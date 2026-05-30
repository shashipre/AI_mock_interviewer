import httpx
import json
from app.llm.base import BaseLLMClient
from app.config import settings
from app.exceptions import LLMError, LLMTimeoutError, LLMJSONParseError
from app.logger import logger


class GroqClient(BaseLLMClient):

    def __init__(self):
        self.api_key = settings.llm_api_key
        self.model = settings.llm_model_name
        self.url = "https://api.groq.com/openai/v1/chat/completions"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    async def complete(self, prompt: str) -> str:
        payload = {
            "model": self.model,
            "messages": [
                {"role": "user", "content": prompt}
            ]
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    self.url,
                    headers=self.headers,
                    json=payload
                )
                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]

        except httpx.TimeoutException:
            logger.error("Groq timeout after 30s")
            raise LLMTimeoutError("Groq took too long to respond")

        except httpx.HTTPStatusError as e:
            logger.error(f"Groq HTTP error: {e.response.status_code}")
            raise LLMError(f"Groq API error: {e.response.status_code}")

        except Exception as e:
            logger.error(f"Unexpected LLM error: {str(e)}")
            raise LLMError(f"Unexpected error communicating with Groq: {str(e)}")

    async def complete_json(self, prompt: str) -> dict:
        json_prompt = prompt + "\n\nRETURN ONLY valid JSON. No explanation, no markdown, no backticks."

        raw_response = await self.complete(json_prompt)

        try:
            cleaned = raw_response.strip()
            cleaned = cleaned.removeprefix("```json")
            cleaned = cleaned.removeprefix("```")
            cleaned = cleaned.removesuffix("```")
            cleaned = cleaned.strip()

            return json.loads(cleaned)

        except json.JSONDecodeError as e:
            logger.error(f"JSON parse failed. Raw: {raw_response}")
            raise LLMJSONParseError(
                f"LLM returned invalid JSON: {str(e)}\nRaw response: {raw_response}"
            )
        