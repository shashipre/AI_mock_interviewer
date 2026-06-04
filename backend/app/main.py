from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import resume,session, interview, audio
from app.logger import logger
from app.config import settings
from contextlib import asynccontextmanager
from app.core.stt_engine import STTEngine
from app.core.tts_engine import TTSEngine

@asynccontextmanager
async def lifespan(app: FastAPI):

    # Startup
    logger.info("Mock Interviewer API starting up...")
    logger.info(f"Debug mode: {settings.debug}")
    logger.info(f"LLM Provider: {settings.llm_provider}")

    app.state.stt_engine = STTEngine()
    app.state.tts_engine = TTSEngine()

    yield

    # Shutdown
    logger.info("Mock Interviewer API shutting down...")

app = FastAPI(
    title = "AI MOCK Interviewer",
    description = "Resume-based adaptive voice interviewer",
    version = "1.0.0",
    debug = settings.debug,
    lifespan= lifespan
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
app.include_router(audio.router,prefix="/api/v1/audio",tags=["audio"])


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "version": "1.0.0",
        "llm_provider": settings.llm_provider
    }