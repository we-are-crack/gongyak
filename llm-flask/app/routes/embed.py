from flask import Blueprint, request, jsonify, Response
from sentence_transformers import SentenceTransformer
import numpy as np

embed_bp = Blueprint("embed", __name__)

# 모델 로딩
model = SentenceTransformer("distiluse-base-multilingual-cased-v1")

@embed_bp.route("/embed", methods=["GET"])
def embed():
    query = request.args.get("q")
    if not query:
        return jsonify({"status": "error", "message": "Query is required."}), 400

    # numpy 배열을 list로 변환해서 JSON 직렬화
    return jsonify({
        "status": "ok",
        "query_embedding": _embed_query(query),
        "passage_embedding": _embed_query(query)
    }), 200

def _embed_query(query: str):
    return model.encode(f"query: {query}", normalize_embeddings=True).astype(np.float32).tolist()