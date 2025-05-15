import os
from app.extensions.storage import storage
from app.storage.gcs_storage import GCSStorage

def upload_directory(gcs_storage: GCSStorage, directory_path: str):
    print(f"begin {directory_path} upload to gcs...")

    for file in storage.list_files(directory_path):
        source_file_path = os.path.join(storage.base_dir, directory_path, file)
        destination_blob_name = source_file_path

        gcs_storage.upload(source_file_path, destination_blob_name)

    print(f"complete {directory_path} upload to gcs...")