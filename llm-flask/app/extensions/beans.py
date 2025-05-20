import os

from app.util_classes.local_storage import LocalStorage
from app.util_classes.gcs_storage import GCSStorage
from app.util_classes.gemini import Gemini
from app.util_classes.faiss import Faiss
from app.util_classes.name_k2e_convertor import NameKor2EngConvertor

### 환경 변수 로드 ###
PRIVATE_BUCKET = os.getenv("GOOGLE_CLOUD_STORAGE_GONGYAK_PRIVATE_BUCKET")
PUBLIC_BUCKET = os.getenv("GOOGLE_CLOUD_STORAGE_GONGYAK_PUBLIC_BUCKET")

API_KEY = os.getenv("GEMINI_API_KEY")
PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT_ID")
LOCATION = os.getenv("GEMINI_LOCATION")

### 공유 객체 생성
local_storage = LocalStorage()

private_gcs_storage = GCSStorage(PRIVATE_BUCKET)
public_gcs_storage = GCSStorage(PUBLIC_BUCKET)

gemini = Gemini(API_KEY, PROJECT_ID, LOCATION)

faiss = Faiss(local_storage, private_gcs_storage)

name_k2e_convertor = NameKor2EngConvertor()
