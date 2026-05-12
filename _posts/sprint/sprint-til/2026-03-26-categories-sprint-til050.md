---
title: '[TIL 50일 차] Sprint Mission7 - 로깅 작성'
excerpt: '2-2.로그 관리'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til050

toc: true
toc_sticky: true

date: 2026-03-26
last_modified_at: 2026-03-26
---

# 오늘의 성취

## 1. 개발 진행 상황

- 로깅 작성
  - HTTP Request마다 Request와 Response를 공통 로깅하는 `RequestLoggingFilter` Filter 추가
  - Service, Controller 레이어의 주요 메서드에 로깅 추가
    - Service 레이어에서 사용자, 채널, 메시지 create/update/delete/find/findAll
    - Controller 레이어에서의 로깅은 `OncePerRequestFilter`를 상속하는 `RequestLoggingFilter`로 대체
      - HTTP 요청마다 Request와 Response를 공통으로 로깅
    - 파일 upload/download

<br>

## 2. 고민

### 로그를 작성할 때, 로그 레벨 `DEBUG`, `INFO`, `WARN`, `ERROR`를 사용하기 적합한 시점은 언제일까?

- `DEBUG`
  - 메서드 호출 정보, 중요 변수 값, SQL 쿼리 등 **개발과 디버깅에 도움이되는 상세정보**를 기록할 대 사용
  - 운영 환경에서 로그가 과도하게 많아질 수 있기 때문에, 주로 개발 환경에 활용
- `INFO`
  - 서비스 시작/종료, 생성/수정/삭제 완료, 로그인 성공처럼 **애플리케이션에서 실제로 의미 있는 비즈니스 이벤트**를 기록할 때 사용
  - 운영 환경에서 확인할 가치가 있는 **정상적인 주요 동작**에 적합
- `WARN`
  - 잘못된 요청, 예상 가능한 예외, 비정상적인 입력값처럼 **예측 가능한 문제 상황**이 발생했을 때 사용
  - 시스템은 계속 동작할 수 있지만, 주의 깊게 볼 필요가 있는 경우에 해당
- `ERROR`
  - 서버 내부 오류, 외부 시스템 장애, 예상하지 못한 예외처럼 **즉시 확인이 필요한 심각한 문제 상황**을 기록할 때 사용
  - 정상 흐름으로 복구되기 어렵거나, 장애 원인 분석이 필요한 경우에 해당

### Service 계층에서 조회는 `DEBUG`인가, `INFO`인가

- 조회는 말 그대로 변경이 아닌 DB에 있는 걸 가져오는 단순히 읽어오는 작업이며, 호출 빈도가 높다. 따라서 대부분의 조회 로그는 `DEBUG`가 맞을 것이다.
- 특히 목록 조회, 단건 조회, 검색 요청처럼 자주 호출되는 기능을 `INFO`로 남기면 운영 로그가 빠르게 많아지고, 정말 중요한 로그를 구분하기 어려워질 수 있다.
- 단, “관리자 권한으로 특정 정보 조회”, “보안상 민감한 정보 조회”, “감사(audit) 추적이 필요한 조회”처럼 **조회 자체가 중요한 의미를 가지는 경우**에는 `INFO`로 기록할 수 있다.

### 막상 작성하다보니 `INFO` 로그 레벨이 많아 보인다. 어떻게 구분하는 게 좋을까??

- 보통 시작 로그는 "이제 시작합니다." 정도라서 운영에서 중요한 것은 아님. 다만, 개발 환경에서는 오류 추적 시 좋다고 할 수 있음.
- 첨언하자면, 성공/생성 로그가 `INFO`인 이유는 **실제 시스템에서 무슨 일이 발생했는지(생성 완료, 결제 완료, 업로드 완료 등)**를 보여주는 기록이기 때문
- 식당을 예로 들면 `DEBUG`는 "요리 시작", "재료를 꺼냄", "팬 달구는 중"인데, 주방장 입장에서는 문제가 생겼을 때 보면 좋지만 매장 운영 기록 측면에서는 너무 많다.
- `INFO`의 경우 "주문 1, 2, 3번 음식 나갔습니다"는 실제 완료 기록이라서 매장 운영 기록 측면에서도 중요하다.

---

# 프로젝트 요구 사항

## 2. 기본 요구사항

`//...`

### 2-2. 로그 관리

`//...`

- [x] 서비스 레이어와 컨트롤러 레이어의 주요 메서드에 로깅을 추가하세요.
  - [x] 로깅 레벨을 적절히 사용하세요: ERROR, WARN, INFO, DEBUG
  - [x] 다음과 같은 메서드에 로깅을 추가하세요:
    - [x] 사용자 생성/수정/삭제
    - [x] 채널 생성/수정/삭제
    - [x] 메시지 생성/수정/삭제
    - [x] 파일 업로드/다운로드

`//...`

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint7](https://github.com/JungH200000/10-sprint-mission/tree/sprint7)
