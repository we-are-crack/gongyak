from abc import ABC, abstractmethod

import numpy as np
from common.config.logger import setup_logging  # type: ignore
from common.dtype import Document  # type: ignore


class VectorIndex(ABC):

    def __init__(self) -> None:
        self.logger = setup_logging(f"{__name__}.{self.__class__.__name__}")

    @abstractmethod
    def search(self, embedded_query: np.ndarray, k: int = 5) -> list[Document]:
        pass
