from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.schemas.audio import TranscriptResponse

router = APIRouter()

BUFFER_SIZE = 1024 * 1024

@router.websocket("/stream")
async def stream_audio(websocket: WebSocket):
    await websocket.accept()

    audio_buffer = bytearray()

    stt_engine = websocket.app.state.stt_engine

    try:
        while True:
            chunk = await websocket.receive_bytes()

            audio_buffer.extend(chunk)

            if len(audio_buffer) >= BUFFER_SIZE:
                transcript = stt_engine.transcribe(bytes(audio_buffer))

                response = TranscriptResponse(transcript= transcript,
                                              is_final=False,
                                              confidence=1.0
                                              )
                await websocket.send_json(response.model_dump())

                audio_buffer.clear()
    except WebSocketDisconnect:
        print("Client disconnect")

@router.websocket("/speak")
async def speak(websocket: WebSocket):

    await websocket.accept()

    data = await websocket.receive_json()

    text = data['text']

    tts_engine = websocket.app.state.tts_engine

    for audio_chunk in tts_engine.stream(text):
        await websocket.send_bytes(
            audio_chunk
        )
    await websocket.send_json({
        "type": "complete"
    })
