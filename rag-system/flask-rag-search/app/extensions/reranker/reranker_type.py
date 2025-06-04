from enum import Enum


class RerankerType(Enum):
    NORMAL = "normal"
    LLM = "llm"
    MODEL_BASE = "model"
