import os
from google import genai
from google.genai import types
from app.extensions.faiss import faiss_service
from app.extensions.gemini import gemini

answer_format = """
<div class="candidate-container">
  <div class="candidates-grid">
    <div class="candidate-card `정당`">
      <div class="candidate-header">
        <a
          href="`후보자 사진`"
        >
          <img
            class="candidate-photo"
            src="`후보자 사진`"
            alt="`후보자` 얼굴"
          />
        </a>
        <h2>`후보자`</h2>
      </div>
      <div class="main-pledge">
        한 문서의 정책 요약 내용
        <a class="refimg" href="`이미지`" target="_blank">
          이미지 보기
          <span class="refimg-preview">
            <img src="`이미지`" alt="공약 참고 이미지 미리보기" />
          </span>
        </a>
      </div>
      <ul>
        <li>세부 공약 내용1</li>
        <li>세부 공약 내용2</li>
        <li>세부 공약 내용3</li>
        <li>세부 공약 내용4</li>
        <li>세부 공약 내용5</li>
      </ul>
      <div class="main-pledge">
        한 문서의 정책 요약 내용
        <a class="refimg" href="`이미지`" target="_blank">
          이미지 보기
          <span class="refimg-preview">
            <img src="`이미지`" alt="공약 참고 이미지 미리보기" />
          </span>
        </a>
      </div>
      <ul>
        <li>세부 공약 내용1</li>
        <li>세부 공약 내용2</li>
        <li>세부 공약 내용3</li>
        <li>세부 공약 내용4</li>
        <li>세부 공약 내용5</li>
      </ul>
    </div>
  </div>
</div>
<!-- 후보자별 공약 요약 비교 섹션 추가 -->
<div class="summary-section">
  <h3>후보자별 교육 공약 요약 비교</h3>
  <table class="summary-table">
    <thead>
      <tr>
        <th>후보자</th>
        <th>핵심 공약 요약</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><span class="summary-cand summary-cand-`정당`">`후보자`</span></td>
        <td>
          <ul>
            <li>공약 요약 1</li>
            <li>공약 요약 2</li>
          </ul>
        </td>
      </tr>
    </tbody>
  </table>
</div>
<hr class="border-gray-300 mb-4" />
"""

political_party_eng = {
  "더불어민주당": "theminjoo",
  "국민의힘": "peoplepowerparty",
  "개혁신당": "reformparty"
}

def query(q: str) -> str:
    docs = []

    for ret in faiss_service.get_retrievers():
        docs.extend(ret.get_relevant_documents(q))
    
    context = "\n\n".join(
        f"{doc.page_content}\n"
        f"[정당: {political_party_eng.get(doc.metadata.get('political_party', 'N/A'))}] "
        f"[후보자: {doc.metadata.get('candidate', 'N/A')}] "
        f"[이미지: {doc.metadata.get('source_image', 'N/A')}] "
        f"[OCR텍스트: {doc.metadata.get('source_text', 'N/A')}]"
        for doc in docs
    )

    prompt = f"""
    당신은 대한민국 제21대 대통령 선거 후보자의 정책 공약에 대해서만 대답하는 AI입니다. 당신은 지금부터 아래 주어지는 대한민국 21대 대통령 선거 후보자의 정책 공약을 쉽게 요약해주어야 합니다.
    각 데이터의 [] 내에는 해당 문서의 메타데이터가 포함되어 있습니다. 이를 활용해 아래 주어진 답변 형식에 따라 질문에 대한 답을 해주세요.
    답변 형식에 포함된 백틱(`)으로 감싸진 `후보자`, `정당`, `이미지` 등은 아래 지정하는 값을 넣어주세요.
    `후보자`: 메타데이터.후보자
    `정당`: 메타데이터.정당
    `이미지`: 메타데이터.이미지
    `후보자 사진`: https://storage.googleapis.com/gongyak21_public/resources/candidate_image/`메타데이터.후보자`.png
    요약은 후보자별로 그리고 페이지별로 간단하게 요약해주세요. 즉, div.candidate-card는 후보자 수만큼, div.main-pledge는 해당 후보자의 주요 공약 내용을 페이지별로 요약한 수만큼 추가되어야 합니다. 세부내용을 포함하는 li 태그들은 형식에 포함된 개수와 상관없이 당신이 요약한 갯수만큼 추가하되 형식에서 기존에 존재하던 태그들과 동일한 레벨에 추가해주세요.
    마지막으로 후보자별 공약을 요약하는 summary-talbe 내의 li는 당신이 위에서 요약한 후보자별 div.main-pledge의 페이지별 요약을 더욱 간단하게 요약해서 추가하면 됩니다.

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