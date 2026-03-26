---
title: '[TIL 7일차] Sprint Mission2.1 - 디스코드: 도메인 모델링 및 서비스 설계'
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

# 오늘의 성취

### 1. **개발 진행 상황**

- `User` 클래스, `Channel` 클래스, `Message` 클래스의 공통 필드 관리를 위해 `BaseEntity` 클래스를 추상 클래스로 구현
- 디스코드의 핵심 도메인(`User`, `Channel`, `Message`)을 분석하여 도메인 모델링
- 도메인 모델 별 CRUD(생성, 읽기, 모두 읽기, 수정, 삭제) 기능을 인터페이스로 선언

### 2. **오늘 헷갈린 접근 제어자**

- default: "이 필드는 해당 패키지 식구들만 공유하자."
- protected: "이 필드는 나를 상속받은 자식들에게만 물려줄 것이다."

### 3. **데이터 부재 처리**

- **단건 조회(`Optional<T>`):** 결과가 존재하지 않을 수 있음을 반환 타입을 Optional로 감싸서 호출자가 `isPresent()`나 `ifPresent()`를 통해 NPE(NullPointerException) 방지
- **다건 조회(`List`/`Set`):** 데이터가 없을 경우 `null` 대신 빈 컬렉션(`Collections.emptyList()` 등)을 반환하여 NPE를 방지
  - ex) 컬렉션 `List<User>`은 데이터가 없을 경우 빈 리스트 `[]`를 반환해서 `list.isEmpty()`로 상태 확인 가능
  - ex) 일반 객체 `User`는 데이터가 없을 경우 `null` 반환하는데 상태 확인 가능한 방법이 없어서 `Optional<User>`로 감싸서 `isPresent()` 또는 `ifPresent()` 메소드로 상태 확인 가능

# 프로젝트 요구사항

## 1. 기본 요구사항

### 1-2. 도메인 모델링

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

### 1-3. 서비스 설계 및 구현

- [x] 도메인 모델 별 CRUD(생성, 읽기, 모두 읽기, 수정, 삭제) 기능을 인터페이스로 선언하세요.
  - [x] 인터페이스 패키지명: `com.sprint.mission.discodeit.service`
  - [x] 인터페이스 네이밍 규칙: `[도메인 모델 이름]Service`

`//...`

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint2](https://github.com/JungH200000/10-sprint-mission/tree/sprint2)
