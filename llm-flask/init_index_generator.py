import fitz
from langchain.schema import Document
from pdf2image import convert_from_path
import os
from PIL import Image

from app.extensions.beans import faiss, name_k2e_convertor

image_source_base_url = "https://storage.googleapis.com/gongyak21_public/resources"

def merge_images_horizontally(images):
    """여러 이미지를 좌우로 병합"""
    widths, heights = zip(*(img.size for img in images))
    total_width = sum(widths)
    max_height = max(heights)

    merged_img = Image.new('RGB', (total_width, max_height), (255, 255, 255))
    x_offset = 0
    for img in images:
        merged_img.paste(img, (x_offset, 0))
        x_offset += img.width
    return merged_img

def convert_and_merge_pdf_images_by_page_group(pdf_path, output_dir, page_groups):
    os.makedirs(output_dir, exist_ok=True)

    print("🔄 PDF → 이미지 변환 중...")
    images = convert_from_path(pdf_path, dpi=300)
    print(f"✅ 변환 완료: 총 {len(images)} 페이지")

    for i, (group, pledge) in enumerate(page_groups):
        image_list = []

        # 1-based to 0-based index 변환
        for page_num in group:
            page_idx = page_num - 1
            if 0 <= page_idx < len(images):
                image_list.append(images[page_idx])
            else:
                print(f"⚠️ 페이지 {page_num}는 범위를 벗어납니다.")

        if not image_list:
            continue

        if len(image_list) == 1:
            merged_image = image_list[0]
        else:
            merged_image = merge_images_horizontally(image_list)

        save_path = os.path.join(output_dir, f"page_{'-'.join(map(str, group))}.png")
        merged_image.save(save_path)
        print(f"📄 저장 완료: {save_path}")


def group_vectorization(pdf_path, political_party, candidate, page_groups):
    # PDF 로딩
    # loader = PyPDFLoader(pdf_path)
    # pages = loader.load()
    doc = fitz.open(pdf_path)
    
    political_party_eng = name_k2e_convertor.get_political_party_eng_name(political_party)
    candidate_eng = name_k2e_convertor.get_candidate_eng_name(candidate)

    # 묶은 문서 리스트
    grouped_documents = []

    for i, (group, pledge) in enumerate(page_groups):
        # 0-based index 변환
        page_indices = [p - 1 for p in group]

        # 해당 페이지들의 텍스트 추출
        selected_texts = [f"passage: 10대 주요 공약 - {i + 1}: {pledge}\n"]
        for p_idx in page_indices:
            page = doc[p_idx]
            text = page.get_text()
            selected_texts.append(text)

        combined_content = "\n".join(selected_texts)
        
        image_name = f"page_{"-".join(str(p) for p in group)}.png"
        source_image = f"{image_source_base_url}/{political_party_eng}_{candidate_eng}/main_pledge_images/{image_name}"
        metadata = {
            "source_image": source_image,
            "political_party": political_party,
            "political_party_eng": political_party_eng,
            "candidate": candidate,
            "candidate_eng": candidate_eng
        }

        grouped_doc = Document(page_content = combined_content, metadata = metadata)
        grouped_documents.append(grouped_doc)

    faiss.save_init_index(grouped_documents, political_party_eng, candidate_eng)

    # 결과 확인
    # for i, doc in enumerate(grouped_documents):
    #     print(f"--- 공약 {i+1}: {doc.metadata['source_image']} ---")
    #     print(doc.page_content)
    #     print(doc.metadata)

