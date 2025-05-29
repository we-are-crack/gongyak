from flask import Blueprint, request, jsonify, Response
import os
from werkzeug.utils import secure_filename
import json
import logging

from app.service.query_service import get_documents, get_documents_with_bge, get_documents_with_llm, query, is_relevant_question

query_bp = Blueprint("query", __name__)
logger = logging.getLogger(__name__)

@query_bp.route("/query", methods=["GET"])
def query_to_llm():
    q = request.args.get("q")

    logger.info("질문: %s", q)

    if not is_relevant_question(q):
        return jsonify({"searchQuery": "", "status": "invalid", "data": ""}), 200

    result = query(q).strip().removeprefix("```json").removesuffix("```").strip()
    data = json.loads(result)

    return jsonify({"searchQuery": q, "status": "ok", "data": data}), 200

@query_bp.route("/docs", methods=["GET"])
def get_docs():
    q = request.args.get("q")
    k = int(request.args.get("k", "5"))
    t = request.args.get("type", "normal")

    if not q:
        return jsonify({"status": "error", "message": "Query is required."}), 400

    logger.info("질문: %s", q)
    # if t == "bge":
    #     data = get_documents_with_bge(q, k)
    if t == "llm":
        data = get_documents_with_llm(q, k)
    else:
        data = get_documents(q, k)

    return jsonify({"status": "ok", "data": data}), 200