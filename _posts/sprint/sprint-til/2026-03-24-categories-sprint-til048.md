---
layout: single-editorial
title: '[TIL 48일 차] Spring TDD'
excerpt: '1.Spring 테스트의 이해 ~ 4.Mockito 기초'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til048

toc: true
toc_sticky: true

date: 2026-03-24
last_modified_at: 2026-03-24
---

# Spring TDD

## <span style="background-color: #FFF9C4">1. Spring 테스트의 이해</span>

### 1-01. 테스트(Test)

어떤 대상이 정해진 기준에 부합하는지 검증하는 과정(확인하는 수단)으로, 이를 통해 리스크를 최소화하고, 결과의 신뢰도를 높을 수 있다.

- Postman으로 HTTP 요청을 보내 결과를 확인하는 것도 테스트이다.

<br>

#### 1) 테스트의 필요성

완벽한 테스트는 불가능하지만, 하지 않는다면 아래의 문제 발생 가능

- 심각한 버그로 Service 전체 마비 가능
- 고객에게 잘못된 결과 제공 가능
- 문제 발생 시 원인을 찾기 어려워 수습 비용이 증가

<br>

#### 2) 테스트 수행 시 장점

- 코드 품질 보장
- 리팩토링 용이
- 회귀 테스트 가능
- 문서화 역할
- 협업 효율 향상

<br>

#### 3) 테스트 자동화의 필요성

- 수동 테스트의 한계
  - 매번 서버 실행 후 Postman을 띄우는 과정이 비효율적
  - 테스트 항목이 많아질수록 반복 작업이 과중됨
  - 일부 기능(ex: 특정 메서드만)의 단독 테스트가 어려움
- 수동 테스트의 한계를 해결하기 위해 **단위 테스트 (Unit Test)** 등장

<br>

### 1-02. Spring 테스트의 종류

대부분의 개발 환경에서 세 가지로 구분할 수 있다.

<br>

#### 1) 단위 테스트 (Unit Test)

작은 단위의 기능이나 메서드가 기대한 결과를 정확히 내는지 테스트하는 것

- 단위 테스트는 주로 개별 메서드나 클래스의 동작을 검증한다.
- 따라서 단위 테스트 코드는 보통 메서드 단위로 작성된다.
- **장점**
  - 애플리케이션 전체를 실행하지 않아도 됨
  - 빠르게 반복 수행 가능
  - 자동화하기 쉬움
- Java에서는 `JUnit`, `AssertJ` 등을 사용해 작성 가능
- Spring에서는 계층별 테스트(`@WebMvcTest`, `@DataJpaTest` 등)을 지원하여 범위 제어 가능
- **필요성**
  - 구현한 코드가 의도한 대로 동작하는지 그 결과를 빠르게 확인 가능
  - 작은 단위의 테스트로 미리 버그를 찾을 수 있기 때문에 문제의 원인을 찾는데 상대적으로 적은 시간이 걸림
- **F.I.R.S.T 원칙**
  - Fast : 빠르게 실행할 수 있어야 한다.
  - Independent : 테스트는 서로 독립적이어야 한다.
  - Repeatable : 반복 실행이 가능해야 한다.
  - Self-validating : 성공/실패라는 자체 검증 결과를 보여주어야 한다.
  - Timely : 기능 구현을 하기 직전에 작성해야 한다.

<br>

#### 2) 기능 테스트

애플리케이션을 사용하는 사용자 입장에서 애플리케이션이 제공하는 기능이 올바르게 동작하는지를 테스트

- 기능 테스트의 주체는 일반적으로 테스트 전문 부서(QA 부서) 또는 외부 QA 업체가 된다.

<br>

#### 3) 통합 테스트 (Integration Test)

- 클라이언트 측 툴 없이 개발자가 짜 놓은 테스트 코드를 실행시켜서 이루어지는 경우가 많음
- 애플리케이션을 만든 개발자 또는 개발팀이 테스트의 주체가 되는 것이 일반적

<br>

#### 4) 슬라이스 테스트 (Slice Test)

애플리케이션을 특정 계층으로 쪼개어서 하는 테스트

