---
title: '[TIL 62일 차] Sprint Mission8 - AWS ECR, ECS 구성 및 CI 파이프라인 구축'
excerpt: '2-03.AWS를 활용한 배포 (AWS RDS, ECR, ECS), 3-02. GitHub Actions를 활용한 CI/CD 파이프라인 구축'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til062

toc: true
toc_sticky: true

date: 2026-04-09
last_modified_at: 2026-04-09
---

# 오늘의 성취

## 1. 개발 진행 상황

- AWS ECR 구성
  - AWS CLI 설치
  - `aws configure` 실행 후 `discodeit` IAM 사용자 정보 입력
  - `discodeit` IAM 사용자에게 ECR에 접근할 수 있는 `AmazonElasticContainerRegistryPublicFullAccess` 권한 부여
  - Docker 이미지를 배포할 Public Repository(`discodeit`) 생성 후 인증
  - 멀티플랫폼을 지원하도록 애플리케이션 이미지를 build 후 push
    - 태그명: `latest`, `1.2-M8`
    - 멀티플랫폼: `linux/amd64`, `linux/arm64`
- AWS ECS 구성
  - 환경변수 파일(`discodeit.env`) S3에 업로드
  - 클러스터 생성 및 태스크 정의
    - 환경 변수 파일을 읽기 위한 S3 권한 추가
  - 생성한 클러스트어세 서비스 생성
  - 테스트해보기
