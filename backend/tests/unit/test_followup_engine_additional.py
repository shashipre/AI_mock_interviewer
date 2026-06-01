import pytest
import asyncio
from app.core.followup_engine import FollowupEngine
from app.schemas.session import Session, ConversationEntry, CandidateInfo
from app.schemas.resume import Question, ResumeAnalysis

# Helper to create a minimal ResumeAnalysis with a question bank
def make_resume_analysis(questions=None):
    if questions is None:
        questions = []
    return ResumeAnalysis(
        candidate_info=CandidateInfo(
            candidate_name="Test Candidate",
            target_role="Software Engineer",
            interviewer_summary="Mock interviewer",
        ),
        skills=[],
        experience=[],
        projects=[],
        question_bank=questions,
    )

@pytest.fixture
def empty_session():
    """A session with no prior conversation and an empty question bank."""
    return Session(
        session_id="empty",
        candidate_info=CandidateInfo(
            candidate_name="Test Candidate",
            target_role="Software Engineer",
            interviewer_summary="Mock interviewer",
        ),
        question_bank=[],
    )

@pytest.fixture
def bank_session():
    """A session pre‑populated with two bank questions."""
    bank_questions = [
        Question(question="Bank Q1", answer_type="text"),
        Question(question="Bank Q2", answer_type="text"),
    ]
    return Session(
        session_id="bank",
        candidate_info=CandidateInfo(
            candidate_name="Test Candidate",
            target_role="Software Engineer",
            interviewer_summary="Mock interviewer",
        ),
        question_bank=bank_questions,
    )

@pytest.mark.asyncio
async def test_engine_returns_first_bank_question(bank_session, mock_llm):
    """Engine should return the first bank question when no history exists."""
    engine = FollowupEngine(mock_llm)
    question, q_type, done = await engine.get_next_question(bank_session)
    assert not done
    assert q_type == "bank"
    assert question == "Bank Q1"
    assert bank_session.question_count == 0  # engine does not mutate session here

@pytest.mark.asyncio
async def test_engine_follows_up_when_possible(bank_session, mock_llm):
    """After answering the first bank question, engine should produce a follow‑up."""
    # Simulate answering the first question
    bank_session.conversation.append(
        ConversationEntry(question="Bank Q1", question_type="bank", answer="My answer")
    )
    bank_session.question_count = 1
    bank_session.bank_questions_asked.append(0)

    engine = FollowupEngine(mock_llm)
    question, q_type, done = await engine.get_next_question(bank_session)
    assert not done
    assert q_type == "followup"
    assert question == "Mock follow-up?"
    # consecutive_followups should be increased by the engine (we don't check here directly)

@pytest.mark.asyncio
async def test_engine_falls_back_to_bank_when_llm_fails(bank_session, mock_llm, monkeypatch):
    """If the LLM raises an exception, engine must fall back to the next bank question."""
    async def broken_complete_json(_):
        raise RuntimeError("LLM broken")
    monkeypatch.setattr(mock_llm, "complete_json", broken_complete_json)

    # Simulate a previous answer that would trigger a follow‑up
    bank_session.conversation.append(
        ConversationEntry(question="Bank Q1", question_type="bank", answer="Answer")
    )
    bank_session.question_count = 1
    bank_session.bank_questions_asked.append(0)

    engine = FollowupEngine(mock_llm)
    question, q_type, done = await engine.get_next_question(bank_session)
    # Should return the second bank question
    assert not done
    assert q_type == "bank"
    assert question == "Bank Q2"

@pytest.mark.asyncio
async def test_engine_stops_at_max_interview_questions(bank_session, mock_llm, monkeypatch):
    """When the max interview question limit is hit, engine signals completion."""
    # Force the session to think it has asked the maximum number of questions
    max_q = bank_session.question_bank.__len__() * (1 + 2)  # bank + 2 follow‑ups per bank
    bank_session.question_count = max_q
    engine = FollowupEngine(mock_llm)
    # No need to monkeypatch settings – the engine reads Settings.max_interview_questions
    question, q_type, done = await engine.get_next_question(bank_session)
    assert done
    assert question is None
    assert q_type == "ended"

# ---------------------------------------------------------------------------
# Helper fixtures for the mock LLM are provided by conftest.py (mock_llm).
# No modifications to production code are performed – only additional unit tests.
# ---------------------------------------------------------------------------
