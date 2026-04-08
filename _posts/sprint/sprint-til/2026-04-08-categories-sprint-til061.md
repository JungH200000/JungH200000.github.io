---
title: '[TIL 61일 차] Sprint Mission8 - BinaryContentStroage 고도화 및'
excerpt: '2-02.BinaryContentStorage 고도화 (AWS S3) ~ '

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til061

toc: true
toc_sticky: true

date: 2026-04-08
last_modified_at: 2026-04-08
---

# 오늘의 성취

## 1. 개발 진행 상황

- AWS S3를 활용한 `BinaryContentStorage` 고도화
  - `S3BinaryContentStorageTest` 구현
  - 고도화 후 S3 테스트

---

# 프로젝트 요구 사항

## 2. 기본 요구사항

`//...`

### 2-02. BinaryContentStorage 고도화 (AWS S3)

`//...`

#### AWS S3를 활용한 `BinaryContentStroage` 고도화

- [x] 앞서 작성한 테스트 메서드를 참고해 `S3BinaryContentStorage`를 구현하세요.
  - 클래스 다이어그램

    <image src="https://bakey-api.codeit.kr/api/files/resource?root=static&seqId=13951&version=1&directory=/evsb0sfio-image.png&name=evsb0sfio-image.png" width=400px>

- [x] `discodeit.storage.type` 값이 `s3`인 경우에만 Bean으로 등록되어야 합니다.
- [x] `S3BinaryContentStorageTest`를 함께 작성하면서 구현하세요.
- [x] `BinaryContentStorage` 설정을 유연하게 제어할 수 있도록 `application.yaml`을 수정하세요.

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

  - [x] AWS 관련 정보는 형상관리하면 안되므로 `.env` 파일에 작성된 값을 임포트하는 방식으로 설정하세요.
  - [x] Docker Compose에서도 위 설정을 주입할 수 있도록 수정하세요.

- [x] `download` 메서드는 `PresignedUrl`을 활용해 리다이렉트하는 방식으로 구현하세요.

### 2-03. AWS를 활용한 배포 (AWS RDS, ECR, ECS)

#### AWS RDS 구성

- [ ] AWS RDS PostgreSQL 인스턴스를 생성하세요.
  | 항목                                     | 값             | 비고               |
  | ---------------------------------------- | -------------- | ------------------ |
  | 데이터베이스 생성 방식                   | 표준 생성      |                    |
  | 엔진 옵션 > 엔진 유형                    | PostgreSQL     |                    |
  | 엔진 옵션 > 엔진 버전                    | 17.2-R2        | 기본값             |
  | 템플릿                                   | 프리 티어      | 과금 주의          |
  | 설정 > DB 인스턴스 식별자                | discodeit-db   |                    |
  | 설정 > 자격증명설정 > 마스터 사용자 이름 | postgres       | 기본값             |
  | 설정 > 자격증명설정 > 자격 증명 관리     | 자체 관리      | 기본값             |
  | 설정 > 자격증명설정 > 마스터 암호        | 임의의 값      | 따로 메모해두세요. |
  | 인스턴스 구성 > DB 인스턴스 클래스       | db.t4g.micro   | 기본값             |
  | 연결 > 퍼블릭 액세스                     | 아니오         | 과금 주의          |
  | 연결 > 추가구성 > 데이터베이스 포트      | 5432           | 기본값             |
  | 모니터링 > 보존기간                      | 7일 (프리티어) | 과금 주의          |
  | 모니터링 > 추가 모니터링 설정            | 모두 체크 해제 | 기본값, 과금 주의  |
  | 추가 구성 > 백업                         | 체크 해제      | 과금 주의          |
  - 이외 설정은 기본값을 유지하세요.
- [ ] 과금이 발생할 수 있으니 다음 항목은 한번 더 확인해주세요.
  - [ ] 템플릿: `프리티어`
  - [ ] 퍼블릭 액세스: `아니오`
  - [ ] 모니터링 > 보존기간: `7일`
  - [ ] 모니터링 > 추가 모니터링 설정: `모두 체크 해제`
  - [ ] 추가 구성 > 백업: `비활성화`
