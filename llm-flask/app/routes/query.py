from flask import Blueprint, request, jsonify, Response
import os
from werkzeug.utils import secure_filename
import json

from app.service.query_service import query, is_relevant_question

query_bp = Blueprint("query", __name__)

@query_bp.route("/query", methods=["GET"])
def query_to_llm():
    q = request.args.get("q")

    print(f"질문: {q}")

    if not is_relevant_question(q):
        return jsonify({"searchQuery": "", "status": "invalid", "data": ""}), 200

    result = query(q).strip().removeprefix("```json").removesuffix("```").strip()
    data = json.loads(result)
    print(data)

    return jsonify({"searchQuery": q, "status": "ok", "data": data}), 200