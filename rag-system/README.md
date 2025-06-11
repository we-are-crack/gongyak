# Gongyak21 RAG System

프로젝트 중반까지 RAG 전체 시스템 구축을 담당하고 구축했지만 웹서버에서 화면을 그리기 때문에 LLM에 요청하는 부분을 웹서버 쪽으로 옮기게되어 최종적으로는 **RAG 기반 응답 시스템의 전처리 및 벡터 검색 파이프라인**을 담당

## API List

### 문서 검색

사용자의 질문을 임베딩해 벡터 저장소에서 유사한 문서를 검색해 응답

- Method: `GET`
- URI: `/docs`
- Query Parameter:
  | **이름** | **필수** | **설명** |
  | -------- | -------- | ----------------------------------- |
  | q | O | 사용자 질문 |
  | k | X | 검색할 문서 개수, 기본값 = 5 |
  | type | X | 리랭크 타입, 기본값 = 리랭크 수행 X |
- Response
  ```json
  // 200 OK
  {
    "status": "ok",
    "data": {
      "leejaemyung": {
        "metadata": {
          "politicalParty": "정당 한글명",
          "politicalPartyEng": "정당 영문명",
          "candidate": "후보자 한글명",
          "candidateEng": "후보자 영문명"
        },
        "contents": [
          {
            "content": "문서 내용",
            "sourceImage": "출처 이미지 경로"
          }
          // ...
        ]
      },
      "kimmoonsoo": {
        // 동일
      },
      "leejunseok": {
        // 동일
      }
    }
  }
  ```

### RAG 기반 LLM 응답 생성

사용자의 질문을 임베딩해 벡터 저장소에서 유사한 문서를 검색해 프롬프트를 만들고 LLM Call을 통해 비교 및 요약 응답 생성해 응답

- Method: `GET`
- URI: `/query`
- Query Parameter:
  | **이름** | **필수** | **설명** |
  | -------- | -------- | ----------------------------------- |
  | q | O | 사용자 질문 |
- Response
  ```json
  // 200 OK
  {
    "searchQuery": "검색어",
    "status": "ok",
    "data": [
      {
        "candidate": "leejaemyung",
        "pledges": [
          {
            "mainPledge": "주요 정책1",
            "sourceImage": "이미지 출처 경로",
            "details": [
              "세부 정책 내용1",
              "세부 정책 내용2",
              "세부 정책 내용3"
              // ...
            ]
          },
          {
            "mainPledge": "주요 정책2",
            "sourceImage": "이미지 출처 경로",
            "details": [
              "세부 정책 내용1",
              "세부 정책 내용2",
              "세부 정책 내용3"
              // ...
            ]
          }
          // ...
        ]
      },
      {
        "candidate": "kimmoonsoo",
        "pledges": [] // 위와 동일
      },
      {
        "candidate": "leejunseok",
        "pledges": [] // 위와 동일
      }
    ]
  }
  ```

### 질문 임베딩

캐싱을 위해 사용자의 질문을 임베딩한 결과를 응답
임베딩 모델에 따라 검색을 위한 임베딩과 저장을 위한 임베딩의 prefix가 다르기 때문에 `query_embedding(검색을 위함 임베딩)`, `passage_embedding(저장을 위한 임베딩)`으로 나누어 응답

- Method: `GET`
- URI: `/embed`
- Query Parameter:
  | **이름** | **필수** | **설명** |
  | -------- | -------- | ----------------------------------- |
  | q | O | 사용자 질문 |
- Response
  ```json
  // 200 OK
  {
    "status": "ok",
    "query_embedding": [], // 검색을 위한 임베딩 결과, float32 벡터 리스트
    "passage_embedding": [] // 저장을 위한 임베딩 결과, float32 벡터 리스트
  }
  ```

### 인덱스 리로드

서비스 중단 없이 새로 만들어지거나 수정된 인덱스를 업데이트하기 위한 API로 요청을 통해 클라우드 스토리지에서 인덱스를 다운받아 벡터 인덱스를 리로드

- Method: `GET`
- URI: `/reload`

## Tech Stack

- Language: `Python v3.12.3`
- Web Framework: `Flask`
- Google Cloud Service
  - Cloud Engine - `e2-medium` (vCPU 2개, 메모리 4GB)
  - Vision OCR: 공약 정책집의 텍스트 추출
  - VertexAI(LLM) - `Gemini 2.0 Flash Lite`
  - Cloud Storage: 임베딩 결과, 출처 이미지 등 저장
  - Cloud DNS: Cloud Engine 인스턴스와 도메인 연결
- 전처리
  - Vector Storage: `FAISS`
  - Embedding Model
    - `dragonkue/BGE-m3-ko`: 공약 데이터 벡터화
    - `distiluse-base-multilingual-cased-v1`: 캐싱을 위한 질문 벡터화

## 폴더구조

