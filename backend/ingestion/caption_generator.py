import os
from typing import Optional, Tuple
from openai import OpenAI
from backend.config import settings
from backend.utils.logger import logger
from backend.utils.image_utils import load_image_to_pil, pil_to_base64


class CaptionGenerator:
    """
    Generates rich, descriptive captions for extracted or uploaded images.

    Uses OpenRouter Vision (e.g. anthropic/claude-opus-4.8) exclusively.
    Falls back to a context-aware text description if the vision call fails
    or no API key is configured.
    """

    # OpenRouter headers required by their API policy
    _OR_HEADERS = {
        "HTTP-Referer": "https://multimodal-rag-system.local",
        "X-Title": "Multimodal RAG System"
    }

    def __init__(self):
        pass

    def _get_vision_client(self) -> Tuple[Optional[OpenAI], Optional[str]]:
        """
        Return (OpenAI-compatible client, model_name) for vision inference.
        OpenRouter is the sole provider.
        """
        if settings.OPENROUTER_API_KEY:
            return (
                OpenAI(
                    api_key=settings.OPENROUTER_API_KEY,
                    base_url=settings.OPENROUTER_BASE_URL,
                    default_headers=self._OR_HEADERS
                ),
                settings.OPENROUTER_VISION_MODEL  # e.g. nex-agi/nex-n2.5-pro:free
            )
        return None, None

    def generate_caption(self, image_path: str, context: Optional[str] = None) -> str:
        """
        Generate a concise descriptive caption for an image using OpenRouter Vision.

        Args:
            image_path: Path to the image file on disk.
            context: Optional surrounding document text for additional context.

        Returns:
            A 1-2 sentence descriptive caption string.
        """
        client, model = self._get_vision_client()

        if client and model:
            try:
                pil_img = load_image_to_pil(image_path)
                data_url = pil_to_base64(pil_img)

                prompt = (
                    "Provide a concise 1-2 sentence descriptive caption summarising the visual and conceptual "
                    "content of this diagram or image for search indexing. "
                    "Focus on charts, flowcharts, architectures, or key objects."
                )
                if context:
                    prompt += f" Surrounding text from the same page: '{context[:350]}'"

                response = client.chat.completions.create(
                    model=model,
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": prompt},
                                {"type": "image_url", "image_url": {"url": data_url}}
                            ]
                        }
                    ],
                    max_tokens=160
                )
                caption = response.choices[0].message.content.strip()
                logger.info(f"OpenRouter vision caption via {model}: '{caption[:80]}...'")
                return caption
            except Exception as e:
                logger.warning(f"OpenRouter vision captioning failed: {e}. Using context fallback.")

        # Context-aware text fallback (no API key or vision call failure)
        filename = os.path.basename(image_path)
        if context and context.strip():
            clean_words = " ".join(context.strip().split()[:30])
            return f"Diagram / Figure illustrating: {clean_words}"
        return f"Diagram / Visual content from {filename}"


# Module-level singleton for import convenience
caption_generator = CaptionGenerator()
