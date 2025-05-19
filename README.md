# 🎯 21대 대선 후보자 공약 비교 서비스 v1.0

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

## 🛠️ 기술 스택

### 🌐 Server

- **Frontend**: `HTML`, `CSS`, `JavaScript`
- **Backend**: `Node.js v22.15`
  - `Express v5.1`
- **Process Manager**: `pm2 v6.0`
- **AI Integration**: `Copilot`

### 🤖 AI

- **Programming Language**: `Python v3.12.3`
- **Framework**: `Flask`
- **Google Cloud Services**:
  - Vision OCR
  - VertexAI: `Gemini 2.0 Flash Lite`
  - Cloud Storage
- **RAG (Retrieval-Augmented Generation)**:
  - **Vector Search**: `Faiss`
  - **Embedding Model**: `dragonkue/BGE-m3-ko`

## 🏗️ 서비스 아키텍처

서비스는 다음과 같은 아키텍처로 구성되어 있습니다:

![서비스 아키텍처](/img/gongyak21-service-architecture.png)

## 👩‍💻 개발자

| 역할       | GitHub 프로필                           | 이메일               |
| ---------- | --------------------------------------- | -------------------- |
| **Server** | [on1ystar](https://github.com/on1ystar) | tjdwls0607@naver.com |
| **AI**     | [eello](https://github.com/eello)       | eello.bdev@gmail.com |

## 📜 라이선스

이 프로젝트는 [ISC 라이선스](LICENSE)를 따릅니다.
