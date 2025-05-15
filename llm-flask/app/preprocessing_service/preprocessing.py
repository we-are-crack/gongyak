import os
from app.preprocessing_service.pdf_to_half_image import pdf_to_half_image
from app.preprocessing_service.vision_ocr import ocr_images
from app.preprocessing_service.embed_store import embed_texts
from app.preprocessing_service.upload_to_cloud import upload_directory
from app.extensions.storage import storage
from app.extensions.cloud_storage import private_gcs_storage, public_gcs_storage

def preprocessing(pdf_path, pdf_dirname, pdf_filename):
    print("--- preprocessing start ----")
    split = pdf_dirname.split("_")
    political_party = split[0]
    candidate = split[1]

    half_images_dir = os.path.join(pdf_dirname, "half_images")
    ocr_texts_dir = os.path.join(pdf_dirname, "ocr_texts")

    # pdf_to_half_image(pdf_path, half_images_dir)
    # ocr_images(half_images_dir, ocr_texts_dir)
    embed_texts(ocr_texts_dir, political_party, candidate)

    # upload_directory(public_gcs_storage, half_images_dir)
    # upload_directory(private_gcs_storage, ocr_texts_dir)

    print("--- preprocessing complete ---")