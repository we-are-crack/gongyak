from typing import Any, override

from app.extensions.llm import LLM
from app.utils.prompts import build_llm_rerank_prompt

from .abstract import Reranker


class LLMReranker(Reranker):

    def __init__(self, llm: LLM) -> None:
        super().__init__()
        self.llm = llm

    @override
    def rerank(
        self, q: str, docs_by_candidate: dict[str, Any], k: int
    ) -> dict[str, Any]:
        self.logger.info("LLM 리랭크 실행")

        docs = [doc for doc_list in docs_by_candidate.values() for doc in doc_list]
        context = "\n\n".join(
            f"{doc.page_content}\n"
            f"metadata[데이터ID: {doc.id}, "
            f"정당: {doc.metadata.get('political_party', 'N/A')}, "
            f"정당영문명: {doc.metadata.get('political_party_eng', 'N/A')}, "
            f"후보자: {doc.metadata.get('candidate', 'N/A')}, "
            f"후보자영문: {doc.metadata.get('candidate_eng', 'N/A')}, "
            f"이미지: {doc.metadata.get('source_image', 'N/A')}] "
            for doc in docs
        )

        prompt = build_llm_rerank_prompt(query=q, context=context)
        response = self.llm.generate_content_as_json(prompt=prompt)

        rerank_result = {}
        for cnd, docs in docs_by_candidate.items():
            doc_list = []
            selected = response[cnd][:k]

            for doc in docs:
                if doc.id not in selected:
                    continue

                doc_list.append(doc)

            rerank_result[cnd] = doc_list

        return rerank_result
