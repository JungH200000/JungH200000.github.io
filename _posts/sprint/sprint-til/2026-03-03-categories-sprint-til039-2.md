---
title: '[TIL 39-2일 차] Sprint Mission6 - 데이터베이스 환경 설정, table 생성, 의존성 설정'
excerpt: '2-2. 데이터베이스 ~ 2-3. Spring Data JPA 적용하기'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til039-2/

toc: true
toc_sticky: true

date: 2026-03-03
last_modified_at: 2026-03-03
---

# 오늘의 학습

## 1. 개발 진행 상황

- Service 계층에서 Dto를 반환하도록 Service 반환값 전체적으로 수정
- 데이터베이스 환경 설정
  - 데이터베이스: `discodeit`
  - 유저: `discodeit_user`
  - 비밀번호: `notion 참고`
- ERD를 참고하여 DDL 작성 후, table 생성
  - DDL 파일 경로 : `/src/main/resources/schema.sql`
  - table 생성을 JPA `ddl-auto`가 아닌 SQL 스크립트로 table 생성

<br>

## 2. 고민

### DDL 파일 실행 방법

```yaml
spring:
  sql: # SQL 초기화 기능 관련 설정
    init: # SQL 초기화 동작 세부 옵션 (스키마/데이터 스크립트 실행)
      mode: always # SQL 초기화를 적용할 범위 (`embedded`, `never`)
      # schema-locations: classpath:schema.sql
```

- `init` 하위에 `schema-locations`를 추가하면 스키마 초기화 SQL(DDL) 파일 위치를 명시할 수 있다.
- 이때 경로는 `src/main/resources/...` 같은 프로젝트 경로가 아닌 `classpath:` 기준 경로로 작성해야 한다.
- 설정하지 않으면 기본 classpath ➡️ `classpath:파일_이름.sql`

---

# 프로젝트 요구 사항

`// ...`

### 2-2. 데이터베이스

- [x] 아래와 같이 데이터베이스 환경을 설정하세요.
  - 데이터베이스: `discodeit`
  - 유저: `discodeit_user`
  - 패스워드: `notion 참고`
- [x] ERD를 참고하여 DDL을 작성하고, 테이블을 생성하세요.
  - 작성한 DDL 파일은 /src/main/resources/schema.sql 경로에 포함하세요.

    <img src="https://bakey-api.codeit.kr/api/files/resource?root=static&seqId=12178&version=1&directory=/u0ghedzoz-image.png&name=u0ghedzoz-image.png" width=700px>

  - `PK`: Primary Key
  - `UK`: Unique Key
  - `NN`: Not Null
  - `FK`: Foreign Key
    - `ON DELETE CASCADE`: 연관 엔티티 삭제 시 같이 삭제
    - `ON DELETE SET NULL`: 연관 엔티티 삭제 시 NULL로 변경

<br>

### 2-3. Spring Data JPA 적용하기

- [x] Spring Data JPA와 PostgreSQL을 위한 의존성을 추가하세요.
- [x] 앞서 구성한 데이터베이스에 연결하기 위한 설정값을 `application.yaml` 파일에 작성하세요.
- [x] 디버깅을 위해 SQL 로그와 관련된 설정값을 `application.yaml` 파일에 작성하세요.

`// ...`

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint6](https://github.com/JungH200000/10-sprint-mission/tree/sprint6)
