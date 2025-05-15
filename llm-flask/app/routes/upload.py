from flask import Blueprint, request, jsonify
import os
from werkzeug.utils import secure_filename
from app.preprocessing_service.preprocessing import preprocessing
from app.extensions.storage import storage

upload_bp = Blueprint("upload", __name__)

@upload_bp.route("/upload", methods=["POST"])
def upload_pdf():
    political_party = request.form.get("political_party")
    candidate = request.form.get("candidate")
    pdf_file = request.files.get("gongyak_pdf")

    if not all([political_party, candidate, pdf_file]):
        return jsonify({"error": "모든 필드를 입력해주세요."}), 400

    dirname = f"{political_party}_{candidate}"
    filename = f"{dirname}.pdf"
    saved_path = storage.save(pdf_file, dirname, filename)

    preprocessing(saved_path, dirname, filename)

    return jsonify({"message": "업로드 완료", "path": saved_path}), 200
