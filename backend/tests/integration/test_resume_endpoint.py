# tests/integration/test_resume_endpoint.py
import pytest
import io
from fastapi.testclient import TestClient


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_upload_invalid_file_type(client):
    # send a .txt file — should be rejected
    response = client.post(
        "/api/v1/resume/upload",
        files={"file": ("resume.txt", b"some text content", "text/plain")}
    )
    assert response.status_code == 400
    assert "Only PDF and DOCX" in response.json()["detail"]


def test_upload_empty_file(client):
    # send empty PDF — should be rejected as too short
    response = client.post(
        "/api/v1/resume/upload",
        files={"file": ("resume.pdf", b"", "application/pdf")}
    )
    assert response.status_code in [400, 422]


from unittest.mock import patch

def test_upload_valid_resume_returns_analysis(client, tmp_path):
    # create a fake PDF with enough text
    fake_pdf = tmp_path / "resume.pdf"
    fake_pdf.write_bytes(b"%PDF-1.4 " + b"John Doe Backend Engineer Python FastAPI " * 20)

    with patch("app.api.v1.resume.parse_resume") as mock_parse:
        mock_parse.return_value = "John Doe Backend Engineer Python FastAPI " * 20
        with open(fake_pdf, "rb") as f:
            response = client.post(
                "/api/v1/resume/upload",
                files={"file": ("resume.pdf", f, "application/pdf")}
            )

    # mock LLM returns valid response
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Resume uploaded and analyzed successfully"
    assert data["analysis"]["candidate_name"] == "John Doe"
    assert len(data["analysis"]["skills"]) > 0
    assert len(data["analysis"]["question_bank"]) > 0