- HTTP 요청이 필요하고, 외부 Service가 연동되기도 하고, 데이터 엑세스 계층의 경우 DB와 연동되어 있기 때문에 단위 테스트 보다는 슬라이스 테스트라고 부른다.

<br>

### 1-03. Spring Test 모듈 소개

Spring Boot에서는 `spring-boot-starter-test`를 통해 다양한 테스트 기능 사용 가능

```groovy
// build.gradle
dependencies {
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
}
```

- JUnit, Mockito, AssertJ, Hamcrest, Spring Test, JSONassert, Spring Boot Test 등을 자동으로 포함

<br>

#### 1) 테스트 관련 애너테이션

`@SpringBootTest`, `@WebMvcTest`, `@DataJpaTest`, `@MockitoBean`, `@MockitoSpyBean`, `@Test`, `@BeforeEach`, `@AfterEach`

<br>

#### 2) 테스트 데이터 초기화

테스트의 신뢰성과 반복 가능성을 높이기 위해 초기 데이터를 설정하는 것이 중요하다.

- **목적**
  - 결정론적 테스트 : 언제 실행하든 결과 동일
  - 테스트 독립성 : 테스트 간 영향 최소화
  - 경계 조건 테스트 : 특정 상태의 데이터에서 시스템이 잘 동작하는지 확인
  - 가독성 향 : 테스트 전제 조건을 코드에 명확히 표현
- `@Sql` 애너테이션 사용

<br>

#### 3) 테스트 환경 격리

테스트 환경을 서로 격리시키는 것은 테스트 간 상호작용을 막고 신뢰도를 높이는 데 매우 중요

- 트랜잭션 롤백 기반 격리
- 테스트 순서 제어
  - 테스트는 가능하면 순서에 의존하지 않도록 구성하는 것이 유지보수에 유리

---

## <span style="background-color: #FFF9C4">2. JUnit 5 기초</span>

### 2-01. JUnit 5 구조

3개의 주요 구성 요소로 나뉜다.

<br>

#### 1) JUnit Platform

테스트 프레임워크를 실행하기 위한 기반 런타임으로, Jupiter든 Vintage든 모두 Platform 위에서 실행된다.

- JUnit 5 환경에서 Gradle과 Maven이 내부적으로 JUnit Platform을 통해 테스트를 수행한다.

<br>

#### 2) JUnit Jupiter

JUnit 5에서 새롭게 정의된 테스트 API

- 테스트 애너테이션 :
  - `@Test` : 테스트 메서드를 정의하는 기본 애너테이션으로, 반환 타입은 반드시 `void`
  - `@BeforeEach`
    - 각 테스트 메서드 실행 전에 호출
    - 목적 : 공통 입력값, 객체 준비
  - `@AfterEach`
    - 각 테스트 메서드 실행 후에 호출
    - 목적 : 로그 출력, 리소스 닫기
  - `@BeforeAll`
    - 테스트 클래스에서 최초 1회만 실행, 반드시 `static` 메서드로 선언
    - 목적 : DB 연결 및 고용 자원 초기화
  - `@AfterAll`
    - 테스트 클래스 종료 시 1회만 실행, 반드시 `static` 메서드로 선언
    - 목적 : DB 연결 해제, 종료 로그
  - `@DisplayName` : 테스트 명세화에 사용

<br>

#### 3) JUnit Vintage

기존의 JUnit 3, 4 기반 테스트를 JUnit 5 플랫폼 위에서 실행할 수 있도록 지원하는 엔진

- 필요성
  - 기존 코드베이스에서 JUnit 4를 많이 사용하고 있음
  - JUnit 5로 점진적으로 마이그레이션을 돕기 위해
- 의존성
  - JUnit Platform에서 JUnit 3/4 테스트를 실행하려면 `junit-vintage-engine`이 필요
  ```groovy
  // build.gradle
  dependencies {
      testImplementation 'org.junit.vintage:junit-vintage-engine:5.9.3'
      testImplementation 'junit:junit:4.13.2' // JUnit 4(4.12 이상)도 함께 필요함
  }
  ```

