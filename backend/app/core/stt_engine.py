from faster_whisper import WhisperModel
from app.exceptions import AudioProcessingError,TranscriptionError

class STTEngine:
    def __init__(self):
        self.model = WhisperModel("base",device="cuda",compute_type="float16")
    
    def transcribe(self, audio_bytes):
        if not audio_bytes:
            raise AudioProcessingError(
                "Received empty audio"
            )
        try:
            segments, into = self.model.transcribe(audio_bytes) 
        except Exception as e:
            raise TranscriptionError(f"Transcription failed: {e}") from e
        test = ""
        for segment in segments:
            text += segment.text

        return text.strip()
    






