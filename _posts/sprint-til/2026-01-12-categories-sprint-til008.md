---
title: '[TIL 8일차] Sprint Mission2.1 - 디스코드: 도메인 모델링 및 서비스 설계'
excerpt: ''

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til008/

toc: true
toc_sticky: true

date: 2026-01-12
last_modified_at: 2026-01-12
---

# 오늘의 성취

1. **개발 진행 상황**
   - `UserService` 인터페이스의 구현체 `JCFUserService` 구현 완료
   - `ChannelService` 인터페이스의 구현체 `JCFChannelService` 구현 중...

2. **Java Stream & Data Structure**
   - **`filter()` 메소드 안에서의 논리 연산**
   - `filter()` 메소드 안에 논리 연산자 사용해 복합 조건 필터링 가능
   - ex: `filter(user -> user.getUserName().contains(partialName) || user.getNickName().contains(partialName))`
   - **`Map<K, V>`으로 데이터 저장:**
   - 데이터를 저장할 때 `private final Map<UUID, Message> data = new HashMap<>();` 같이 UUID를 중복 저장하는 이유는 **Key**는 빠른 검색을 위한 색인(index) 역할을 하고 **Value**는 Message 데이터 그 자체의 역할을 한다.

3. 메서드의 반환 타입이 `Optional`일 경우, 예외를 던질 것인가? 아니면 빈 상자를 반환할 것인가?
   - **입력 파라미터 자체가 비정상("", null)**일 경우
     - 서비스 내부에서 **IllegalArgumentException**을 던지기
     - 호출자가 잘못된 argument를 넘김
     - ex) `throw new IllegalArgumentException("message");`
   - **입력은 정상인데 결과(데이터)가 없는** 경우
     - **Optional.empty()**를 반환하여 데이터가 없음을 명시
     - 호출자(메서드를 사용하는 쪽)가 후속 조치를 하게 함.
     - ex) `return Optional.empty()`
   - **컬렉션**이라면?
     - 반환 타입이 `List`나 `Set`인 **다건 조회**의 경우, 데이터가 없다면 **빈 컬렉션**을 반환해서 호출자가 후속 조치를 하게 함.
     - ex) `return Collections.emptyList();`

4. **`orElseThrow()`:** `Optional` 래핑을 해제하고 내용물 반환하는 메서드
   - 만약 메서드의 반환 타입이 `Optional`이라면 `Optional`로 래핑된 상태를 반환해야 함.

5. **메서드가 객체를 반환할 때**는 객체 자체가 이동하는 것이 아닌 **객체의 주소값이 복사되어 전달됨!!** 즉, 서로 다른 위치의 두 참조 변수가 **힙에 위치한 동일한 객체를 바라봄.**

6. 객체 간 양방향 관계에서 한쪽 리스트만 업데이트할 경우 데이터 불일치 발생할 수 있기 때문에 한 쪽의 메서드 안에서 양쪽을 한꺼번에 처리하도록 구현(`User.java` 참고)

7. **Exception 종류**
   - `NoSuchElementException`: 요청한 요소를 찾을 수 없다.
   - `IllegalArgumentException`: 입력 파라미터가 잘못됐다.

---

# 프로젝트 요구사항

## 1. 기본 요구사항

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
