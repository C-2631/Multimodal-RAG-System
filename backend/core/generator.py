import asyncio
from typing import List, Optional, Tuple, AsyncGenerator
from openai import OpenAI, AsyncOpenAI

from backend.config import settings
from backend.models.schemas import SourceItem
from backend.utils.logger import logger


class AnswerGenerator:
    """
    Generates answers grounded in retrieved text chunks, images, and live web results.
    Uses OpenRouter exclusively as the LLM provider for all inference tasks.
    Supports automatic image markdown embedding and streaming output.
    """

    def __init__(self):
        pass

    def _get_active_client(self) -> Tuple[Optional[OpenAI], Optional[AsyncOpenAI], str, str]:
        """
        Returns OpenAI-compatible client tuple configured exclusively for OpenRouter.
        Returns: (sync_client, async_client, provider_name, model_name)
        """
        if settings.OPENROUTER_API_KEY:
            model = settings.OPENROUTER_MODEL or "nvidia/nemotron-3-ultra-550b-a55b:free"
            headers = {
                "HTTP-Referer": "https://multimodal-rag-system.local",
                "X-Title": "Multimodal RAG System"
            }
            return (
                OpenAI(
                    api_key=settings.OPENROUTER_API_KEY,
                    base_url=settings.OPENROUTER_BASE_URL,
                    default_headers=headers
                ),
                AsyncOpenAI(
                    api_key=settings.OPENROUTER_API_KEY,
                    base_url=settings.OPENROUTER_BASE_URL,
                    default_headers=headers
                ),
                "openrouter",
                model
            )

        # No provider configured — return local fallback only
        return None, None, "local", "local-grounded-fallback"

    def _setup_clients(self):
        """Eagerly initialise and cache clients (used by tests)."""
        self._sync_client, self._async_client, self.provider, self.model_name = self._get_active_client()

    def get_provider_info(self) -> dict:
        _, _, provider, model = self._get_active_client()
        return {
            "provider": provider,
            "model": model,
            "configured": provider != "local"
        }

    def build_prompt(
        self,
        query: str,
        sources: List[SourceItem],
        web_results: Optional[List[dict]] = None
    ) -> str:
        # Only include sources that have genuine semantic relevance (>= 0.60 in CLIP space)
        relevant_sources = [s for s in sources if getattr(s, 'similarity_score', 0) >= 0.60]

        context_parts = []
        for idx, s in enumerate(relevant_sources, 1):
            if s.type == "text":
                context_parts.append(
                    f"[{idx}] (Text from {s.document_name}, Page {s.page_number} - Relevance: {s.similarity_score}):\n{s.content}"
                )
            else:
                img_url_str = f" Image URL: '{s.image_url}'" if s.image_url else ""
                context_parts.append(
                    f"[{idx}] (Image/Diagram from {s.document_name}, Page {s.page_number} - Relevance: {s.similarity_score}):\n"
                    f"Caption: {s.content}.{img_url_str}"
                )

        if web_results:
            context_parts.append("\n--- LIVE WEB & SCHOLARLY SEARCH RESULTS ---")
            for w in web_results:
                context_parts.append(f"• [{w.get('title')}]({w.get('url')}): {w.get('snippet')}")

        context_str = "\n\n".join(context_parts) if context_parts else ""

        prompt = (
            f"You are Researchly, a fast, intelligent multimodal AI research assistant (like Gemini/Claude).\n"
            f"Provide a concise, direct, high-value, well-structured answer (around 200-350 words).\n\n"
            f"INSTRUCTIONS:\n"
            f"1. Answer the user's question directly with factual accuracy, clarity, and depth.\n"
            f"2. If context documents or web results are provided, seamlessly ground your answer and cite sources using [1], [2].\n"
            f"3. Use structured formatting with short paragraphs, bold key terms, and bullet points.\n"
            f"4. If an image with an 'Image URL' is in context, embed it using `![Description](image_url)`.\n"
            f"5. Do NOT output internal thoughts, preambles, or disclaimers.\n\n"
            f"--- CONTEXT ---\n"
            f"{context_str if context_str else 'General knowledge query.'}\n"
            f"--- END CONTEXT ---\n\n"
            f"Question: {query}\n\n"
            f"Answer:"
        )
        return prompt

    def generate_answer(
        self,
        query: str,
        sources: List[SourceItem],
        web_results: Optional[List[dict]] = None
    ) -> Tuple[str, int, float]:
        """Non-streaming generation via OpenRouter with low latency and token efficiency."""
        sync_client, _, provider, model = self._get_active_client()
        prompt = self.build_prompt(query, sources, web_results)

        if sync_client:
            try:
                extra_kwargs = {}
                if "nemotron" in model.lower() or "reasoning" in model.lower():
                    extra_kwargs["extra_body"] = {"reasoning": {"enabled": True}}

                response = sync_client.chat.completions.create(
                    model=model,
                    messages=[
                        {
                            "role": "system",
                            "content": (
                                "You are Researchly, an intelligent multimodal research assistant. "
                                "Provide direct, high-value, beautifully structured markdown responses. "
                                "CRITICAL: Do NOT output internal scratchpad, analysis, or 'Analyze User Request' headings. "
                                "Output ONLY the final polished answer. "
                                "When referencing images with an Image URL, embed with ![Caption](url)."
                            )
                        },
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.2,
                    max_tokens=1200,
                    **extra_kwargs
                )
                raw_answer = response.choices[0].message.content or ""
                answer = self._clean_model_output(raw_answer)

                total_tokens = response.usage.total_tokens if response.usage else len(answer.split())
                logger.info(f"Generated answer via OpenRouter/{model} ({total_tokens} tokens).")
                return answer, total_tokens, round(total_tokens * 0.000001, 6)
            except Exception as e:
                logger.error(f"OpenRouter call failed ({model}): {e}")

        # Local grounded fallback when OpenRouter is unavailable
        return self._local_grounded_fallback(sources, web_results)

    def _clean_model_output(self, raw_answer: str) -> str:
        """Strip internal thinking tokens, scratchpads, and planning preambles."""
        import re
        text = raw_answer.strip()
        # 1. Strip XML-style thinking tags
        text = re.sub(r"<(thought|think)>.*?</(thought|think)>", "", text, flags=re.DOTALL).strip()
        
        # 2. Strip plaintext scratchpads: "Analyze User Request: ... Let's draft:"
        text = re.sub(
            r"^(?:Analyze User (?:Request|Input):|Thinking Process:|Here'?s a thinking process:).*?(?:Let'?s draft:?|Drafting answer:?|Answer:|\n#{1,3}\s|\n\*\*[A-Z])",
            "",
            text,
            flags=re.DOTALL | re.IGNORECASE
        ).strip()

        # 3. If leftover role/task bullets remain at the start, extract after the last draft marker
        if re.match(r"^(?:Role|Task|Constraints|Context|Question|Identify Key Concepts):", text, flags=re.IGNORECASE):
            parts = re.split(r"(?:Let'?s draft:?|Answer:|\n\n(?=[A-Z#]))", text, flags=re.IGNORECASE)
            if len(parts) > 1:
                text = parts[-1].strip()

        return text or raw_answer.strip()

    async def generate_answer_stream(
        self,
        query: str,
        sources: List[SourceItem],
        web_results: Optional[List[dict]] = None
    ) -> AsyncGenerator[str, None]:
        """Streaming generation via OpenRouter, yielding tokens with embedded image tags."""
        _, async_client, provider, model = self._get_active_client()
        prompt = self.build_prompt(query, sources, web_results)

        if async_client:
            try:
                extra_kwargs = {}
                if "nemotron" in model.lower() or "reasoning" in model.lower():
                    extra_kwargs["extra_body"] = {"reasoning": {"enabled": True}}

                stream = await async_client.chat.completions.create(
                    model=model,
                    messages=[
                        {
                            "role": "system",
                            "content": (
                                "You are Researchly, an intelligent multimodal research assistant. "
                                "Provide direct, high-value, beautifully structured markdown responses. "
                                "CRITICAL: Do NOT output internal scratchpad, analysis, or 'Analyze User Request' headings. "
                                "Output ONLY the final polished answer. "
                                "When referencing images with an Image URL, embed with ![Caption](url)."
                            )
                        },
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.2,
                    max_tokens=1200,
                    stream=True,
                    **extra_kwargs
                )
                async for chunk in stream:
                    delta = chunk.choices[0].delta.content if chunk.choices else ""
                    if delta:
                        yield delta
                return
            except Exception as e:
                logger.error(f"OpenRouter streaming error ({model}): {e}")

        # Fallback: yield local grounded answer word-by-word
        fallback_text, _, _ = self._local_grounded_fallback(sources, web_results)
        for token in fallback_text.split(" "):
            yield token + " "
            await asyncio.sleep(0.02)

    def _local_grounded_fallback(
        self,
        sources: List[SourceItem],
        web_results: Optional[List[dict]] = None
    ) -> Tuple[str, int, float]:
        """Synthesize a minimal answer directly from retrieved context and embedded images."""
        lines = []

        # Embed any retrieved visual sources
        images = [s for s in sources if s.type == "image" and s.image_url]
        if images:
            lines.append("### Retrieved Visual Sources:\n")
            for img in images:
                lines.append(
                    f"![{img.content}]({img.image_url})\n"
                    f"*{img.content}* (from {img.document_name}, Page {img.page_number})\n"
                )

        if sources:
            top = sources[0]
            lines.append(f"### Context from {top.document_name} (Page {top.page_number}):")
            lines.append(f"> {top.content}\n")

        if web_results:
            lines.append("### Web Search Results:")
            for w in web_results:
                lines.append(f"- [{w['title']}]({w['url']}): {w['snippet']}")

        if not lines:
            return (
                "No local knowledge base documents or web results matched your query. "
                "Try uploading a document (PDF, image, audio, or video) or adjusting your search.",
                0, 0.0
            )

        return "\n".join(lines), 0, 0.0


generator = AnswerGenerator()
