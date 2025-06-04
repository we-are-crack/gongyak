from pathlib import Path
from typing import override

from google.cloud import storage

from .abstract import CloudStorage


class GoogleCloudStorage(CloudStorage):

    def __init__(self) -> None:
        super().__init__()

        try:
            self.client = storage.Client()
        except Exception as e:
            raise RuntimeError(
                "GCS 클라이언트를 생성하는 중 인증 문제가 발생했습니다."
            ) from e

    @override
    def download_directory(self, bucket: str, prefix: str, local_dir: str) -> None:
        blobs = self.client.list_blobs(bucket, prefix=prefix)

        for blob in blobs:
            # GCS "디렉터리" 이름과 동일한 prefix를 가진 파일만 선택됨
            if blob.name.endswith("/"):
                continue  # 디렉토리 추정 항목은 무시
            rel_path = blob.name[len(prefix) :].lstrip("/")
            local_path = Path(local_dir) / rel_path
            local_path.parent.mkdir(parents=True, exist_ok=True)

            # blob 다운로드
            blob.download_to_filename(local_path)
            self.logger.info(f"Downloaded {blob.name} to {local_path}")
