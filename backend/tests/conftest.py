import os
import sys
import pytest
from fastapi.testclient import TestClient

# Add backend directory to sys.path so 'app' can be imported directly
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app.main import app
from app.dependencies import get_llm
from app.llm.base import BaseLLMClient


class MockLLMClient(BaseLLMClient):
    async def complete(self, prompt: str) -> str:
        return "Mock response"
    async def complete_json(self, prompt: str) -> dict:
        return {
            "candidate_name": "John Doe",
            "target_role": "Backend Engineer",
            "skills": ["Python", "FastAPI", "Redis"],
            "experience": [
                {
                    "company": "Google",
                    "role": "SWE Intern",
                    "duration": "6 months",
                    "summary": "Built internal tooling"
                }
            ],
            "projects": [
                {
                    "name": "E-commerce API",
                    "tech_stack": ["FastAPI", "PostgreSQL"],
                    "summary": "REST API handling 10k daily orders"
                }
            ],
            "interviewer_summary": "Strong backend focus",
            "question_bank": [
                {
                    "question": "Why did you choose Redis?",
                    "topic": "technology",
                    "based_on": "E-commerce API"
                }
            ]
        }
    
@pytest.fixture
def client():
    app.dependency_overrides[get_llm] = lambda: MockLLMClient()
    test_client = TestClient(app)
    yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def sample_pdf(tmp_path):
    pdf_content = b"%PDF-1.4\n%Mock PDF content for testing\n"
    pdf_path = tmp_path / "sample_resume.pdf"
    pdf_path.write_bytes(pdf_content)
    return pdf_path

@pytest.fixture
def sample_resume_text():
    return """
    John Doe — Backend Engineer
    Skills: Python, FastAPI, Redis, PostgreSQL, Docker
    Experience: Google SWE Intern 2022-2023
    Projects: E-commerce API — built REST API handling 10k daily orders
    Education: B.Tech Computer Science 2024
    """
