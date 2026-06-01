from pydantic import BaseModel


class Experience(BaseModel):
    company: str
    role: str
    duration: str
    summary: str

class Project(BaseModel):
    name: str
    tech_stack: list[str]
    summary: str

class Question(BaseModel):
    question: str
    topic: str
    based_on: str

class CandidateInfo(BaseModel):
    candidate_name: str = ""
    target_role: str
    interviewer_summary: str

class ResumeAnalysis(BaseModel):
    candidate_info : CandidateInfo
    skills: list[str]
    experience: list[Experience]
    projects: list[Project]
    question_bank: list[Question]


class ResumeUploadResponse(BaseModel):
    message: str
    analysis: ResumeAnalysis

