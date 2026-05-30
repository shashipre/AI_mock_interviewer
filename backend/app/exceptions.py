# Resume Parser Exceptions

class InvalidFileTypeError(Exception):
    """Raised when uploaded file is not PDF or DOCX"""
    pass

class FileParsingError(Exception):
    """Raised when there is an error parsing the uploaded file"""
    pass

class ResumeTooShortError(Exception):
    """Raised when the parsed resume content is too short to be valid"""
    pass

# LLM Exceptions

class LLMError(Exception):
    """Raised when LLM API call fails for any reason"""
    pass

class LLMTimeoutError(LLMError):
    """Raised when LLM takes too long to respond"""
    pass

class LLMInvalidResponseError(LLMError):
    """Raised when LLM returns an invalid or unexpected response"""
    pass

class LLMJSONParseError(LLMError):
    """Raised when LLM response cannot be parsed as JSON"""
    pass


