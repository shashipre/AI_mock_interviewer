import pdfplumber
import docx2txt
import re
import os
from app.exceptions import InvalidFileTypeError,FileParsingError


def clean_text(text: str) -> str:
    text = re.sub(r'[ \t]+', ' ', text)  # Replace tabs and multiple spaces with a single space
    text = re.sub(r'\n{3,}', '\n\n', text)  # Replace multiple newlines with two newlines
    return text.strip()

def parse_pdf(file_path: str) -> str:
    try: 
        text = ""
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text: # Check if text was extracted successfully
                    text += page_text + "\n"
        return clean_text(text)
    except Exception as e:
        raise FileParsingError(f"Error parsing PDF file: {str(e)}")

def parse_docx(file_path: str) -> str:
    try:
        text = docx2txt.process(file_path)
        return clean_text(text)
    except Exception as e:
        raise FileParsingError(f"Error parsing DOCX file: {str(e)}")

async def parse_resume(file, session_id: str, upload_dir: str) -> str:
    filename = file.filename.lower()
    if not (filename.endswith(".pdf") or filename.endswith(".docx")):
        raise InvalidFileTypeError("Unsupported file type. Only PDF and DOCX are allowed.")
    
    save_path = os.path.join(upload_dir, f"{session_id}_{file.filename}")

    content = await file.read()

    os.makedirs(upload_dir, exist_ok=True)
    with open(save_path, "wb") as f:
        f.write(content)
    
    try:
        if filename.endswith(".pdf"):
            return parse_pdf(save_path)
        elif filename.endswith(".docx"):
            return parse_docx(save_path)
    except Exception as e:
        if os.path.exists(save_path):
            os.remove(save_path)
        raise



    
    
    