from abc import ABC, abstractmethod
from pathlib import Path

from common.config.logger import setup_logging  # type: ignore

from ..vector_index.abstract import VectorIndex


class VectorStorage(ABC):

    def __init__(self) -> None:
        self.logger = setup_logging(f"{__name__}.{self.__class__.__name__}")

    @abstractmethod
    def load_vector_index(self, index_path: Path) -> VectorIndex:
        pass
