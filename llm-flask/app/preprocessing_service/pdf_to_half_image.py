from pdf2image import convert_from_path
from PIL import Image
from io import BytesIO
from app.extensions.storage import storage

# pdf를 이미지로 바꾼 후 이미지를 반으로 잘라 저장
def pdf_to_half_image(pdf_path, output_dir):
    print("pdf to half image convert start...")
    images = convert_from_path(pdf_path, dpi = 300)
    for i, img in enumerate(images):
        width, height = img.size

        # 왼쪽/오른쪽 반 자르기
        left_image = img.crop((0, 0, width // 2, height))
        right_image = img.crop((width // 2, 0, width, height))

        # BytesIO로 변환
        left_stream = BytesIO()
        right_stream = BytesIO()
        left_image.save(left_stream, format='JPEG')
        right_image.save(right_stream, format='JPEG')
        left_stream.seek(0)
        right_stream.seek(0)

        # 파일명
        page = (i + 1) * 2
        left_filename = f"page_{page}.jpg"
        right_filename = f"page_{page + 1}.jpg"

        # storage.save() 사용
        storage.save(left_stream, output_dir, left_filename)
        storage.save(right_stream, output_dir, right_filename)

    print("pdf to half image convert end...")