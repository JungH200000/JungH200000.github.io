---
title: '[TIL 12일차] Sprint Mission2.1 - 디스코드 도메인 모델링 및 서비스 설계'
excerpt: ''

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til012/

toc: true
toc_sticky: false

date: 2026-01-16
last_modified_at: 2026-01-16
---

# 1. 오늘의 성취

1. 개발 진행 현황
   - 피드백 받은 부분 수정 진행 : [Sprint2-1 Feedback](https://www.notion.so/jungh20000/Sprint2-1-Feedback-2e9f59816c02804295a9f76a9f0d3c62)
   - 전반적으로 메소드의 파라미터에 객체가 아닌 id를 가지도록 리팩토링
   - 전반적으로 메소드명 의미가 명확하게 수정
   - `UserService`와 ChannelService`, `MessageService` 의존 관계 재설정
   - `JCFMessageService`
     - 의존 관계 `UserService`, `ChannelService` 추가
   - entity 내부 필드를 UUID에서 객체 자체를 저장하게 수정

2. 식별자(id)가 아닌 객체를 저장
   - 우리가 사용하는 프로그래밍 언어가 자바이기에, 객체로 모든걸(상태와 행위) 바라봐야 한다.
   - 만약 TV의 리모콘을 우리가 하나의 클래스로 만들어보면

     ```java
     class Remote {
         UUID tvId;
     }
     ```

   - 실제로 이렇게 만들면 리모콘은 "어떤 TV인지만" 알게 됨
   - 사용하려면 저 리모콘을 통해 TV를 선별하고 결국 TV에 가서 뭔갈 직접 해야해요

     ```java
     TV tv = tvService.find(remote.tvId);
     tv.increaseVolume();
     ```

   - 즉, id만 사용하면 매번 조회 코드를 추가로 거쳐야 하는데, 객체를 사용하면 바로바로 접근이 가능하다.

3. `removeIf` : 람다식이나 Predicate로 조건을 정해 모든 일치 요소를 안전하게 제거

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
- [x] 다음의 조건을 만족하는 서비스 인터페이스의 구현체를 작성하세요.
  - [x] 클래스 패키지명: `com.sprint.mission.discodeit.service.jcf`
  - [x] 클래스 네이밍 규칙: `JCF[인터페이스 이름]`
  - [x] Java Collections Framework를 활용하여 데이터를 저장할 수 있는 필드(`data`)를 `final`로 선언하고 생성자에서 초기화하세요.
  - [x] `data` 필드를 활용해 생성, 조회, 수정, 삭제하는 메소드를 구현하세요.

### 메인 클래스 구형

- [x] 메인 메소드가 선언된 `JavaApplication` 클래스를 선언하고, 도메인 별 서비스 구현체를 테스트해보세요.
  - [x] 등록
  - [x] 조회(단건, 다건)
  - [x] 수정
  - [x] 수정된 데이터 조회
  - [x] 삭제
  - [x] 조회를 통해 삭제되었는지 확인

## 심화 요구 사항

### 서비스 간 의존성 주입

- [x] 도메인 모델 간 관계를 고려해서 검증하는 로직을 추가하고, 테스트해보세요.
  - 힌트: Message를 생성할 때 연관된 도메인 모델 데이터 확인하기

---

# 3. GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint2](https://github.com/JungH200000/10-sprint-mission/tree/sprint2)
