import pytest
from app.core.followup_engine import FollowupEngine
from app.schemas.session import Session, ConversationEntry, CandidateInfo

@pytest.fixture
def dummy_session():
    """A minimal Session with a tiny question bank (2 items)."""
    return Session(
        session_id="demo",
        candidate_info=CandidateInfo(
            target_role="Software Engineer",
            interviewer_summary="Mock interviewer",
        ),
        question_bank=[
            {"question": "Bank Q1", "answer_type": "text"},
            {"question": "Bank Q2", "answer_type": "text"},
        ],
    )

@pytest.mark.asyncio
async def test_first_question_is_bank(dummy_session, mock_llm):
    engine = FollowupEngine(mock_llm)
    q, q_type, done = await engine.get_next_question(dummy_session)
    assert q_type == "bank"
    assert q == "Bank Q1"
    assert not done

@pytest.mark.asyncio
async def test_followup_after_answer(dummy_session, mock_llm):
    # Simulate answering the first bank question
    dummy_session.conversation.append(
        ConversationEntry(question="Bank Q1", question_type="bank", answer="My answer")
    )
    dummy_session.question_count = 1
    dummy_session.bank_questions_asked.append(0)

    engine = FollowupEngine(mock_llm)
    q, q_type, done = await engine.get_next_question(dummy_session)
    assert q_type == "followup"
    assert q == "Mock follow-up?"
    assert not done