def init_v11n_ljm():
    pdf_path = "resources/theminjoo_leejaemyung/20250603_대한민국_이재명_10대공약.pdf"

    # ✅ 사용자 정의 페이지 그룹 (1-based index 기준)
    page_groups = [
        ([1, 2], "세계를 선도하는 경제 강국을 만들겠습니다."),
        ([3, 4], "내란극복과 K-민주주의 위상 회복으로 민주주의 강국을 만들겠습니다."),
        ([5, 6], "가계·소상공인의 활력을 증진하고,공정경제를 실현하겠습니다."),
        ([7, 8], "세계질서 변화에 실용적으로 대처하는 외교안보 강국을 만들겠습니다."),
        ([9, 10], "국민의 생명과 안전을 지키는 나라를 만들겠습니다."),
        ([11, 12], "세종 행정수도와 ‘5극 3특’추진으로 국토균형발전을 이루겠습니다."),
        ([13, 14], "노동이 존중받고 모든 사람의 권리가 보장되는 사회를 만들겠습니다."),
        ([15, 16], "생활안정으로 아동·청년·어르신 등 모두가 잘사는 나라를 만들겠습니다."),
        ([17, 18], "저출생·고령화 위기를 극복하고 아이부터 어르신까지 함께 돌보는 국가를 만들겠습니다."),
        ([19, 20], "미래세대를 위해 기후위기에 적극 대응하겠습니다.")
    ]

    # convert_and_merge_pdf_images_by_page_group(pdf_path, "resources/theminjoo_leejaemyung/main_pledge_images", page_groups)
    group_vectorization(pdf_path, "더불어민주당", "이재명", page_groups)

def init_v11n_kms():
    pdf_path = "resources/peoplepowerparty_kimmoonsoo/20250603_대한민국_김문수_10대공약.pdf"

    # ✅ 사용자 정의 페이지 그룹 (1-based index 기준)
    page_groups = [
        ([1], "자유 주도 성장, 기업하기 좋은 나라"),
        ([2, 3], "AI·에너지 3대 강국 도약"),
        ([4, 5], "청년이 크는 나라, 미래가 열리는 대한민국"),
        ([6, 7], "GTX로 연결되는 나라, 함께 크는 대한민국"),
        ([8, 9], "중산층 자산증식, 기회의 나라"),
        ([10, 11], "아이 낳고 기르기 좋은 나라, 안심되는 평생복지"),
        ([12, 13], "소상공인, 민생이 살아나는 서민경제"),
        ([14, 15], "재난에 강한 나라, 국민을 지키는 대한민국"),
        ([16, 17], "특권을 끊는 정부, 신뢰를 세우는 나라"),
        ([18, 19], "북핵을 이기는 힘, 튼튼한 국가안보")
    ]

    # convert_and_merge_pdf_images_by_page_group(pdf_path, "resources/peoplepowerparty_kimmoonsoo/main_pledge_images", page_groups)
    group_vectorization(pdf_path, "국민의힘", "김문수", page_groups)

def init_v11n_ljs():
    pdf_path = "resources/reformparty_leejunseok/20250603_대한민국_이준석_10대공약.pdf"

    # ✅ 사용자 정의 페이지 그룹 (1-based index 기준)
    page_groups = [
        ([1, 2], "대통령 힘빼고 일 잘하는 정부 만든다"),
        ([3], "중국 베트남 공장을 다시 대한민국으로"),
        ([4], "지자체, 법인세 자치권 부여로 지방 경쟁력 강화!"),
        ([5], "최저임금 최종 결정 권한 지자체에 위임"),
        ([6], "국민연금, 신-구 연금 분리가 유일한 해결책"),
        ([7], "교권 보호를 위한 교사 소송 국가책임제 및 학습지도실 제도 도입"),
        ([8], "5천만원 한도 든든출발자금으로 청년의 도전 응원!"),
        ([9], "현역대상자 가운데 장교 선발한다"),
        ([10], "압도적 규제 혁파 위한 ‘규제기준국가제’실시"),
        ([11], "‘과학기술 성과연금’ 및 ‘과학자 패스트트랙’ 등 「국가과학영웅 우대제도」도입")
    ]

    # convert_and_merge_pdf_images_by_page_group(pdf_path, "resources/reformparty_leejunseok/main_pledge_images", page_groups)
    group_vectorization(pdf_path, "개혁신당", "이준석", page_groups)

# init_v11n_ljm()
# init_v11n_kms()
# init_v11n_ljs()
