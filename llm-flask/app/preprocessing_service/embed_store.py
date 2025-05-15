import os
from langchain.schema import Document
from app.extensions.storage import storage
from app.extensions.faiss import faiss_service

candidate_eng_name = {
    "이재명" : "leejaemyung",
    "김문수" : "kimmoonsoo",
    "이준석" : "leejunseok"
}

def embed_texts(text_dir, political_party, candidate):
    print("text embedding start...")
    base_dir = os.path.join(storage.base_dir, f"{political_party}_{candidate}")
    image_source_base_url = "https://storage.googleapis.com/gongyak21_public"
    documents = []

    for filename in storage.list_files(text_dir):
        if not filename.endswith(".txt"):
            continue

        text = storage.load(text_dir, filename)
        if not text:
            # 비어있는 파일 건너뜀
            continue
        
        original_filename = filename.split(".")[0]

        metadata = {
            "source_image": f"{image_source_base_url}/{base_dir}/half_images/{original_filename}.jpg",
            "source_text": f"{base_dir}/ocr_texts/{original_filename}.txt",
            "political_party": political_party,
            "candidate": candidate,
            "candidate_eng": candidate_eng_name.get(candidate)
        }

        # E5 모델 입력 형식: "passage: ..."
        input_text = "passage: " + text.replace("\n", " ")

        # OCR 텍스트들을 Document로 생성
        documents.append(Document(page_content=input_text, metadata = metadata))

    faiss_service.save_index(documents, political_party, candidate)
    print("text embedding end...")