from fastapi import APIRouter, Depends, UploadFile, File
from app.dependencies import get_llm
from app.llm.base import BaseLLMClient
from app.core.resume_parser import parse_resume
from app.schemas.resume import ResumeUploadResponse, ResumeAnalysis
from app.exceptions import (
    InvalidFileTypeError,
    FileParsingError,
    LLMError,
    LLMTimeoutError,
    ResumeTooShortError,
)
from config import settings

from app.logger import logger
from fastapi import HTTPException
import json
from app.config import settings

router = APIRouter()

@router.post("/upload", response_model=ResumeUploadResponse)

async def upload_resume(
    file = File(...),
    llm: BaseLLMClient = Depends(get_llm)
):
    logger.info(f"Received file upload: {file.filename}")

    try:
        resume_text = await parse_resume(file = file, session_id="temp", upload_dir=settings.uploads_dir)
        logger.info(f"Resume parsed successfully: {file.filename}")
    except InvalidFileTypeError as e:
        logger.error(f"Invalid file type: {file.filename}")
        raise HTTPException(status_code=400, detail=str(e))
    except FileParsingError as e:
        logger.error(f"Error parsing file: {file.filename} - {str(e)}")
        raise HTTPException(status_code=422, detail=str(e))

    if len(resume_text) < 100:
        logger.error(f"Resume too short: {file.filename} - Length: {len(resume_text)}")
        raise HTTPException(status_code=400, detail="Resume content is too short to analyze")

    try:
        import os
        current_dir = os.path.dirname(os.path.abspath(__file__))
        prompt_path = os.path.abspath(os.path.join(current_dir, "..", "..", "prompts", "resume_analysis.txt"))
        with open(prompt_path, "r") as f:
            prompt_template = f.read()
        prompt = prompt_template.format(resume_text = resume_text, question_bank_size = settings.question_bank_size) 
    except FileNotFoundError:
        logger.error("Prompt template not found: app/prompts/resume_analysis.txt")
        raise HTTPException(status_code=500, detail="Internal server error")
    
    try:
        raw_analysis = await llm.complete_json(prompt)
        logger.info(f"LLM analysis completed successfully for: {raw_analysis.get('candidate_name', 'Unknown')}")
    
    except LLMError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except LLMTimeoutError as e:
        raise HTTPException(status_code=504, detail=str(e))
    
    try:
        analysis = ResumeAnalysis(**raw_analysis)

    except Exception as e:
        logger.error(f"Schema validation failed for LLM response: {str(e)} - Raw response: {json.dumps(raw_analysis)}")
        raise HTTPException(status_code=500, detail="LLM returned invalid data format")
    
    return ResumeUploadResponse(message="Resume uploaded and analyzed successfully", analysis=analysis)
