from flask import Blueprint, request, jsonify, Response
import os
from werkzeug.utils import secure_filename

from app.service.query_service import query, is_relevant_question

query_bp = Blueprint("query", __name__)

@query_bp.route("/query", methods=["GET"])
def query_to_llm():
    q = request.args.get("q")

    print(f"질문: {q}")

    if not is_relevant_question(q):
        return jsonify({"search": "", "status": "invalid", "htmlData": ""}), 200

    answer = query(q)

    return jsonify({"search": q, "status": "ok", "htmlData": answer}), 200