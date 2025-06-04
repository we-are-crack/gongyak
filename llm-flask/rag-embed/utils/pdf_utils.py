from pathlib import Path
from typing import List

import fitz
from common.config.logger import setup_logging  # type: ignore

logger = setup_logging(__name__)


def split_pdf_vertically(pdf_path: Path, first_page: int, last_page: int) -> Path:
    logger.info("양쪽 PDF를 한쪽식 나눠 저장")
    if not isinstance(pdf_path, Path):
        pdf_path = Path(pdf_path)

    output_path = Path(pdf_path.parent / f"{pdf_path.stem}_vertical{pdf_path.suffix}")

    src_doc = fitz.open(pdf_path)
    dst_doc = fitz.open()

    if last_page == -1:
        last_page = len(src_doc)

    for p in range(first_page - 1, last_page):
        page = src_doc[p]
        w, h = page.rect.width, page.rect.height  # type: ignore
        rect_left = fitz.Rect(0, 0, w / 2, h)  # 왼쪽 절반
        rect_right = fitz.Rect(w / 2, 0, w, h)  # 오른쪽 절반

        for rect in (rect_left, rect_right):
            new_page = dst_doc.new_page(  # type: ignore
                width=rect.width, height=rect.height
            )

            new_page.show_pdf_page(new_page.rect, src_doc, page.number, clip=rect)

    dst_doc.save(output_path)
    return output_path


def save_pdf_pages_as_images(
    pdf_path: Path, output_dir: Path, start_page: int
) -> List[Path]:
    logger.info("PDF 각 페이지를 이미지로 저장")
    saved_image_paths = []
    with fitz.open(pdf_path) as doc:
        for i, page in enumerate(doc, start=start_page):  # type: ignore
            pix = page.get_pixmap(dpi=300)  # 300 dpi 권장 (고해상도)

            img_name = f"page_{i}.png"
            img_path = output_dir / img_name
            pix.save(img_path)  # PNG 자동 인코딩
            saved_image_paths.append(img_path)

    return saved_image_paths
