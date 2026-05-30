from pydantic import BaseModel, Field
from datetime import datetime
from app.schemas.resume import Question


class CandidateInfo(BaseModel):
    candidate_name: str
    target_role: str
    interviewer_summary: str


class ConversationEntry(BaseModel):
    question: str
    question_type: str              # "bank" or "followup"
    answer: str | None = None       # None until user answers
    timestamp: datetime = Field(
        default_factory=datetime.now
    )


class Session(BaseModel):
    # identity
    session_id: str
    start_time: datetime = Field(
        default_factory=datetime.now
    )
    end_time: datetime | None = None

    # candidate
    candidate_info: CandidateInfo

    # questions
    question_bank: list[Question]
    current_question: str | None = None
    current_question_type: str = "bank"

    # conversation
    conversation: list[ConversationEntry] = []

    # progress tracking
    question_count: int = 0
    bank_questions_asked: list[int] = []
    # status
    status: str = "active"          # "active" or "ended"