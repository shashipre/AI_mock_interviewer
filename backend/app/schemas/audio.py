from pydantic import BaseModel

class TranscriptResponse(BaseModel):
    transcript: str
    is_final : bool
    confidence : float

class TTSRequest(BaseModel):
    text: str
    session_id: str | None = None