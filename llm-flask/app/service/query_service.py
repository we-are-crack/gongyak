import os
from google import genai
from google.genai import types

from app.extensions.beans import faiss, gemini

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

  # print(context)

  prompt = f"""
  당신은 대한민국 제21대 대통령 선거 후보자의 정책 공약에 대해 간략하고 쉽게 요약해주는 AI입니다. 아래에 제가 제공하는 문서 데이터에서 질문과 관련있는 것만 참고해 후보별로 그리고 문서별로 질문과 관계있는 문서를 주요 공약과 세부 공약으로 요약해주어야 합니다.
  또한, 요약한 모든 문장은 명사형 종결 스타일로 작성해야 합니다. 예를들어 "대책을 마련하겠습니다." 가 아닌 "대책 마련" 식으로 간결하게 요약하세요.
  각 데이터의 [] 내에는 해당 문서의 메타데이터가 포함되어 있습니다. 이를 활용해 아래 주어진 JSON 포맷의 답변 형식에 따라 질문에 대한 답을 해주세요. 그리고 중복되는 내용은 제외해주세요. 세부 공약 내용은 최대 4개까지만 적어주세요.

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
  또한, 특정 후보를 지지하는지 질문하거나 어떤 후보를 추천하는 지 등 대선 후보자에 대한 중립성을 해치는 질문에도 "No"를 응답해야합니다.
  질문 = {q}
  """

  return gemini.generate(prompt) == "Yes"