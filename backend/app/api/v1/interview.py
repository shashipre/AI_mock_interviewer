from fastapi import APIRouter, Depends, HTTPException
from app.schemas.interview import AnswerRequest, QuestionResponse,InterviewCompleteResponse
from app.storage.session_store import session_store
from app.dependencies import get_llm
from app.llm.base import BaseLLMClient
from app.core.followup_engine import FollowupEngine
from app.logger import logger
from app.config import settings

router = APIRouter()

@router.post("/answer", response_model= QuestionResponse)
async def submit_answer(
    req: AnswerRequest,
    llm: BaseLLMClient = Depends(get_llm),
)-> QuestionResponse:
    """
    Handles a candidate's answer, updates the session state,
    runs the Follow-up Engine, and returns either:
    * the next question (bank or follow-up) OR
    * a flag indicating the interview is complete.
    """

    if not session_store.exists(req.session_id):
        raise HTTPException(status_code=404, detail="Session not found")
    session = session_store.get_session(req.session_id)

    if session.status != "active":
        raise HTTPException(status_code=404, detail="Session is not active")

    if not session.conversation:
        raise HTTPException(status_code=404, details="No active question to answer")
    
    last_entry = session.conversation[-1]
    last_entry.answer = req.answer

    logger.info(
        f"Received answer for session {session.session_id} – Q#{len(session.conversation)}"
    )

    engine = FollowupEngine(llm_client=llm)
    next_question, q_type, is_complete = await engine.get_next_question(session)

    if is_complete or next_question is None:
        # Interview is finished – mark session as ended and return a completion payload
        session.status = "ended"
        session.end_time = session.end_time or session.start_time
        session_store.update_session(session)
    
        return QuestionResponse(
                session_id=session.session_id,
                question="",
                question_type="ended",
                question_number=session.question_count,
                is_complete=True,
            )
    session.question_count += 1
    session.conversation.append(
        {
        "question": next_question,
        "question_type": q_type,
        "answer": None
        }
    )
    session_store.update_session(session)

    return QuestionResponse(
        session_id=session.session_id,
        question=next_question,
        question_type=q_type,
        question_number=session.question_count,
        is_complete=False
    )
    
    