---
title: '[Sprint Mission8]'
excerpt: ''

categories:
  - Sprint Mission
tags:
  - [Codeit Sprint, Codeit Sprint Mission]

permalink: /categories/codeit-sprint/sprint-mission/sprint-mission0008

toc: true
toc_sticky: true

date: 2026-04-05
last_modified_at: 2026-04-06
---

# Sprint Mission8

Section: Sprint Mission
날짜: 2026년 4월 5일 17:04 (GMT+9)

## 1. 프로젝트 마일스톤

- 애플리케이션 컨테이너화
- `BinaryContentStorage` 고도화 (`AWS S3`)
- AWS를 활용한 배포 (`AWS ECS`, `RDS`)
- CI/CD 파이프라인 구축 (`GitHub Actions`)

### 1-01. 주요 변경 사항

#### 1) 원활한 실습 진행을 위해 `Spring Boot Admin` 관련 코드는 삭제

- 세부 사항
  - `admin` 모듈
  - `IntelliJ Gradle` 툴 윈도우에서도 삭제해주세요.

            <image src="https://raw.githubusercontent.com/JungH200000/JungH200000.github.io/refs/heads/categories-ver2/assets/images/posts_img/requirements/sprint8/yfdejqkdz-image.png" width=400px>

- `spring boot admin` 의존성 삭제

  ```groovy
  # build.gradle
  ...
  - implementation 'de.codecentric:spring-boot-admin-starter-client:3.4.5'
  ...
  ```

#### 2) 프로젝트 버전이 변경되었습니다. `v1.2-M8`

- 세부 사항

  ```groovy
  # build.gradle
  ...
  - version = '0.0.1-SNAPSHOT'
  + version = '1.2-M8'
  ...
  ```

  - `1.2`: `api-doc` 버전을 따릅니다.
  - `M8`: 미션 8을 의미합니다.

### 1-02. 과금 안내사항

**미션 진행 중 유의사항**

이 미션은 AWS 프리티어 할당량 내에서 충분히 수행 가능하도록 설계되었습니다. 불필요한 비용이 발생하지 않도록 미션 요구사항을 사전에 꼼꼼히 확인해 주시기 바랍니다.

**미션 종료 후 안내사항**

멘토님들의 리뷰가 완료된 후에는 추후에 진행할 실습(미션, 중급 프로젝트 등)을 위해, 이번 미션에서 생성했던 모든 AWS 리소스(EC2, RDS, S3)를 반드시 삭제해 주세요. 리소스를 '중지'하는 것이 아닌 '삭제'해야 추가 비용이 발생하지 않습니다.

---

## 2. 기본 요구사항

### 2-01. 애플리케이션 컨테이너화

#### Dockerfile 작성

