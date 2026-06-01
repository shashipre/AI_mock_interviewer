from pydantic import BaseModel, Field
from datetime import datetime
from app.schemas.resume import Question


class CandidateInfo(BaseModel):
    candidate_name: str = ""
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
    session_id: str = ""
    start_time: datetime = Field(default_factory=datetime.now)
    end_time: datetime | None = None

    # candidate
    candidate_info: CandidateInfo | None = None

    # questions
    question_bank: list[Question] = Field(default_factory=list)
    current_question: str | None = None
    current_question_type: str = "bank"

    # conversation
    conversation: list[ConversationEntry] = Field(default_factory=list)

    # progress tracking
    question_count: int = 0
    consecutive_followups: int = 0
    bank_questions_asked: list[int] = Field(default_factory=list)
    # status
    status: str = "active"