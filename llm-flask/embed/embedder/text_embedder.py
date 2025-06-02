from typing import List

import numpy as np
from sentence_transformers import SentenceTransformer

from embedder.document_cls import Document


class TextEmbedder:

    EMBEDDING_MODEL_DRAGONKUE_BGE_M3 = "dragonkue/BGE-m3-ko"

    def __init__(self, embedding_model_name: str = EMBEDDING_MODEL_DRAGONKUE_BGE_M3):
        self.embedding_model = SentenceTransformer(
            model_name_or_path=embedding_model_name
        )

    def embed(self, docs: List[Document], dtype: str = "float32") -> np.ndarray:
        texts = [doc.page_content for doc in docs]
        return self.embedding_model.encode(texts, convert_to_numpy=True).astype(
            dtype=dtype
        )

    def embed_query(self, query: str, dtype: str = "float32") -> np.ndarray:
        return self.embedding_model.encode([query], convert_to_numpy=True).astype(
            dtype=dtype
        )
