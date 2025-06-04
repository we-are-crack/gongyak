from abc import ABC, abstractmethod
from pathlib import Path

import numpy as np
from common.config.logger import setup_logging  # type: ignore
from common.dtype import Document  # type: ignore

from app.extensions.cloud_storage import CloudStorage

from ...vector_storage.abstract import VectorStorage
from ..abstract import VectorIndex


class VectorIndexManager(ABC):

    def __init__(
        self,
        vector_storage: VectorStorage,
        local_index_dir: Path,
        cloud_storage: CloudStorage | None = None,
        bucket: str | None = None,
        cloud_index_dir: Path | None = None,
    ) -> None:
        self.logger = setup_logging(f"{__name__}.{self.__class__.__name__}")
        self.vector_storage = vector_storage
        self.local_index_dir = local_index_dir
        self.cloud_storage = cloud_storage
        self.bucket = bucket
        self.cloud_index_dir = cloud_index_dir

        self.vector_indices = self._load_indices()

    def _download_latest_index_from_cloud(self) -> None:
        self.logger.info("클라우드 스토리지에서 인덱스 파일 다운로드 시도...")

        if (
            self.cloud_storage is None
            or self.bucket is None
            or self.cloud_index_dir is None
        ):
            raise ValueError(
                "클라우드 스토리지에서 다운로드하기 위해 클래스 변수 "
                "[cloud_storage, bucket, cloud_index_dir]은 필수 입니다."
            )

        self.cloud_storage.download_directory(
            bucket=self.bucket,
            prefix=str(self.cloud_index_dir),
            local_dir=str(self.local_index_dir),
        )

    @abstractmethod
    def _load_indices(self) -> dict[str, VectorIndex]:
        pass

    def query(
        self, embedded_query: np.ndarray, k: int = 5
    ) -> dict[str, list[Document]]:
        docs = {}
        for key, vi in self.vector_indices.items():
            docs[key] = vi.search(embedded_query=embedded_query, k=k)
        return docs

    def reload(self) -> None:
        self.logger.info("벡터 인덱스 리로딩...")
        self._load_indices()

    @abstractmethod
    def get_dtype(self) -> str:
        pass