```
rag-system
│
├── common
│   ├── common
│   │   ├── __init__.py
│   │   ├── config
│   │   │   └── logger.py
│   │   └── dtype.py
│   └── setup.py
│
├── flask-rag-search
│   ├── app
│   │   ├── __init__.py
│   │   ├── extensions
│   │   │   ├── cloud_storage
│   │   │   │   ├── __init__.py
│   │   │   │   ├── abstract.py
│   │   │   │   └── google_cloud_storage.py
│   │   │   ├── embedder
│   │   │   │   ├── __init__.py
│   │   │   │   ├── text_embedder.py
│   │   │   │   └── text_embedding_model.py
│   │   │   ├── llm
│   │   │   │   ├── __init__.py
│   │   │   │   ├── abstract.py
│   │   │   │   └── google_gemini.py
│   │   │   ├── reranker
│   │   │   │   ├── __init__.py
│   │   │   │   ├── abstract.py
│   │   │   │   ├── llm_reranker.py
│   │   │   │   ├── model_base_reranker.py
│   │   │   │   ├── reranker_model.py
│   │   │   │   ├── reranker_registry.py
│   │   │   │   └── reranker_type.py
│   │   │   └── retrieval
│   │   │       ├── __init__.py
│   │   │       ├── vector_index
│   │   │       │   ├── abstract.py
│   │   │       │   ├── faiss_index.py
│   │   │       │   └── vector_index_manager
│   │   │       │       ├── abstract.py
│   │   │       │       └── faiss_index_manager.py
│   │   │       └── vector_storage
│   │   │           ├── abstract.py
│   │   │           └── faiss_storage.py
│   │   ├── routes
│   │   │   ├── __init__.py
│   │   │   └── main.py
│   │   ├── services
│   │   │   ├── __init__.py
│   │   │   ├── embed_service.py
│   │   │   └── query_service.py
│   │   └── utils
│   │       ├── candidate_info.py
│   │       └── prompts.py
│   ├── requirements.txt
│   └── run.py
│
├── rag-embed
│   ├── embed_by_candidate
│   │   ├── kimmoonsoo
│   │   │   ├── 2025 국민의힘 정책공약집 시도 (1).pdf
│   │   │   ├── 2025 국민의힘 정책공약집 중앙.pdf
│   │   │   ├── embed.py
│   │   │   └── exclusion_pages.txt
│   │   ├── leejaemyung
│   │   │   ├── 25_05_28_민주당_광역공약_제21대_대통령선거_더불어민주당_광역공약배포용_.pdf
│   │   │   ├── 25_05_28_민주당_중앙공약_제21대_대통령선거_더불어민주당_중앙공약배포용_.pdf
│   │   │   ├── embed.py
│   │   │   └── exclusion_pages.txt
│   │   ├── leejunseok
│   │   │   ├── embed.py
│   │   │   └── src_imgs
│   │   │       ├── 정책 공약 캡처 이미지
│   │   │       ├── 정책 공약 캡처 이미지
│   │   │       └── ...
│   │   └── load_exlusion_pages.py
│   ├── embedder
│   │   └── text_embedder.py
│   ├── main.py
│   ├── pledge_embedder
│   │   ├── embedder.py
│   │   ├── image_embedder.py
│   │   └── pdf_embedder.py
│   ├── requirements.txt
│   ├── storage
│   │   ├── faiss.py
│   │   ├── gcs_storage.py
│   │   ├── local_storage.py
│   │   └── vector_storage.py
│   └── utils
│       ├── base64url_encode.py
│       ├── candidate_info.py
│       ├── pdf_utils.py
│       └── text_extract.py
└── README.md
```

## Quick Start

### 사전 준비

현재 사용된 PDF 공약집은 텍스트 추출이 불가한 PDF로 구글 VisionOCR을 사용해 텍스트를 추출하고 있으며 임베딩 결과를 Google Cloud Storage에 업로드하고 LLM은 VertexAI의 Gemini를 사용하기 때문에 VisionOCR과 GCS, VertexAI 사용하기 위한 준비가 필요하다.

#### 구글 VisionOCR 설정

1. Google Cloud Console에서 Vision API를 활성화
2. 서비스 계정 및 키 생성
   - Google Cloud Console → IAM & 관리자 → 서비스 계정
   - 새 서비스 계정 생성 → 역할: "Vision AI 사용자"
     > 역할을 설정안해도 실행되긴 했음
   - 키 생성 → JSON 형식 선택 → 키 파일 다운로드
3. 인증 정보 설정 (환경 변수)
   ```bash
   # 가상환경을 사용한다면 rag-embed의 가상환경에 환경 변수 설정
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your-service-account-key.json"
   ```

#### GCS 설정

1. Google Cloud Console에서 Cloud Storage API를 활성화
2. 서비스 계정 및 키 생성
   - Google Cloud Console → IAM & 관리자 → 서비스 계정
   - 새 서비스 계정 생성 → 역할: "Storage 객체 관리자"
   - 키 생성 → JSON 형식 선택 → 키 파일 다운로드
     > 새로 생성하지 않고 VisionOCR에서 생성한 서비스 계정에 역할만 추가해 동일한 키 파일 사용 가능
