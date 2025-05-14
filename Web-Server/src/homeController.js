import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch'; // 추가

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const home = (req, res) => {
  console.log('home controller called'); // 디버깅용 로그
  res.sendFile(path.join(__dirname, 'client', 'home.html'));
};

// 공약 데이터를 처리하는 컨트롤러
export const fetchPledges = async (req, res) => {
  try {
    // const response = await fetch('http://localhost:4000/ai');

    // if (!response.ok) {
    //   throw new Error(`AI 서버 응답 오류: ${response.status}`);
    // }

    // const data = await response.json();

    const data = {
      search: '청년 주거 정책에 대해 알려줘',
      status: 'ok',
      htmlData: `<div class="candidate-container">

<div class="candidate-container">
    <div class="candidates-grid">
        <div class="candidate-card theminjoo">
        <div class="candidate-header">
	        <a href="https://i.namu.wiki/i/zTLYeNvXSl8IGm6oFHmc2qTD-nNcIxHCZYMZzP7jHCDfvt_50wolRhf9oLfV2kc8-dB1FNLwahM5o1KrSW29O4RZfAmQobpTdAW4G3FQN1gdSiA1P7gXMm5lWORoa-CLaYgmjaNHph5VKJ2L_tBLqA.webp">
	          <img class="candidate-photo" src="https://i.namu.wiki/i/zTLYeNvXSl8IGm6oFHmc2qTD-nNcIxHCZYMZzP7jHCDfvt_50wolRhf9oLfV2kc8-dB1FNLwahM5o1KrSW29O4RZfAmQobpTdAW4G3FQN1gdSiA1P7gXMm5lWORoa-CLaYgmjaNHph5VKJ2L_tBLqA.webp" alt="윤석열 얼굴" />
					</a>
          <h2>윤석열</h2>
        </div>
        <div class="main-pledge">
            미래 인재 육성을 위한 교육 정책 
            <a class="refimg" href="https://storage.googleapis.com/gongyak21_public/resources/%EB%8D%94%EB%B6%88%EC%96%B4%EB%AF%BC%EC%A3%BC%EB%8B%B9_%EC%9D%B4%EC%9E%AC%EB%AA%85/half_images/page_67.jpg" target="_blank">
              이미지 보기
              <span class="refimg-preview">
                <img src="https://storage.googleapis.com/gongyak21_public/resources/%EB%8D%94%EB%B6%88%EC%96%B4%EB%AF%BC%EC%A3%BC%EB%8B%B9_%EC%9D%B4%EC%9E%AC%EB%AA%85/half_images/page_67.jpg" alt="공약 참고 이미지 미리보기" />
              </span>
            </a>
        </div>
        <ul>
            <li>입시 비리 암행어사제, 원스트라이크 아웃제 등 공정한 대입 제도 마련</li>
            <li>정시 모집인원 확대 및 대입전형 단순화</li>
            <li>특성화고 등을 통한 실무 중심 직업 교육 강화 및 고숙련 전문 인재 양성</li>
            <li>교원 행정업무 총량제 및 시스템 개선을 통한 학교 교육의 정치적 중립성 확보</li>
            <li>평생학습 기회 보장 (선행학습인정제 도입, 발달장애 학생 맞춤형 대학 학위 과정, 다문화 학생 맞춤형 교육 등)</li>
            <li>서민 로스쿨 설립 및 입시 전형 개선</li>
            <li>AI 과학기술 강군 육성을 위한 미래형 인재 육성</li>
            <li>대학등록금과 사교육비 부담 완화</li>
            <li>학교 교육의 정치적 중립성 확보</li>
        </ul>
        </div>
        <div class="candidate-card peoplepowerparty">
        <div class="candidate-header">
		      <a href="resources/half_images/page_22.jpg">
	          <img class="candidate-photo" src="resources/photos/이재명.jpg" alt="이재명 얼굴" />
					</a>
          
          <h2>이재명</h2>
        </div>
        <div class="main-pledge">
            미래 인재 양성을 위한 교육 정책 
            <a class="refimg" href="resources/half_images/page_22.jpg" target="_blank">
              이미지 보기
              <span class="refimg-preview">
                <img src="resources/half_images/page_22.jpg" alt="공약 참고 이미지 미리보기" />
              </span>
            </a>
        </div>
        <ul>
            <li>교육 컨트롤 타워 재구조화 (교육부, 국가교육위원회, 교육청 역할 조정)</li>
            <li>사교육 경감을 위한 맞춤형 지원 확대 및 교육 플랫폼 구축 (EBS 온라인 학교 전환, 온라인 대입 컨설팅 지원 확대 등)</li>
            <li>학력·학벌 차별 금지 제도 마련</li>
            <li>교육취약계층 지원 확대</li>
            <li>디지털 교육 정착을 위한 1인 1 태블릿 기기 확대 보급 (초등 4학년부터)</li>
            <li>미래 인재 양성을 위한 SW, AI, 빅데이터 교육 강화</li>
        </ul>
        </div>
        <div class="candidate-card reformparty">
        <div class="candidate-header">
          <a href="resources/half_images/page_22.jpg">
	          <img class="candidate-photo" src="resources/photos/이재명.jpg" alt="이재명 얼굴" />
					</a>
          
          <h2>이재명</h2>
        </div>
        <div class="main-pledge">
            미래 인재 양성을 위한 교육 정책 
            <a class="refimg" href="resources/half_images/page_22.jpg" target="_blank">
              이미지 보기
              <span class="refimg-preview">
                <img src="resources/half_images/page_22.jpg" alt="공약 참고 이미지 미리보기" />
              </span>
            </a>
        </div>
        <ul>
            <li>교육 컨트롤 타워 재구조화 (교육부, 국가교육위원회, 교육청 역할 조정)</li>
            <li>사교육 경감을 위한 맞춤형 지원 확대 및 교육 플랫폼 구축 (EBS 온라인 학교 전환, 온라인 대입 컨설팅 지원 확대 등)</li>
            <li>학력·학벌 차별 금지 제도 마련</li>
            <li>교육취약계층 지원 확대</li>
            <li>디지털 교육 정착을 위한 1인 1 태블릿 기기 확대 보급 (초등 4학년부터)</li>
            <li>미래 인재 양성을 위한 SW, AI, 빅데이터 교육 강화</li>
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
        <td><span class="summary-cand summary-cand-theminjoo">윤석열</span></td>
        <td>
          <ul>
            <li>공정한 대입제도(입시비리 근절, 정시 확대)</li>
            <li>실무·전문 인재 양성(특성화고, AI·과학기술 인재)</li>
            <li>대학등록금·사교육비 부담 완화</li>
            <li>학교 교육의 정치적 중립성 확보</li>
          </ul>
        </td>
      </tr>
      <tr>
        <td><span class="summary-cand summary-cand-peoplepowerparty">이재명</span></td>
        <td>
          <ul>
            <li>교육 컨트롤타워 재구조화</li>
            <li>사교육 경감 및 맞춤형 지원 확대</li>
            <li>디지털 교육(1인 1태블릿, SW·AI 교육 강화)</li>
            <li>교육취약계층 지원 및 학벌 차별 금지</li>
          </ul>
        </td>
      </tr>
      <tr>
        <td><span class="summary-cand summary-cand-reformparty">이재명</span></td>
        <td>
          <ul>
            <li>교육 컨트롤타워 재구조화</li>
            <li>사교육 경감 및 맞춤형 지원 확대</li>
            <li>디지털 교육(1인 1태블릿, SW·AI 교육 강화)</li>
            <li>교육취약계층 지원 및 학벌 차별 금지</li>
          </ul>
        </td>
      </tr>
    </tbody>
  </table>
</div>
<hr class="border-gray-300 mb-4">`,
    };

    res.set('Content-Type', 'application/json; charset=utf-8');
    res.status(200).json(data);
  } catch (error) {
    console.error('fetchPledges Error:', error);
    res.status(500).json({
      search: '',
      status: 'error',
      htmlData: '',
    });
  }
};
