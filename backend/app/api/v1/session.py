from fastapi import FastAPI, APIRouter, Depends, HTTPException
from uuid import uuid4
from datetime import datetime

from app.schemas.interview import StartSessionRequest, QuestionResponse
from app.schemas.session import Session, ConversationEntry
from app.storage.session_store import session_store
from app.dependencies import get_llm
from app.llm.base import BaseLLMClient
from app.core.followup_engine import FollowupEngine
from app.logger import logger
from app.config import settings

router = APIRouter()

@router.post("/start", response_model= QuestionResponse)
async def start_session(
    req: StartSessionRequest,
    llm: BaseLLMClient = Depends(get_llm),
) -> QuestionResponse:
    """
    Creates a brand-new interview session.
    * Generates a UUID for the session.
    * Stores a fresh Session object in the in-memory store.
    * Returns the **first bank question** (or a follow-up if the engine decides so).
    """
    session_id = str(uuid4())
    logger.info(f"Creating interview session {session_id}")

    session = Session(
        session_id=session_id,
        candidate_info=req.resume_analysis.candidate_info,
        question_bank=req.resume_analysis.question_bank
    )

    session_store.add_session(session)


    engine = FollowupEngine(llm_client=llm)
    next_question, q_type, is_done = await engine.get_next_question(session)

    if is_done or next_question is None:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate the first interview question",
        )
    session.conversation.append(
        ConversationEntry(
            question=next_question,
            question_type=q_type,
            answer=None,
        )
    )
    session.question_count = 1
    session_store.update_session(session)

    return QuestionResponse(
        session_id=session_id,
        question=next_question,
        question_type=q_type,
        question_number=1,
        is_complete=False,
    )

@router.post("/end")
async def end_session(session_id: str) -> dict:
    """
    Marks a session as ended and records the end timestamp.
    This endpoint is a manual “give-up” path; the normal flow ends automatically
    when the Follow-up Engine signals completion.
    """
    if not session_store.exists(session_id):
        raise HTTPException(status_code=404, detail="Session not found")
    session = session_store.get_session(session_id)
    session.status = "ended"
    session.end_time = session.end_time or session.start_time  # keep something sensible
    session_store.update_session(session)

    logger.info(f"Session {session_id} manually ended")
    return {"message": f"Session {session_id} ended"}
