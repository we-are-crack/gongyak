import os
import io
from io import BytesIO
import fitz  # pymupdf
from PyPDF2 import PdfReader, PdfWriter
from google.cloud import vision
import logging
import time
from langchain.schema import Document

from app.extensions.beans import local_storage, name_k2e_convertor, faiss, private_gcs_storage, public_gcs_storage

logger = logging.getLogger(__name__)

def preprocessing(political_party, candidate, pdf_file, need_vertically_split, readable, first_page, last_page):
    method_start = time.perf_counter()

    political_party_eng = name_k2e_convertor.get_political_party_eng_name(political_party)
    candidate_eng = name_k2e_convertor.get_candidate_eng_name(candidate)

    output_dir = os.path.join("resources", f"{political_party_eng}_{candidate_eng}")
    os.makedirs(output_dir, exist_ok = True)

    filename = f"{candidate}_정책공약집.pdf"
    pdf_path = os.path.join(output_dir, filename)

    ### 1. PDF 파일 저장
    logger.info("PDF 파일 저장 시작")
    start = time.perf_counter()

    if need_vertically_split:
        # 양 쪽이 한 페이지로 이루어진 경우 각각 한 쪽으로 분할해 저장
        logger.info("양 쪽이 한 페이지로 이루어진 PDF로 한 쪽씩 분할해 저장")
        _split_vertically_pdf(pdf_file, output_dir, filename, first_page, last_page)
    else:
        local_storage.save(pdf_file, output_dir, filename)

    logger.info("PDF 파일 저장 완료 | 실행시간 : %.4fs", time.perf_counter() - start)

    ### 페이지 번호 - 파일명을 일치시키기 위함
    first_page = first_page * 2 if need_vertically_split else first_page

    ### 2. PDF -> IMAGE 변환 및 저장
    logger.info("PDF -> IMAGE 변환 및 저장 시작")
    start = time.perf_counter()

    img_dir = os.path.join(output_dir, "imgs")
    os.makedirs(img_dir, exist_ok = True)
    
    _pdf_to_image(pdf_path, img_dir, first_page)
    logger.info("PDF -> IMAGE 변환 및 저장 완료 | 실행시간 : %.4fs", time.perf_counter() - start)

    ### 3. PDF 내용 읽기
    logger.info("PDF 내용 읽기 시작")
    start = time.perf_counter()

    txt_dir = os.path.join(output_dir, "txts")
    if readable:
        # 읽기 가능한 경우 PyMuPDF로 읽어 저장
        logger.info("PyMuPDF로 PDF 읽어 텍스트 저장")
        _save_content_using_pymupdf(pdf_path, txt_dir, first_page)
    else:
        # 읽기 불가능한 경우 이미지를 사용해 OCR을 사용해 결과 저장
        logger.info("이미지로 만들어진 PDF이므로 OCR을 사용해 텍스트 저장")
        _save_content_using_ocr(img_dir, txt_dir)

    logger.info("PDF 내용 읽기 완료 | 실행시간 : %.4fs", time.perf_counter() - start)

    ### 4. PDF 텍스트 임베딩
    logger.info("PDF 텍스트 임베딩 및 저장 시작")
    start = time.perf_counter()

    index_file_path = _embed_txts(txt_dir, political_party, candidate)
    logger.info("PDF 텍스트 임베딩 및 저장 완료 | 실행시간 : %.4fs", time.perf_counter() - start)

    ### 5. 생성된 이미지, 텍스트, 임베딩 인덱스 파일 등 구글 클라우드 스토리지에 업로드
    logger.info("전처리 산출물 업로드 시작")
    start = time.perf_counter()

    private_gcs_storage.upload(pdf_path)
    upload_directory_to_gcs(public_gcs_storage, img_dir)
    upload_directory_to_gcs(private_gcs_storage, txt_dir)
    private_gcs_storage.upload(f"{index_file_path}.faiss")
    private_gcs_storage.upload(f"{index_file_path}.pkl")

    logger.info("전처리 산출물 업로드 완료 | 실행시간 : %.4fs", time.perf_counter() - start)

    logger.info("PDF 전처리 완료 | 총 실행시간 : %.4fs", time.perf_counter() - method_start)

