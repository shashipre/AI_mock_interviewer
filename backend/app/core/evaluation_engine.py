import json
import os
from app.llm.base import BaseLLMClient
from app.schemas.session import Session
from app.schemas.evalution import EvaluationResult

class EvaluationEngine:
    def __init__ (self, llm_client: BaseLLMClient):
        self.llm_client = llm_client

        async def evaluate_session(self, session: Session) -> EvaluationResult:
            transcript_text = ""
            for i, entry in enumerate(session.conversation):
                q_num = i+ 1
                transcript_text += f"Question {q_num}: {entry.question}\n"
                transcript_text += f"Answer {q_num}: {entry.answer or 'No answer provided.'}\n\n"

                current_dir = os.path.dirname(os.path.abspath(__file__))

                prompt_path = os.path.abspath(os.path.join(current_dir,"..","prompt", "evaluation_prompt.txt"))

                with open(prompt_path, "r") as f:
                    prompt_template = f.read()
                
                target_role = session.condidate_info.target_role if session.candidate_info  else "Software Engineer"

                interviewer_summary = session.candidate_info.interviewer_summary if session.candidate_info else ""

            
                prompt = prompt_template.format(
                    target_role = target_role,
                    interviewer_summary = interviewer_summary,
                    transcript = transcript_text
                    )
                
                raw_evaluation= await self.llm_client.complete_json(prompt)

                raw_evaluation["session_id"] = session.session_id

                return EvaluationResult(**raw_evaluation)