# Internal Developer Platform

이 플랫폼은 개발자의 생산성을 향상시키기 위한 내부 개발자 플랫폼입니다. 이 플랫폼을 통해서 Jenkins, Argocd에 등록된 애플리케이션의 빌드, 배포, 상태조회를 한 곳에서 할 수 있도록 구성되어 있습니다.

## 필요조건
* Jenkins, Argocd 구성(Demo Mode를 통해서 구성 없이도 시연 가능)
* docker, docker-compose, kubernetes

## 목표
### 구현
* 빌드(Jenkins)
  * Jenkins Job 리스트 화면 제공
    * 빌드 성공/실패 시간, 소요시간
    * 빌드 수행
      * 리스트에 존재하는 Jenkins Job에 대해 빌드 수행
  * Job 상세 화면 제공
    * 빌드 수행내역 히스토리 제공
      * 최대 10개
      * 빌드 수행내역 히스토리별 빌드스탭, 빌드로그 조회
    * 빌드 수행
      * 빌드 수행 후 트리거된 빌드의 빌드스탭 & 진행로그 화면 제공
* 배포(Argocd)
  * Argocd Application 리스트 화면 제공
    * 배포 성공, 상태
    * 배포 수행
      * 리스트에 존재하는 Argocd Application에 대해 배포 수행
  * Application 상세 화면 제공
    * Status, Resources, Overview, Error logs, History 탭 제공
    * Sync 상태, 배포 수행 날짜
    * 연관 Resource 리스트

### 미구현
* 생성(Create)
  * 신규 Jenkins, Argocd Job&Application 생성
  * kuberntes 매니페스트 생성 및 배포
* Kubernetes 리소스 대시보드
  * kuberntes에 배포된 애플리케이션 상태 조회
* 통합인증(SSO)
* 메트릭(Metric) 시스템
  * Prometheus, Grafana 등의 정보를 보여주는 대시보드
* CI/CD
  * Github Action, tekton 등 다른 CI/CD툴과도 연동


## 사용법
실제 구성된 Jenkins, Argocd가 없더라도 backend 환경변수 DEMO_MODE(true/false)로 시연이 가능합니다.
Kubernetes 환경은 frontend/backend에 대한 domain 구성이 되어야 시연이 가능합니다.

#### 로컬환경
1. 환경변수 설정
* backend
```yaml
#docker-compose.yaml
    environment:
      // http or https
      PROTOCOL: http
      // jenkins url ex) jenkins.com
      JENKINS_URL:
      // jenkins user who created api token
      JENKINS_USER:
      // created api token value
      JENKINS_API_TOKEN:
      // argocd url ex) argocd.com
      ARGOCD_URL:
      // argocd user who created api token
      ARGOCD_USER:
      // created api token value
      ARGOCD_API_TOKEN:
      // demo mode enable/disable
      DEMO_MODE: false
```

2. docker compose 실행
```bash
docker-compose up 
```

#### Kubernetes
1. manifest 설정
* backend
각 값에 알맞게 config.yaml, secret.yaml 설정
```yaml
#backend/deployment.yaml
        env:
          - name: DEMO_MODE
            value: 'true'
          - name: PROTOCOL
            value: 'http'
          - name: JENKINS_URL
            valueFrom:
              configMapKeyRef:
                name: idp-hj-backend-cm
                key: JENKINS_URL
          - name: ARGOCD_URL
            valueFrom:
              configMapKeyRef:
                name: idp-hj-backend-cm
                key: ARGOCD_URL
          - name: JENKINS_USER
            valueFrom:
              secretKeyRef:
                name: idp-hj-backend-sc
                key: JENKINS_USER
          - name: ARGOCD_USER
            valueFrom:
              secretKeyRef:
                name: idp-hj-backend-sc
                key: ARGOCD_USER
```
* frontend
각 값에 알맞게 변수값 수정
```yaml
#frontend/deployment.yaml
        env:
          - name: NODE_ENV
            value: 'production'
            # replace backend domain url
          - name: REACT_APP_BACKEND_URL
            value: 'http://backend.com'

```

2. 배포
```bash
dir=frontend or backend
cd {dir}
k apply -f .
```
