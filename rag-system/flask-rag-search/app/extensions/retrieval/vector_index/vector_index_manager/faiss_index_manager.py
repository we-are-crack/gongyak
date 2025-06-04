from pathlib import Path
from typing import override

from app.extensions.cloud_storage import CloudStorage

from ...vector_storage.abstract import VectorStorage
from ..abstract import VectorIndex
from .abstract import VectorIndexManager


class FaissIndexManager(VectorIndexManager):

    def __init__(
        self,
        vector_storage: VectorStorage,
        local_index_dir: Path,
        cloud_storage: CloudStorage | None = None,
        bucket: str | None = None,
        cloud_index_dir: Path | None = None,
    ) -> None:
        super().__init__(
            vector_storage=vector_storage,
            local_index_dir=local_index_dir,
            cloud_storage=cloud_storage,
            bucket=bucket,
            cloud_index_dir=cloud_index_dir,
        )

    @override
    def _load_indices(self) -> dict[str, VectorIndex]:
        try:
            self._download_latest_index_from_cloud()
        except ValueError as e:
            self.logger.info(f"클라우드 스토리지에서 인덱스 파일 다운로드 실패: {e}")

        self.logger.info("로컬 디렉토리로부터 인덱스 파일 로딩 시작...")

        vector_indices = {}
        for index_path in self.local_index_dir.iterdir():
            if not index_path.name.endswith(".index"):
                continue

            # 인덱스 파일명 : 정당영문명_후보자영문명_index
            candidate = index_path.stem.split("_")[1]
            vector_indices[candidate] = self.vector_storage.load_vector_index(
                index_path=index_path
            )

        return vector_indices

    @override
    def get_dtype(self) -> str:
        return "float32"
