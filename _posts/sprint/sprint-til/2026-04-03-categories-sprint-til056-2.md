---
title: '[TIL 56일 차] Sprint Mission7 - Controller 계층에서 주요 메서드 슬라이스 테스트'
excerpt: '2-7.슬라이스 테스트'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til056-2

toc: true
toc_sticky: true

date: 2026-04-03
last_modified_at: 2026-04-03
---

# 오늘의 성취

- Controller 계층에서 슬라이스 테스트를 작성
  - `@WebMvcTest`를 활용해 테스트를 구현
  - WebMvcTest에서 자동으로 등록되지 않는 유형의 Bean이 필요하다면 `@Import`를 활용해 추가
  - 주요 컨트롤러(User, Channel, Message)에 대해 테스트 케이스 작성
    - `UserController` 작업 완료
  - MockMvc를 활용해 Controller를 테스트
  - Service 계층을 mock하여 Controller 로직만 테스트
  - JSON 응답을 검증하는 테스트를 포함
- MDC로 로깅 고도화
  - requestId, requestUri, requestMethod 등의 정보를 MDC에 추가하는 `MDCLoggingInterceptor` 구현
  - `MDCLoggingInterceptor`를 등록하는 `WebMvcConfig` 구현
  - `logback-spring.xml`의 Logback 패턴에 MDC 값 추가

---

# 프로젝트 요구 사항

## 2. 기본 요구사항

`//...`

### 2-7. 슬라이스 테스트

`//...`

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

<br>

## 3. 심화 요구사항

### 3-1. MDC를 활용한 로깅 고도화

- [x] 요청 ID, 요청 URL, 요청 방식 등의 정보를 MDC에 추가하는 인터셉터를 구현하세요.
  - [x] 클래스명: `MDCLoggingInterceptor`
  - [x] 패키지명: `com.**.discodeit.config`
  - [x] 요청 ID는 랜덤한 문자열로 생성합니다. (UUID)
  - [x] 요청 ID는 응답 헤더에 포함시켜 더 많은 분석이 가능하도록 합니다.
    - 헤더 이름: `Discodeit-Request-ID`
- [x] `WebMvcConfigurer`를 통해 `MDCLoggingInterceptor`를 등록하세요.
  - [x] 클래스명: `WebMvcConfig`
  - [x] 패키지명: `com.**.discodeit.config`
- [x] Logback 패턴에 MDC 값을 포함시키세요.
  - 로그 출력 예시

    ```markdown
    # 패턴

    {년}-{월}-{일} {시}:{분}:{초}:{밀리초} [{스레드명}] {로그 레벨(5글자로 맞춤)} {로거 이름(최대 36글자)} [{MDC:요청ID} | {MDC:요청 메서드} | {MDC:요청 URL}] - {로그 메시지}{줄바꿈}

    # 예시

    25-01-01 10:33:55.740 [main] DEBUG o.s.api.AbstractOpenApiResource [827cbc0b | GET | /v3/api-docs] - Init duration for springdoc-openapi is: 216 ms
    ```

`//...`

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint7](https://github.com/JungH200000/10-sprint-mission/tree/sprint7)