- GitHub Actions를 활용한 CI/CD 파이프라인 구축
  - CI를 위한 Workflow 설정
    - [Codecov](https://app.codecov.io/)를 이용한 테스트 커버리지 뱃지를 `README`에 추가

<br>

## 2. 문제

### Windows Credential Manager가 너무 긴 토큰을 저장하려다 실패

```shell
#입력
aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws/***

# 결과
error saving credentials: error storing credentials - err: exit status 1, out: `The stub received bad data.`
```

AWS ECR Public에서 나오는 인증 토큰이 길어서 `docker login`이 Windows용 credential helper(`wincred`/`desktop`)에 전달하려고 할 때 "The stub received bad data."가 출력된다.

#### 가장 간단한 해결 방법

- `~/.docker/config.json`에 있는 `"credsStore"`의 값을 `""`로 바꾸거나 제거한다.
- 그 후 명령어를 다시 실행하고, Docker 이미지를 ECR로 build, push한 후, 기존의 `"credsStore"`를 원상태로 복구한다.
  - 다만, `"credsStore"`를 `""`로 바꾼다면 `config.json`에 인증토큰이 base64 인증 정보로 직접 저장됨으로 Docker 이미지를 ECR로 build, push 후 `docker logout public.ecr.aws`를 해야 한다.

#### AWS ECR Public용 credential helper로 해결하는 방법

AWS ECR Public용 credential helper 쓰는 방법도 있다.

- AWS ECR(ro/Ecr Public)은 `docker-credential-ecr-login`을 지원하기에 `docker-credential-ecr-login`을 설치하고
- `~/.docker/config.json`에 아래처럼 설정하면 된다.

```json
{
  "credHelpers": {
    "public.ecr.aws": "ecr-login"
  }
}
```

이렇게 하면 매번 `aws ecr-public get-login-password | docker login`을 직접 쓰지 않아도, `docker push public.ecr.aws/...`만 입력하면 Docker가 `public.ecr.aws`에 대해 `docker-credential-ecr-login` helper를 자동 호출하고, 이 helper가 AWS 자격 증명으로 ERC용 토큰을 자동 생성해 Docker에게 전달해준다. 즉, Docker가 자동으로 ECR 인증을 처리한다.

- 참고
  - `aws ecr-public get-login-password --region us-east-1` : ECR용 토큰 생성(12시간)
  - `docker login --username AWS --password-stdin public.ecr.aws/***` : Docker 수동 로그인

### ECS 배포 실패

- ECS 서비스 생성 후 테스크가 계속 `STOPPED` 상태가 되었고,
- 서비스 이벤트에서는 `tasks failed to start`,
- 테스크 상세에서는 `Essential container in task exited (exit code: 1)`이 표시됨

그래서 CloudWatch Logs를 확인해보니 아래와 같은 원인 때문이었다.

```shell
Caused by: java.lang.OutOfMemoryError: Metaspace
```

이때 JVM 옵션은 아래와 같았다.

```.env
JVM_OPTS=-Xmx384m -Xms256m -XX:MaxMetaspaceSize=64m -XX:+UseSerialGC
```

- `-Xmx384m` : JVM 힙 메모리의 최대 크기를 384MB로 제한
- `-Xmx256m` : JVM 힙 메모리의 초기 크기를 256MB로 설정
- `-XX:MaxMetaspaceSize=64m` : 클래스 메타데이터를 저장하는 Metaspace의 최대 크기를 64MB로 제한
- `XX:+UseSerialGC` : 메모리 사용량이 적은 Serial GC 사용

ECS 태스크의 메모리 하드 제한이 512MB인 상황에서 힙 최대를 384MB로 허용하고, Metaspace를 64MB로 제한해뒀다. JVM은 힙과 Metaspace뿐만 아니라 스레드 스택, Code Cache, Direct Memory, 기타 네이트브 메모리도 함께 사용하기 때문에 전체 메모리 여유가 크지 않았다. 이런 상태에서 Spring Boot + JPA/Hibernate 애플리케이션은 시작 과정에서 클래스 로딩과 프록시 생성이 많아 클래스 메타데이터를 많이 로딩하면서 Metaspcae 64MB 제한을 넘어 `OutOfMemoryError: Metaspace`가 발생해 `EntityManagerFactory` 생성 단계에서 종료된 것이었다.

그래서 아래처럼 수정했다.

```.env
JVM_OPTS=-Xms128m -Xmx256m -XX:MaxMetaspaceSize=128m -XX:+UseSerialGC
```

- `-Xmx256m`으로 낮춰 힙이 전체 메모리를 과도하게 점유하지 않도록 조정
- `-Xms128m`으로 시작 힙 크기도 줄여 초기 메모리 부담 완화
- `XX:MaxMetaspaceSize=128m`으로 늘려 Hibernate/JPA 초기화 시 필요한 클래스 메타데이터 공간 확보

수정 후 ECS 서비스에서 "새 배포 강제 적용"을 수행했고, 태스크가 정상적으로 `RUNNING` 상태가 되었으며 서비스도 안정적으로 동작했다.

- 참고로 로그는 클러스트 > 서비스 > 특정 서비스 > 로그에서도 볼 수 있다.
- 클래스 메타데이터 공간은 "객체 그 자체"가 아니라, 그 객체를 만들기 위한 클래스의 설명서 정보를 저장하는 공간

<br>

## 3. 질문

### 로컬에서 작성한 환경변수와 S3에 올릴 환경변수가 다른 이유

아래 `docker-compose.yaml`파일을 보면

```yaml
# 서비스 정의
services:
  app: # 애플리케이션 서비스
    build: . # 현재 디렉터리의 Dockerfile을 사용해 이미지 build
    image: discodeit:local-slim
    environment: # 환경변수 바인딩
      SPRING_PROFILES_ACTIVE: ${SPRING_PROFILES_ACTIVE}
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/${POSTGRES_DB}
      SPRING_DATASOURCE_USERNAME: ${POSTGRES_USER}
      SPRING_DATASOURCE_PASSWORD: ${POSTGRES_PASSWORD}
      STORAGE_LOCAL_ROOT_PATH: ${STORAGE_LOCAL_ROOT_PATH}
      STORAGE_TYPE: ${STORAGE_TYPE}
      AWS_S3_ACCESS_KEY: ${AWS_S3_ACCESS_KEY}
      AWS_S3_SECRET_KEY: ${AWS_S3_SECRET_KEY}
      AWS_S3_REGION: ${AWS_S3_REGION}
      AWS_S3_BUCKET: ${AWS_S3_BUCKET}
      AWS_S3_PRESIGNED_URL_EXPIRATION: ${AWS_S3_PRESIGNED_URL_EXPIRATION}
# ...
```

이렇게 정의되어 있다.

여기서 `app` 컨테이너가 실제 최종적으로 받는 이름은 `SPRING_PROFILES_ACTIVE`, `SPRING_DATASOURCE_URL`, ... 이런 형태이다. 반면 `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`는 로컬의 `postgres` service용이거나 Docker Compose가 `SPRING_DATASOURCE_URL`을 조합할 때 쓰는 "재료 변수"에 가깝다.

다만 ECS는 별도 `postgres` 컨테이너가 아닌 RDS를 사용하기 때문에 "`app`이 읽는 최종 변수명만 맞추면 된다.

---

# 프로젝트 요구 사항

## 2. 기본 요구사항

`//...`

### 2-03. AWS를 활용한 배포 (AWS RDS, ECR, ECS)

`//...`

#### AWS ECR 구성

- [x] 이미지를 배포할 퍼블릭 레포지토리(`discodeit`)를 생성하세요.
  - 프라이빗 레포지토리는 용량 제한이 있으므로 퍼블릭 레포지토리로 생성합니다.
- [x] [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html#getting-started-install-instructions)를 설치하세요.
- [x] `aws configure` 실행 후 앞서 생성한 `discodeit` IAM 사용자 정보를 입력하세요.
  - 엑세스 키
  - 시크릿 키
  - region: `ap-northeast-2`
  - output format: `json`
- [x] `discodeit` IAM 사용자가 ECR에 접근할 수 있도록 다음 권한을 부여하세요.
  - `AmazonElasticContainerRegistryPublicFullAccess`
- [x] Docker 클라이언트를 배포할 레지스트리에 대해 인증합니다.
  - AWS 콘솔을 통해 생성한 레포지토리 페이지로 이동 후 우측 상단 `푸시 명령 보기`를 클릭하면 관련 명령어를 확인할 수 있습니다.
    ```bash
    # 예시
    aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws/...
    ```
- [x] 멀티플랫폼을 지원하도록 애플리케이션 이미지를 빌드하고, `discodeit` 레포지토리에 **push** 하세요.
  - 태그명: `latest`, `1.2-M8`
  - 멀티플랫폼: `linux/amd64`,`linux/arm64`
- [x] AWS 콘솔에서 푸시된 이미지를 확인하세요.

#### AWS ECS 구성

- [x] 배포 환경에서 컨테이너 실행 간 사용할 환경 변수를 정의하고, S3에 업로드하세요.
  - [x] `discodeit.env` 파일을 만들어 다음의 내용을 작성하세요.

    ```bash
    # Spring Configuration
    SPRING_PROFILES_ACTIVE=prod

    # Application Configuration
    STORAGE_TYPE=s3
    AWS_S3_ACCESS_KEY=엑세스_키
    AWS_S3_SECRET_KEY=시크릿_키
    AWS_S3_REGION=ap-northeast-2
    AWS_S3_BUCKET=버킷_이름
    AWS_S3_PRESIGNED_URL_EXPIRATION=600

    # DataSource Configuration
    RDS_ENDPOINT=RDS_엔드포인트(포트 포함)
    SPRING_DATASOURCE_URL=jdbc:postgresql://${RDS_ENDPOINT}/discodeit
    SPRING_DATASOURCE_USERNAME=RDS_유저네임(DataGrip을 통해 생성했던 유저)
    SPRING_DATASOURCE_PASSWORD=RDS_비밀번호

    # JVM Configuration (프리티어 고려)
    JVM_OPTS="-Xmx384m -Xms256m -XX:MaxMetaspaceSize=64m -XX:+UseSerialGC"
    ```

  - [x] 이 파일을 S3에 업로드하세요.
  - [x] 이 파일은 형상관리되지 않도록 주의하세요.

- [x] AWS ECS 콘솔에서 클러스터를 생성하세요.

  <img width="400" src="https://github.com/user-attachments/assets/f01e1a9e-2b77-48ae-a1b6-f17830aafc2d" />

  - 이외 설정은 기본값을 유지하세요.

- [x] 태스크를 정의하세요.

  <img width="600" src="https://github.com/user-attachments/assets/86c7d608-52f4-42e1-a56b-1496bd791dde" />


  - 이외 설정은 기본값을 유지하세요.
  - [x] 태스크 생성 후 `태스크 실행 역할`에 S3 관련 권한을 추가하세요.
    - 환경 변수 파일을 읽기위해 필요합니다.

- [x] `discodeit` 클러스터 상세 화면에서 서비스를 생성하세요.

  <img width="400" src="https://github.com/user-attachments/assets/911ffa0f-e27d-4ac7-ae50-1458fc3d6acb" />

  - 이외 설정은 기본값을 유지하세요.

- [x] 태스크의 EC2 보안 그룹의 인바운드 규칙을 설정하여 어디서든 접근할 수 있도록 하세요.
  - [x] EC2 보안 그룹에서 인바운드 규칙을 편집하세요.
  - [x] 규칙 유형으로 `HTTP`를 선택하세요.
  - [x] 소스로 `Anywhere-IPv4`를 선택하여 모든 IP를 허용하세요.
- [x] 태스크 실행이 완료되면 해당 EC2의 퍼블릭 IP에 접속해보세요.

---

## 3. 심화 요구사항

`//...`

### 3-02. GitHub Actions를 활용한 CI/CD 파이프라인 구축

- [x] **CI**(지속적 통합)를 위한 워크플로우를 설정하세요.
  - [x] `.github/workflows/test.yml` 파일을 생성하세요.
  - [x] `main` 브랜치에 PR이 생성되면 실행되도록 설정하세요.
  - [x] 테스트가 실행하는 Job을 정의하세요.
  - [x] [CodeCov](https://app.codecov.io/)를 통해 테스트 커버리지 뱃지를 README에 추가해보세요.

`//...`

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint8](https://github.com/JungH200000/10-sprint-mission/tree/sprint8)

---
