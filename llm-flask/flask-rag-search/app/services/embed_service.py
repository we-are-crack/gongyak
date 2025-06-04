from typing import Any

from app.extensions.embedder import TextEmbedder


class EmbedService:

    def __init__(self, text_embedder: TextEmbedder) -> None:
        self.text_embedder = text_embedder

    def embed_document(self, document: str, dtype: str = "float32") -> list[Any]:
        return self.text_embedder.embed_document(
            document=document, dtype=dtype
        ).tolist()

    def embed_query(self, query: str, dtype: str = "float32") -> list[Any]:
        return self.text_embedder.embed_query(query=query, dtype=dtype).tolist()
