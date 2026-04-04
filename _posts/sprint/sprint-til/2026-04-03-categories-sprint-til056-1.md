---
title: '[TIL 56일 차] AWS ECS 로 프로그램 배포하기'
excerpt: '2.ECR 시작하기 ~ 5.GitHub Actions'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til056-1

toc: true
toc_sticky: true

date: 2026-04-03
last_modified_at: 2026-04-03
---

# AWS ECS 로 프로그램 배포하기

## <span style="background-color: #FFF9C4">2. ECR</span>

### 2-01. ECR (Elastic Container Registry)

AWS에서 제공하는 Docker 호환 컨테이너 이미지 저장소

- 로컬 환경에서 만든 Docker 이미지를 push하여 저장한 뒤, 다른 서버나 환경에 pull하여 실행할 수 있다.
- 이미지 전용 GitHub라고 생각하면 된다.
- ECR 권한은 최소 권한 원칙(Principle of Least Privilege)을 지켜야 함

#### 1) ECR 수명주기(생애주기) 정책 (Lifecycle Policy)

ECR은 수명주기 정책을 설정하여 오래된 이미지를 자동 삭제할 수 있다.

- ECR 수명주기 정책 필요성
  - 정책에 맞춰 자동으로 오래된 이미지 삭제
  - GB 단위로 요금이 청구되는데 사용하지 않는 오래된 이미지를 삭제하면 비용 절감 가능
  - 팀원들이 혼란 없이 최신 이미지만 사용 가능
  - 옛날 이미지가 그대로 남아있다면 취약점 스캐너에 걸릴 수 있

---

## <span style="background-color: #FFF9C4">3. ECS</span>

### 3-01. 컨테이너 오케스트레이션

실제 운영 환경에서 단일 컨테이너만 사용하는 경우는 드물다. 보통 수십~수백 개의 컨테이너를 동시에 실행하고 관리한다.

이때 필요한 것이 컨테이너 오케스트레이션(Container Orchestration)이다.

컨테이너 오케스트레이션은 아래의 기능을 자동으로 수행한다.

- 컨테이너 배치 (어떤 서버에 컨테이너를 올릴지)
- 컨테이너 상태 모니터링 (죽으면 자동으로 재시작)
- 확장/축소 (트래픽에 맞춰 개수를 늘리거나 줄임)
- 네트워크 연결 및 로드밸런싱

대표적인 서비스로는 Kubernetes, Amazon ECS, Docker Swarm 등이 있다.

```bash
# 컨테이너 오케스트레이션이 없는 경우 (직접 서버에 올림)
server1: run container A, B
server2: run container C

# 오케스트레이션 도구를 쓰는 경우 (자동으로 배치)
cluster: run container A, B, C (자동으로 최적 서버 배치)
```

<br>

### 3-02. ECS

AWS에서 제공하는 완전관리형 컨테이너 오케스트레이션 서비스로, ECR에 저장된 Docker 이미지를 불러와 클러스터 환경에서 실행할 수 있다.

```bash
# 연결 관계 한눈에 보기 (간단 다이어그램)
[Cluster]
  └─[Service]  ← 확장/축소, 배포, 로드밸런서 연결
      └─[Task] (실행 인스턴스, 1개 이상)
          └─[Containers] (여러 개 가능, web, sidecar, log 등)
```

- **Cluster**
  - 컨테이너를 실행하는 어떤 논리적 그룹 (운영 단지, 실행 환경)
  - 컨테이너 관리 X, Service를 관리
    - Fargate 모드일 경우, 실제 서버(EC2)를 직접 지정하진 않지만 내부적으로 Fargate가 AWS 리소스를 할당해 컨테이너를 구동
    - EC2 모드일 경우, 클러스터에는 하나 이상의 EC2 인스턴스가 등록되며, 그 인스턴스 안에서 컨테이너가 동작
- **Service**
  - ECS에서 특정 작업 정의(Task Definition)를 기반으로 여러 개의 작업(Task)을 실행하고 관리하는 단위
  - 단순히 한 번 실행되는 작업(Task)과 달리, 지속적으로 실행되며 중단되면 자동으로 재시작됨
  - 세대 수 유지, 교체 공사(배포), 공동시설(ALB) 연결을 담당하는 관리사무소라고 할 수 있음
