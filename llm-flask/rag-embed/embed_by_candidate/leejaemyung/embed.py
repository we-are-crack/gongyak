import pickle
from pathlib import Path

import faiss

from embed_by_candidate.load_exlusion_pages import load_exclusion_pages
from embedder.text_embedder import TextEmbedder
from pledge_embedder.pdf_embedder import PDFEmbedder
from storage.faiss import vs_faiss


def embed(text_embedder: TextEmbedder):
    cur_dir_path = Path(__file__).parent

    # 중앙 공약 임베딩
    exclusion_file_path = cur_dir_path / "exclusion_pages.txt"
    exclusion = load_exclusion_pages(
        exclusion_file_path=exclusion_file_path, prefix="page_"
    )

    pdf_path = (
        cur_dir_path
        / "25_05_28_민주당_중앙공약_제21대_대통령선거_더불어민주당_중앙공약배포용_.pdf"
    )
    embeder = PDFEmbedder(
        candidate="이재명",
        vector_storage=vs_faiss,
        text_embedder=text_embedder,
        src_pdf_path=pdf_path,
        first_page=14,
        real_first_page=30,
        need_virtical_split=True,
        exlusion=exclusion,
    )

    embeder.embed(False, "passge: ")

    # 시도(광역) 공약 임베딩
    sido_pdf_path = (
        cur_dir_path
        / "25_05_28_민주당_광역공약_제21대_대통령선거_더불어민주당_광역공약배포용_.pdf"
    )
    merge_embedder = PDFEmbedder(
        candidate="이재명",
        vector_storage=vs_faiss,
        text_embedder=text_embedder,
        src_pdf_path=sido_pdf_path,
        real_first_page=377,
        need_virtical_split=False,
    )

    merge_embedder.embed(merge=True, prefix="passage: ")

    embed_test(text_embedder=text_embedder, query="query: 충남 공약")


def embed_test(text_embedder: TextEmbedder, query: str):
    index_name = "resources/indexes/theminjoo_leejaemyung_index"
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
