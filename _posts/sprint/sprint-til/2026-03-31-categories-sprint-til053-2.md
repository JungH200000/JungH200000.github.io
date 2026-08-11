---
layout: single-editorial
title: '[TIL 53일 차] Sprint Mission7 - Repository와 Controller 계층에서 주요 메서드 슬라이스 테스트'
excerpt: '2-6.단위 테스트 ~ 2-7.슬라이스 테스트'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til053-2

toc: true
toc_sticky: true

date: 2026-03-31
last_modified_at: 2026-03-31
---

# 오늘의 성취

## 1. 개발 진행 상황

- 슬라이스 테스트
  - Repository 계층에서 주요 메서드에 대한 슬라이스 테스트
    - 주요 레포지토리(User, Channel, Message)의 주요 쿼리 메서드에 대해 테스트 케이스 작성
      - `UserRepository` 작업 중
        - 커스텀 쿼리 메서드
        - 페이징 및 정렬 메서드
- Controller 계층에서 슬라이스 테스트를 작성
  - `@WebMvcTest`를 활용해 테스트를 구현
  - WebMvcTest에서 자동으로 등록되지 않는 유형의 Bean이 필요하다면 `@Import`를 활용해 추가
  - 주요 컨트롤러(User, Channel, Message)에 대해 테스트 케이스 작성
    - `MessageController` 작업 중
  - MockMvc를 활용해 Controller를 테스트
  - Service 계층을 mock하여 Controller 로직만 테스트
  - JSON 응답을 검증하는 테스트를 포함

---

# 프로젝트 요구 사항

## 2. 기본 요구사항

`//...`

### 2-6. 단위 테스트

- [x] 서비스 레이어의 주요 메서드에 대한 단위 테스트를 작성하세요.
  - [x] 다음 서비스의 핵심 메서드에 대해 각각 최소 2개 이상(성공, 실패)의 테스트 케이스를 작성하세요.
    - [x] UserService: create, update, delete 메서드
    - [x] ChannelService: create(PUBLIC, PRIVATE), update, delete, findByUserId 메서드
    - [x] MessageService: create, update, delete, findByChannelId 메서드
  - [x] `Mockito`를 활용해 Repository 의존성을 모의(mock)하세요.
  - [x] `BDDMockito`를 활용해 테스트 가독성을 높이세요.

<br>

### 2-7. 슬라이스 테스트

- [x] 레포지토리 레이어의 슬라이스 테스트를 작성하세요.
  - [x] `@DataJpaTest`를 활용해 테스트를 구현하세요.
  - [x] 테스트 환경을 구성하는 프로파일을 구성하세요.
    - [x] `application-test.yaml`을 생성하세요.
    - [x] 데이터소스는 H2 인메모리 데이터 베이스를 사용하고, PostgreSQL 호환 모드로 설정하세요.
    - [x] H2 데이터베이스를 위해 필요한 의존성을 추가하세요.
    - [x] 테스트 시작 시 스키마를 새로 생성하도록 설정하세요.
    - [x] 디버깅에 용이하도록 로그 레벨을 적절히 설정하세요.
  - [x] 테스트 실행 간 `test` 프로파일을 활성화 하세요.
  - [x] JPA Audit 기능을 활성화 하기 위해 테스트 클래스에 `@EnableJpaAuditing`을 추가하세요.
  - [x] 주요 레포지토리(User, Channel, Message)의 주요 쿼리 메서드에 대해 각각 최소 2개 이상(성공, 실패)의 테스트 케이스를 작성하세요.
    - [x] 커스텀 쿼리 메서드
    - [x] 페이징 및 정렬 메서드
- [진행 중] 컨트롤러 레이어의 슬라이스 테스트를 작성하세요.
  - [ ] `@WebMvcTest`를 활용해 테스트를 구현하세요.
  - [ ] `WebMvcTest`에서 자동으로 등록되지 않는 유형의 Bean이 필요하다면 `@Import`를 활용해 추가하세요.
    - 예시
      ```java
      @Import({ErrorCodeStatusMapper.class})
      ```
  - [ ] 주요 컨트롤러(User, Channel, Message)에 대해 최소 2개 이상(성공, 실패)의 테스트 케이스를 작성하세요.
  - [ ] MockMvc를 활용해 컨트롤러를 테스트하세요.
  - [ ] 서비스 레이어를 모의(mock)하여 컨트롤러 로직만 테스트하세요.
  - [ ] JSON 응답을 검증하는 테스트를 포함하세요.

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint7](https://github.com/JungH200000/10-sprint-mission/tree/sprint7)
