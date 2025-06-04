import platform
from typing import Any, override

import torch
from common.dtype import Document  # type: ignore
from transformers import AutoModelForSequenceClassification, AutoTokenizer

from .abstract import Reranker
from .reranker_model import RerankerModel


class ModelBaseReranker(Reranker):

    def __init__(self, reranker_model: RerankerModel, use_quantization: bool) -> None:
        super().__init__()
        self.use_quantization = use_quantization

        self.reranker_tokenizer = AutoTokenizer.from_pretrained(reranker_model.value)
        self.reranker_model = AutoModelForSequenceClassification.from_pretrained(
            reranker_model.value
        )

        if use_quantization:
            self._set_quantization()

        self.reranker_model.eval()

    def _set_quantization(self):
        # 양자화 엔진 설정
        arch = platform.machine().lower()
        if arch in ["x86_64", "i386", "i686"]:
            torch.backends.quantized.engine = "fbgemm"
        elif arch in ["arm64", "aarch64"]:
            torch.backends.quantized.engine = "qnnpack"
        else:
            self.logger.info(f"Unsupported architecture: {arch}, defaulting to qnnpack")
            torch.backends.quantized.engine = "qnnpack"

        self.reranker_model = torch.quantization.quantize_dynamic(
            self.reranker_model, {torch.nn.Linear}, dtype=torch.qint8
        )

        self.logger.info(
            f"Quantization applied with {torch.backends.quantized.engine} engine"
        )

    @override
    def rerank(
        self, q: str, docs_by_candidate: dict[str, Any], k: int
    ) -> dict[str, Any]:
        self.logger.info("Model Base 리랭크 실행")

        rerank_result = {}
        for cnd, docs in docs_by_candidate.items():
            rerank_result[cnd] = self._rerank_docs(q=q, docs=docs, k=k)

        return rerank_result

    def _rerank_docs(
        self, q: str, docs: list[Document], k: int, batch_size: int = 2
    ) -> list[Document]:
        # Reranker 점수 계산 (배치 처리)
        scores = []
        for i in range(0, len(docs), batch_size):
            batch_docs = docs[i : i + batch_size]
            inputs = self.reranker_tokenizer(
                [(q, doc.page_content) for doc in batch_docs],
                return_tensors="pt",
                padding=True,
                truncation=True,
                max_length=512,
            )

            with torch.no_grad():
                logits = self.reranker_model(**inputs).logits
                batch_scores = torch.sigmoid(logits).squeeze().tolist()

            scores.extend(
                batch_scores if isinstance(batch_scores, list) else [batch_scores]
            )

        # 상위 n개 문서 선택
        sorted_docs = sorted(zip(docs, scores), key=lambda x: x[1], reverse=True)[:k]
        reranked_docs, _ = zip(*sorted_docs)
        return list(reranked_docs)
