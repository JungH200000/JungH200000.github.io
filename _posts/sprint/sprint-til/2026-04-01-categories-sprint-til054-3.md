---
title: '[TIL 54일 차] Sprint Mission7 - Controller 계층에서 주요 메서드 슬라이스 테스트'
excerpt: '2-7.슬라이스 테스트'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til054-3

toc: true
toc_sticky: true

date: 2026-04-01
last_modified_at: 2026-04-01
---

# 오늘의 성취

## 1. 개발 진행 상황

- Controller 계층에서 슬라이스 테스트를 작성
  - `@WebMvcTest`를 활용해 테스트를 구현
  - WebMvcTest에서 자동으로 등록되지 않는 유형의 Bean이 필요하다면 `@Import`를 활용해 추가
  - 주요 컨트롤러(User, Channel, Message)에 대해 테스트 케이스 작성
    - `MessageController` 작업 완료
    - `ChannelController` 작업 중
  - MockMvc를 활용해 Controller를 테스트
  - Service 계층을 mock하여 Controller 로직만 테스트
  - JSON 응답을 검증하는 테스트를 포함

---

# 프로젝트 요구 사항

## 2. 기본 요구사항

`//...`

### 2-7. 슬라이스 테스트

`//...`

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
