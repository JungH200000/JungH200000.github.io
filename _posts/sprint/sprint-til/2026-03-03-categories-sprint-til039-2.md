---
title: '[TIL 39-2일 차] Spring Mission6 - table 생성'
excerpt: ''

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

1. 개발 진행 상황
   - Service 계층에서 Dto를 반환하도록 Service 반환값 전체적으로 수정
   - 데이터베이스 환경 설정
     - 데이터베이스: `discodeit`
     - 유저: `discodeit_user`
     - 비밀번호: `notion 참고`
   - ERD를 참고하여 DDL 작성 후, table 생성
     - DDL 파일 경로 : `/src/main/resources/schema.sql`
     - table 생성을 JPA `ddl-auto`가 아닌 SQL 스크립트로 table 생성

2. DDL 스키마 실행 방법

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
