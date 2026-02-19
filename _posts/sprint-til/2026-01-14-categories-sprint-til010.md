---
title: '[TIL 10일차] Sprint Mission2.1 - 디스코드: 도메인 모델링 및 서비스 설계'
excerpt: ''

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til010/

toc: true
toc_sticky: true

date: 2026-01-14
last_modified_at: 2026-01-14
---

# 오늘의 성취

1. 개발 진행 현황
   - `JCFMessageService.java` 구현체 완성
   - 각 객체 삭제 시 의존 관계 설정
   - 메인 클래스(테스트 용) 구현
   - 피드백 받는 중...

2. 객체 참조
   - `new Message(...)`를 하는 순간 자바에서는 힙(Heap) 메모리 영역에 단 하나의 실제 객체가 생성됨
   - 이 객체를 `data.put(...)`, user 객체의 메세지 리스트, channel 객체의 메세지 리스트 등에 **주소**로 저장됨.
   - 즉, 모두 같은 주소를 바라보게 되기 때문에 하나만 수정해도 전체 반영이 됨
   - 다만 **관계의 변경**의 경우 한 쪽에서 연결을 끊는다고 해도 다른 쪽에서는 계속 참조하고 있기 때문에 전부 끊어 주는 게 좋음

3. 불변(Immutable) 리스트
   - `stream().toList()`를 사용하면 불변 리스트를 반환
   - ex: `return listA.stream().toList()`하면 반환 받는 외부에서 `listA`를 수정하지 못하게 함
   - 즉, 조회만 가능한 메서드를 만들 때 사용

4. DIP(Dependency Inversion Principle)
   - 구체적인 클래스에 직접 의존하지 말고, 인터페이스(추상화)에 의존하자
   - 잘못된 ex: `JCFMessageService messageService = new JCFMessageService(messageRepo);`
   - 옳은 ex: `MessageService messageService = new JCFMessageService(messageRepo);`
   - 인터페이스로 타입을 제한하면, `MessageService`가 약속한 기능만 사용하게 강제된다.

5. 문제 상황: 원본 List 내부에서 데이터를 삭제하는 코드로 인한 `ConcurrentModificationException` 예외 발생
   - `ConcurrentModificationException` 예외는 순회 도중 인덱스가 늘어나거나 감소하면서 발생하는 문제
   - 해결하는 가장 쉬운 방법은 `ArrayList`로 복사본을 만들고, 해당 복사본으로 작업하는 것
   - 해결 방법1: List를 순회하면서 해당 List 안의 데이터를 삭제할 때는 `new ArrayList<>(원본);`으로 복사본을 만들 것! - `ArrayList`는 내부에 `modCount`라는 변수를 통해 리소스의 수정 횟수를 기록 후 처음 기록한 숫자와 비교
     - `List<Message> copyMessageList = new ArrayList<>(channel.getChannelMessagesList());`
     - `copyMessageList.forEach(message -> messageService.deleteMessage(message.getAuthor().getId(), message.getId()));`
   - 해결 방법2: `getChannelMessagesList()`가 `return channelMessagesList.stream().toList();`를 반환하기
     - `stream().toList()`: 원본 데이터를 바탕으로 새롭게 생성된 별개의 List 객체(복사본)
     - 즉, 자바는 현재 복사본을 보고 있지만 `deleteMessage()` 메소드 내에서는 원본을 수정하고 있기 때문에 예외를 발생시키지 않음

6. 상황별 Java Exception 종류
   - `NullPointerException`: null이 들어오는 건 절대 일어나서는 안 된다.
   - `NoSuchElementException`: 요청한 요소를 찾을 수 없다.
   - `IllegalArgumentException`: 입력 파라미터가 잘못됐다.
   - `IllegalStateException`: 객체의 현재 상태(state)에서 호출된 메서드가 실행될 수 없는 상황(ex: 이미 존재하는 상태)
   - `ConcurrentModificationException`: "컬렉션 순회 중 구조 변경(추가/삭제)으로 발생하는 fail-fast 예외" (인덱스가 변하기 때문에)

---

# 프로젝트 요구사항

## 1. 기본 요구사항

`//...`

### 1-3. 서비스 설계 및 구현

`//...`

- [x] 다음의 조건을 만족하는 서비스 인터페이스의 구현체를 작성하세요.
  - [x] 클래스 패키지명: `com.sprint.mission.discodeit.service.jcf`
  - [x] 클래스 네이밍 규칙: `JCF[인터페이스 이름]`
  - [x] Java Collections Framework를 활용하여 데이터를 저장할 수 있는 필드(`data`)를 `final`로 선언하고 생성자에서 초기화하세요.
  - [x] `data` 필드를 활용해 생성, 조회, 수정, 삭제하는 메소드를 구현하세요.

### 1-4. 메인 클래스 구현

- [x] 메인 메소드가 선언된 `JavaApplication` 클래스를 선언하고, 도메인 별 서비스 구현체를 테스트해보세요.
  - [x] 등록
  - [x] 조회(단건, 다건)
  - [x] 수정
  - [x] 수정된 데이터 조회
  - [x] 삭제
  - [x] 조회를 통해 삭제되었는지 확인

## 2. 심화 요구 사항

### 2-1. 서비스 간 의존성 주입

- [x] 도메인 모델 간 관계를 고려해서 검증하는 로직을 추가하고, 테스트해보세요.
  - 힌트: Message를 생성할 때 연관된 도메인 모델 데이터 확인하기

---

# 3. GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint2](https://github.com/JungH200000/10-sprint-mission/tree/sprint2)
