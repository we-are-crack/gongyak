import os

from google.cloud import storage


class GCSStorage:

    BUCKET_BASE_URL = "https://storage.googleapis.com"

    PUBLIC_BUCKET = os.getenv("GOOGLE_CLOUD_STORAGE_GONGYAK_PUBLIC_BUCKET", "")
    if not PUBLIC_BUCKET:
        raise EnvironmentError(
            "환경변수 GOOGLE_CLOUD_STORAGE_GONGYAK_PUBLIC_BUCKET이 설정되어 있지 않습니다."
        )

    PRIVATE_BUCKET = os.getenv("GOOGLE_CLOUD_STORAGE_GONGYAK_PRIVATE_BUCKET", "")
    if not PUBLIC_BUCKET:
        raise EnvironmentError(
            "환경변수 GOOGLE_CLOUD_STORAGE_GONGYAK_PRIVATE_BUCKET이 설정되어 있지 않습니다."
        )

    PUBLIC_BUCKET_BASE_URL = f"{BUCKET_BASE_URL}/{PUBLIC_BUCKET}"

    def __init__(self, bucket_name: str):
        self.client = storage.Client()
        self.bucket_name = bucket_name
        self.bucket = self.client.bucket(bucket_name)

    def upload(
        self, source_file_path: str, destination_blob_name: str | None = None
    ) -> None:
        # destination_blob_name이 None이면 원본 파일과 같은 폴더 구조로 업로드
        if destination_blob_name is None:
            destination_blob_name = source_file_path

        # blob 객체 생성 (GCS에서의 경로/파일명)
        blob = self.bucket.blob(destination_blob_name)

        # 파일 업로드
        blob.upload_from_filename(source_file_path)


private_gcs = GCSStorage(GCSStorage.PRIVATE_BUCKET)
public_gcs = GCSStorage(GCSStorage.PUBLIC_BUCKET)
