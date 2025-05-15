import os
from typing import Union
from io import BytesIO
from werkzeug.datastructures import FileStorage
from app.storage.storage_interface import StorageInterface

class LocalStorage(StorageInterface):
    def __init__(self, base_dir="resources"):
        self.base_dir = base_dir
        os.makedirs(base_dir, exist_ok=True)

    def save(self, file_stream: Union[FileStorage, BytesIO], dirname: str, filename: str) -> str:
        save_dir = os.path.join(self.base_dir, dirname)
        os.makedirs(save_dir, exist_ok=True)

        save_path = os.path.join(save_dir, filename)
        if os.path.exists(save_path):
            return save_path

        if isinstance(file_stream, BytesIO):
            with open(save_path, "wb") as f:
                f.write(file_stream.read())
        else:
            file_stream.save(save_path)

        return save_path

    def load(self, dirname: str, filename: str) -> bytes:
        file_path = os.path.join(self.base_dir, dirname, filename)
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"{file_path} 파일을 찾을 수 없습니다.")

        # 파일 확장자를 확인하여 텍스트 파일인지 바이너리 파일인지 구분
        if filename.lower().endswith(".txt"):
            # 텍스트 파일은 텍스트 모드로 읽기
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()
        else:
            # 바이너리 파일은 바이너리 모드로 읽기
            with open(file_path, "rb") as f:
                return f.read()

    def list_files(self, dirname: str) -> list:
        dir_path = os.path.join(self.base_dir, dirname)
        if not os.path.exists(dir_path):
            raise FileNotFoundError(f"{dir_path} 디렉토리를 찾을 수 없습니다.")
        
        return os.listdir(dir_path)