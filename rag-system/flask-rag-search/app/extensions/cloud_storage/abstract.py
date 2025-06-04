from abc import ABC, abstractmethod

from common.config.logger import setup_logging  # type: ignore


class CloudStorage(ABC):

    def __init__(self) -> None:
        self.logger = setup_logging(f"{__name__}.{self.__class__.__name__}")

    @abstractmethod
    def download_directory(self, bucket: str, prefix: str, local_dir: str) -> None:
        # prefix: 클라우드 스토리지 폴더 경로
        # local_dir: 로컬에 다운받을 폴더 위치
        pass
