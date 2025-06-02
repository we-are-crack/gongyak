from pathlib import Path
from typing import override

import faiss
import numpy as np

from storage.vector_storage import VectorStorage


class Faiss(VectorStorage):

    def __init__(self):
        super().__init__()

    @override
    def _write_index(self, embeddings: np.ndarray, output_dir: Path, index_name: str):
        dimension = embeddings.shape[1]
        index = faiss.IndexFlatL2(dimension)
        index.add(embeddings)  # type: ignore

        index_path = str(output_dir / f"{index_name}.index")
        faiss.write_index(index, index_path)

    @override
    def _merge_index(self, embeddings: np.ndarray, output_dir: Path, index_name: str):
        index_path = str(output_dir / f"{index_name}.index")

        existing_index = faiss.read_index(index_path)

        if existing_index.d != embeddings.shape[1]:
            raise ValueError("기존 인덱스와 차원이 다릅니다.")

        # 병합
        existing_index.add(embeddings)

        faiss.write_index(existing_index, index_path)

    @override
    def get_dtype(self) -> str:
        return "float32"


vs_faiss = Faiss()
