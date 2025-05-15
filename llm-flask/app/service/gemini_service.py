import os
from google import genai
from google.genai import types

class GeminiService:

    MODLE_2_0_FLASH_001 = "gemini-2.0-flash-001"
    MODLE_2_0_FLASH_LITE_001 = "gemini-2.0-flash-lite-001"

    def __init__(self, api_key: str, project_id: str, location: str, model_name: str = MODLE_2_0_FLASH_LITE_001):
        self.model_name = model_name
        self.client = self._init_model(api_key, project_id, location)

    def _init_model(self, api_key: str, project_id: str, location: str):
        client = genai.Client(api_key = api_key)

        return genai.Client(
            vertexai = True, project = project_id, location = location
        )

    def generate(self, prompt: str) -> str:
        return self.client.models.generate_content(
            model = self.model_name,
            contents = prompt
        ).text.strip()