- [ ] SSH 터널링을 통해 개발 환경에서 접근할 수 있도록 EC2를 구성하세요.
  - [ ] EC2 인스턴스를 생성하세요.
    | 항목                             | 값                  | 비고                              |
    | -------------------------------- | ------------------- | --------------------------------- |
    | 이름 및 태그                     | rds-ssh             |                                   |
    | 인스턴스 유형                    | t2.micro            | 기본값, 과금 주의                 |
    | 키 페어                          | 새 키 페어 생성     | .pem 파일 저장 위치를 기억하세요. |
    | 네트워크 설정 > 방화벽(보안그룹) | 기존 보안 그룹 선택 |                                   |
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
  | 항목                           | 값                      | 비고      |
  | ------------------------------ | ----------------------- | --------- |
  | 클러스터 구성 > 클러스터 이름  | discodeit-cluster       |           |
  | 인프라 > AWS Fargate(서버리스) | 체크해제                | 과금 주의 |
  | 인프라 > Amazon EC2 인스턴스   | 체크                    |           |
  | 인프라 > EC2 인스턴스 유형     | t2.micro                | 과금 주의 |
  | 인프라 > 원하는 용량           | 최소 0, 최대 1          | 과금 주의 |
  | 인프라 > SSH 키 페어           | 새 키 페어 생성 후 지정 |           |
  - 이외 설정은 기본값을 유지하세요.
- [ ] 태스크를 정의하세요.
  | 항목                                               | 값                                                                    | 비고 |
  | -------------------------------------------------- | --------------------------------------------------------------------- | ---- |
  | 태스크 정의 구성 > 태스크 정의 패밀리              | discodeit-task                                                        |      |
  | 인프라 요구 사항 > 시작 유형                       | AWS Fargate: 체크 해제, Amazon EC2 인스턴스: 체크                     |      |
  | 인프라 요구 사항 > 네트워크 모드                   | bridge                                                                |      |
  | 인프라 요구 사항 > 태스크 크기                     | CPU: 0.25 vCPU, 메모리: 0.5 GB                                        |      |
  | 컨테이너-1 > 컨테이너 세부 정보                    | 이름: discodeit-app, 이미지 URI: 이전에 배포한 이미지                 |      |
  | 컨테이너-1 > 포트 매핑                             | 호스트 포트: 80, 컨테이너 포트: 80                                    |      |
  | 컨테이너-1 > 리소스 할당 제한 - 조건부             | CPU: 0.25 vCPU, 메모리 하드 제한: 0.5 GB, 메모리 소프트 제한: 0.25 GB |      |
  | 컨테이너-1 > 환경 변수 - 선택 사항 > 파일에서 추가 | 이전에 S3에 업로드한 discodeit.env 파일 지정                          |      |
  - 이외 설정은 기본값을 유지하세요.
  - [ ] 태스크 생성 후 `태스크 실행 역할`에 S3 관련 권한을 추가하세요.
    - 환경 변수 파일을 읽기위해 필요합니다.
- [ ] `discodeit` 클러스터 상세 화면에서 서비스를 생성하세요.
  | 항목                            | 값                | 비고   |
  | ------------------------------- | ----------------- | ------ |
  | 배포 구성 > 태스크 정의 패밀리  | discodeit-task    |        |
  | 배포 구성 > 서비스 이름         | discodeit-service |        |
  | 배포 구성 > 원하는 태스크       | 1                 | 기본값 |
  | 배포 구성 > 상태 검사 유예 기간 | 30초              |        |
  - 이외 설정은 기본값을 유지하세요.
- [ ] 태스크의 EC2 보안 그룹의 인바운드 규칙을 설정하여 어디서든 접근할 수 있도록 하세요.
  - [ ] EC2 보안 그룹에서 인바운드 규칙을 편집하세요.
  - [ ] 규칙 유형으로 `HTTP`를 선택하세요.
  - [ ] 소스로 `Anywhere-IPv4`를 선택하여 모든 IP를 허용하세요.
- [ ] 태스크 실행이 완료되면 해당 EC2의 퍼블릭 IP에 접속해보세요.

`//...`

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint8](https://github.com/JungH200000/10-sprint-mission/tree/sprint8)

---

# 정리 및 보관용 코드
