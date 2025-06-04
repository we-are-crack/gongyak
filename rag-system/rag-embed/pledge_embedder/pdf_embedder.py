import shutil
from pathlib import Path
from typing import List, override

import utils.pdf_utils as pdf_utils
from embedder.text_embedder import TextEmbedder
from pledge_embedder.embedder import Embedder
from storage.vector_storage import VectorStorage
from utils.text_extract import extract_text_with_ocr, extract_text_with_pymupdf


class PDFEmbedder(Embedder):

    def __init__(
        self,
        candidate: str,
        vector_storage: VectorStorage,
        text_embedder: TextEmbedder,
        src_pdf_path: str | Path,
        first_page: int = 1,
        real_first_page: int = 1,
        last_page: int = -1,
        readable: bool = False,
        need_virtical_split: bool = False,
        exlusion: List[str] = [],
    ):
        super().__init__(
            candidate=candidate,
            vector_storage=vector_storage,
            text_embedder=text_embedder,
        )

        if isinstance(src_pdf_path, str):
            src_pdf_path = Path(src_pdf_path)

        if not src_pdf_path.exists():
            raise FileNotFoundError(f"'{src_pdf_path}'를 찾을 수 없습니다.")

        # 정당영문명_후보자영문명 폴더 밑으로 저장
        self.pdf_path = self.base_dir / src_pdf_path.name
        shutil.copy(src=src_pdf_path, dst=self.pdf_path)

        self.need_virtical_split = need_virtical_split
        self.readable = readable
        self.first_page = first_page
        self.real_first_page = real_first_page
        self.last_page = last_page
        self.exclusion = exlusion

    @override
    def _preprocess(self) -> List[Path]:
        self.logger.info("PDF 전처리 시작...")

        # 양쪽으로 구성된 PDF라면 한쪽씩 나눠 저장
        if self.need_virtical_split:
            self.pdf_path = pdf_utils.split_pdf_vertically(
                pdf_path=self.pdf_path,
                first_page=self.first_page,
                last_page=self.last_page,
            )

        # PDF 각 페이지를 이미지로 저장
        saved_image_paths = pdf_utils.save_pdf_pages_as_images(
            self.pdf_path, self.img_dir, self.real_first_page
        )

        # 페이지별 텍스트 추출
        if self.readable:
            # 읽을 수 있는 PDF는 PyMuPDF로 추출
            extract_text_with_pymupdf(
                pdf_path=self.pdf_path,
                output_dir=self.txt_dir,
                start_page=self.real_first_page,
            )
        else:
            # 읽을 수 없는 PDF는 OCR로 추출
            extract_text_with_ocr(
                image_paths=saved_image_paths,
                output_dir=self.txt_dir,
                exclusion=self.exclusion,
            )

        return saved_image_paths
