---
title: '[TIL 9일차] Sprint Mission2.1 - 디스코드: 도메인 모델링 및 서비스 설계'
excerpt: ''

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til009/

toc: true
toc_sticky: true

date: 2026-01-13
last_modified_at: 2026-01-13
---

# 오늘의 성취

### 1. 개발 진행 상황

- `MessageService.java` 인터페이시의 구현체 `JCFMessageService.java` 구현

### 2. 검증 로직 분리

- 반복되는 파라미터 검증 로직을 `ValidationMethods.java` 클래스의 메소드로 분리
- 클래스 내, 반복되는 검증 메소드를 하나의 메소드로 통합
- 단일 책임 원칙(SRP) 및 캡슐화 준수

### 3. 모든 수정(Update) 메서드에 `Optional` 적용 해제

- 수정(Update)은 대상이 존재함을 전제로 하기 때문에, 대상이 없을 때 예외를 던짐.
- 결과적으로 항상 `Optional`이라는 상자에 값이 들어있는 상태로 반환되기 때문에, 상자를 해체해야 하는 불필요한 작업을 또 하게 됨

### 4. 상황별 Exception

- `NullPointerException`: null이 들어오는 건 절대 일어나서는 안 된다.
- `NoSuchElementException`: 요청한 요소를 찾을 수 없다.
- `IllegalArgumentException`: 입력 파라미터가 잘못됐다.
- `IllegalStateException`: 객체의 현재 상태(state)에서 호출된 메서드가 실행될 수 없는 상황(ex: 이미 존재하는 상태)

---

# 프로젝트 요구사항

## 기본 요구사항

`//...`

### 1-3. 서비스 설계 및 구현

`//...`

- [진행 중] 다음의 조건을 만족하는 서비스 인터페이스의 구현체를 작성하세요.
  - [진행 중] 클래스 패키지명: `com.sprint.mission.discodeit.service.jcf`
  - [진행 중] 클래스 네이밍 규칙: `JCF[인터페이스 이름]`
  - [진행 중] Java Collections Framework를 활용하여 데이터를 저장할 수 있는 필드(`data`)를 `final`로 선언하고 생성자에서 초기화하세요.
  - [진행 중] `data` 필드를 활용해 생성, 조회, 수정, 삭제하는 메소드를 구현하세요.

`//...`

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint2](https://github.com/JungH200000/10-sprint-mission/tree/sprint2)
