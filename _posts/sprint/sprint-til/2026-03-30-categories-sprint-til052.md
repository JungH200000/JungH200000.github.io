---
title: '[TIL 52일 차] Sprint Mission7 - Service 계층에서 주요 메서드 단위 테스트'
excerpt: '2-6.단위 테스트'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til052

toc: true
toc_sticky: true

date: 2026-03-30
last_modified_at: 2026-03-30
---

# 오늘의 성취

## 1. 개발 진행 상황

- 단위 테스트
  - Service 계층에서 주요 메서드에 대한 단위 테스트
    - `UserService` : `create`, `update`, `delete`
    - `ChannelService` : `create(PUBLIC, PRIVATE)`, `update`, `delete`, `findByUserId`
    - `MessageService` : `create`, `update`, `delete`, `findByChannelId`
  - `Mockito` 활용하여 Repository 의존성 Mock
  - `BDDMockito`를 활용해 테스트 가독성 높이기
- 슬라이스 테스트
  - Repository 계층에서 주요 메서드에 대한 슬라이스 테스트
    - 테스트 환경을 구성하는 프로파일을 구현(`application-test.yaml`)
      - 데이터소스는 H2 인메모리 데이터 베이스, PostgreSQL 호환 모드
      - 테스트 시작 시 스키마를 새로 생성
      - 디버깅에 용이하도록 로그 레벨을 적절히 설정
    - JPA Audit 기능을 활성화 하기 위해 테스트 클래스에 @EnableJpaAuditing을 추가
    - 주요 레포지토리(User, Channel, Message)의 주요 쿼리 메서드에 대해 테스트 케이스 작성
      - `ChannelRepository`, `MessageRepository` 작업 중
        - 커스텀 쿼리 메서드
        - 페이징 및 정렬 메서드

<br>

## 2. 고민

### 실패 테스트 개수는 몇 개가 적합할까??

- 예외를 던지는 분기가 몇 개인지, 그 분기가 의미있게 구분되는지에 따라 다르다.
- `BasicUserService`의 `create` 메서드에는 email 중복, username 중복, profile 업로드 실패로 총 3가지 예외 분기가 있을 때, 모두 각각 다른 실패 요인이기 때문에 기대하는 동작도 다르다.

### 만약 설정한 `@EnableJpaAuditing` 테스트 코드에서 적용되지 않는다면?

`@DataJpaTest`는 JPA 관련 부분만 잘라서 로드하는 슬라이스 테스트 애너테이션이기 때문에, 애플리케이션 시작 클래스나 설정 클래스에 `@EnableJpaAuditing`을 적용했다면 설정이 제외될 수도 있다.

따라서 테스트 안에 설정을 추가하거나 따로 테스트에 설정 클래스를 추가하면 된다.

```java
@Import(ChannelRepositoryTest.JpaAuditingConfig.class)
class ChannelRepositoryTest {

    @TestConfiguration
    @EnableJpaAuditing
    static class JpaAuditingConfig {
    }
}
```

### JPA 테스트에서 Entity는 왜 `assertEquals()`로 비교하는 것을 추천하지 않을까? DTO는 괜찮을까?

```java
assertEquals(message1, result.get());
```

조회한 Entity가 내가 저장한 Entity와 같은지 확인하고 싶을 때, 무심코 작성했다. 그런데 JPA Entity를 이런 방식으로 비교하는 것을 조심하는 것이 좋다.

반면 DTO는 `assertEquals(expectedDto, actualDto)`로 비교해도 괜찮은 경우가 많다.

#### 1) `assertEquals()`는 결국 `equals()`를 호출한다

`assertEquals(a, b)`는 내부적으로 `a.equals(b)`를 호출해서 두 객체가 같은지 판단한다.

즉, 테스트에서 중요한 건 단순히 "둘 다 같은 데이터처럼 보이느냐"가 아니라, **그 클래스의 `equals()`가 어떻게 정의되어 있느냐**다.

#### 2) Entity에 `assertEquals()`를 잘 쓰지 않는 이유

JPA Entity는 보통 단순한 값 객체가 아니라 영속성 컨텍스트, 프록시, 식별자 생성 시점, 연관관계 같은 요소들이 얽혀 있어서 비교가 생각보다 까다롭다.

예를 들어 아래의 테스트가 있다고 가정해보자.

```java
Message savedMessage = messageRepository.save(message1);
Optional<Message> result = messageRepository.findById(savedMessage.getId());

assertEquals(savedMessage, result.get());
```

이 코드가 항상 안전한 것은 아니다.

- `equals()`를 재정의하지 않았다면 참조 비교가 된다
  - Entity에서 `equals()`를 직접 구현하지 않았다면, 기본적으로 객체의 주소값을 비교하게 된다.
  - 즉, 두 객체가 같은 DB row를 가리켜도 서로 다른 자바 객체면 `assertEquals()`는 실패할 수 있다.

- 물론, 어떤 때는 우연히 통과할 수도 있다
  - 같은 영속성 컨텍스트 안에서는 JPA가 같은 Entity를 같은 객체 인스턴스로 관리하기 때문에, 저장한 객체와 조회한 객체가 사실상 동일한 참조일 수 있다. 그래서 테스트가 통과할 수도 있다.
  - 하지만 이건 **현재 영속성 컨텍스트 상태에 우연히 의존해서 통과한 것**에 가깝다.

