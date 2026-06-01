import os
from typing import Tuple, Optional
from app.schemas.session import Session
from app.llm.base import BaseLLMClient
from app.config import settings
from app.logger import logger
class FollowupEngine:
    def __init__(self, llm_client: BaseLLMClient):
        self.llm = llm_client
    async def get_next_question(self, session:Session) -> Tuple[Optional[str], str, bool]:
        """
        Processes the current session state and returns a Tuple:
        (next_question_text, question_type, is_complete)
        
        Question Types: "bank" or "followup"
        """
        if session.question_count >= settings.max_interview_questions:
            logger.info(f"Interview {session.session_id} completed: reached max question limit.")
            return None, "ended", True
        
        last_question = None
        last_answer = None

        if session.conversation:
            last_entry =  session.conversation[-1]
            last_question = last_entry.question
            last_answer = last_entry.answer
        
        should_followup = (
            session.conversation is not None
            and len(session.conversation) > 0
            and session.consecutive_followups < settings.max_consecutive_followups
            and last_answer is not None
            and len(last_answer.strip()) > 0
        )

        if should_followup:
            try:
                 question_text = await self._generate_llm_followup(session, last_question, last_answer)
                 session.consecutive_followups += 1
                 return question_text, "followup", False
            except Exception as e:
                logger.error(
                    f"Failed to generate LLM follow-up for {session.session_id}: {str(e)}. Falling back to bank."
                                 )
                # Fall back to bank if LLM fails
                
        asked_count = len(session.bank_questions_asked)

        if asked_count < settings.max_bank_questions and asked_count < len(session.question_bank):
            # We found a bank question!
            bank_question_obj = session.question_bank[asked_count]
            session.bank_questions_asked.append(asked_count)
            session.consecutive_followups = 0  # Reset counter
            return bank_question_obj.question, "bank", False
        
        return None, "ended", True


    async def _generate_llm_followup(self, session: Session, last_question:str, last_answer:str)->str:
        """
        Builds the prompt and calls the Groq LLM to generate the next follow-up question.
        """
        current_dir = os.path.dirname(os.path.abspath(__file__))
        prompt_path = os.path.abspath(os.path.join(current_dir,"..","prompts","followup.txt")) 

        with open(prompt_path, "r") as f:
            prompt_template = f.read()

        history_str = ""

        for entry in session.conversation[:-1]:
            history_str += f"Interviewer ({entry.question_type}): {entry.question}\n"

            if entry.answer:
                history_str += f"Candidate: {entry.answer}\n"
            history_str += "---\n"
        
        if not history_str:
            history_str = "No previous history."

        prompt = prompt_template.format(
            target_role =session.candidate_info.target_role,
            interviewer_summary =session.candidate_info.interviewer_summary,
            conversation_history =history_str,
            last_question =last_question or "None",
            last_answer =last_answer or "None"
        )

        raw_json = await self.llm.complete_json(prompt)
        question = raw_json.get("question")

        if not question or not isinstance(question, str):
            raise ValueError("LLM JSON did not contain a valid 'question' string.")
        return question.strip()
