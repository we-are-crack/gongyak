# 🎯 21대 대선 후보자 공약 비교 서비스 [공약21](https://gongyak21.site/) v1.0

<p align="center">
  <img src="./img/gongyak21_logo.png" alt="공약21 로고" width="300" />
</p>

## 📖 개요

각 후보자들의 공약을 찾아보기 쉽지 않으며, 관심 있는 공약과 관심 없는 공약이 혼재되어 있는 경우가 많습니다. 또한, 직접적인 비교를 제공하는 곳은 뉴스 기사와 같은 제한된 매체에 불과합니다.

**21대 대선 후보자 공약 비교 서비스**는 사용자가 궁금한 공약을 검색하면, **AI**가 객관적이고 중립적으로 후보자들의 공약을 제공 및 비교해 주는 서비스입니다.  
공약의 출처는 각 후보자의 공식 공약 정책집만을 참조하므로 **신뢰성이 매우 높습니다**.

## ✨ 주요 기능 및 사용 방법

- **사용자가 궁금한 공약을 자유롭게 검색**
  - 예시:
    - `청년 주거 정책 알려줘`
    - `경제 관련 정책 알려줘`
    - `여성 정책 알려줘`
- **각 후보자의 공식 공약 정책집을 근거로 주요 공약 나열**
- **후보자들의 공약을 비교 및 요약**
- **검색한 공약 카카오톡 공유**
- **유사한 검색어의 경우 캐싱 결과 사용**
- **최근 사용자들이 검색한 검색어 추천**

## 🛠️ 기술 스택

### 🌐 Server

- **Frontend**: `HTML`, `CSS`, `JavaScript`
- **Template Engine** : `Pug`
- **Backend**: `Node.js v22.15`
  - `Express v5.1`
  - `@xenova/transformers ^2.17.2`
  - `Jest v29.7.0`
- **Transformers.js**
  - **Embedding model** : `Xenova/paraphrase-multilingual-MiniLM-L12-v2`
- **Database**
  - `Redis v7.4.2`
- **Process Manager**: `pm2 v6.0`
- **AI Integration**: `Copilot`

### 🤖 AI

- **Programming Language**: `Python v3.12.3`
- **Framework**: `Flask`
- **Google Cloud Services**:
  - Vision OCR
  - **VertexAI**: `Gemini 2.0 Flash Lite`
  - Cloud Storage
- **RAG (Retrieval-Augmented Generation)**:
  - **Vector Search**: `Faiss`
  - **Embedding Model**: `dragonkue/BGE-m3-ko`

## 🏗️ 서비스 아키텍처

서비스는 다음과 같은 아키텍처로 구성되어 있습니다:

![서비스 아키텍처](/img/gongyak21-service-architecture-2.png)

1. 사용자가 검색어를 입력하면, 서버는 Redis에 이미 유사한 문장 분석 결과가 저장되어 있는지 벡터 탐색
2. 유사한 문장이 있으면 분석 데이터를 가져와 렌더링하고, 없으면 검색어를 AI 분석 서버로 전달
3. AI 분석 서버는 검색어와 관련된 공약 데이터를 RAG 기반 검색 시스템을 통해 조회
4. 조회된 데이터는 VertexAI를 통해 요약 및 비교 분석 수행
5. 분석 결과는 서버로 전달되고, 분석 결과를 레디스에 저장
6. 데이터 렌더링 후 사용자에게 표시

## 👩‍💻 개발자

| 역할       | GitHub 프로필                           | 이메일               |
| ---------- | --------------------------------------- | -------------------- |
| **Server** | [on1ystar](https://github.com/on1ystar) | tjdwls0607@naver.com |
| **AI**     | [eello](https://github.com/eello)       | eello.bdev@gmail.com |

## 📜 라이선스

이 프로젝트는 [ISC 라이선스](LICENSE)를 따릅니다.
