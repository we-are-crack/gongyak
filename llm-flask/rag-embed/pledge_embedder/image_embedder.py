import shutil
from pathlib import Path
from typing import List, override

from embedder.text_embedder import TextEmbedder
from pledge_embedder.embedder import Embedder
from storage.local_storage import local_storage
from storage.vector_storage import VectorStorage
from utils.text_extract import extract_text_with_ocr


class ImageEmbedder(Embedder):

    def __init__(
        self,
        candidate: str,
        vector_storage: VectorStorage,
        text_embedder: TextEmbedder,
        src_dir: Path,
        exclusion: List[str] = [],
    ):
        super().__init__(
            candidate=candidate,
            vector_storage=vector_storage,
            text_embedder=text_embedder,
        )

        if not src_dir.is_dir():
            raise ValueError(f"{src_dir}은 이미지가 담긴 디렉토리여야 합니다.")

        self.src_dir = src_dir
        # 입력 이미지 디렉토리를 img_dir로 복사
        shutil.copytree(src_dir, self.img_dir, dirs_exist_ok=True)

        self.exclusion = exclusion

    @override
    def _preprocess(self) -> List[Path]:
        image_paths = []
        for path in local_storage.list_files(self.src_dir):
            if path.suffix not in [".png", ".jpg", ".jpeg"]:
                continue

            image_path = self.img_dir / path.name
            image_paths.append(image_path)

        extract_text_with_ocr(
            image_paths=image_paths, output_dir=self.txt_dir, exclusion=self.exclusion
        )

        return image_paths
