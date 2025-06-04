import uuid
from dataclasses import dataclass, field


@dataclass
class Document:
    page_content: str
    metadata: dict[str, str]
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