- **Task Definition**
  - ECS에서 실행할 애플리케이션(컨테이너)의 설계도
  - 컨테이너 이미지, CPU/메모리, 포트, 환경 변수, 로그, 볼륨 등 실행 방법이 기술되어 있
- **Task**
  - Task Definition을 바탕으로 실제 실행 중인 인스턴스 (입주 세대(컨테이너 집합))
  - 하나 이상의 컨테이너를 가짐

---

## <span style="background-color: #FFF9C4">4. CI/CD</span>

### 4-01. CI (Continuous Integration, 지속적 통합)

개발자가 작성한 코드를 짧은 주기로 중앙 저장소에 통합하고, 자동으로 build와 테스트를 실행하는 프로세스

- 중요성
  - 코드 변경 시마다 자동으로 build/테스트하여 충돌, 빌드 실패, 에러 폭발 등 여러 문제를 빠르게 발견하고 해결 가능
- 효과
  - 자동 테스트로 코드 품질 향상
  - 문제를 즉시 발견하여 빠른 피드백 가능
  - 반복 작업을 자동화하여 개발자가 핵심 비즈니스 개발에만 집중할 수 있어 효율성 증가
- CI 프로세스
  1. 버전 관리 시스템에 코드 등록
  2. CI 서버가 자동 build & 테스트
  3. 결과를 개발자에게 알림
  4. 문제가 있으면 빠르게 수정 / 없으면 코드 릴리스

<br>

### 4-02. CD (Continuous Delivery/Deployment)

CI 이후 단계로, build와 테스트를 통과한 코드를 자동으로 배포하는 프로세스

- Continuous Delivery (지속적 전달)
  - 코드가 항상 배포 가능한 상태로 준비되며, 실제 프로덕션 배포는 최종적으로 사람이 승인
- Continuous Deployment (지속적 배포)
  - 코드가 준비되면 승인 과정 없이 자동으로 프로덕션에 배포
- 배포 파이프라인(Pipeline)
  - 소스 코드부터 최종 서비스 배포까지 이어지는 전체 과정을 단계별(Stages) 정의
  - **Source 단계**
    - 원격 저장소(GiHub 등) 코드 변경 감지
  - **Build 단계**
    - 코드 컴파일, build, 테스트하고 결과물(Artifact) 생성
  - **Deploy 단계**
    - 결과물을 실제 서비스 환경에 반영

---

## <span style="background-color: #FFF9C4">5. GitHub Actions</span>

### 5-01. GitHub Actions

GitHub 저장소에 코드를 push하거나 Pull Request를 생성할 때 자동으로 실행되는 CI/CD 도구

- 저장소 내부에 `.github/workflows` 디렉터리를 만들고, `.yml` 파일을 작성하여 동작을 정의
- build, 테스트, 배포뿐만 아니라 코드 스타일 검사, 보안 점검, 자동 문서화 등 다양한 작업 자동화 가능

```bash
my-project/
 └── .github/
      └── workflows/
           └── ci.yml   # 워크플로우 정의 파일
```

```yaml
name: CI Workflow # 워크플로우 이름 (GitHub Actions 탭에서 표시되는 이름)

on: # 워크플로우 실행 조건(트리거 이벤트) 정의
  push: # push 이벤트 발생 시 실행 (종류: push, pull_request, schedule)
    branches: ['main'] # main 브랜치에 push될 때만 실행

jobs: # 실행할 작업(job)들을 정의
  build: # "build"라는 이름의 job
    runs-on: ubuntu-latest # 실행 환경: GitHub이 제공하는 Ubuntu 최신 버전 가상 머신

    steps: # job 안에서 실행할 단계(step)들
      - uses: actions/checkout@v3 # 현재 리포지토리의 소스 코드를 체크아웃 (가져오기)

      - name: JDK 17 설정
        uses: actions/setup-java@v3 # Java 환경을 세팅하는 공식 액션
        with:
          java-version: '17' # 설치할 Java 버전 (여기서는 JDK 17)

      - name: 빌드 및 테스트
        run: ./gradlew clean build # Gradle 빌드 및 테스트 실행 (clean 후 build)
```

---
