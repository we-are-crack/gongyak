import pickle
from abc import ABC, abstractmethod
from pathlib import Path
from typing import List

import numpy as np
from common.config.logger import setup_logging  # type: ignore
from common.dtype import Document  # type: ignore


class VectorStorage(ABC):

    def __init__(self):
        self.logger = setup_logging(f"{__name__}.{self.__class__.__name__}")

    @abstractmethod
    def _write_index(self, embeddings: np.ndarray, output_dir: Path, index_name: str):
        pass

    def embed(
        self,
        embeddings: np.ndarray,
        docs: List[Document],
        output_dir: Path,
        index_name: str,
    ):
        self.logger.info("새로운 인덱스 생성")

        # 임베딩 결과를 벡터 저장소에 저장
        self._write_index(
            embeddings=embeddings, output_dir=output_dir, index_name=index_name
        )

        # 메타데이터 저장
        pkl = output_dir / f"{index_name}.pkl"
        with open(pkl, "wb") as f:
            pickle.dump(docs, f)

    @abstractmethod
    def _merge_index(self, embeddings: np.ndarray, output_dir: Path, index_name: str):
        pass

    def embed_merge(
        self,
        embeddings: np.ndarray,
        docs: List[Document],
        output_dir: Path,
        index_name: str,
    ):
        self.logger.info("기존 인덱스와 병합")
        index_path = output_dir / f"{index_name}.index"
        if not index_path.exists():
            self.logger.info(
                "기존 인덱스: %s가 존재하지 않아 새로 생성합니다.", str(index_path)
            )
            self.embed(
                embeddings=embeddings,
                docs=docs,
                output_dir=output_dir,
                index_name=index_name,
            )
            return

        # 임베딩 결과를 기존 인덱스와 병합
        self._merge_index(
            embeddings=embeddings, output_dir=output_dir, index_name=index_name
        )

        # 메타데이터 병합
        pkl = output_dir / f"{index_name}.pkl"
        if pkl.exists():
            with open(pkl, "rb") as f:
                existing_metadata = pickle.load(f)

        merged_metadata = existing_metadata + docs  # type: ignore
        with open(pkl, "wb") as f:
            pickle.dump(merged_metadata, f)

    @abstractmethod
    def get_dtype(self) -> str:
        pass
