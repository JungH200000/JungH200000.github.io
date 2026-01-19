---
title: '[TIL 9일차] Sprint Mission2.1 - 디스코드 도메인 모델링 및 서비스 설계'
excerpt: ''

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til009/

toc: true
toc_sticky: false

date: 2026-01-13
last_modified_at: 2026-01-13
---

# 1. 오늘의 성취

1. 개발 진행 상황
   - `MessageService.java` 인터페이시의 구현체 `JCFMessageService.java` 구현

2. 검증 로직 분리
   - 반복되는 파라미터 검증 로직을 `ValidationMethods.java` 클래스의 메소드로 분리
   - 클래스 내, 반복되는 검증 메소드를 하나의 메소드로 통합
   - 단일 책임 원칙(SRP) 및 캡슐화 준수
3. 모든 수정(Update) 메서드에 `Optional` 적용 해제
   - 수정(Update)은 대상이 존재함을 전제로 하기 때문에, 대상이 없을 때 예외를 던짐.
   - 결과적으로 항상 `Optional`이라는 상자에 값이 들어있는 상태로 반환되기 때문에, 상자를 해체해야 하는 불필요한 작업을 또 하게 됨

4. 상황별 Exception
   - `NullPointerException`: null이 들어오는 건 절대 일어나서는 안 된다.
   - `NoSuchElementException`: 요청한 요소를 찾을 수 없다.
   - `IllegalArgumentException`: 입력 파라미터가 잘못됐다.
   - `IllegalStateException`: 객체의 현재 상태(state)에서 호출된 메서드가 실행될 수 없는 상황(ex: 이미 존재하는 상태)

---

# 2. 프로젝트 요구사항

## 기본 요구사항

### 도메인 모델링

- [x] 디스코드 서비스를 활용해보면서 각 도메인 모델에 필요한 정보를 도출하고, Java Class로 구현하세요.
  - [x] 패키지명: `com.sprint.mission.discodeit.entity`
  - [x] 도메인 모델 정의
    - [x] 공통
      - [x] `id`: 객체를 식별하기 위한 id로 UUID 타입으로 선언합니다.
      - [x] `createdAt`, `updatedAt`: 각각 객체의 생성, 수정 시간을 유닉스 타임스탬프로 나타내기 위한 필드로 Long 타입으로 선언합니다.
    - [x] User
    - [x] Channel
    - [x] Message
  - [x] 생성자
    - [x] `id`는 생성자에서 초기화하세요.
    - [x] `createdAt`는 생성자에서 초기화하세요.
    - [x] `id`, `createdAt`, `updatedAt`을 제외한 필드는 생성자의 파라미터를 통해 초기화하세요.
  - [x] 메소드
    - [x] 각 필드를 반환하는 `Getter` 함수를 정의하세요.
    - [x] 필드를 수정하는 `update` 함수를 정의하세요.

### 서비스 설계 및 구현

- [x] 도메인 모델 별 CRUD(생성, 읽기, 모두 읽기, 수정, 삭제) 기능을 인터페이스로 선언하세요.
  - [x] 인터페이스 패키지명: `com.sprint.mission.discodeit.service`
  - [x] 인터페이스 네이밍 규칙: `[도메인 모델 이름]Service`
- [진행 중] 다음의 조건을 만족하는 서비스 인터페이스의 구현체를 작성하세요.
  - [진행 중] 클래스 패키지명: `com.sprint.mission.discodeit.service.jcf`
  - [진행 중] 클래스 네이밍 규칙: `JCF[인터페이스 이름]`
  - [진행 중] Java Collections Framework를 활용하여 데이터를 저장할 수 있는 필드(`data`)를 `final`로 선언하고 생성자에서 초기화하세요.
  - [진행 중] `data` 필드를 활용해 생성, 조회, 수정, 삭제하는 메소드를 구현하세요.

### 메인 클래스 구형

- [ ] 메인 메소드가 선언된 `JavaApplication` 클래스를 선언하고, 도메인 별 서비스 구현체를 테스트해보세요.
  - [ ] 등록
  - [ ] 조회(단건, 다건)
  - [ ] 수정
  - [ ] 수정된 데이터 조회
  - [ ] 삭제
  - [ ] 조회를 통해 삭제되었는지 확인

## 심화 요구 사항

### 서비스 간 의존성 주입

- [ ] 도메인 모델 간 관계를 고려해서 검증하는 로직을 추가하고, 테스트해보세요.
  - 힌트: Message를 생성할 때 연관된 도메인 모델 데이터 확인하기

---

# 3. GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint2](https://github.com/JungH200000/10-sprint-mission/tree/sprint2)
