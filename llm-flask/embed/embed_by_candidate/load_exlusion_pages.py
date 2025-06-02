from pathlib import Path
from typing import List


def load_exclusion_pages(exclusion_file_path: Path, prefix: str = "") -> List[str]:
    with open(exclusion_file_path, encoding="utf-8") as f:
        numbers = [int(line.strip()) for line in f if line.strip().isdigit()]
    return [f"{prefix}{n}" for n in numbers]
