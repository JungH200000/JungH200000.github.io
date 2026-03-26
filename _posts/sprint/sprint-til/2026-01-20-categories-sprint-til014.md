---
title: '[TIL 14일차] Sprint Mission2.2 - 디스코드: File IO를 통한 데이터 영속화와 레포지토리 설계 및 구현'
excerpt: ''

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til014/

toc: true
toc_sticky: true

date: 2026-01-20
last_modified_at: 2026-01-20
---

# 오늘의 성취

### 1. 개발 진행 상황

- File IO를 통한 데이터 영속화
  - JCF가 아닌 FileIO와 객체 직렬화를 통해 파일에 데이터 저장/삭제를 구현
- 레포지토리 설계 및 구현
  - 저장 로직과 관련된 기능을 도메인 모델 별 인터페이스, 구현체 구현

### 2. Unchecked warning?

- 자바 제네릭 관련하여 컴파일러가 "타입 안전을 100% 보장 못 하겠다"라고 경고하는 것
- 원인
  - 타입 소거 발생 : 자바 제네릭은 컴파일할 때만 타입 체크를 하고, 런타임(실행)할 때는 `<>`안의 정보가 대부분 사라지는 현상
  - 원인 예시 : `Map<UUID, User> m = new HashMap<>();`
    - 컴파일러는 `m.put(UUID, User);`만 허용하고, `m.put("hello", 123);` 같은 건 컴파일 에러로 막음
    - 런타임 중에는 m은 UUID와 User라는 정보가 없는 Map으로만 보임
- 발생 예시
  - `unchecked cast: List<String> x = (List<String>) obj;`
  - `ObjectInputStream.readObject()`처럼 Object로 읽어온 걸 제네릭 타입으로 캐스팅할 때

```java
Object obj = ois.readObject();
List<String> list = (List<String>) obj; // unchecked cast 경고
```

- 즉, 제네릭은 런타임에 타입 정보가 지워지기 때문에 런타임에 진짜 `List<String>`인지 확실히 검증할 방법이 없어서, 컴파일러가 경고를 띄우는 것

### 3. `WriteAbortedException`

- 직렬화 도중 `NotSerializableException`이 발생해서 저장이 중단(abort)되었다는 랩핑된 예외
- 파일에 제대로 저장이 안되었거나 깨졌을 가능성이 매우 높음
- `Serializable` 미구현으로 인한 예외로, `Serializable`을 구현하면 정상 동작됨.

### 4. 파일에서 데이터를 읽어올 때마다 UUID가 달라지는 문제 발생

- 자바 직렬화 규칙상 서브클래스(User)가 Serializable이어도 부모(BaseEntity)가 Serializable이 아니면 역직렬화할 때 부모 생성자가 실행됨
- 즉, 파일이 존재하고, 데이터 로드가 성공해도 UUID가 바뀌는 문제가 발생
- 해결 방법
  - BaseEntity 자체를 직렬화 가능하게 Serializable 구현하기

---

# 프로젝트 요구사항

## 1. 기본 요구사항

### 1-1. File IO를 통한 데이터 영속화

- [x] 다음의 조건을 만족하는 서비스 인터페이스의 구현체를 작성하세요.
  - [x] 클래스 패키지명: `com.sprint.mission.discodeit.service.file`
  - [x] 클래스 네이밍 규칙: `File[인터페이스 이름]`
  - [x] JCF 대신 FileIO와 객체 직렬화를 활용해 메소드를 구현하세요.
  - [객체 직렬화/역직렬화 가이드](https://codeit.notion.site/13b6fd228e8d80c6b144cdfbf518a9f7)

- [x] `Application`에서 서비스 구현체를 `File*Service`로 바꾸어 테스트해보세요.

### 1-2. 서비스 구현체 분석

- [x] `JCF*Service` 구현체와 `File*Service` 구현체를 비교하여 공통점과 차이점을 발견해보세요.
  - [x] "비즈니스 로직"과 관련된 코드를 식별해보세요.
  - [x] "저장 로직"과 관련된 코드를 식별해보세요.

### 1-3. 레포지토리 설계 및 구현

참고: 레포지토리는 데이터를 관리하는 로직을 가짐

- [x] "저장 로직"과 관련된 기능을 도메인 모델 별 인터페이스로 선언하세요.
  - [x] 인터페이스 패키지명: `com.sprint.mission.discodeit.repository`
  - [x] 인터페이스 네이밍 규칙: `[도메인 모델 이름]Repository`

- [x] 다음의 조건을 만족하는 레포지토리 인터페이스의 구현체를 작성하세요.
  - [x] 클래스 패키지명: `com.sprint.mission.discodeit.repository.jcf`
  - [x] 클래스 네이밍 규칙: `JCF[인터페이스 이름]`
  - [x] 기존에 구현한 `JCF*Service` 구현체의 "저장 로직"과 관련된 코드를 참고하여 구현하세요.

- [x] 다음의 조건을 만족하는 레포지토리 인터페이스의 구현체를 작성하세요.
  - [x] 클래스 패키지명: `com.sprint.mission.discodeit.repository.file`
  - [x] 클래스 네이밍 규칙: `File[인터페이스 이름]`
  - [x] 기존에 구현한 `File*Service` 구현체의 "저장 로직"과 관련된 코드를 참고하여 구현하세요.

`//...`

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint2](https://github.com/JungH200000/10-sprint-mission/tree/sprint2)