3. 버킷 생성
   - 이미지 제공을 위한 공개 버킷: 권한 > 액세스 권한 부여 > 주 구성원에 "allUsers" 입력 > 역할 : "저장소 개체 뷰어"
   - 임베딩 결과를 업로드하기 위한 비공개 버킷
4. 환경 변수 설정

   ```bash
   # 가상환경을 사용한다면 flask-rag-search, rag-embed 동일
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your-service-account-key.json"

   # rag-embed
   export GOOGLE_CLOUD_STORAGE_GONGYAK_PUBLIC_BUCKET="공개 버킷 이름"
   export GOOGLE_CLOUD_STORAGE_GONGYAK_PRIVATE_BUCKET="비공개 버킷 이름"
   ```

#### 구글 Vertex AI 설정

1. Google Cloud Console에서 VertextAI API를 활성화
2. 서비스 계정 및 키 생성
   - Google Cloud Console → IAM & 관리자 → 서비스 계정
   - 새 서비스 계정 생성 → 역할: "Vertex AI User"
   - 키 생성 → JSON 형식 선택 → 키 파일 다운로드
     > 마찬가지로 새로 생성하지 않고 VisionOCR에서 생성한 서비스 계정에 역할만 추가해 동일한 키 파일 사용 가능
3. 인증 정보 설정 (환경 변수)
   ```bash
   # 가상환경을 사용한다면 flask-rag-search의 가상환경에 환경 변수 설정
   export GOOGLE_CLOUD_PROJECT="GOOGLE_CLOUD_PROJECT_ID" # 프로젝트 ID 입력
   export GOOGLE_CLOUD_LOCATION="us-central1" # Region 입력
   export GOOGLE_GENAI_USE_VERTEXAI=True
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your-service-account-key.json"
   ```

- 참고 : [Vertext AI Gemini를 사용하여 텍스트 생성](https://cloud.google.com/vertex-ai/generative-ai/docs/start/quickstarts/quickstart-multimodal?hl=ko#gen-ai-sdk-for-python)

### 인덱스 파일 생성

> 가상환경을 사용한다는 가정으로 작성

1. 가상환경 생성
   ```bash
   cd rag-embed
   python -m venv venv
   ```
2. 가상환경 내 사전 준비에서 필요한 환경 변수 설정
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your-service-account-key.json"
   export GOOGLE_CLOUD_STORAGE_GONGYAK_PUBLIC_BUCKET="공개 버킷 이름"
   export GOOGLE_CLOUD_STORAGE_GONGYAK_PRIVATE_BUCKET="비공개 버킷 이름"
   ```
   - 환경 변수를 설정하는 방법은 다양하다.
     - 환경 변수와 함께 가상 환경 active를 위한 실행파일(.sh) 만들어 가상환경 실행
     - venv/bin/active 파일 내에 환경 변수 설정
     - 등
3. 가상환경 실행 및 패키지 설치
   ```
   source venv/bin/activate
   pip install -r requirements.txt
   ```
4. `rag-embed/main.py` 실행
   - 실행 시 `rag-embed/resources/` 안에 임베딩 결과가 생성되며 해당 폴더를 클라우드 스토리지에 업로드

> ⚠️ 주의
> 임베딩 결과 중 `rag-embed/resources/indexes` 내에 생성되는 `.index`, `.pkl`의 파일 이름은 `{정당영문명}_{후보자영문명}_index`로 고정되어야 한다.

### RAG 검색을 위한 Flask 웹 애플리케이션 실행

> 가상환경을 사용한다는 가정으로 작성

1. 가상환경 생성
   ```bash
   cd flask-rag-search
   python -m venv venv
   ```
2. 가상환경 내 사전 준비에서 필요한 환경 변수 설정
   ```bash
   export GOOGLE_CLOUD_PROJECT="GOOGLE_CLOUD_PROJECT_ID" # 프로젝트 ID 입력
   export GOOGLE_CLOUD_LOCATION="us-central1" # Region 입력
   export GOOGLE_GENAI_USE_VERTEXAI=True
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your-service-account-key.json"
   ```
3. 가상환경 실행 및 패키지 설치
   ```
   source venv/bin/activate
   pip install -r requirements.txt
   ```
4. Flask 웹 애플리케이션 실행
   ```bash
   gunicorn -w 1 -b 127.0.0.1:5000 run:app
   # 또는
   FLASK_APP=run.py flask run
   # 또는
   python run.py
   ```

- 인덱스 파일이 정상적으로 실행되어 클라우드 스토리지에 업로드 됐다면 Flask 앱 실행 시 클라우드에서 다운로드 받아 벡터 인덱스를 생성해 사용
- 만약 클라우드 스토리지를 사용하지 않는다면 `flask-rag-search/resources/indexes` 폴더 안에 `rag-embed/resources/indexes` 내의 파일들(`*.index`, `*.pkl`)을 복사한 후 실행
