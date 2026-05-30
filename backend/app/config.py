import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    llm_provider: str
    llm_api_key: str
    llm_model_name: str

    uploads_dir: str = "uploads"
    reports_dir: str = "reports"

    max_bank_questions: int = 5          # how many from question bank
    max_consecutive_followups: int = 2   # follow-ups per bank question
    question_bank_size: int = 7          # how many LLM generates (bank + buffer)

    @property
    def max_interview_questions(self) -> int:
        return (
            self.max_bank_questions *
            (self.max_consecutive_followups + 1)
        )

    app_host: str = "127.0.0.1"
    app_port: int = 8000
    debug: bool = False

    class Config:
        env_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env")

settings = Settings()