<br>

### 2-02. Assertions 활용

테스트는 결국 “예상 결과”가 실제 코드 실행 결과와 일치하는지 검증하는 행위

- Assertion가 가장 많이 사용되는 기능
  - 특정 조건이 true인지 확인
  - 조건 불만족시 실패로 처리
  - 테스트 코드의 가독성과 신뢰성을 높이는 핵심 요소

<br>

#### 1) Given-When-Then

BDD(Behavior Driven Development) 스타일에서 자주 사용하는 테스트 작성 방식

- Given : 테스트에 필요한 입력 값 및 전제 조건 설정
- When : 테스트할 대상 메서드 호출
- Then : 기대한 결과를 Assertion으로 검증

테스트 목적을 쉽게 파악 가능

<br>

#### 2) 기본 검증 메서드

JUnit Jupiter (JUnit 5) 기준 가장 많이 사용하는 Assertion 메서드

- `assertEquals(expected, actual)` : 예상값과 실제값이 같은지 비교
- `assertNotEquals(unexpected, actual)` : 예상값과 실제값이 다른지 비교
- `assertTrue(condition)` : 조건이 true인지 확인
- `assertFalse(condition)` : 조건이 false인지 확인
- `assertNull(object)` : 객체가 null인지 확인
- `assertNotNull(object)` : 객체가 null이 아닌지 확인

<br>

#### 3) 그룹 검증 : `assertAll()`

여러 조건을 하나의 테스트 내에서 모두 검증할 때 사용하는 Assertion 메서

```java
// then
assertAll(
        "이름 검증",
        () -> assertEquals("Lee", firstName),            // 이름 일치 여부 확인
        () -> assertEquals("Jungmin", lastName),        // 성 일치 여부 확인
        () -> assertTrue(firstName.length() <= 5)       // 길이 제한 확인
);
```

<br>

#### 4) 예외 검증 : `assertThrows()`

예외가 발생해야 하는 상황을 테스트할 때 사용하는 Assertion 메서드

```java
// when & then
IllegalArgumentException thrown = assertThrows(IllegalArgumentException.class,
        () -> {
            throw new IllegalArgumentException("잘못된 인자입니다.");
        }
);
```

<br>

### 2-03. 테스트 라이프사이클 (**Test Lifecycle)**

테스트 클래스의 인스턴스가 생성되고 종료되는 시점, 각 테스트 메서드의 실행 순서 및 전후 처리 과정을 제어하는 일련의 흐름을 말함

- `@Test` 메서드를 나열하는 것만으로 유지보수가 어렵기 때문에, 라이플사이클을 고려한 설계가 중요

<br>

#### 1) 테스트 인스턴스의 생명주기

JUnit 5에서 테스트 클래스는 기본적으로 테스트 메서드마다 새로운 인스턴스를 생성함. 즉, `@Test`가 5개 있다면 테스트 클래스는 5번 인스턴스화 됨. 이것을 `PER_METHOD`라고 부름

- 상태 공유가 필요한 경우
  - `@TestInstance(TestInstance.Lifecycle.PER_CLASS)`를 설정하여 클래스 단위로 한 번만 인스턴스를 생성

<br>

#### 2) 테스트 전후 후킹 메서드 (Setup/Teardown)