- [ ] [Amazon Corretto 17 이미지](https://hub.docker.com/layers/library/amazoncorretto/17/images/sha256-8929bdc3e2be20250ae46b3bc1dc361fcd637cd189ec02174251b0e499a22fad)를 베이스 이미지로 사용하세요.
- [ ] 작업 디렉터리를 설정하세요. (`/app`)
- [ ] 프로젝트 파일을 컨테이너로 복사하세요. 단, 불필요한 파일은 `.dockerignore`를 활용해 제외하세요.
- [ ] Gradle Wrapper를 사용하여 애플리케이션을 build하세요.
- [ ] `80` 포트를 노출하도록 설정하세요.
- [ ] 프로젝트 정보를 환경 변수로 설정하세요.
  - 실행할 jar 파일의 이름을 추론하는데 활용됩니다.
  - `PROJECT_NAME`: discodeit
  - `PROJECT_VERSION`: 1.2-M8
- [ ] JVM 옵션을 환경 변수로 설정하세요.
  - `JVM_OPTS`: 기본값은 빈 문자열로 정의
- [ ] 애플리케이션 실행 명령어를 설정하세요. 이때 환경변수로 정의한 프로젝트 정보를 활용하세요.

#### 이미지 build 및 실행 테스트

- [ ] Docker 이미지를 build하고 태그(`local`)를 지정하세요.
- [ ] build된 이미지를 활용해서 컨테이너를 실행하고 애플리케이션을 테스트하세요.
  - [ ] `prod` 프로필로 실행하세요.
  - [ ] 데이터베이스는 로컬 환경에서 구동 중인 PostgreSQL 서버를 활용하세요.
  - [ ] `http://localhost:8081`로 접속 가능하도록 포트를 매핑하세요.

#### Docker Compose 구성

- 개발 환경용 `docker-compose.yml` 파일을 작성합니다.
- [ ] 애플리케이션과 PostgreSQL 서비스를 포함하세요.
- [ ] 각 서비스에 필요한 모든 환경 변수를 설정하세요.
  - `.env` 파일을 활용하되, `.env`는 형상관리에서 제외하여 보안을 유지하세요.
- [ ] 애플리케이션 서비스를 로컬 Dockerfile에서 build하도록 구성하세요.
- [ ] 애플리케이션 볼륨을 구성하여 컨테이너가 재시작되어도 `BinaryContentStorage` 데이터가 유지되도록 하세요.
- [ ] PostgreSQL 볼륨을 구성하여 컨테이너가 재시작되어도 데이터가 유지되도록 하세요.
- [ ] PostgreSQL 서비스 실행 후 `schema.sql`이 자동으로 실행되도록 구성하세요.
- [ ] 서비스 간 의존성을 설정하세요(`depends_on`).
- [ ] 필요한 포트 매핑을 구성하세요.
- [ ] Docker Compose를 사용하여 서비스를 시작하고 테스트하세요.
  - `--build` 플래그를 사용하여 서비스 시작 전에 이미지를 build하도록 합니다.

### 2-02. BinaryContentStorage 고도화 (AWS S3)

#### AWS S3 버킷 구성

- [ ] AWS S3 버킷을 생성하세요.
  - [ ] 버킷 이름을 `discodeit-binary-content-storage-(사용자 이니셜)` 형식으로 지정하세요.
  - [ ] 퍼블릭 액세스 차단 설정을 활성화하세요(모든 퍼블릭 액세스 차단).
  - [ ] 버전 관리는 비활성화 상태로 두세요.

#### AWS S3 접근을 위한 IAM 구성

- [ ] S3 버킷에 접근하기 위한 IAM 사용자(`discodeit`)를 생성하세요.
- [ ] `AmazonS3FullAccess` 권한을 할당하고, 사용자 생성을 완료하세요.
- [ ] 생성된 사용자에 엑세스 키를 생성하세요.
- [ ] 발급받은 키를 포함해서 AWS 관련 정보는 `.env` 파일에 추가합니다.

  ```
  ...
  # AWS
  AWS_S3_ACCESS_KEY=**엑세스_키**
  AWS_S3_SECRET_KEY=**시크릿_키**
  AWS_S3_REGION=**ap-northeast-2**
  AWS_S3_BUCKET=**버킷_이름**
  ```

  - 작성한 `.env` 파일은 리뷰를 위해 PR에 별도로 첨부해주세요. 단, 엑세스 키와 시크릿 키는 제외하세요.

#### AWS S3 테스트

- [ ] AWS S3 SDK 의존성을 추가하세요.
  ```groovy
  implementation 'software.amazon.awssdk:s3:2.31.7'
  ```
- [ ] S3 API를 간단하게 테스트하세요.
  - 패키지명: `com.sprint.mission.discodeit.stoarge.s3`
  - 클래스명: `AWSS3Test`
  - [ ] `Properties` 클래스를 활용해서 `.env`에 정의한 AWS 정보를 로드하세요.
  - [ ] 작업 별 테스트 메서드를 작성하세요.
    - 업로드
    - 다운로드
    - PresignedUrl 생성

#### AWS S3를 활용한 `BinaryContentStroage` 고도화

- [ ] 앞서 작성한 테스트 메서드를 참고해 `S3BinaryContentStorage`를 구현하세요.
  - 클래스 다이어그램

            <image src="https://bakey-api.codeit.kr/api/files/resource?root=static&seqId=13951&version=1&directory=/fxlj0hb8j-image.png&name=fxlj0hb8j-image.png" width=400px>

- [ ] `discodeit.storage.type` 값이 `s3`인 경우에만 Bean으로 등록되어야 합니다.
- [ ] `S3BinaryContentStorageTest`를 함께 작성하면서 구현하세요.
- [ ] `BinaryContentStorage` 설정을 유연하게 제어할 수 있도록 `application.yaml`을 수정하세요.

  ```yaml
  discodeit:
    storage:
  -    type: local
  +    type: ${STORAGE_TYPE:local}  # local | s3 (기본값: local)
      local:
  -      root-path: .discodeit/storage
  +      root-path: ${STORAGE_LOCAL_ROOT_PATH:.discodeit/storage}
  +    s3:
  +      access-key: ${AWS_S3_ACCESS_KEY}
  +      secret-key: ${AWS_S3_SECRET_KEY}
  +      region: ${AWS_S3_REGION}
  +      bucket: ${AWS_S3_BUCKET}
  +      presigned-url-expiration: ${AWS_S3_PRESIGNED_URL_EXPIRATION:600} # (기본값: 10분)
  ```

  - [ ] AWS 관련 정보는 형상관리하면 안되므로 `.env` 파일에 작성된 값을 임포트하는 방식으로 설정하세요.
  - [ ] Docker Compose에서도 위 설정을 주입할 수 있도록 수정하세요.

- [ ] `download` 메서드는 `PresignedUrl`을 활용해 리다이렉트하는 방식으로 구현하세요.

### 2-03. AWS를 활용한 배포 (AWS RDS, ECR, ECS)

#### AWS RDS 구성

- [ ] AWS RDS PostgreSQL 인스턴스를 생성하세요.

<img width="400" alt="image" src="https://github.com/user-attachments/assets/13534ac9-2f6b-40cd-8db6-9bc9ee4c4dbf" />
- 이외 설정은 기본값을 유지하세요.

- [ ] 과금이 발생할 수 있으니 다음 항목은 한번 더 확인해주세요.
  - [ ] 템플릿: `프리티어`
  - [ ] 퍼블릭 액세스: `아니오`
  - [ ] 모니터링 > 보존기간: `7일`
  - [ ] 모니터링 > 추가 모니터링 설정: `모두 체크 해제`
  - [ ] 추가 구성 > 백업: `비활성화`
- [ ] SSH 터널링을 통해 개발 환경에서 접근할 수 있도록 EC2를 구성하세요.
  - [ ] EC2 인스턴스를 생성하세요.

  <img width="500" alt="image" src="https://github.com/user-attachments/assets/c501a55e-8bcc-4036-a507-e057853935cf" />
  - 이외 설정은 기본값을 유지하세요.
  - [ ] 보안 그룹에서 인바운드 규칙을 편집하세요.
    - 유형: `SSH`
    - 소스: `내 IP`
      - 작업 환경의 네트워크(와이파이 등)가 달라지면 계속 수정해주어야 할 수 있습니다.

- [ ] DataGrip을 통해 연결 후 데이터베이스와 사용자, 테이블을 초기화하세요.
  - [ ] 데이터 소스 추가 시 `SSH/SSL > Use SSH tunnel` 설정을 활성화하세요. 이때 이전에 다운로드한 `.pem` 파일을 활용하세요.
  - [ ] 연결이 성공하면 데이터베이스와 사용자, 테이블을 초기화하세요.

    ```sql
    -- 1. 새 유저 'discodeit_user' 생성 (비밀번호는 원하는 값으로 설정)
    CREATE USER discodeit_user WITH PASSWORD 'discodeit1234';

    -- 2. postgres 계정은 AWS RDS 환경 특성상 완전한 super user가 아니므로, discodeit_user에 대한 권한을 추가로 부여해야함.
    GRANT discodeit_user TO postgres;

    -- 3. 'discodeit' 데이터베이스 생성 (소유자는 'discodeit_user')
    CREATE DATABASE discodeit OWNER discodeit_user;

    -- 4. schema.sql 실행하여 테이블 생성
    ```

  - [ ] 구성이 완료되면 `rds-ssh` 인스턴스는 완전히 삭제하여 과금에 유의하세요.

#### AWS ECR 구성

- [ ] 이미지를 배포할 퍼블릭 레포지토리(`discodeit`)를 생성하세요.
  - 프라이빗 레포지토리는 용량 제한이 있으므로 퍼블릭 레포지토리로 생성합니다.
- [ ] [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html#getting-started-install-instructions)를 설치하세요.
- [ ] `aws configure` 실행 후 앞서 생성한 `discodeit` IAM 사용자 정보를 입력하세요.
  - 엑세스 키
  - 시크릿 키
  - region: `ap-northeast-2`
  - output format: `json`
- [ ] `discodeit` IAM 사용자가 ECR에 접근할 수 있도록 다음 권한을 부여하세요.
  - `AmazonElasticContainerRegistryPublicFullAccess`
- [ ] Docker 클라이언트를 배포할 레지스트리에 대해 인증합니다.
  - AWS 콘솔을 통해 생성한 레포지토리 페이지로 이동 후 우측 상단 `푸시 명령 보기`를 클릭하면 관련 명령어를 확인할 수 있습니다.
    ```bash
    # 예시
    aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws/...
    ```
- [ ] 멀티플랫폼을 지원하도록 애플리케이션 이미지를 빌드하고, `discodeit` 레포지토리에 **push** 하세요.
  - 태그명: `latest`, `1.2-M8`
  - 멀티플랫폼: `linux/amd64`,`linux/arm64`
- [ ] AWS 콘솔에서 푸시된 이미지를 확인하세요.

#### AWS ECS 구성

- [ ] 배포 환경에서 컨테이너 실행 간 사용할 환경 변수를 정의하고, S3에 업로드하세요.
  - [ ] `discodeit.env` 파일을 만들어 다음의 내용을 작성하세요.

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

  - [ ] 이 파일을 S3에 업로드하세요.
  - [ ] 이 파일은 형상관리되지 않도록 주의하세요.

- [ ] AWS ECS 콘솔에서 클러스터를 생성하세요.

<img width="500" alt="image" src="https://github.com/user-attachments/assets/dec40aed-f58b-4748-b17b-ebd7455cc839" />
- 이외 설정은 기본값을 유지하세요.

- [ ] 태스크를 정의하세요.

<img width="800" alt="image" src="https://github.com/user-attachments/assets/5f61a17b-874a-4491-91f1-80c3a51d8d80" />
- 이외 설정은 기본값을 유지하세요.
- [ ] 태스크 생성 후 `태스크 실행 역할`에 S3 관련 권한을 추가하세요.
  - 환경 변수 파일을 읽기위해 필요합니다.

- [ ] `discodeit` 클러스터 상세 화면에서 서비스를 생성하세요.

<img width="500" alt="image" src="https://github.com/user-attachments/assets/847c9bd0-3fa0-4768-ba98-219d699315d1" />
- 이외 설정은 기본값을 유지하세요.

- [ ] 태스크의 EC2 보안 그룹의 인바운드 규칙을 설정하여 어디서든 접근할 수 있도록 하세요.
  - [ ] EC2 보안 그룹에서 인바운드 규칙을 편집하세요.
  - [ ] 규칙 유형으로 `HTTP`를 선택하세요.
  - [ ] 소스로 `Anywhere-IPv4`를 선택하여 모든 IP를 허용하세요.

- [ ] 태스크 실행이 완료되면 해당 EC2의 퍼블릭 IP에 접속해보세요.

---

## 3. 심화 요구사항

### 3-01. 이미지 최적화하기

- [ ] 멀티 스테이지(`빌드`, `런타임`) 빌드를 활용해 이미지의 크기를 줄여보세요.
  - 태그명: `local-slim`
  - 이전에 빌드한 이미지(`1.2-M8` 또는 `local`)와 크기를 비교해보세요.
- [ ] 이미지 레이어 캐시를 고려해 Dockerfile을 수정해보세요.

### 3-02. GitHub Actions를 활용한 CI/CD 파이프라인 구축

- [ ] **CI**(지속적 통합)를 위한 워크플로우를 설정하세요.
  - [ ] `.github/workflows/test.yml` 파일을 생성하세요.
  - [ ] `main` 브랜치에 PR이 생성되면 실행되도록 설정하세요.
  - [ ] 테스트가 실행하는 Job을 정의하세요.
  - [ ] [CodeCov](https://app.codecov.io/)를 통해 테스트 커버리지 뱃지를 README에 추가해보세요.
        <image src="https://bakey-api.codeit.kr/api/files/resource?root=static&seqId=13953&version=1&directory=/tb4cb7hos-image.png&name=tb4cb7hos-image.png" width=200px>

- [ ] **CD**(지속적 배포)를 위한 워크플로우를 설정하세요.
  - [ ] `.github/workflows/deploy.yml` 파일을 생성하세요.
  - [ ] `release` 브랜치에 코드가 푸시되면 실행되도록 설정하세요.
  - [ ] AWS 정보 설정
    - [ ] GitHub 레포지토리 설정을 통해 시크릿을 추가하세요.
      - `AWS_ACCESS_KEY`: IAM 사용자의 액세스 키
      - `AWS_SECRET_KEY`: IAM 사용자의 시크릿 키
    - [ ] GitHub 레포지토리 설정을 통해 변수를 추가하세요.
      - `AWS_REGION`: AWS 리전(`ap-northeast-2`)
      - `ECR_REPOSITORY_URI`: ECR 레포지토리 URI
      - `ECS_CLUSTER`: ECS 클러스터 이름(`discodeit-cluster`)
      - `ECS_SERVICE`: ECS 서비스 이름(`discodeit-service`)
      - `ECS_TASK_DEFINITION`: ECS 태스크 정의 이름(`discodeit-task`)
  - [ ] Docker 이미지 빌드 및 푸시
    - [ ] Docker 이미지를 빌드하고 푸시하는 Job을 정의하세요.
    - [ ] AWS CLI를 설정하는 Step을 추가하세요.
      - Pubilc ECR에 배포해야하므로 리전은 `us-east-1`으로 설정해야합니다.
    - [ ] ECR 로그인 Step을 추가하세요.
      - Public ECR에 로그인해야합니다.
    - [ ] Docker 이미지 빌드 및 푸시하는 과정을 Step으로 추가하세요.
      - 단, 빌드 시간 단축을 위해 멀티 플랫폼 옵션은 제외합니다.
      - GitHub Actions의 런타임 OS와 우리가 배포할 ECS는 모두 `x86_64`입니다.
    - [ ] 이미지 태그는 `latest`와 GitHub 커밋 해시를 사용하도록 설정하세요.
  - [ ] ECS 서비스 업데이트
    - [ ] ECS 서비스를 업데이트하는 Job을 정의하세요.
    - [ ] AWS CLI를 설정하는 Step을 추가하세요.
      - 우리의 ECS 클러스터에 접근해야하므로 리전은 `AWS_REGION`으로 설정해야합니다.
    - [ ] 태스크 정의를 업데이트하는 Step을 추가하세요.
      - 기존의 태스크 정의를 기반으로 새 이미지를 사용하도록 업데이트하세요.
    - [ ] 프리티어 리소스를 고려해 AWS CLI를 사용해 기존에 구동 중인 서비스를 중단하는 Step을 추가하세요.
      - `aws ecs update-service --desired-count` 옵션을 활용하세요.
    - [ ] 새로 등록한 태스크 정의를 사용하도록 ECS 서비스를 업데이트하는 Step을 추가하세요.
  - [ ] AWS 콘솔을 통해 새로 등록된 태스크 정의로 배포되었는지 확인하세요.

---

## 4. PR에 포함해야할 정보

- [ ] `.env` 파일 (AWS 키는 제외)
- [ ] RDS
  - AWS 콘솔 인스턴스 상세 페이지 스크린샷 이미지
  - SSH 터널링을 통해 연결한 DataGrip 스크린샷 이미지
    - 생성한 테이블 목록이 보이도록 캡처해주세요.
- [ ] ECR
  - 푸시된 이미지가 보이는 AWS 콘솔 페이지 스크린샷 이미지
- [ ] ECS
  - 실행 중인 태스크 구성정보가 표시된 AWS 콘솔 페이지 스크린샷 이미지
  - 배포된 EC2 엔드포인트
- [ ] VPC
  - 보안 그룹의 인바운드 규칙을 확인할 수 있는 AWS 콘솔 페이지 스크린샷 이미지
- [ ] IAM
  - 사용자의 권한 정책이 표시된 AWS 콘솔 페이지 스크린샷 이미지

---
