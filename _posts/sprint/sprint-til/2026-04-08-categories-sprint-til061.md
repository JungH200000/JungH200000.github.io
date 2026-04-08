---
title: '[TIL 61일 차] Sprint Mission8 - BinaryContentStroage 고도화 및 AWS RDS 구성'
excerpt: '2-02.BinaryContentStorage 고도화 (AWS S3) ~ 2-03.AWS를 활용한 배포 (AWS RDS, ECR, ECS)'

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
- AWS RDS 구성
  - AWS RDS PostgreSQL 인스턴스를 생성
  - SSH 터널링을 통해 개발 환경에서 접근
    - EC2 인스턴스를 생성
    - DataGrip을 통해 연결
      - 데이터 소스 추가 시 `SSH/SSL > Use SSH tunnel` 설정을 활성화
      - 다운로드한 `.pem` 파일을 활용
    - 연결이 성공하면 데이터베이스와 사용자, 테이블을 초기화
    - 구성이 완료되면 EC2 인스턴스는 완전히 삭제하여 과금에 유의

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

- [x] AWS RDS PostgreSQL 인스턴스를 생성하세요.

<img width="400" src="https://github.com/user-attachments/assets/d8f34d08-ab67-48c1-a022-0f55f38514e7" />
- 이외 설정은 기본값을 유지하세요.

- [x] 과금이 발생할 수 있으니 다음 항목은 한번 더 확인해주세요.
  - [x] 템플릿: `프리티어`
  - [x] 퍼블릭 액세스: `아니오`
  - [x] 모니터링 > 보존기간: `7일`
  - [x] 모니터링 > 추가 모니터링 설정: `모두 체크 해제`
  - [x] 추가 구성 > 백업: `비활성화`
- [x] SSH 터널링을 통해 개발 환경에서 접근할 수 있도록 EC2를 구성하세요.
  - [x] EC2 인스턴스를 생성하세요.

  <img width="600" src="https://github.com/user-attachments/assets/e5e46db3-7a82-405e-b512-34d3c6b2267e" />
  - 이외 설정은 기본값을 유지하세요.
  - [x] 보안 그룹에서 인바운드 규칙을 편집하세요.
    - 유형: `SSH`
    - 소스: `내 IP`
      - 작업 환경의 네트워크(와이파이 등)가 달라지면 계속 수정해주어야 할 수 있습니다.

- [x] DataGrip을 통해 연결 후 데이터베이스와 사용자, 테이블을 초기화하세요.
  - [x] 데이터 소스 추가 시 `SSH/SSL > Use SSH tunnel` 설정을 활성화하세요. 이때 이전에 다운로드한 `.pem` 파일을 활용하세요.
  - [x] 연결이 성공하면 데이터베이스와 사용자, 테이블을 초기화하세요.

    ```sql
    -- 1. 새 유저 'discodeit_user' 생성 (비밀번호는 원하는 값으로 설정)
    CREATE USER discodeit_user WITH PASSWORD 'discodeit1234';

    -- 2. postgres 계정은 AWS RDS 환경 특성상 완전한 super user가 아니므로, discodeit_user에 대한 권한을 추가로 부여해야함.
    GRANT discodeit_user TO postgres;

    -- 3. 'discodeit' 데이터베이스 생성 (소유자는 'discodeit_user')
    CREATE DATABASE discodeit OWNER discodeit_user;

    -- 4. schema.sql 실행하여 테이블 생성
    ```

  - [x] 구성이 완료되면 `rds-ssh` 인스턴스는 완전히 삭제하여 과금에 유의하세요.

`//...`

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint8](https://github.com/JungH200000/10-sprint-mission/tree/sprint8)
