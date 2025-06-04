import json
from typing import Any, override

from google import genai

from .abstract import LLM


class GoogleGemini(LLM):

    MODEL_2_0_FLASH_001 = "gemini-2.0-flash-001"
    MODEL_2_0_FLASH_LITE_001 = "gemini-2.0-flash-lite-001"

    def __init__(self, default_model: str = MODEL_2_0_FLASH_001) -> None:
        super().__init__(default_model=default_model)

        try:
            self.client = genai.Client()
        except Exception as e:
            raise RuntimeError(
                "환경변수 [GOOGLE_CLOUD_PROJECT, "
                "GOOGLE_CLOUD_LOCATION, "
                "GOOGLE_GENAI_USE_VERTEXAI]는 필수 입니다."
            ) from e

    @override
    def generate_content(self, prompt: str, model: str | None = None) -> str:
        if model is None:
            model = self.default_model

        response = self.client.models.generate_content(model=model, contents=prompt)

        if not response.text:
            raise RuntimeError("Gemini 응답 에러: 텍스트가 포함되지 않았습니다.")

        return response.text.strip()

    @override
    def generate_content_as_json(
        self, prompt: str, model: str | None = None
    ) -> dict[str, Any]:
        generated_content = self.generate_content(prompt, model)
        return json.loads(
            generated_content.strip()
            .removeprefix("```json")
            .removesuffix("```")
            .strip()
        )
