import pickle
from pathlib import Path
from typing import override

import faiss

from ..vector_index.abstract import VectorIndex
from ..vector_index.faiss_index import FaissIndex
from .abstract import VectorStorage


class FaissStorage(VectorStorage):

    def __init__(self) -> None:
        super().__init__()

    @override
    def load_vector_index(self, index_path: Path) -> VectorIndex:
        pkl_path = index_path.with_suffix(".pkl")

        if not index_path.exists() or not pkl_path.exists():
            raise FileNotFoundError(
                f"{index_path.stem}의 .index 파일과 .pkl 파일 모두 존재해야 합니다."
            )

        index = faiss.read_index(str(index_path))
        with open(pkl_path, "rb") as f:
            metadata = pickle.load(f)

        return FaissIndex(index=index, metadata=metadata)
