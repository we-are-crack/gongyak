from flask import Blueprint, request, jsonify
import os
from werkzeug.utils import secure_filename

from app.service.preprocessing_service import preprocessing
from app.extensions.beans import local_storage, name_k2e_convertor

upload_bp = Blueprint("upload", __name__)

@upload_bp.route("/upload", methods=["POST"])
def upload_pdf():
    political_party = request.form.get("political_party") # 한글 정당 이름
    candidate = request.form.get("candidate") # 한글 후보자 이름
    pdf_file = request.files.get("gongyak_pdf") # pdf 공약집
    need_vertically_split = request.form.get("need_vertically_split", False) # pdf의 한 페이지가 두 페이지 양쪽으로 구성되어 분할이 필요한지
    readable = request.form.get("readable", "True") # 읽을 수 있는 pdf 인지
    first_page = request.form.get("first_page", "1") # 문서화를 할 시작 페이지(목차를 제외하기 위해)
    last_page = request.form.get("last_page") # 문서화의 마지막 페이지
    
    if not all([political_party, candidate, pdf_file]):
        return jsonify({"error": "모든 필드를 입력해주세요."}), 400

    first_page = int(first_page)
    readable = readable == "True"

    preprocessing(political_party, candidate, pdf_file, need_vertically_split, readable, first_page, last_page)

    return jsonify({"message": "업로드 완료"}), 200