#### 3) DTO는 왜 `assertEquals()`를 써도 괜찮을까?

DTO는 Entity보다 훨씬 **값 객체(value object)** 에 가깝다. 그래서 `equals/hashCode`가 값 기준으로 잘 정의되어 있거나 `record`면 `assertEquals(expectedDto, actualDto)`를 사용하는 것이 자연스럽다.

```java
public record UserDto(UUID id, String username, String email) {
}
```

이 경우에는 값 기반 `equals/hashCode`가 자동 생성되므로 아래의 코드 검증에 적합하다.

```java
assertEquals(expectedDto, actualDto);
```

<br>

## 3. 문제

### `application-test.yaml`에서 설정한 데이터베이스 설정이 변경됨

```bash
2026-03-30 17:27:41.613 [Test worker] INFO  o.s.b.t.a.j.TestDatabaseAutoConfiguration$EmbeddedDataSourceBeanFactoryPostProcessor - Replacing 'dataSource' DataSource bean with embedded version
2026-03-30 17:27:41.715 [Test worker] INFO  o.s.j.d.e.EmbeddedDatabaseFactory - Starting embedded database: url='jdbc:h2:mem:2dfbf6f6-7ff9-4771-b4d7-1a8d917198a0;
```

#### 원인

Spring Boot 테스트에서는 H2, HSQL, Derby 같은 내장 테스트 DB가 있으면, 기존에 설정한 실제 DB 연결 정보를 무시하고 그걸로 자동 교체

#### 해결방법

`@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)` 이 설정으로 테스트에서 사용할 데이터베이스를 Spring Boot가 다른 임베디드 DB로 바꿔치기하지 않도록 설정하는 것

```bash
2026-03-30 17:28:10.120 [Test worker] INFO  o.h.jpa.internal.util.LogHelper - HHH000204: Processing PersistenceUnitInfo [name: default]
2026-03-30 17:28:10.192 [Test worker] INFO  org.hibernate.Version - HHH000412: Hibernate ORM core version 6.6.41.Final
2026-03-30 17:28:10.236 [Test worker] INFO  o.h.c.i.RegionFactoryInitiator - HHH000026: Second-level cache disabled
2026-03-30 17:28:10.568 [Test worker] INFO  o.s.o.j.p.SpringPersistenceUnitInfo - No LoadTimeWeaver setup: ignoring JPA class transformer
2026-03-30 17:28:10.606 [Test worker] INFO  com.zaxxer.hikari.HikariDataSource - HikariPool-1 - Starting...
2026-03-30 17:28:10.796 [Test worker] INFO  com.zaxxer.hikari.pool.HikariPool - HikariPool-1 - Added connection conn0: url=jdbc:h2:mem:test-practice-test user=SA

```

---

# 프로젝트 요구 사항

## 2. 기본 요구사항

`//...`

### 2-6. 단위 테스트

- [x] 서비스 레이어의 주요 메서드에 대한 단위 테스트를 작성하세요.
  - [x] 다음 서비스의 핵심 메서드에 대해 각각 최소 2개 이상(성공, 실패)의 테스트 케이스를 작성하세요.
    - [x] UserService: create, update, delete 메서드
    - [x] ChannelService: create(PUBLIC, PRIVATE), update, delete, findByUserId 메서드
    - [x] MessageService: create, update, delete, findByChannelId 메서드
  - [x] `Mockito`를 활용해 Repository 의존성을 모의(mock)하세요.
  - [x] `BDDMockito`를 활용해 테스트 가독성을 높이세요.

<br>

### 2-7. 슬라이스 테스트

- [x] 레포지토리 레이어의 슬라이스 테스트를 작성하세요.
  - [x] `@DataJpaTest`를 활용해 테스트를 구현하세요.
  - [x] 테스트 환경을 구성하는 프로파일을 구성하세요.
    - [x] `application-test.yaml`을 생성하세요.
    - [x] 데이터소스는 H2 인메모리 데이터 베이스를 사용하고, PostgreSQL 호환 모드로 설정하세요.
    - [x] H2 데이터베이스를 위해 필요한 의존성을 추가하세요.
    - [x] 테스트 시작 시 스키마를 새로 생성하도록 설정하세요.
    - [x] 디버깅에 용이하도록 로그 레벨을 적절히 설정하세요.
  - [x] 테스트 실행 간 `test` 프로파일을 활성화 하세요.
  - [x] JPA Audit 기능을 활성화 하기 위해 테스트 클래스에 `@EnableJpaAuditing`을 추가하세요.
  - [진행 중] 주요 레포지토리(User, Channel, Message)의 주요 쿼리메서드에 대해 각각 최소 2개 이상(성공, 실패)의 테스트 케이스를 작성하세요.
    - [진행 중] 커스텀 쿼리 메서드
    - [x] 페이징 및 정렬 메서드
- [ ] 컨트롤러 레이어의 슬라이스 테스트를 작성하세요.
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

`//...`

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint7](https://github.com/JungH200000/10-sprint-mission/tree/sprint7)
