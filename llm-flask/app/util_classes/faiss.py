import os
from langchain.vectorstores import FAISS
from langchain.schema import Document
from langchain.embeddings import HuggingFaceEmbeddings
import logging

logger = logging.getLogger(__name__)

class Faiss:
    
    EMBEDDING_MODEL_INTFLOAT_MULTILINGUAL_E5_BASE = "intfloat/multilingual-e5-base"
    EMBEDDING_MODEL_DRAGONKUE_BGE_M3 = "dragonkue/BGE-m3-ko"

    def __init__(self, local_storage, private_gcs_storage, model_name:str = EMBEDDING_MODEL_DRAGONKUE_BGE_M3, top = 5):
        self.local_storage = local_storage
        self.private_gcs_storage = private_gcs_storage
        
        self.index_dir = os.path.join("resources", "indexes")
        self.init_index_dir = os.path.join("resources", "init_indexes")
        self.embedding = HuggingFaceEmbeddings(model_name = model_name)
        self.top = top
        self.vectorstores = []
        self.retrievers = []
        self.vs_by_candidate = {}

        # 클라우드 스토리지에서 인덱스 파일 다운로드 (항상 최신화)
        self.private_gcs_storage.download_directory(self.index_dir, self.index_dir)
        
    def _load_vectorstores(self):
        try:
            vectorstores = []
            vs_by_candidate = {}
            for index_file in self.local_storage.list_files(self.index_dir):
                if not index_file.lower().endswith(".faiss"):
                    continue
                
                index_name = index_file.split(".")[0]
                candidate = index_name.split("_")[1]

                vs = FAISS.load_local(
                    folder_path = self.index_dir,
                    embeddings = self.embedding,
                    index_name = index_name,
                    allow_dangerous_deserialization = True
                )

                vectorstores.append(vs)
                vs_by_candidate[candidate] = vs

            self.vectorstores = vectorstores
            self.vs_by_candidate = vs_by_candidate
            print(f"{len(self.vectorstores)}개의 인덱스 로드.")

        except FileNotFoundError:
            print("저장된 인덱스가 없음.")

    def query_by_candidate(self, q: str, k: int = 5) -> dict:
        if not self.vs_by_candidate:
            self._load_vectorstores()
        
        docs = {}
        for candidate, vs in self.vs_by_candidate.items():
            docs[candidate] = vs.similarity_search(q, k)
        
        return docs

    def query(self, q: str, k: int = 5) -> list[Document]:
        if not self.vectorstores:
            self._load_vectorstores()

        docs = []
        for vs in self.vectorstores:
            docs.extend(vs.similarity_search(q, k))
        
        return docs
        
    def query_with_score(self, q: str, k: int = 5) -> list:
        if not self.vectorstores:
            self._load_vectorstores()

        docs = []
        for vs in self.vectorstores:
            docs.extend(vs.similarity_search_with_score(q, k))
        
        return docs
        
    def _load_retrievers(self):
        if not self.vectorstores:
            self._load_vectorstores()
        
        retrievers = []
        for vs in self.vectorstores:
            retrievers.append(vs.as_retriever(search_kwargs={"k": self.top}))
        
        self.retrievers = retrievers
        print(f"{len(self.retrievers)}개의 리트리버 로드.")

    def get_retrievers(self) -> list:
        if not self.retrievers:
            self._load_retrievers()

        return self.retrievers

    def save_index(self, documents: list[Document], political_party: str, candidate: str) -> str:
        index_name = f"{political_party}_{candidate}_index"
        init_index_path = os.path.join(self.init_index_dir, f"{index_name}.faiss")

        init_vs = None
        if self.local_storage.is_exists(init_index_path):
            init_vs = FAISS.load_local(
                folder_path = self.init_index_dir,
                embeddings = self.embedding,
                index_name = index_name,
                allow_dangerous_deserialization = True
            )

        new_vs = FAISS.from_documents(documents, self.embedding)
        
        if init_vs is not None:
            # new_vs와 init_vs를 병합 후 저장
            init_vs.merge_from(new_vs)
            init_vs.save_local(self.index_dir, index_name = index_name)

            logger.info("init 인덱스 파일과 병합해 저장")
        else:
            # 없다면 새로운 인덱스 저장
            new_vs.save_local(self.index_dir, index_name = index_name)
            logger.info("새로운 인덱스 파일 저장")

        # 벡터스토리지, 리트리버 재로딩
        self._load_vectorstores()
        self._load_retrievers()

        return os.path.join(self.index_dir, index_name)

    def save_init_index(self, documents: list[Document], political_party: str, candidate: str):
        index_name = f"{political_party}_{candidate}_index"

        new_vs = FAISS.from_documents(documents, self.embedding)
        new_vs.save_local(self.init_index_dir, index_name = index_name)

    def reload_index(self):
        self.private_gcs_storage.download_directory(self.index_dir, self.index_dir)
        self._load_vectorstores()
        logger.info("index reload complete.")