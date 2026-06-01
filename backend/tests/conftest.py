import sys, os
# Add project root to sys.path so "app" can be imported
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(project_root)

import pytest
from fastapi.testclient import TestClient
from fastapi import HTTPException
from app.llm.base import BaseLLMClient
from app.main import app
from app.dependencies import get_llm
from app.logger import logger

class MockLLM(BaseLLMClient):
    current_dir = os.path.dirname(os.path.abspath(__file__))
    prompt_path = os.path.abspath(os.path.join(current_dir, "..", "app", "prompts", "resume_analysis.txt"))
    try:
        with open(prompt_path, "r") as f:
            prompt_template = f.read()
    except FileNotFoundError:
        logger.error("Prompt template not found: app/prompts/resume_analysis.txt")
        raise HTTPException(status_code=500, detail="Internal server error")
    # For tests we don't need to interpolate variables; the mock LLM ignores the prompt.
    prompt = prompt_template

    async def complete(self, prompt: str) -> str:
        # Not used in current tests; return a placeholder.
        return "dummy"

    async def complete_json(self, prompt: str) -> dict:
        return {"question": "Mock follow-up?"}

@pytest.fixture
def mock_llm() -> MockLLM:
    """Provides a fresh MockLLM instance for each test."""
    return MockLLM()

@pytest.fixture
def client(mock_llm: MockLLM) -> TestClient:
    """FastAPI TestClient with LLM dependency overridden."""
    app.dependency_overrides[get_llm] = lambda: mock_llm
    return TestClient(app)
