"""
tests/test_providers.py

Verifies that the OpenRouter provider is correctly configured and that all
client factories (generator, caption, audio) point to OpenRouter exclusively.
"""
import os
import sys
import pytest

sys.path.insert(0, os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

from backend.config import settings
from backend.core.generator import AnswerGenerator
from backend.core.audio_service import AudioService
from backend.ingestion.caption_generator import CaptionGenerator


# ---------------------------------------------------------------------------
# Helper: make get_effective_provider return 'openrouter' regardless of .env
# ---------------------------------------------------------------------------

def _patch_openrouter(monkeypatch):
    monkeypatch.setattr(settings, "OPENROUTER_API_KEY", "sk-or-v1-test_dummy_key_12345")
    monkeypatch.setattr(settings, "LLM_PROVIDER", "openrouter")


# ---------------------------------------------------------------------------
# Generator tests
# ---------------------------------------------------------------------------

def test_openrouter_provider_setup(monkeypatch):
    """AnswerGenerator must use OpenRouter API key and base URL."""
    _patch_openrouter(monkeypatch)
    assert settings.get_effective_provider() == "openrouter"
    assert settings.OPENROUTER_MODEL is not None
    assert settings.OPENROUTER_VISION_MODEL is not None

    gen = AnswerGenerator()
    gen._setup_clients()
    info = gen.get_provider_info()
    assert info["provider"] == "openrouter"
    assert info["model"] == settings.OPENROUTER_MODEL
    assert gen._sync_client is not None
    or_base = str(gen._sync_client.base_url).rstrip("/")
    assert "openrouter.ai" in or_base, f"Expected openrouter.ai base URL, got: {or_base}"
    print("\n[PASS] AnswerGenerator → OpenRouter verified.")


def test_openrouter_is_preferred_over_groq(monkeypatch):
    """When both OpenRouter and Groq keys are set, OpenRouter wins."""
    _patch_openrouter(monkeypatch)
    monkeypatch.setattr(settings, "GROQ_API_KEY", "gsk_dummy_groq_key")
    assert settings.get_effective_provider() == "openrouter"
    print("[PASS] OpenRouter preferred over Groq when both keys are present.")


# ---------------------------------------------------------------------------
# Vision (caption) tests
# ---------------------------------------------------------------------------

def test_openrouter_vision_client(monkeypatch):
    """CaptionGenerator must use OpenRouter for vision captioning."""
    _patch_openrouter(monkeypatch)
    cap = CaptionGenerator()
    client, model = cap._get_vision_client()
    assert client is not None, "Expected an OpenRouter client, got None"
    assert model == settings.OPENROUTER_VISION_MODEL
    assert "openrouter.ai" in str(client.base_url)
    print(f"[PASS] CaptionGenerator vision client → OpenRouter/{model}")


def test_caption_fallback_without_key(monkeypatch):
    """CaptionGenerator gracefully returns None client when no key is set."""
    monkeypatch.setattr(settings, "OPENROUTER_API_KEY", None)
    monkeypatch.setattr(settings, "GROQ_API_KEY", None)
    monkeypatch.setattr(settings, "OPENAI_API_KEY", None)
    cap = CaptionGenerator()
    client, model = cap._get_vision_client()
    assert client is None
    assert model is None
    print("[PASS] CaptionGenerator returns None client when no key configured.")


# ---------------------------------------------------------------------------
# Audio tests
# ---------------------------------------------------------------------------

def test_openrouter_audio_client(monkeypatch):
    """AudioService must initialise its OpenRouter client correctly."""
    _patch_openrouter(monkeypatch)
    svc = AudioService()
    client = svc._get_openrouter_client()
    assert client is not None, "Expected an OpenRouter audio client, got None"
    assert "openrouter.ai" in str(client.base_url)
    print("[PASS] AudioService STT client → OpenRouter")


def test_audio_service_raises_without_key(monkeypatch):
    """AudioService.transcribe_audio raises ValueError if no API key is set."""
    monkeypatch.setattr(settings, "OPENROUTER_API_KEY", None)
    svc = AudioService()
    svc._or_client = None  # force reset cached client
    with pytest.raises(ValueError, match="OPENROUTER_API_KEY"):
        svc.transcribe_audio(b"fake audio bytes", "test.wav")
    print("[PASS] AudioService raises ValueError without OPENROUTER_API_KEY.")
