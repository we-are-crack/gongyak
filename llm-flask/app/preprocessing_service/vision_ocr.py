import os
from io import BytesIO
from google.cloud import vision
from app.extensions.storage import storage

def ocr_images(image_dir, output_dir):
    print("image ocr start...")
    client = vision.ImageAnnotatorClient()

    for filename in storage.list_files(image_dir):
        if filename.lower().endswith((".png", ".jpg", ".jpeg")):
            content = storage.load(image_dir, filename)

            image = vision.Image(content=content)
            response = client.text_detection(image=image)
            
            text = response.text_annotations[0].description if response.text_annotations else ""

            save_ocr_text(output_dir, filename, text)

    print("image ocr end...")

# OCR 결과를 텍스트 파일로 저장
def save_ocr_text(output_dir, filename, text):
    filename = f"{filename.split(".")[0]}.txt"

    # 텍스트 내용을 BytesIO에 저장
    text_stream = BytesIO()
    text_stream.write(text.encode('utf-8'))
    text_stream.seek(0)  # 스트림을 처음 위치로 리셋

    # storage.save를 사용하여 텍스트 파일 저장
    storage.save(text_stream, output_dir, filename)