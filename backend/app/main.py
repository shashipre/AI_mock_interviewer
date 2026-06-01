from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import resume,session, interview
from app.logger import logger
from app.config import settings

app = FastAPI(
    title = "AI MOCK Interviewer",
    description = "Resume-based adaptive voice interviewer",
    version = "1.0.0",
    debug = settings.debug
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume.router, prefix="/api/v1/resume", tags=["resume"])
app.include_router(session.router, prefix="/api/v1/session", tags=["session"])
app.include_router(interview.router, prefix="/api/v1/interview", tags=["interview"])

@app.on_event("startup")
async def startup():
    logger.info("Mock Interviewer API starting up...")
    logger.info(f"Debug mode: {settings.debug}")
    logger.info(f"LLM Provider: {settings.llm_provider}")


@app.on_event("shutdown")
async def shutdown():
    logger.info("Mock Interviewer API shutting down...")

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "version": "1.0.0",
        "llm_provider": settings.llm_provider
    }