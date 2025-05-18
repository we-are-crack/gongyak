import os
from google import genai
from google.genai import types
from app.extensions.faiss import faiss_service
from app.extensions.gemini import gemini

answer_format = """
<div class="candidate-container">
  <div class="candidates-grid">
    <div class="candidate-card theminjoo">
      <div class="candidate-header">
        <a
          href="https://storage.googleapis.com/gongyak21_public/resources/candidate_image/leejaemyung.png"
        >
          <img
            class="candidate-photo"
            src="https://storage.googleapis.com/gongyak21_public/resources/candidate_image/leejaemyung.png"
            alt="이재명 후보"
          />
        </a>
        <h2>기호 1번 더불어민주당 이재명</h2>
      </div>
      <div class="main-pledge">
        한 문서의 정책 요약 내용
        <a class="refimg" href="`이미지`" target="_blank">
          출처 보기
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
      </ul>
      <div class="main-pledge">
        한 문서의 정책 요약 내용
        <a class="refimg" href="`이미지`" target="_blank">
          출처 보기
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
      </ul>
    </div>
  </div>
  <div class="candidates-grid">
    <div class="candidate-card peoplepowerparty">
      <div class="candidate-header">
        <a
          href="https://storage.googleapis.com/gongyak21_public/resources/candidate_image/kimmoonsoo.png"
        >
          <img
            class="candidate-photo"
            src="https://storage.googleapis.com/gongyak21_public/resources/candidate_image/kimmoonsoo.png"
            alt="김문수 후보"
          />
        </a>
        <h2>기호 2번 국민의힘 김문수</h2>
      </div>
      <div class="main-pledge">
        한 문서의 정책 요약 내용
        <a class="refimg" href="`이미지`" target="_blank">
          출처 보기
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
      </ul>
      <div class="main-pledge">
        한 문서의 정책 요약 내용
        <a class="refimg" href="`이미지`" target="_blank">
          출처 보기
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
      </ul>
    </div>
  </div>
  <div class="candidates-grid">
    <div class="candidate-card reformparty">
      <div class="candidate-header">
        <a
          href="https://storage.googleapis.com/gongyak21_public/resources/candidate_image/leejunseok.png"
        >
          <img
            class="candidate-photo"
            src="https://storage.googleapis.com/gongyak21_public/resources/candidate_image/leejunseok.png"
            alt="이준석 후보"
          />
        </a>
        <h2>기호 4번 개혁신당 이준석</h2>
      </div>
      <div class="main-pledge">
        한 문서의 정책 요약 내용
        <a class="refimg" href="`이미지`" target="_blank">
          출처 보기
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
      </ul>
      <div class="main-pledge">
        한 문서의 정책 요약 내용
        <a class="refimg" href="`이미지`" target="_blank">
          출처 보기
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
        <td><span class="summary-cand summary-cand-theminjoo">이재명</span></td>
        <td>
          <ul>
            <!-- 이재명 후보의 주요 공약 리스트 -->
            <li>공약 요약 1</li>
            <li>공약 요약 2</li>
          </ul>
        </td>
        <td><span class="summary-cand summary-cand-peoplepowerparty">김문수</span></td>
        <td>
          <ul>
            <!-- 김문수 후보의 주요 공약 리스트 -->
            <li>공약 요약 1</li>
            <li>공약 요약 2</li>
          </ul>
        </td>
        <td><span class="summary-cand summary-cand-reformparty">이준석</span></td>
        <td>
          <ul>
            <!-- 이준석 후보의 주요 공약 리스트 -->
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

def query(q: str) -> str:
  q = f"query: {q}"
  docs = []

  for ret in faiss_service.get_retrievers():
      docs.extend(ret.get_relevant_documents(q))
  
  context = "\n\n".join(
      f"{doc.page_content}\n"
      f"metadata[정당: {doc.metadata.get('political_party', 'N/A')}, "
      f"정당영문명: {doc.metadata.get('political_party_eng', 'N/A')}, "
      f"후보자: {doc.metadata.get('candidate', 'N/A')}, "
      f"후보자영문: {doc.metadata.get('candidate_eng', 'N/A')}, "
      f"이미지: {doc.metadata.get('source_image', 'N/A')}, "
      f"후보기호: {doc.metadata.get('candidate_num', 'N/A')}, "
      f"후보자사진: {doc.metadata.get('candidate_image', 'N/A')}] "
      for doc in docs
  )

  # print(context)

  prompt = f"""
  당신은 대한민국 제21대 대통령 선거 후보자의 정책 공약에 대해서만 대답하는 AI입니다. 당신은 지금부터 아래 주어지는 대한민국 21대 대통령 선거 후보자의 정책 공약 데이터 중에 질문과 관계있는 문서에 대해서만 간략하고 쉽게 요약해주어야 합니다.
  또한, 요약한 모든 문장은 명사형 종결 스타일로 작성해야 합니다. 예를들어 "대책을 마련하겠습니다." 가 아닌 "대책 마련" 식으로 간결하게 요약하세요.
  각 데이터의 [] 내에는 해당 문서의 메타데이터가 포함되어 있습니다. 이를 활용해 아래 주어진 답변 형식에 따라 질문에 대한 답을 해주세요. 그리고 중복되는 내용은 제외해주세요.
  답변 형식에 포함된 백틱(`)으로 감싸진 `이미지`는 metadata를 참고해 아래 지정하는 값을 넣어주세요.
  - `이미지`: metadata.이미지

  요약은 후보자별로 그리고 페이지별로 간략하게 요약해주세요. div.main-pledge와 세부 공약내용인 li 태그는 당신이 요약한 페이지 수만큼 추가되어야 합니다. 예를들어, 당신이 3개의 문서를 참조해 요약했다면 div.main-pledge는 3개가 되어야하고 세부 공약 내용이 3개라면 li 태그 또한 3개가 되어야합니다. 단, li 태그는 최대 4개까지만 추가하세요.
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