def _split_vertically_pdf(pdf_file, output_dir, output_filename, first_page, last_page):
    output_path = os.path.join(output_dir, output_filename)

    # ─── FileStorage → in‑memory 스트림 ─────────────────────────────
    pdf_stream = io.BytesIO(pdf_file.read())
    pdf_stream.seek(0)

    # ─── 원본 PDF 열기 ───────────────────────────────────────────────
    src_doc = fitz.open(stream = pdf_stream, filetype = "pdf")
    dst_doc = fitz.open()               # 결과 PDF (빈 문서)

    # ─── 각 페이지를 절반(Rect)으로 잘라 복사 ───────────────────────
    if last_page is None:
        last_page = len(src_doc)
    else:
        last_page = int(last_page)

    for p in range(first_page - 1, last_page):
        page = src_doc[p]
        w, h = page.rect.width, page.rect.height
        rect_left  = fitz.Rect(0,     0, w/2, h)   # 왼쪽 절반
        rect_right = fitz.Rect(w/2,   0, w,   h)   # 오른쪽 절반

        for rect in (rect_left, rect_right):
            new_page = dst_doc.new_page(width = rect.width, height = rect.height)
            # show_pdf_page(target_rect, src_doc, src_page_index, clip = rect)
            new_page.show_pdf_page(new_page.rect, src_doc, page.number, clip = rect)

    src_doc.close()

    # ─── 결과를 메모리로 저장 후 응답 ────────────────────────────────
    dst_doc.save(output_path)
    dst_doc.close()

def _pdf_to_image(pdf_path, img_dir, first_page):
    doc = fitz.open(pdf_path)

    # ── 변환 파라미터 ───────────────────────────
    DPI  = 300          # 300 dpi 권장 (고해상도)

    for i, page in enumerate(doc, start = first_page):
        pix = page.get_pixmap(dpi = DPI)

        img_name = f"page_{i:03}.png"
        img_path = os.path.join(img_dir, img_name)
        pix.save(img_path)                 # PNG 자동 인코딩

    logger.info("총 %d개 이미지 저장 완료: %s", len(doc), img_dir)
    doc.close()

def _save_content_using_pymupdf(pdf_path, txt_dir, first_page):
    doc = fitz.open(pdf_path)

    for idx, page in enumerate(doc, start = first_page):
        text = page.get_text("text")

        # 텍스트를 BytesIO 버퍼에 기록 → saver.save 로 전달
        buf = io.BytesIO(text.encode("utf-8"))
        filename = f"page_{idx}.txt"          # 1.txt, 2.txt, …
        local_storage.save(buf, txt_dir, filename)

    logger.info("총 %d개의 텍스트 파일 저장: %s", len(doc), txt_dir)
    doc.close()

def _save_content_using_ocr(img_dir, output_dir):
    client = vision.ImageAnnotatorClient()

    for filename in local_storage.list_files(img_dir):
        if filename.lower().endswith((".png", ".jpg", ".jpeg")):
            content = local_storage.load(img_dir, filename)

            image = vision.Image(content=content)
            response = client.text_detection(image=image)
            
            text = response.text_annotations[0].description if response.text_annotations else ""

            filename = f"{filename.split(".")[0]}.txt"

            # 텍스트 내용을 BytesIO에 저장
            text_stream = BytesIO()
            text_stream.write(text.encode('utf-8'))
            text_stream.seek(0)  # 스트림을 처음 위치로 리셋

            # local_storage.save를 사용하여 텍스트 파일 저장
            local_storage.save(text_stream, output_dir, filename)

def _embed_txts(txt_dir, political_party, candidate):
    political_party_eng = name_k2e_convertor.get_political_party_eng_name(political_party)
    candidate_eng = name_k2e_convertor.get_candidate_eng_name(candidate)

    base_dir = os.path.join("resources", f"{political_party_eng}_{candidate_eng}")
    public_bucket_base_url = "https://storage.googleapis.com/gongyak21_public"

    documents = []
    for filename in local_storage.list_files(txt_dir):
        if not filename.endswith(".txt"):
            continue

        text = local_storage.load(txt_dir, filename)
        if not text:
            # 비어있는 파일 건너뜀
            continue
        
        original_filename = filename.split(".")[0]
        metadata = {
            "source_image": f"{public_bucket_base_url}/{base_dir}/imgs/{original_filename}.png",
            "political_party": political_party,
            "political_party_eng": political_party_eng,
            "candidate": candidate,
            "candidate_eng": candidate_eng
        }

        # E5 모델 입력 형식: "passage: ..."
        input_text = text.replace("\n", " ")

        # OCR 텍스트들을 Document로 생성
        documents.append(Document(page_content = input_text, metadata = metadata))

    return faiss.save_index(documents, political_party_eng, candidate_eng)

def upload_directory_to_gcs(gcs_storage, dir_path: str):
    for file in local_storage.list_files(dir_path):
        source_file_path = os.path.join(dir_path, file)
        gcs_storage.upload(source_file_path)