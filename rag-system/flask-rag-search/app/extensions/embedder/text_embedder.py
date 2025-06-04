import numpy as np
from sentence_transformers import SentenceTransformer

from .text_embedding_model import TextEmbeddingModel


class TextEmbedder:

    def __init__(
        self,
        embedding_model: TextEmbeddingModel,
        search_prefix: str = "",
        save_prefix: str = "",
    ):
        self.embedding_model = SentenceTransformer(
            model_name_or_path=embedding_model.value
        )
        self.searh_prefix = search_prefix
        self.save_prefix = save_prefix

    def embed_document(self, document: str, dtype: str = "float32") -> np.ndarray:
        return self.embedding_model.encode(
            [f"{self.save_prefix}{document}"], convert_to_numpy=True
        ).astype(dtype=dtype)

    def embed_query(self, query: str, dtype: str = "float32") -> np.ndarray:
        return self.embedding_model.encode(
            [f"{self.searh_prefix}{query}"], convert_to_numpy=True
        ).astype(dtype=dtype)


text_embedder = TextEmbedder(TextEmbeddingModel.DRAGONKUE_BGE_M3_KO)