- 테스트 실행 전후에 특정 메서드 자동 실행해주는 후킹(Hook) 애너테이션
- `@BeforeEach`, `@AfterEach`, `@BeforeAll`, `@AfterAll` - [설명 바로가기](#2-junit-jupiter)

<br>

#### 3) 테스트 순서 결정

JUnit 5는 테스트 간 의존성 방지를 위해, 기본적으로 테스트 순서는 비결정적(실행 순서 보장X)

- 테스트 간 독립성 보장을 위한 설계
- 순서 명시 애너테이션
  - `@TestMethodOrder(...)` : MethodOrderer를 이용해 테스트 메서드 실행 순서 정의
    - MethodOrderer
      - `OrderAnnotation.class`, `MethodName.class`, `DisplayName.class`, `Random.class`, 커스텀 구현
  - `@Order(int)` : 실행 순서를 지정할 숫자(`int`) 설정

<br>

#### 4) 테스트 그룹화: Nested 개발

JUnit 5에서 제공하는 `@Nested`는 테스트 클래스 내에서 내부 클래스를 사용해 관련 테스트들을 그룹화 할 수 있게 해주는 애너테이션

- **장점**
  - 유사 기능끼리 묶어서 보기 쉽게 만들 수 있음
  - 계층적 구조로 테스트 코드 관리 가능
  - `@BeforeEach`, `@AfterEach` 같은 전처리/후처리 사용 시 해당 그룹 내부에만 적용 가능

```java
@Nested
class LoginTest {
    @Test
    void successLogin() {
        System.out.println("성공적인 로그인 테스트");
    }
}
```

---

## <span style="background-color: #FFF9C4">3. Spring Data JPA 테스트</span>

### 3-01. 데이터 엑세스 계층 테스트의 목적

**데이터 액세스 계층 테스트(Data Access Layer Test)**는 DB와 직접적으로 상호작용하는 코드를 대상으로 하여 정확성, 무결성, 신뢰성을 검증하는 테스트

- 데이터 영속성 검증
  - 엔티티 객체가 DB에 저장되고, 다시 불러와도 동일한 값이 유지되는지 검증하는 것이 이 테스트의 핵심
  - 영속성(Persistence)이란 애플리케이션 메모리 밖에서 데이터를 저장해두는 성질을 의미
- 데이터 정합성 보장
  - 정합성(Consistency)이란 데이터의 논리적 일관성을 의미
- DB 제약조건 검증
  - `NOT NULL` ➡️ `DataIntegrityViolationException` 예외 발생
  - `UNIQUE` ➡️ `DataIntegrityViolationException` 예외 발생
  - `FOREIGN KEY` ➡️ `ConstraintViolationException` 예외 발생
- 쿼리 결과 정확성 검증
  - 개발자가 작성한 JPQL, SQL, Native Query, QueryDSL 등의 쿼리가 예상한 데이터를 정확하게 반환하는지 확인

<br>

### 3-02. 데이터 엑세스 계층의 테스트 대상

데이터 액세스 계층은 DB와 직접 연결되는 민감한 계층이기에 테스트가 매우 중요하지만, 모든 메서드를 테스트하는 것은 비효율적이다.

그래서 "무엇을 테스트할지"와 "무엇을 테스트하지 않을지"를 명확히 구분하는 것이 중요

<br>

#### 1) 테스트해야 할 대상

- 직접 작성한 `@Query`
  - `@Query`는 JPQL 또는 Native SQL을 수동으로 작성하기 때문에 반드시 테스트해야 한다.
- 조건이 2개 이상 조합된 메서드명 쿼리
  - Spring Data JPA가 메서드명을 기반으로 쿼리를 생성하는데, 이때 조건이 많아지면 자동 생성 로직이 정확히 작동하는지 확인이 필요

<br>

#### 2) 테스트하지 말아야 할 대상

- 기본 제공 메서드
  - Spring Data JPA가 기본적으로 제공하는 메서드는 충분히 검증된 메서드이기 때문에 테스트 불필요
- 단순한 메서드명 쿼리
  - `findByEmail(String email);` 같은 단일 조건의 단순 메서드명 쿼리는 테스트 대상에서 제외
  - 다만, 비즈니스 로직상 매우 중요한 Entity 필드일 경우(예: 로그인 조건) 예외적으로 테스트 가능

<br>

### 3-03. 데이터 엑세스 계층의 테스트 방법

#### 1) 데이터 엑세스 계층 테스트의 핵심 규칙

테스트 케이스 실행 이후, 데이터베이스 상태는 반드시 초기 상태로 되돌려져야 한다. ➡️ 테스트를 완전 격리하기 위해서

테스트 간 의존성을 없애고, 각 테스트가 사용할 데이터는 직접 삽입하거나 준비해야 하며, 테스트 후에는 DB가 원상복구되어야 한다.

- 이유
  - 테스트 간 데이터가 공유되면 테스트 결과에 영향을 주는 순서 의존성 문제가 발생 가능
  - 테스트는 독립적인데, 반복 실행해도 항상 동일한 결과를 반환해야 한다.
  - CI/CD에 적용하는 경우, 불안정한 테스트는 배포 파이프라인에 치명적

<br>

#### 2) `@DataJpaTest`를 활용한 슬라이스 테스트

`@DataJpaTest`는 Spring Boot에서 JPA Repository 계층을 테스트할 때 사용하는 전용 슬라이스 테스트 애너테이션

- 장점
  - 전체 애플리케이션 컨텍스트를 로딩하지 않고, JPA 관련 Bean만 선별적으로 등록하여 빠르고 가벼운 JPA 테스트 환경 구축 가능
  - 자동으로 `@Transactional`이 적용되기 때문에 각 테스트 실행 후 데이터는 자동으로 롤백됨
- 아래의 구성 요소만 자동 로딩
  - `@Entity` 클래스들, `Repository` 인터페이스, `DataSource`, `JdbcTemplate`, `EntityManager`, `TransactionManager`

<br>

#### 3) 테스트 데이터 준비 전략

- `@BeforeEach`
  - 간단한 공통 데이터만 필요한 경우 사용
  - 테스트 실행 전 공통 데이터 직접 생성
  - 빠르게 시작 가능하고 중복 발생 가능
- Fixture 클래스
  - 여러 테스트에서 동일한 구조의 객체를 반복 생성할 때 사용
  - 코드 중복 제거, 재사용 가능, 의도 표현이 명확
- Fixture + Builder
  - 다양한 필드 조합이 필요한 경우 사용
  - 유연성과 재사용성 동시 확보 가능

<br>

#### 4) 결과 검증 방식

JPA Repository 테스트에서 결과를 검증하는 방식은 크게 두 가지로 나뉘고, 모두 `@DataJpaTest` 슬라이스 테스트에서 매우 적합한 검증 전략

Repository 계층에서 실제로 발생하는 데이터 조회/저장 결과만 집중적으로 확인하는데 사용됨

- 상태(리턴값) 검증
  - 특정 쿼리 메서드가 예상대로 작동하는지 확인
    - 즉, JPA 쿼리 메서드의 동작 여부 자체를 테스트
  - `findByEmail()` 같은 단건 조회 메서드의 정확한 동작 확인에 적합함
- DB 상태 검증
  - 저장된 Entity 개수와 필드 값이 올바르게 반영되었는지 확인
    - 즉, JPA의 저장 및 조회 동작만 검증
  - `findAll()` 같은 저장된 Entity 수와 필드 값이 예상과 일치하는지 확인
    - 리스트에서 특정 필드만 추출해 비교 ➡️ 다수의 Entity 속성 검증에 매우 유용

<br>

#### 5) 기타 환경

Spring Boot에서 각 기술에 맞는 슬라이스 테스트 애너테이션을 통해 효율적으로 Repository 테스트 가능

- Spring JDBC : `@JdbcTest`
  - 순서 JDBC 환경에서 Repository 테스트할 때 사용하는 애너테이션
  - JPA 관련 설정 로딩 X
- Spring Data JDBC : `@DataJdbcTest`
  - Spring Data JDBC 기반 Repository 테스트할 때 사용
  - ex: `CrudRepository`, `PagingAndSortingRepository`

---

## <span style="background-color: #FFF9C4">4. Mockito 기초</span>

### 4-01. Mock

- Mock이란 진짜인 것처럼 보이도록 유사한 상황이나 동작을 흉내낸 것
- **테스트에서의 Mock**은 가짜 객체(fake object)를 의미
- Mocking은 단위 테스트, 슬라이스 테스트 등에서 진짜 객체 대신 사용하는 가짜 객체를 만드는 작업

<br>

#### 1) 테스트에서 Mock 객체를 사용하는 이유

- 실제 객체 사용의 한계
  - 테스트 속도가 느리고 불안정함
  - 외부 API나 DB까지 연동되는 전 계층이 테스트에 포함됨
  - 테스트 대상 외부 요소(Service, Repository)의 동작까지 함께 테스트 되기 때문에 관심사 분리가 어려움
- 장점
  - 불필요한 의존을 제거하고 단위에 집중된 테스트를 할 수 있다.

<br>

#### 2) Mockito

테스트 대상 클래스의 의존 객체를 가짜(Mock) 객체로 만들어주는 Mocking 프레임워크

- Mock 객체 생성, 동작 설정, 호출 검증 등을 손쉽게 제공
- 테스트의 정확성, 독립성, 실행 속도를 보장하는데 큰 역할
- Spring Framework는 `@MockitoBean` 등으로 Mockito와 자연스럽게 통합되어 있음
- **사용 시기**
  - 외부 API나 DB 등 실제 객체 사용이 부담될 때
  - 테스트 대상이 아닌 다른 계층의 동작을 무시하고 싶을 때
- 사용 하지 않아도 될 때
  - 단순한 Java 객체 간 상호작용 테스트
  - 실제 DB와의 연동 테스트
  - Service 로직을 통합적으로 검증할

<br>

### 4-02. Mockito 기본 기능

#### 1) 생성 방법

- `Mockito.mock()`
- `@Mock` + `@ExtendWith(MockitoExtension.class)`
- `@MockitoBean`

<br>

#### 2) Mock 객체 주입 기법

Mock 객체를 생성한 뒤 테스트 대상 클래스에 주입하는 방법

- 생상자 주입
- `@InjectMocks` 애너테이션
- `@MockitoBean` + Spring Context 주입(`@Autowired`)

`@MockitoBean`은 통합 테스트에서만 사용

단위 테스트에는 `@Mock` + `@InjectMocks` 조합이 권장됨

<br>

### 4-03. Mock 객체 동작 정의

#### 1) 필요성

Mock 객체는 테스트 중 외부 의존 객체의 실제 동작을 흉내 내기 위해 사용되는데, 기본적으로 모든 메서드는 `null`, `false`, `0`, 빈 컬렉션 등을 반환하므로, 명시적으로 원하는 동작을 설정해줘야 한다.

아래 두 가지 기능으로 설정

<br>

#### 2) `when(...).thenReturn(...)`

Mock 객체가 특정 메서드를 호출받았을 때 어떤 값을 반환할지를 정의하는 문법으로, Mock 객체의 **상태(결과)를 설정**하는 도구라고 할 수 있다.

- `when(mockObject.methodCall(arguments)).thenReturn(expectedValue);`
  - "mockObject의 someMethod가 주어진 args로 호출되면, value를 반환해라."
- 용도
  - 실제 객체 대신 가짜 객체(mock)를 만들어 테스트할 때 사용
  - 주로 Service 테스트 시 Repository를 Mock 처리할 때 활용

<br>

#### 3) `verify(...)`

Mockito에서 Mock 객체가 실제로 호출되었는지 확인하는 검증 메서드로, Mock 객체의 **행위(호출)를 검증**하는 도구라고 할 수 있다.

결과값을 확인하는 상태 검증(State Verification)이 아니라 테스트 대상 코드가 예상한 동작을 수행했는지를 확인하는 행동 검증(Behavior Verification) 방식

- 용도
  - 특정 메서드가 호출되었는지 여부 확인
  - 호출 횟수나 호출 순서 검증 가능

<br>

#### 4) `ArgumentMatchers` 활용

`any()`, `eq()`, `anyString()` 등 다양한 인자 조건을 설정할 수 있는 유틸 클래스로, `when(...)` 또는 `verify(...)` 내에서 파라미터 값을 유연하게 처리할 수 있게 해줌

- `any()` : 어떤 객체든 허용
- `anyString()` : 어떤 문자열이든 허용
- `eq("value")` : 정확히 해당 값과 일치할 때만 매칭
- `anyInt()`, `anyLong()` : 숫자형 타입 매칭

<br>

#### 5) 추가적인 Mock 동작 기법

- `doThrow()` : 예외 발생 시뮬레이션
- `doNothing()` : 아무 동작도 하지 않도록 설정
- `doAnswer()` : 커스텀 응답 설정

---
