from app.llm.factory import get_llm_client
from app.llm.base import BaseLLMClient
from app.logger import logger

_llm_client: BaseLLMClient = None

def get_llm() -> BaseLLMClient:
    global _llm_client
    if _llm_client is None:
        logger.info("Initializing LLM client...")
        _llm_client = get_llm_client()
        logger.info(f"LLM client created: {type(_llm_client).__name__}")
    return _llm_client

