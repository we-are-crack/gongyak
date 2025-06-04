import os
from pathlib import Path

from flask import Flask

from app.extensions.cloud_storage import GoogleCloudStorage
from app.extensions.embedder import TextEmbedder, TextEmbeddingModel
from app.extensions.llm import GoogleGemini
from app.extensions.reranker import LLMReranker, RerankerRegistry, RerankerType
from app.extensions.retrieval import FaissIndexManager, FaissStorage
from app.routes.main import create_main_bp
from app.services import EmbedService, QueryService

# from app.extensions.reranker import ModelBaseReranker, RerankerModel


def create_app():
    app = Flask(__name__)

    # VectorStorage, VectorIndexManager 생성
    faiss_storage = FaissStorage()
    local_index_dir = Path("resources/indexes")
    google_cloud_storage = GoogleCloudStorage()
    bucket_name = os.getenv("GOOGLE_CLOUD_STORAGE_PRIVATE_BUCKET_NAME", "")
    if not bucket_name:
        raise EnvironmentError(
            "환경변수 [GOOGLE_CLOUD_STORAGE_PRIVATE_BUCKET_NAME]은 필수입니다."
        )
    cloud_index_dir = Path("resources/indexes")

    candidate_vim = FaissIndexManager(
        vector_storage=faiss_storage,
        local_index_dir=local_index_dir,
        cloud_storage=google_cloud_storage,
        bucket=bucket_name,
        cloud_index_dir=cloud_index_dir,
    )

    # LLM 생성
    gemini = GoogleGemini()

    # Reranker 생성 및 등록
    llm_reranker = LLMReranker(llm=gemini)
    RerankerRegistry.register(reranker_type=RerankerType.LLM, reranker=llm_reranker)

    # model_base_reranker = ModelBaseReranker(
    #     reranker_model=RerankerModel.DONGJIN_KO_RERANKER, use_quantization=False
    # )
    # RerankerRegistry.register(
    #     reranker_type=RerankerType.MODEL_BASE, reranker=model_base_reranker
    # )

    # 서비스 생성
    query_service = QueryService(
        text_embedder=TextEmbedder(
            embedding_model=TextEmbeddingModel.DRAGONKUE_BGE_M3_KO,
            search_prefix="query: ",
            save_prefix="passage: ",
        ),
        candidate_vim=candidate_vim,
        llm=gemini,
    )

    embed_service = EmbedService(
        text_embedder=TextEmbedder(
            embedding_model=TextEmbeddingModel.DISTILUSE_BASE_MULTILINGUAL
        )
    )

    main_bp = create_main_bp(
        query_service=query_service,
        embed_service=embed_service,
        vector_indices=candidate_vim,
    )

    app.register_blueprint(main_bp)

    app.logger.info("Flask app created")
    return app
