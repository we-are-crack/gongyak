from common.config.logger import setup_logging  # type: ignore
from flask import Blueprint, jsonify, request

from app.extensions.reranker import RerankerType
from app.extensions.retrieval import VectorIndexManager
from app.services import EmbedService, QueryService

logger = setup_logging(__name__)


def create_main_bp(
    query_service: QueryService,
    embed_service: EmbedService,
    vector_indices: VectorIndexManager,
) -> Blueprint:
    main_bp = Blueprint("main", __name__)

    @main_bp.route("/query", methods=["GET"])
    def query_to_llm():
        q = request.args.get("q")
        if not q:
            return jsonify({"status": "error", "message": "q(Query) is required."}), 400

        logger.info("질문: %s", q)

        try:
            data = query_service.generate_answer_with_llm(q=q)
            return jsonify({"searchQuery": q, "status": "ok", "data": data}), 200
        except ValueError:
            # 연관되지 않은 질문인 경우 빈 리스트
            return jsonify({"searchQuery": "", "status": "invalid", "data": ""}), 200
        except RuntimeError:
            return jsonify({"status": "internal-error"}), 500

    @main_bp.route("/docs", methods=["GET"])
    def get_docs():
        q = request.args.get("q")
        if not q:
            return jsonify({"status": "error", "message": "Query is required."}), 400

        k = int(request.args.get("k", "5"))
        t = request.args.get("type", "")  # 지원하는 타입: llm, model

        if not t:
            reranker_type = None
        else:
            try:
                reranker_type = RerankerType(t)
            except KeyError:
                return (
                    jsonify(
                        {
                            "status": "error",
                            "message": "지원하지 않는 리랭크 방식입니다.",
                        }
                    ),
                    400,
                )

        logger.info("질문: %s", q)
        data = query_service.get_documents(q=q, k=k, reranker_type=reranker_type)

        return jsonify({"status": "ok", "data": data}), 200

    @main_bp.route("/embed", methods=["GET"])
    def embed():
        q = request.args.get("q")
        if not q:
            return jsonify({"status": "error", "message": "q(Query) is required."}), 400

        # numpy 배열을 list로 변환해서 JSON 직렬화
        return (
            jsonify(
                {
                    "status": "ok",
                    "query_embedding": embed_service.embed_query(query=q),
                    "passage_embedding": embed_service.embed_document(document=q),
                }
            ),
            200,
        )

    @main_bp.route("/reload", methods=["GET"])
    def reload_index():
        vector_indices.reload()
        return jsonify({"status": "ok", "message": "index reload complete."}), 200

    return main_bp
