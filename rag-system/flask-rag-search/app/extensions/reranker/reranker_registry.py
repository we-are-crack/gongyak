from .abstract import Reranker
from .reranker_type import RerankerType


class RerankerRegistry:

    _rerankers: dict[RerankerType, Reranker] = {}

    @classmethod
    def register(cls, reranker_type: RerankerType, reranker: Reranker) -> None:
        cls._rerankers[reranker_type] = reranker

    @classmethod
    def get_reranker(cls, reranker_type: RerankerType) -> Reranker:
        reranker = cls._rerankers.get(reranker_type)
        if reranker is None:
            raise ValueError("지원하지 않는 RerankerType 입니다.")

        return reranker
