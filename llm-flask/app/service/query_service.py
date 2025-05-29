import os
import logging
from google import genai
from google.genai import types
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import json
import platform

from app.extensions.beans import faiss, gemini, name_k2e_convertor
from app.util_classes.candidate_info import candidate_info

logger = logging.getLogger(__name__)

# 양자화 엔진 설정
# arch = platform.machine().lower()
# if arch in ['x86_64', 'i386', 'i686']:
#   torch.backends.quantized.engine = 'fbgemm'
# elif arch in ['arm64', 'aarch64']:
#   torch.backends.quantized.engine = 'qnnpack'
# else:
#   print(f"Unsupported architecture: {arch}, defaulting to qnnpack")
#   torch.backends.quantized.engine = 'qnnpack'

# # Reranker 모델 로드
# reranker_tokenizer = AutoTokenizer.from_pretrained("Dongjin-kr/ko-reranker")
# reranker_model = AutoModelForSequenceClassification.from_pretrained("Dongjin-kr/ko-reranker")
# reranker_model = torch.quantization.quantize_dynamic(
#     reranker_model, {torch.nn.Linear}, dtype=torch.qint8
# )
# print(f"Quantization applied with {torch.backends.quantized.engine} engine")
# reranker_model.eval()

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

def _build_data(docs_by_candidate: list) -> dict:
  data = {}
  for candidate, docs in docs_by_candidate.items():
    contents = []
    for doc in docs:      
      content = {
        "content": doc.page_content.replace("passage: ", ""),
        "sourceImage": doc.metadata.get("source_image", "N/A")
      }

      contents.append(content)

    data[candidate] = {
      "metadata": candidate_info.get(candidate),
      "contents": contents
    }

  return data

def get_documents(q: str, k: int):
  q = f"query: {q}"
  docs_by_candidate = faiss.query_by_candidate(q, k)
  return _build_data(docs_by_candidate)

def get_documents_with_llm(q: str, k: int) -> dict:
  # BGE 기반 모델 사용시 prefix로 'query: ' 적용
  q = f"query: {q}"
  docs_by_candidate = faiss.query_by_candidate(q, k * 2)
  _llm_rerank(q, docs_by_candidate, k)
  return _build_data(docs_by_candidate)

# def get_documents_with_bge(q: str, k: int) -> dict:
#   # BGE 기반 모델 사용시 prefix로 'query: ' 적용
#   q = f"query: {q}"
#   docs_by_candidate = faiss.query_by_candidate(q, k * 2)
#   _bge_rerank_all(q, docs_by_candidate, k)
#   return _build_data(docs_by_candidate)

# def _bge_rerank_all(query, docs_by_candidate, n):
#   logger.info("bge 리랭크 실행")
#   for candidate, docs in docs_by_candidate.items():
#     sorted_docs, _ = zip(*_bge_rerank(query, docs, n))
#     docs_by_candidate[candidate] = sorted_docs

# def _bge_rerank(query, docs, n, batch_size = 2):
#   # Reranker 점수 계산 (배치 처리)
#   scores = []
#   for i in range(0, len(docs), batch_size):
#       batch_docs = docs[i:i+batch_size]
#       inputs = reranker_tokenizer(
#           [(query, doc.page_content) for doc in batch_docs],
#           return_tensors = "pt",
#           padding = True,
#           truncation = True,
#           max_length = 512
#       )

#       with torch.no_grad():
#           logits = reranker_model(**inputs).logits
#           batch_scores = torch.sigmoid(logits).squeeze().tolist()
#       scores.extend(batch_scores if isinstance(batch_scores, list) else [batch_scores])

#   # 상위 n개 문서 선택
#   sorted_docs = sorted(zip(docs, scores), key = lambda x: x[1], reverse = True)[:n]
#   return sorted_docs

def _llm_rerank(query, docs_by_candidate, n):
  logger.info("llm 리랭크 실행")
  total_data = ""
  for candidate, docs in docs_by_candidate.items():
    data = "\n\n".join(
        f"{doc.page_content}\n"
        f"metadata[데이터ID: {doc.id}, "
        f"정당: {doc.metadata.get('political_party', 'N/A')}, "
        f"정당영문명: {doc.metadata.get('political_party_eng', 'N/A')}, "
        f"후보자: {doc.metadata.get('candidate', 'N/A')}, "
        f"후보자영문: {doc.metadata.get('candidate_eng', 'N/A')}, "
        f"이미지: {doc.metadata.get('source_image', 'N/A')}] "
        for doc in docs
    )

    total_data = total_data + data + "\n\n"

  response_format = """
    ```json
      {
        "leejaemyung": [관련있는 데이터의 id, 관련있는 데이터의 id, 관련있는 데이터의 id, ...],
        "kimmoonsoo": [관련있는 데이터의 id, 관련있는 데이터의 id, 관련있는 데이터의 id, ...],
        "leejunseok": [관련있는 데이터의 id, 관련있는 데이터의 id, 관련있는 데이터의 id, ...],
      }
    ```
  """

  prompt = f"""
    당신은 제가 제공하는 데이터 중에 질문과 관계있는 데이터만 골라내는 AI입니다. 답변 형식은 다음과 같습니다.
    {response_format}
    관련있는 데이터의 id는 해당 데이터와 질문과의 유사도의 내림차순으로 정렬해주세요.

    질문: {query}

    데이터:
    {total_data}
  """

  result = gemini.generate(prompt).strip().removeprefix("```json").removesuffix("```").strip()
  selected = json.loads(result)

  for candidate, docs in docs_by_candidate.items():
    temp = []
    sel = selected[candidate][:n]

    for doc in docs:
      if doc.id in sel:
        temp.append(doc)

    docs_by_candidate[candidate] = temp

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