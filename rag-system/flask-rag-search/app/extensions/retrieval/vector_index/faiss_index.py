from typing import override

from common.dtype import Document  # type: ignore
from faiss import Index
from numpy import ndarray

from .abstract import VectorIndex


class FaissIndex(VectorIndex):

    def __init__(self, index: Index, metadata: list[dict]) -> None:
        super().__init__()
        self.index = index
        self.metadata = metadata

    @override
    def search(self, embedded_query: ndarray, k: int = 5) -> list[Document]:
        docs = []

        distances, indices = self.index.search(embedded_query, k=k)  # type: ignore
        for idx in indices[0]:
            docs.append(self.metadata[idx])

        return docs
