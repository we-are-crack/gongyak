import os
from app.storage.gcs_storage import GCSStorage

PRIVATE_BUCKET = os.getenv("GOOGLE_CLOUD_STORAGE_GONGYAK_PRIVATE_BUCKET")
PUBLIC_BUCKET = os.getenv("GOOGLE_CLOUD_STORAGE_GONGYAK_PUBLIC_BUCKET")

private_gcs_storage = GCSStorage(PRIVATE_BUCKET)
public_gcs_storage = GCSStorage(PUBLIC_BUCKET)