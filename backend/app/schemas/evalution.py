from pydantic import BaseModel, Field


class SkillScore(BaseModel):
    category : str
    score : float
    feedback : str

class EvaluationResult(BaseModel):
    session_id : str
    overall_score: float
    categories: list[SkillScore] = Field(default_factory = list)
    strengths: list[str] = Field(default_factory = list)
    weaknesses: list[str] = Field(defult_factory = list)
    recommendations: list[str] = Field(defult_factory = list)
