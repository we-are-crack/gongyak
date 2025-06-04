from abc import ABC, abstractmethod

from common.config.logger import setup_logging  # type: ignore
from common.dtype import Document  # type: ignore


class Reranker(ABC):

    def __init__(self) -> None:
        self.logger = setup_logging(f"{__name__}.{self.__class__.__name__}")

    @abstractmethod
    def rerank(
        self, q: str, docs_by_candidate: dict[str, Document], k: int
    ) -> dict[str, Document]:
        pass
