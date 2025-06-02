from io import BytesIO
from pathlib import Path
from typing import List

import fitz
from common_config.logger_config import setup_logging  # type: ignore
from google.cloud import vision  # type: ignore

from storage.local_storage import local_storage

logger = setup_logging(__name__)


def extract_text_with_pymupdf(pdf_path: Path, output_dir: Path, start_page: int = 1):
    logger.info("PyMuPDF를 사용해 페이지별 텍스트 추출")
    with fitz.open(pdf_path) as doc:
        for idx, page in enumerate(doc, start=start_page):  # type: ignore
            text = page.get_text("text")

            # 텍스트 내용을 BytesIO에 저장
            text_stream = BytesIO()
            text_stream.write(text.encode("utf-8"))
            text_stream.seek(0)  # 스트림을 처음 위치로 리셋

            text_file_name = (
                f"page_{idx}.txt"  # page_{start_page}.txt, page_{start_page + 1}.txt, …
            )
            local_storage.save(text_stream, output_dir, text_file_name)


def extract_text_with_ocr(
    image_paths: List[Path], output_dir: Path, exclusion: List[str] = []
):
    logger.info("OCR을 사용해 페이지별 텍스트 추출")
    client = vision.ImageAnnotatorClient()

    for ip in image_paths:
        if (
            not ip.exists()
            or ip.suffix not in [".png", ".jpg", ".jpeg"]
            or ip.stem in exclusion
        ):
            continue

        image_file = local_storage.load(full_path=ip)
        if not isinstance(image_file, bytes):
            print("byte 파일이어야 합니다.")
            continue

        image = vision.Image(content=image_file)

        response = client.text_detection(image=image)  # type: ignore

        text = (
            response.text_annotations[0].description
            if response.text_annotations
            else ""
        )

        text_file_name = f"{ip.stem}.txt"

        # 텍스트 내용을 BytesIO에 저장
        text_stream = BytesIO()
        text_stream.write(text.encode("utf-8"))
        text_stream.seek(0)  # 스트림을 처음 위치로 리셋

        # local_storage.save를 사용하여 텍스트 파일 저장
        local_storage.save(text_stream, output_dir, text_file_name)
