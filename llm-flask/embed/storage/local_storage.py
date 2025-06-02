import os
from io import BytesIO
from pathlib import Path
from typing import Generator, Optional


class LocalStorage:

    BASE_DIR = Path("resources")

    def __init__(self):
        self.BASE_DIR.mkdir(parents=True, exist_ok=True)

    def save(self, file_stream: BytesIO, save_dir: Path, filename: str) -> Path:
        save_dir.mkdir(parents=True, exist_ok=True)

        save_path = save_dir / filename

        if save_path.exists():
            return save_path

        if isinstance(file_stream, BytesIO):
            with open(save_path, "wb") as f:
                f.write(file_stream.read())
        else:
            file_stream.save(save_path)

        return save_path

    def load(
        self,
        full_path: Optional[Path] = None,
        target_dir: Optional[Path] = None,
        filename: Optional[str] = None,
    ) -> str | bytes:
        if full_path is not None:
            file_path = full_path
        elif target_dir is not None and filename is not None:
            file_path = target_dir / filename
        else:
            raise ValueError(
                "full_path 또는 (target_dir과 filename) 중 하나는 반드시 제공해야 합니다."
            )

        if not file_path.exists():
            raise FileNotFoundError(f"{file_path} 파일을 찾을 수 없습니다.")

        # 파일 확장자를 확인하여 텍스트 파일인지 바이너리 파일인지 구분
        if file_path.suffix == ".txt":
            # 텍스트 파일은 텍스트 모드로 읽기
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()
        else:
            # 바이너리 파일은 바이너리 모드로 읽기
            with open(file_path, "rb") as f:
                return f.read()

    def list_files(self, target_dir: Path) -> Generator[Path, None, None]:
        if not target_dir.exists():
            raise FileNotFoundError(f"{target_dir} 디렉토리를 찾을 수 없습니다.")
        return target_dir.iterdir()

    def is_exists(self, file_path: str) -> bool:
        return os.path.isfile(file_path)


local_storage = LocalStorage()
