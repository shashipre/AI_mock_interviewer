from fastapi import APIRouter, Depends, HTTPException
from app.dependencies import get_llm
from app.llm.base import BaseLLMClient 
from app.storage.session_store import session_store
from app.core.evaluation_engine import EvaluationEngine
from app.schemas.evalution import EvaluationResult
from app.logger import logger

router = APIRouter()

@router.get("/{session_id}", response_model = EvaluationResult)
async def get_evaluation(
    session_id: str,
    llm: BaseLLMClient = Depends(get_llm)
) -> EvaluationResult:
    """
    Retrieves or generates performance feedback and score metrics
    for a completed mock interview session.
    """
    # 1. Load Session
    if not session_store.exists(session_id):
        logger.error(f"Evaluation failed: Session {session_id} not found.")
        raise HTTPException(status_code=404, detail="Session not found")
        
    session = session_store.get_session(session_id)
    
    # 2. Safety check: Ensure session is ended
    if session.status != "ended":
        logger.warning(f"Session {session_id} requested for evaluation was still active. Ending it now.")
        session.status = "ended"
        session_store.update_session(session)
    logger.info(f"Generating evaluation report for session {session_id}")
    # 3. Run EvaluationEngine and Return Report
    try:
        engine = EvaluationEngine(llm_client=llm)
        report = await engine.evaluate_session(session)
        return report
    except Exception as e:
        logger.error(f"Error compiling evaluation report for session {session_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate evaluation feedback report from LLM"
        )



