import pytest
from app.schemas.session import CandidateInfo

# The `client` fixture (TestClient) is provided by conftest.

def test_start_session_returns_bank_question(client):
    payload = {
        "resume_analysis": {
            "candidate_info": {
                "target_role": "Software Engineer",
                "interviewer_summary": "Mock interviewer"
            },
            "question_bank": [
                {"question": "Bank Q1", "answer_type": "text"},
                {"question": "Bank Q2", "answer_type": "text"}
            ]
        }
    }
    response = client.post("/api/v1/session/start", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["question_type"] == "bank"
    assert data["question"] == "Bank Q1"
    assert "session_id" in data
    return data["session_id"]

def test_answer_produces_followup(client):
    # Start a session first (reuse the helper above)
    session_id = test_start_session_returns_bank_question(client)
    # Submit an answer to the first (and only) bank question
    answer_payload = {"session_id": session_id, "answer": "My answer"}
    resp = client.post("/api/v1/interview/answer", json=answer_payload)
    assert resp.status_code == 200
    data = resp.json()
    # Since there was only one bank question, engine should now return a follow‑up
    assert data["question_type"] == "followup"
    assert data["question"] == "Mock follow-up?"
    assert data["is_complete"] is False
