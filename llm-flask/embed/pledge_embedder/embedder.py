from abc import ABC, abstractmethod
from pathlib import Path
from typing import List

from common_config.logger_config import setup_logging  # type: ignore

from embedder.document_cls import Document
from embedder.text_embedder import TextEmbedder
from storage.gcs_storage import GCSStorage, private_gcs, public_gcs
from storage.local_storage import LocalStorage, local_storage
from storage.vector_storage import VectorStorage
from utils.base64url_encode import encode_to_base64url
from utils.candidate_info import get_candidate_info


class Embedder(ABC):

    EMBEDDING_MODEL_DRAGONKUE_BGE_M3 = "dragonkue/BGE-m3-ko"
    INDEX_DIR = LocalStorage.BASE_DIR / "indexes"

    # parameter:
    # - candidate: 후보자명(한글 or 영어)
    # - vector_storage: 사용할 벡터스토리지
    # - embedding_model_name: 사용할 임베딩 모델 이름
    def __init__(
        self, candidate: str, vector_storage: VectorStorage, text_embedder: TextEmbedder
    ):
        self.logger = setup_logging(f"{__name__}.{self.__class__.__name__}")
        self.text_embedder = text_embedder
        self.INDEX_DIR.mkdir(parents=True, exist_ok=True)

        candidate_info = get_candidate_info(candidate)
        if candidate_info is None:
            raise ValueError(
                f"유효한 후보자 이름을 입력하세요. 입력 후보자 이름: {candidate}"
            )
        else:
            self.candidate_info: dict = candidate_info

        political_party_eng = self.candidate_info.get("political_party_eng")
        candidate_eng = self.candidate_info.get("candidate_eng")

        self.base_dir = Path(
            f"{LocalStorage.BASE_DIR}/{political_party_eng}_{candidate_eng}"
        )
        self.base_dir.mkdir(parents=True, exist_ok=True)

        self.img_dir = self.base_dir / "imgs"
        self.img_dir.mkdir(parents=True, exist_ok=True)

        self.txt_dir = self.base_dir / "txts"
        self.txt_dir.mkdir(parents=True, exist_ok=True)

        self.index_name = f"{political_party_eng}_{candidate_eng}_index"
        self.vector_storage = vector_storage

    # 임베딩할 이미지 파일 이름 리스트 반환
    @abstractmethod
    def _preprocess(self) -> List[Path]:
        # --- PDF 기반 임베딩인 경우
        # 1-1. PDF 저장 (필요시 양쪽으로 분할해 저장)
        # 1-2. PDF 각 페이지를 이미지로 저장
        # ---
        # 2. PDF 또는 이미지로부터 텍스트 추출 후 저장
        #   - PDF의 경우 제외할 페이지는 제외해 텍스트 추출
        pass

    def embed(self, merge: bool, prefix: str = ""):
        saved_image_paths = self._preprocess()

        self.logger.info("텍스트 임베딩 시작")
        documents = []
        for image_file in saved_image_paths:
            if image_file.suffix not in [".png", ".jpg", ".jpeg"]:
                continue

            text_file_name = f"{image_file.stem}.txt"
            text_file_path = self.txt_dir / text_file_name
            if not text_file_path.exists():
                continue

            text = local_storage.load(text_file_path)
            if not text:
                # 비어있는 경우
                continue

            if isinstance(text, str):
                content = f"{prefix}{text.replace("\n", " ")}"
            else:
                # 바이너리 파일이면 처리 생략하거나 예외 처리
                # raise TypeError("텍스트 파일이 아닙니다.")
                continue

            metadata = self._build_metadata(image_file)
            documents.append(Document(page_content=content, metadata=metadata))

        embeddings = self.text_embedder.embed(
            docs=documents, dtype=self.vector_storage.get_dtype()
        )

        if merge:
            # 기존 인덱스와 병합
            self.vector_storage.embed_merge(
                embeddings=embeddings,
                docs=documents,
                output_dir=self.INDEX_DIR,
                index_name=self.index_name,
            )
        else:
            # 새로운 인덱스 생성
            self.vector_storage.embed(
                embeddings=embeddings,
                docs=documents,
                output_dir=self.INDEX_DIR,
                index_name=self.index_name,
            )

        self._upload_result()

    def _build_metadata(self, image_file: Path) -> dict:
        public_bucket_base_url = GCSStorage.PUBLIC_BUCKET_BASE_URL
        encoded_name = encode_to_base64url(image_file.stem)
        suffix = image_file.suffix
        source_image = f"{public_bucket_base_url}/{self.img_dir}/{encoded_name}{suffix}"
        return {
            "source_image": source_image,
            "political_party": self.candidate_info.get("political_party"),
            "political_party_eng": self.candidate_info.get("political_party_eng"),
            "candidate": self.candidate_info.get("candidate"),
            "candidate_eng": self.candidate_info.get("candidate_eng"),
        }

    def _upload_result(self):
        self.logger.info("인덱스 파일 업로드...")
        # 인덱스 파일 업로드
        index_path = self.INDEX_DIR / f"{self.index_name}.index"
        pkl_path = self.INDEX_DIR / f"{self.index_name}.pkl"

        private_gcs.upload(str(index_path))
        private_gcs.upload(str(pkl_path))

        # 모든 리소스 파일 비공개 버킷에 업로드
        self.logger.info("비공개 버킷에 전체 결과 파일 업로드...")
        for file_path in self.base_dir.rglob("*"):
            if not file_path.is_file():
                continue

            private_gcs.upload(str(file_path))

        # 이미지 파일 base64Url 인코딩해 업로드
        self.logger.info("공개 버킷에 이미지 파일 업로드...")
        for image_path in self.img_dir.iterdir():
            if image_path.suffix not in [".png", ".jpg", ".jpeg"]:
                continue

            encoded_name = encode_to_base64url(image_path.stem)
            encoded_path = self.img_dir / f"{encoded_name}{image_path.suffix}"

            public_gcs.upload(str(image_path), str(encoded_path))
