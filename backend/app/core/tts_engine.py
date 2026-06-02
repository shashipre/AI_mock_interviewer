from piper import PiperVoice
from pathlib import Path

MODEL_PATH = Path("voice_models/en_US-lessac-medium.onnx")

class TTSEngine:
    def __init__(self):
        """Load the Piper voice model with CUDA support if available."""
        self.voice = PiperVoice.load(MODEL_PATH, use_cuda=True)

    def speak(self, text: str):
        """Synthesize `text` to raw PCM audio bytes.

        Returns:
            bytes: Concatenated int16 PCM audio data produced by Piper.
        """
        audio_bytes = bytearray()
        for chunk in self.voice.synthesize(text):
            # Caller can use chunk.sample_rate, chunk.sample_width, chunk.sample_channels
            # to configure the audio playback/stream.
            yield chunk.audio_int16_bytes
