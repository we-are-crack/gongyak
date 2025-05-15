from abc import ABC, abstractmethod
from werkzeug.datastructures import FileStorage

class StorageInterface(ABC):

    @abstractmethod
    def save(self, file_stream: FileStorage, dir: str, filename: str) -> str:
        """
        파일을 저장하고 저장된 경로 또는 URL을 반환한다.

        :param file_stream: 업로드된 파일 객체 (예: request.files['file'])
        :param filename: 저장할 파일 이름
        :return: 저장된 경로 또는 URL
        """
        pass

    @abstractmethod
    def load(self, dirname: str, filename: str) -> bytes:
        pass

    @abstractmethod
    def list_files(self, dirname: str) -> list:
        """특정 디렉토리 내 파일 목록 반환"""
        pass