import os
from google.cloud import storage

class GCSStorage():
    def __init__(self, bucket_name: str):
        self.client = storage.Client()
        self.bucket_name = bucket_name
        self.bucket = self.client.bucket(bucket_name)

    def upload(self, source_file_path: str, destination_blob_name: str = None) -> None:
        # destination_blob_name이 None이면 원본 파일과 같은 폴더 구조로 업로드
        if destination_blob_name is None:
            destination_blob_name = source_file_path
        
        # blob 객체 생성 (GCS에서의 경로/파일명)
        blob = self.bucket.blob(destination_blob_name)

        # 파일 업로드
        blob.upload_from_filename(source_file_path)

    def download_directory(self, gcs_prefix: str, local_dir: str) -> None:
        blobs = self.client.list_blobs(self.bucket_name, prefix=gcs_prefix)

        for blob in blobs:
            # GCS "디렉터리" 이름과 동일한 prefix를 가진 파일만 선택됨
            relative_path = os.path.relpath(blob.name, gcs_prefix)
            local_path = os.path.join(local_dir, relative_path)

            # if os.path.exists(local_path):
            #     print(f"{local_path} is alreay exists!!")
            #     continue

            # 하위 디렉터리 생성
            os.makedirs(os.path.dirname(local_path), exist_ok=True)

            # blob 다운로드
            blob.download_to_filename(local_path)
            print(f"Downloaded {blob.name} to {local_path}")