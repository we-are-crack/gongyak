import os
from langchain.vectorstores import FAISS
from langchain.schema import Document
from langchain.embeddings import HuggingFaceEmbeddings
from app.extensions.storage import storage
from app.extensions.cloud_storage import private_gcs_storage

class FaissService:
    def __init__(self, model_name, top = 5):
        self.index_dir = "indexes"
        self.full_index_dir = os.path.join(storage.base_dir, self.index_dir)
        self.embedding = HuggingFaceEmbeddings(model_name = model_name)
        self.top = top
        self.retrievers = self._load_retrievers()

    def _load_retrievers(self) -> list:
        try:
            # 서버가 시작할 때 실행하도록 변경하는 것도 좋을듯
            private_gcs_storage.download_directory(self.full_index_dir, self.full_index_dir)

            retrievers = []
            for index_file in storage.list_files(self.index_dir):
                if not index_file.lower().endswith(".faiss"):
                    continue
                
                index_name = index_file.split(".")[0]

                retrierver = FAISS.load_local(
                    folder_path = self.full_index_dir,
                    embeddings = self.embedding,
                    index_name = index_name,
                    allow_dangerous_deserialization = True
                ).as_retriever(search_kwargs={"score_threshold": 0.75, "k": self.top})

                retrievers.append(retrierver)

            print(f"{len(retrievers)}개의 인덱스 로드.")

            return retrievers
        except FileNotFoundError:
            print("저장된 인덱스가 없음.")
            return []

    def get_retrievers(self) -> list:
        return self.retrievers

    def save_index(self, documents: list[Document], political_party: str, candidate: str) -> None:
        index_name = f"{political_party}_{candidate}_index"

        db = FAISS.from_documents(documents, self.embedding)
        db.save_local(self.full_index_dir, index_name = index_name)

        self.retrievers.append(db.as_retriever(search_kwargs={"k": self.top}))

        for file in storage.list_files(self.index_dir):
            if not file.startswith(index_name):
                continue
            
            source_file_path = os.path.join(self.full_index_dir, file)
            destination_blob_name = source_file_path
            private_gcs_storage.upload(source_file_path, destination_blob_name)

        print(f"[INFO] {political_party} {candidate} 인덱스가 저장되었습니다.")