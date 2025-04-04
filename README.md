# Portfolio
안녕하세요, 저는 Devops엔지니어 이흥주입니다.
아래의 프로젝트들을 간단히 소개하고자 합니다.

어떤 곳에서든 보편적으로 필요할만한 기능을 간단하게 구현하는 것을 목표로 하였습니다.

## 프로젝트 소개
* [내부 개발자 플랫폼](./idp/README.md)
* [Kubernetes 리소스 추천 시스템](./k8s-resource-optimizer/README.md)
* [기술문서 RAG 챗봇](./chatbot/rag-chatbot/README.md)

### 1. 프로젝트
**내부 개발자 플랫폼**

개발자가 코드를 생성하고 배포하는데 필요한 표준화된 셀프 서비스 툴을 구현해본 프로젝트입니다.

#### 기술 스택
- **프레임워크**: React, NestJS
- **도구**: Jenkins, Argocd

#### 구현 목표
- Jenkins, Argocd에 생성된 Job과 Application 목록 조회
- Jenkins Job 상세 화면 조회, 빌드 실행
- Argocd Application 상세 화면 조회, 배포 실행

### 2. 프로젝트
**Kubernetes 리소스 추천 시스템**

쿠버네티스에서 구동되는 애플리케이션들에 대해 적정 리소스를 측정, 추천해주는 간소한 프로젝트 입니다.

#### 기술 스택
  - **언어**: Python
  - **도구**: Prometheus

#### 구현 목표
- Prometheus로 측정되는 애플리케이션의 CPU/MEM 사용량으로 적정 사용량을 계산
- Slack을 통해서 추천 사용량 전송

### 3. 프로젝트
**기술문서 RAG 챗봇**

RAG(Retrieval-Augmented Generation) 파이프라인을 이용, 사내 기술문서 등을 참조해 답변하는 챗봇을 가볍게 구현해본 프로젝트 입니다.

#### 기술 스택
  - **언어**: Python
  - **도구**: LangChain, OpenAI, Streamlit

#### 구현 목표
- pdf파일을 업로드하여 인덱싱 작업 후 벡터 저장
- 업로드된 pdf파일을 참조하여 챗봇이 질문에 답변, 출처 표기

### 연락처
- 이메일: enaska0@naver.com
