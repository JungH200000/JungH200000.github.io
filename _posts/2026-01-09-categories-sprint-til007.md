---
title: '[TIL 7일차] Sprint Mission2.1 - 디스코드 도메인 모델링 및 서비스 설계'
excerpt: ''

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til007/

toc: true
toc_sticky: true

date: 2026-01-09
last_modified_at: 2026-01-09
---

# 1. 오늘의 성취

1. **개발 진행 상황**

   - `User` 클래스, `Channel` 클래스, `Message` 클래스의 공통 필드 관리를 위해 `BaseEntity` 클래스를 추상 클래스로 구현
   - 디스코드의 핵심 도메인(`User`, `Channel`, `Message`)을 분석하여 도메인 모델링
   - 도메인 모델 별 CRUD(생성, 읽기, 모두 읽기, 수정, 삭제) 기능을 인터페이스로 선언

2. **오늘 헷갈린 접근 제어자**

   - default: "이 필드는 해당 패키지 식구들만 공유하자."
   - protected: "이 필드는 나를 상속받은 자식들에게만 물려줄 것이다."

3. **데이터 부재 처리**

   - **단건 조회(`Optional<T>`):** 결과가 존재하지 않을 수 있음을 반환 타입을 Optional로 감싸서 호출자가 `isPresent()`나 `ifPresent()`를 통해 NPE(NullPointerException) 방지
   - **다건 조회(`List`/`Set`):** 데이터가 없을 경우 `null` 대신 빈 컬렉션(`Collections.emptyList()` 등)을 반환하여 NPE를 방지
     - ex) 컬렉션 `List<User>`은 데이터가 없을 경우 빈 리스트 `[]`를 반환해서 `list.isEmpty()`로 상태 확인 가능
     - ex) 일반 객체 `User`는 데이터가 없을 경우 `null` 반환하는데 상태 확인 가능한 방법이 없어서 `Optional<User>`로 감싸서 `isPresent()` 또는 `ifPresent()` 메소드로 상태 확인 가능

# 2. 프로젝트 요구사항

## 기본 요구사항

**도메인 모델링**

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

**서비스 설계 및 구현**

- [x] 도메인 모델 별 CRUD(생성, 읽기, 모두 읽기, 수정, 삭제) 기능을 인터페이스로 선언하세요.
  - [x] 인터페이스 패키지명: `com.sprint.mission.discodeit.service`
  - [x] 인터페이스 네이밍 규칙: `[도메인 모델 이름]Service`
- [ ] 다음의 조건을 만족하는 서비스 인터페이스의 구현체를 작성하세요.
  - [ ] 클래스 패키지명: `com.sprint.mission.discodeit.service.jcf`
  - [ ] 클래스 네이밍 규칙: `JCF[인터페이스 이름]`
  - [ ] Java Collections Framework를 활용하여 데이터를 저장할 수 있는 필드(`data`)를 `final`로 선언하고 생성자에서 초기화하세요.
  - [ ] `data` 필드를 활용해 생성, 조회, 수정, 삭제하는 메소드를 구현하세요.

**메인 클래스 구형**

- [ ] 메인 메소드가 선언된 `JavaApplication` 클래스를 선언하고, 도메인 별 서비스 구현체를 테스트해보세요.
  - [ ] 등록
  - [ ] 조회(단건, 다건)
  - [ ] 수정
  - [ ] 수정된 데이터 조회
  - [ ] 삭제
  - [ ] 조회를 통해 삭제되었는지 확인

## 심화 요구 사항

**서비스 간 의존성 주입**

- [ ] 도메인 모델 간 관계를 고려해서 검증하는 로직을 추가하고, 테스트해보세요.
  - 힌트: Message를 생성할 때 연관된 도메인 모델 데이터 확인하기

---

# 3. GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint2](https://github.com/JungH200000/10-sprint-mission/tree/sprint2)
