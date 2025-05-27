import os
from google import genai
from google.genai import types

from app.extensions.beans import faiss, gemini, name_k2e_convertor

answer_format = """
[
  {
    "candidate": "leejaemyung",
    "pledges": [
      {
        "mainPledge": "주요 정책1",
        "sourceImage": "이미지 출처 경로",
        "details": [
          "세부 정책 내용1",
          "세부 정책 내용2",
          "세부 정책 내용3",
          ...
        ]
      },
      {
        "mainPledge": "주요 정책2",
        "sourceImage": "이미지 출처 경로",
        "details": [
          "세부 정책 내용1",
          "세부 정책 내용2",
          "세부 정책 내용3",
          ...
        ]
      },
      ...
    ]
  },
  {
    "candidate": "kimmoonsoo",
    ...
  },
  {
    "candidate": "leejunseok",
    ...
  }
]
"""

def get_documents(q: str, k: int) -> dict:
  data = {
    "leejaemyung": {
      "metadata": {
				"politicalParty": "더불어민주당",
				"politicalPartyEng": name_k2e_convertor.get_political_party_eng_name("더불어민주당"),
				"candidate": "이재명",
	      "candidateEng": name_k2e_convertor.get_candidate_eng_name("이재명")
			},
      "contents": []
    },
    "kimmoonsoo": {
      "metadata": {
				"politicalParty": "국민의힘",
				"politicalPartyEng": name_k2e_convertor.get_political_party_eng_name("국민의힘"),
				"candidate": "김문수",
	      "candidateEng": name_k2e_convertor.get_candidate_eng_name("김문수")
			},
      "contents": []
    },
    "leejunseok": {
      "metadata": {
				"politicalParty": "개혁신당",
				"politicalPartyEng": name_k2e_convertor.get_political_party_eng_name("개혁신당"),
				"candidate": "이준석",
	      "candidateEng": name_k2e_convertor.get_candidate_eng_name("이준석")
			},
      "contents": []
    }
  }

  docs = faiss.query(q, k)
  for doc in docs:
    candidate = doc.metadata.get('candidate_eng', 'N/A')
    content = {
      "content": doc.page_content,
      "sourceImage": doc.metadata.get('source_image', 'N/A')
    }

    if candidate in data:
      data[candidate]["contents"].append(content)
  
  return data

def query(q: str) -> str:
  docs = faiss.query(q)
  
  context = "\n\n".join(
      f"{doc.page_content}\n"
      f"metadata[정당: {doc.metadata.get('political_party', 'N/A')}, "
      f"정당영문명: {doc.metadata.get('political_party_eng', 'N/A')}, "
      f"후보자: {doc.metadata.get('candidate', 'N/A')}, "
      f"후보자영문: {doc.metadata.get('candidate_eng', 'N/A')}, "
      f"이미지: {doc.metadata.get('source_image', 'N/A')}] "
      for doc in docs
  )

  prompt = f"""
  당신은 대한민국 제21대 대통령 선거 후보자의 정책 공약에 대해 간략하고 쉽게 요약해주는 AI입니다. 아래에 제가 제공하는 문서 데이터에서 질문과 관련있는 것만 참고해 후보별로 질문과 관계있는 문서를 주요 공약과 세부 공약으로 요약해주어야 합니다. 요약은 문서별로 해주세요.
  또한, 요약한 모든 문장은 명사형 종결 스타일로 작성해야 합니다. 예를들어 "대책을 마련하겠습니다." 가 아닌 "대책 마련" 식으로 간결하게 요약하세요.
  각 데이터의 [] 내에는 해당 문서의 메타데이터가 포함되어 있습니다. 이를 활용해 아래 주어진 JSON 포맷의 답변 형식에 따라 질문에 대한 답을 해주세요. 만약 해당 후보자의 관련된 공약이 없으면 pledges를 빈 리스트로 놓으면 됩니다. 그리고 중복되는 내용은 제외해주세요. 세부 공약 내용은 최대 4개까지만 적어주세요.

  질문: {q}

  -- 답변 형식 시작
  {answer_format}
  -- 답변 형식 끝

  정책 데이터:
  {context}
  """

  return gemini.generate(prompt)

def is_relevant_question(q: str) -> bool:
  prompt = f"""
  당신은 사용자의 질문에 대해 해당 질문이 경제, 과학, 교육 등 대한민국 21대 대통령 선거 후보자의 정책 공약에 관한 질문인지 아닌지 판별하는 AI입니다.
  주어지는 질문에 대해 정책 공약에 대한 질문인지 아닌지 판별하세요. 만약 사용자의 질문이 정책 공약에 대한 질문이라면 "Yes" 응답을, 그 외 관련이 없는 질문이라면 "No" 응답을 해야합니다.
  또한, 특정 후보를 지지하는지 질문하거나 어떤 후보를 추천하는 지 등 대선 후보자에 대한 중립성을 해치는 질문에도 "No"를 응답해야합니다. 또한, 다음의 키워드만 입력되었더라도 "Yes"입니다.
  
  경제, 교육, 노인(노년), 교통, 교육, 문화, 예술, 사회, 반려동물, 소상공인, 자영업자, 수도권, 강원, 영남, 재외국민, 청년, 충청, 행정, 호남, 공공의료, 과학기술, 기후, 에너지, 환경, 노동자, 방산, 여성, AI

  질문 = {q}
  """

  return gemini.generate(prompt) == "Yes"