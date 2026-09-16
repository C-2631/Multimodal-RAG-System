from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends, Response
from fastapi.responses import StreamingResponse
from typing import Optional

from backend.models.schemas import QueryRequest, TextQueryRequest, QueryResponse, TTSRequest
from backend.core.rag_pipeline import rag_pipeline
from backend.core.audio_service import audio_service
from backend.utils.image_utils import pil_to_base64, load_image_to_pil
from backend.utils.logger import logger

router = APIRouter(prefix="/api/query", tags=["Multimodal Query"])

@router.post("", response_model=None)
async def query_knowledge_base(request: QueryRequest):
    """
    Multimodal RAG Query:
    Accepts text, image (base64), or both simultaneously.
    Supports live web search fallback (`use_web`), streaming responses, and audio TTS.
    """
    if not request.text_query and not request.image_base64:
        raise HTTPException(
            status_code=400,
            detail="You must provide either 'text_query' or 'image_base64' (or both)."
        )

    try:
        if request.stream:
            return StreamingResponse(
                rag_pipeline.run_stream(request),
                media_type="text/event-stream"
            )
        else:
            response = rag_pipeline.run(request)
            return response
    except Exception as e:
        logger.error(f"Query execution failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")

@router.post("/text", response_model=None)
async def text_only_query(request: TextQueryRequest):
    """Convenience endpoint for text queries with web search and audio generation options."""
    if not request.query or not request.query.strip():
        raise HTTPException(status_code=400, detail="Query text cannot be empty.")

    query_req = QueryRequest(
        text_query=request.query,
        top_k=request.top_k,
        search_mode="all",
        filter_document_id=request.filter_document_id,
        stream=request.stream,
        use_web=request.use_web,
        generate_audio=request.generate_audio
    )
    return await query_knowledge_base(query_req)

@router.post("/image", response_model=None)
async def image_file_query(
    file: UploadFile = File(...),
    top_k: int = Form(default=5),
    text_prompt: Optional[str] = Form(default=None),
    use_web: bool = Form(default=False),
    stream: bool = Form(default=False)
):
    """Query by uploading an image file directly (with optional guiding text prompt)."""
    try:
        content = await file.read()
        pil_img = load_image_to_pil(content)
        img_b64 = pil_to_base64(pil_img)

        query_req = QueryRequest(
            text_query=text_prompt,
            image_base64=img_b64,
            top_k=top_k,
            search_mode="all",
            use_web=use_web,
            stream=stream
        )
        return await query_knowledge_base(query_req)
    except Exception as e:
        logger.error(f"Image query failed: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to process image query: {e}")

@router.post("/audio", response_model=QueryResponse)
async def audio_query(
    file: UploadFile = File(...),
    top_k: int = Form(default=5),
    use_web: bool = Form(default=True),
    generate_audio: bool = Form(default=True)
):
    """
    Voice/Audio Query:
    Transcribes spoken query with Groq Whisper, retrieves multimodal context,
    generates grounded answer, and synthesizes speech response.
    """
    try:
        audio_bytes = await file.read()
        filename = file.filename or "audio_query.wav"
        transcribed_text = audio_service.transcribe_audio(audio_bytes, filename=filename)

        query_req = QueryRequest(
            text_query=transcribed_text,
            top_k=top_k,
            search_mode="all",
            use_web=use_web,
            generate_audio=generate_audio
        )
        return rag_pipeline.run(query_req)
    except Exception as e:
        logger.error(f"Audio query failed: {e}")
        raise HTTPException(status_code=500, detail=f"Audio query failed: {str(e)}")

@router.post("/tts")
async def text_to_speech(request: TTSRequest):
    """Generate and return MP3 audio for given text."""
    try:
        audio_bytes = await audio_service.generate_speech_bytes(request.text, voice=request.voice)
        return Response(content=audio_bytes, media_type="audio/mpeg")
    except Exception as e:
        logger.error(f"TTS generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"TTS failed: {str(e)}")
