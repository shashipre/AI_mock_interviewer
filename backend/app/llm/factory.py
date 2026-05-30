from app.config import settings
from app.llm.base import BaseLLMClient
from app.llm.groq_client import GroqClient
from app.exceptions import LLMError

def get_llm_client() -> BaseLLMClient:
    if settings.llm_provider.lower() == "groq":
        return GroqClient()
    else:
        raise LLMError(f"Unsupported LLM provider: {settings.llm_provider}")
    