from typing import Any

import numpy as np
from common.dtype import Document  # type: ignore

import app.utils.prompts as prompts
from app.extensions.embedder import TextEmbedder
from app.extensions.llm import LLM
from app.extensions.reranker import RerankerRegistry, RerankerType
from app.extensions.retrieval import VectorIndexManager
from app.utils.candidate_info import get_candidate_info


class QueryService:

    def __init__(
        self,
        text_embedder: TextEmbedder,
        candidate_vim: VectorIndexManager,
        llm: LLM,
    ) -> None:
        self.text_embedder = text_embedder
        self.candidate_vim = candidate_vim
        self.llm = llm

    def _build_data(
        self, docs_by_candidate: dict[str, list[Document]]
    ) -> dict[str, Any]:
        data = {}
        for cnd, docs in docs_by_candidate.items():
            contents = []

            for doc in docs:
                content = {
                    "content": doc.page_content.replace("passage: ", ""),
                    "sourceImage": doc.metadata.get("source_image", "N/A"),
                }

                contents.append(content)

            candidate_metadata = get_candidate_info(candidate=cnd)
            if candidate_metadata is None:
                raise RuntimeError(f"{cnd} 후보자 정보가 등록되지 않았습니다.")

            data[cnd] = {
                "contents": contents,
                "metadata": {
                    "politicalParty": candidate_metadata.get("political_party"),
                    "politicalPartyEng": candidate_metadata.get("political_party_eng"),
                    "candidate": candidate_metadata.get("candidate"),
                    "candidateEng": candidate_metadata.get("candidate_eng"),
                },
            }

        return data

    def get_documents(
        self, q: str, k: int, reranker_type: RerankerType | None = None
    ) -> dict[str, Any]:
        # 질문 임베딩
        embedded_query = self._embed_query(q=q)

        if reranker_type is None:
            docs_by_candidate = self.candidate_vim.query(
                embedded_query=embedded_query, k=k
            )
        else:
            docs_by_candidate = self.candidate_vim.query(
                embedded_query=embedded_query, k=k * 2
            )  # k의 2배로 문서를 찾고 그 중에서 리랭크

            reranker = RerankerRegistry.get_reranker(reranker_type=reranker_type)
            docs_by_candidate = reranker.rerank(
                q=q, docs_by_candidate=docs_by_candidate, k=k
            )

        return self._build_data(docs_by_candidate=docs_by_candidate)

    def _embed_query(self, q: str) -> np.ndarray:
        return self.text_embedder.embed_query(
            query=q, dtype=self.candidate_vim.get_dtype()
        )

    def generate_answer_with_llm(self, q: str) -> dict[str, Any]:
        if not self._is_relevant_query(q):
            raise ValueError(f"질문: '{q}'는 서비스와 관련없는 질문입니다.")

        embedded_query = self._embed_query(q=q)
        docs_by_candidate = self.candidate_vim.query(embedded_query=embedded_query)

        docs = [doc for doc_list in docs_by_candidate.values() for doc in doc_list]
        context = "\n\n".join(
            f"{doc.page_content}\n"
            f"metadata[정당: {doc.metadata.get('political_party', 'N/A')}, "
            f"정당영문명: {doc.metadata.get('political_party_eng', 'N/A')}, "
            f"후보자: {doc.metadata.get('candidate', 'N/A')}, "
            f"후보자영문: {doc.metadata.get('candidate_eng', 'N/A')}, "
            f"이미지: {doc.metadata.get('source_image', 'N/A')}] "
            for doc in docs
        )

        prompt = prompts.build_query_prompt(query=q, context=context)
        return self.llm.generate_content_as_json(prompt=prompt)

    def _is_relevant_query(self, q: str) -> bool:
        return (
            self.llm.generate_content(prompt=prompts.build_is_relevant_prompt(query=q))
            == "Yes"
        )
