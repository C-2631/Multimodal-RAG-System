import os
import io
import re
import asyncio
from typing import Optional
import edge_tts
from openai import OpenAI
from backend.config import settings
from backend.utils.logger import logger


class AudioService:
    """
    Provides speech-to-text transcription and text-to-speech audio synthesis.

    - Speech-to-Text (STT): Uses OpenRouter's Whisper endpoint to transcribe
      uploaded voice recordings (WAV, MP3, M4A, OGG).
    - Text-to-Speech (TTS): Uses Microsoft Edge TTS to synthesise natural MP3
      audio from any text string.

    All STT inference routes through the OpenRouter API key — no Groq dependency.
    """

    # OpenRouter headers required by their API policy
    _OR_HEADERS = {
        "HTTP-Referer": "https://multimodal-rag-system.local",
        "X-Title": "Multimodal RAG System"
    }

    def __init__(self):
        self._or_client: Optional[OpenAI] = None

    def _get_openrouter_client(self) -> Optional[OpenAI]:
        """Lazily initialise and cache the OpenRouter OpenAI-compatible client."""
        if self._or_client is None and settings.OPENROUTER_API_KEY:
            try:
                self._or_client = OpenAI(
                    api_key=settings.OPENROUTER_API_KEY,
                    base_url=settings.OPENROUTER_BASE_URL,
                    default_headers=self._OR_HEADERS
                )
                logger.info("OpenRouter audio client initialised.")
            except Exception as e:
                logger.warning(f"Failed to initialise OpenRouter audio client: {e}")
        return self._or_client

    def transcribe_audio(self, audio_bytes: bytes, filename: str = "audio.wav") -> str:
        """
        Transcribe speech to text using OpenRouter's Whisper model.

        Args:
            audio_bytes: Raw audio bytes (WAV, MP3, M4A, OGG).
            filename: Original filename (extension determines format detection).

        Returns:
            Transcribed text string.

        Raises:
            ValueError: If OPENROUTER_API_KEY is not configured.
        """
        client = self._get_openrouter_client()
        if not client:
            raise ValueError(
                "OPENROUTER_API_KEY is required for audio transcription. "
                "Please add it to your .env file."
            )

        audio_file = io.BytesIO(audio_bytes)
        audio_file.name = filename
        model = settings.OPENROUTER_WHISPER_MODEL  # e.g. "openai/whisper-large-v3"

        logger.info(f"Transcribing '{filename}' via OpenRouter/{model}...")
        transcription = client.audio.transcriptions.create(
            model=model,
            file=audio_file,
            response_format="text"
        )

        # OpenRouter may return a plain string or an object with a .text attribute
        text = (
            transcription.strip()
            if isinstance(transcription, str)
            else getattr(transcription, "text", str(transcription)).strip()
        )
        logger.info(f"Transcription result: '{text[:80]}...'")
        return text

    async def generate_speech_bytes(
        self,
        text: str,
        voice: str = "en-US-JennyNeural"
    ) -> bytes:
        """
        Synthesise text into MP3 audio bytes using Microsoft Edge TTS.

        Args:
            text: The answer text to speak (markdown is stripped automatically).
            voice: Edge TTS voice identifier (default: en-US-JennyNeural).

        Returns:
            MP3 audio bytes, or empty bytes if the text is blank.
        """
        if not text or not text.strip():
            return b""

        # Strip markdown so TTS sounds natural
        clean = text.replace("**", "").replace("*", "").replace("#", "").replace("`", "")
        clean = re.sub(r"!\[.*?\]\(.*?\)", "", clean)   # remove image embeds
        clean = re.sub(r"\[\d+\]", "", clean)            # remove citation markers
        clean = re.sub(r"\[([^\]]+)\]\([^\)]+\)", r"\1", clean)  # flatten hyperlinks to text
        clean = clean.strip()[:2000]  # cap at ~2 000 chars for reasonable playback length

        communicate = edge_tts.Communicate(clean, voice=voice)
        audio_stream = io.BytesIO()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_stream.write(chunk["data"])

        return audio_stream.getvalue()


# Module-level singleton for import convenience
audio_service = AudioService()
