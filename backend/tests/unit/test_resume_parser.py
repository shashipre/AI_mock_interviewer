# tests/unit/test_resume_parser.py
import pytest
from app.core.resume_parser import clean_text
from app.exceptions import InvalidFileTypeError


# ─── clean_text tests ─────────────────────────────────
def test_clean_text_removes_extra_spaces():
    result = clean_text("Python   FastAPI    Docker")
    assert result == "Python FastAPI Docker"


def test_clean_text_removes_extra_newlines():
    result = clean_text("Skills\n\n\n\nExperience")
    assert result == "Skills\n\nExperience"


def test_clean_text_strips_edges():
    result = clean_text("   John Doe   ")
    assert result == "John Doe"


def test_clean_text_handles_empty_string():
    result = clean_text("")
    assert result == ""


def test_clean_text_handles_tabs():
    result = clean_text("Python\t\tFastAPI")
    assert result == "Python FastAPI"


# ─── parse_resume tests ───────────────────────────────
@pytest.mark.asyncio
async def test_parse_resume_rejects_invalid_file_type():
    class FakeFile:
        filename = "resume.txt"

    with pytest.raises(InvalidFileTypeError):
        from app.core.resume_parser import parse_resume
        await parse_resume(
            file=FakeFile(),
            session_id="test",
            upload_dir="/tmp"
        )