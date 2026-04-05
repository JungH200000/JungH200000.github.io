---
title: '[TIL 57일 차] Sprint Mission7 - MDC를 활용한 로깅 고도화'
excerpt: '3-1.MDC를 활용한 로깅 고도화'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til057

toc: true
toc_sticky: true

date: 2026-04-04
last_modified_at: 2026-04-04
---

# 오늘의 성취

## 1. 개발 진행 상황

- MDC로 로깅 고도화
  - requestId, requestUri, requestMethod 등의 정보를 MDC에 추가하는 `MDCLoggingInterceptor` 구현
  - `MDCLoggingInterceptor`를 등록하는 `WebMvcConfig` 구현
  - `logback-spring.xml`의 Logback 패턴에 MDC 값 추가

---

# 프로젝트 요구 사항

`//...`

## 3. 심화 요구사항

### 3-1. MDC를 활용한 로깅 고도화

- [x] 컨트롤러 레이어의 슬라이스 테스트를 작성하세요.
  - [x] `@WebMvcTest`를 활용해 테스트를 구현하세요.
  - [x] `WebMvcTest`에서 자동으로 등록되지 않는 유형의 Bean이 필요하다면 `@Import`를 활용해 추가하세요.
    - 예시
      ```java
      @Import({ErrorCodeStatusMapper.class})
      ```
  - [x] 주요 컨트롤러(User, Channel, Message)에 대해 최소 2개 이상(성공, 실패)의 테스트 케이스를 작성하세요.
  - [x] MockMvc를 활용해 컨트롤러를 테스트하세요.
  - [x] 서비스 레이어를 모의(mock)하여 컨트롤러 로직만 테스트하세요.
  - [x] JSON 응답을 검증하는 테스트를 포함하세요.

`//...`

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint7](https://github.com/JungH200000/10-sprint-mission/tree/sprint7)
