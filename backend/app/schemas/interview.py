from pydantic import BaseModel
from app.schemas.resume import ResumeAnalysis


class StartSessionRequest(BaseModel):
    resume_analysis: ResumeAnalysis

class AnswerRequest(BaseModel):
    session_id : str
    answer: str

class QuestionResponse(BaseModel):
    session_id : str
    question: str
    question_type: str
    question_number: int
    is_complete: bool

class InterviewCompleteResponse(BaseModel):
    session_id: str
    total_questions: int
    message: str   



