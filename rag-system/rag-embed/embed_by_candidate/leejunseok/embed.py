import pickle
from pathlib import Path

import faiss

from embedder.text_embedder import TextEmbedder
from pledge_embedder.image_embedder import ImageEmbedder
from storage.faiss import vs_faiss


def embed(text_embedder: TextEmbedder):
    cur_dir_path = Path(__file__).parent

    src_dir = cur_dir_path / "src_imgs"
    embedder = ImageEmbedder(
        candidate="이준석",
        vector_storage=vs_faiss,
        text_embedder=text_embedder,
        src_dir=src_dir,
    )

    embedder.embed(merge=False, prefix="passage: ")

    embed_test(text_embedder=text_embedder, query="query: 청년 공약")


def embed_test(text_embedder: TextEmbedder, query: str):
    index_name = "resources/indexes/reformparty_leejunseok_index"
    index = faiss.read_index(f"{index_name}.index")

    pkl_path = f"{index_name}.pkl"
    with open(pkl_path, "rb") as f:
        metadata = pickle.load(f)

    k = 5
    embedded_query = text_embedder.embed_query(query)
    distances, indices = index.search(embedded_query, k=k)

    print(f"🔍 Top {k} 유사 문서:")
    for rank, (idx, dist) in enumerate(zip(indices[0], distances[0]), start=1):
        print(f"\n📌 순위 {rank}")
        print(f"  🔢 문서 ID: {idx}")
        print(f"  📏 거리: {dist:.4f}")
        print(f"  📄 메타데이터: {metadata[idx]}")
        print("-------------------------------")
