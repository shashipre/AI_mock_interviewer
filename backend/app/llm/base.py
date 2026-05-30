from abc import ABC, abstractmethod

class BaseLLMClient(ABC):
    @abstractmethod
    async def complete(self, prompt: str) -> str:
        """
        Send a prompt to the LLM and return the generated response.
        Every LLM client must implement this method to handle the specific API calls and response parsing.
        """
        pass

    @abstractmethod
    async def complete_json(self, prompt: str) -> dict:
        """
        Send a prompt to the LLM and return the generated response as a JSON object.
        This method is useful for structured data generation where the response needs to be parsed into a dictionary.
        """
        pass
    