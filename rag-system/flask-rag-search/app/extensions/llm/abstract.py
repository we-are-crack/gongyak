from abc import ABC, abstractmethod
from typing import Any

from common.config.logger import setup_logging  # type: ignore


class LLM(ABC):

    def __init__(self, default_model: str) -> None:
        self.logger = setup_logging(f"{__name__}.{self.__class__.__name__}")
        self.default_model = default_model

    @abstractmethod
    def generate_content(self, prompt: str, model: str | None = None) -> str:
        pass

    @abstractmethod
    def generate_content_as_json(
        self, prompt: str, model: str | None = None
    ) -> dict[str, Any]:
        pass
