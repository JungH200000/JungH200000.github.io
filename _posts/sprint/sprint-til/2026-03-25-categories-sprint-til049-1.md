---
title: '[TIL 49일 차] Spring TDD'
excerpt: '5.Spring 서비스 계층 테스트 ~ 8.테스트 주도 개발(TDD)'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til049-1

toc: true
toc_sticky: true

date: 2026-03-25
last_modified_at: 2026-03-25
---

# Spring TDD

## <span style="background-color: #FFF9C4">5. Spring Service 계층 테스트</span>

### 5-01. Service 계층 테스트의 목적

비즈니스 로직의 정확성, 트랜잭션 일관성, 예외 처리 규약 준수, 외부 시스템과의 상호작용 계약을 점검

#### 1) 테스트 대상 선정

- 테스트해야 할 것
  - 비즈니스 로직이 포함된 메서드
  - 트랜잭션이 필요한 메서드
- 테스트하지 말아야 할 것
  - 단순 위임 메서드
  - DTO 변환 메서드

#### 2) 테스트 방법 개요

- 단위 테스트
  - Mockito를 활용한 의존성 대체
  - 비즈니스 로직 검증
- 통합 테스트
  - 실제 의존성 활용 (DB, 실제 JPA, 외부 API Stub 서버 등)
  - 트랜잭션 롤백 테스트

#### 3) 테스트 4대 목적

- 비즈니스 로직의 정확성 검증
  - 요구사항을 정확히 구현했는지 확인
  - JUnit5 + Fake 저장소 사용
- 트랜잭션 동작 보장
  - 성공 시 커밋, 실패 시 롤백
  - `@Transactional` 사용
- 예외 처리 검증
  - 명세된 예외 타입/메시지/코드 준수
- 외부 시스템 연동 검증
  - 계약(요청/응답 스키마, 호출 횟수/순서, 타임아웃/재시도 정책)을 검증

<br>

### 5-02. 테스트 대상

#### 1) 테스트해야 할 것

- 비즈니스 로직이 포함된 메서드
- 트랜잭션이 필요한 메서드
- 외부 연동 게약(순서/횟수/파라미터)
- 예외 정책(타입/코드/메시지)

#### 2) 테스트하지 말아야 할 것

- 단순 위임 메서드 (로직 없이 다른 메서드만 호출)
- DTO 변환 메서드 (단순 매핑, getter/setter)

<br>

### 5-03. Service 계층 테스트 방법

- 단위 테스트(Unit Test)
  - **목적** : 비즈니스 규칙의 정확성, 분기, 계산 검증 (빠른 피드백)
  - 의존성을 Mockito로 대체하여 Service 로직만 격
- 통합 테스트(Integration Test)
  - **목적** : 실제 의존성과 연결, 트랜잭션, 영속성 동작 검증
  - 인메모리/로컬 리소스(H2, 파일, 인메모리 메시지 브로커 등)를 사용하여 실제처럼 동작하는 전체 흐름을 구성

---

## <span style="background-color: #FFF9C4">6. Spring Controller 테스트</span>

### 6-01. API 계층 테스트의 목적

Spring Web 계층은 HTTP 요청 ➡️ 파싱/검증 ➡️ Service 호출 ➡️ 응답을 담당한다. Controller 테스트는 서버를 띄우지 않고(ex: MockMvc) 이 흐름이 명세대로 동작하는지 검증

#### 1) 요청 처리의 정확성 검증

Controller가 경로/메서드/파라미터를 올바르게 해석하고 Service로 정확히 위임하는지 검증

#### 2) 입력값 검증

Bean Validation으로 필수/형식/길이 규칙을 선언하고, 검증 실패 시 400+오류 메시지를 보장

#### 3) 응답 상태와 형식 검증

성공/실패 상태 코드와 JSON 스키마(필드명/자료형/페이징 메타)가 명세와 동일한지 확인

#### 4) 예외 처리 검증

글로벌 예외 처리기가 도메인/검증 예외를 일관된 에러 형식으로 변환하는지 확인

<br>

### 6-02. API 계층의 테스트 대상

#### 1) 테스트해야 할 것

- 요청 본문 검증이 필요한 엔드포인트
  - Bean Validation (유효성 검증) 로직
- 커스텀 예외 처리가 있는 엔드포인트
  - `@ControllerAdvice`와 `@ExceptionHandler`로 정의한 오류 처리’

#### 2) 테스트하지 말아야 할 것

- 단순 Service 호출 위임 메서드
- 단순 DTO 변환 메서

#### 3) `@SpringBootTest`를 이용한 API 계층 테스트 기본 구조

- 슬라이스 테스트
  - MVC 계층만 빠르게 검증
  - `@WebMvcTest(Controller_클래스.class)` 사용
- 통합형 테스트
  - 전체 애플리케이션 컨텍스트를 함께 올려 검증
  - `@SpringBootTest` 사용

```java
@WebMvcTest(Controller_클래스.class)
@AutoConfigureMockMvc      // MockMvc 자동 구성(Http Request를 위해 필요한 것들만 불러옴)
public class ControllerTestDefaultStructure {

    @Autowired
    private MockMvc mockMvc; // HTTP 요청 시뮬레이션 도구

    @Test
    void exampleTest() throws Exception {
        // given: 요청 바디, 파라미터 준비
        // when: mockMvc.perform()로 요청 전송
        // then: 상태코드, 응답 본문, 헤더 검증
    }
}
```

<br>

### 6-03. API 계층 테스트 코드 작성 방법

#### 1) `@WebMvcTest`

Spring Boot 테스트 환경에서 Spring MVC 관련 컴포넌트만 로딩하는 애너테이션

즉, Controller, `@ControllerAdvice`, JSON 변환기(ObjectMapper), Validator 등 웹 계층 동작에 필요한 Bean만 초기화

- `@WebMvcTest(controllers = ...)`는 지정한 Controller 클래스만 로딩
- MockMvc를 사용하면 **톰캣 서버 없이** HTTP 요청/응답을 시뮬레이션 가능
- Service나 Repository 계층은 로딩되지 않기 때문에, 필요한 경우 `@MockitoBean`을 사용하여 해당 Bean을 Mocking해야 한다.
- **장점**
  - 테스트 속도가 빠름
  - 웹 계층 계약(Contract)에만 집중 가능

#### 2) `@WebMvcTest`를 이용한 API 계층 슬라이스 테스트 기본 구조

```java
// test/java/com/example/api/ArticleControllerWebMvcTest.java

@WebMvcTest(controllers = ArticleController.class)  // Controller 슬라이스 로딩
@Import(GlobalExceptionHandler.class)              // 전역 예외 처리기 등록
class ArticleControllerWebMvcTest {

    @Autowired private MockMvc mockMvc;             // HTTP 요청 시뮬레이터
    @Autowired private ObjectMapper om;             // JSON 직렬화/역직렬화 도구

    @MockitoBean private ArticleService articleService; // Service 계층 Mock 처리
}

```

#### 3) POST 요청

요청 본문 검증과 응답 상태/헤더 확인

- 요청 본문 유효할 경우 ➡️ 201 Created + Location 헤더 + JSON 응답
- 요청 본문이 유효하지 않을 경우 ➡️ 400 Bad Request + 에러 코드/메시지

#### 4) GET 요청 테스트

리소스 조회와 예외 처리 검증

- 존재하는 ID 요청 시 ➡️ 200 OK + JSON 본문
- 존재하지 않는 ID 요청 시 ➡️ 404 Not Found + 에러 응답(JSON 형식)

#### 5) Spring Security 통합 테스트

보안이 적용된 Controller는 인증/권한이 테스트에 반영되어야 한다.

- Spring Security는 테스트 시 두 가지 접근 방식을 제공
  - `@WithMockUser` : 간단한 인증 주체를 Mocking
  - `SecurityMockMvcRequestPostProcessors` : `user()`, `jwt()` 등으로 세밀한 인증 설정

---

## <span style="background-color: #FFF9C4">7. 통합 테스트</span>

### 7-01. 통합 테스트에서 `@SpringBootTest` 활용

통합 테스트(Integration Test)는 실제 Service 환경과 최대한 유사하게 애플리케이션을 기동하여 계층 간 연동과 환경 설정이 올바른지 검증하는 테스트

`@SpringBootTest`는 Spring Boot의 전체 `ApplicationContext`를 로딩하여, Service/Repository/AOP/이벤트/환경설정까지 모두 포함한 테스트 환경을 제공

- Bean 의존성 주입이 정상적으로 이루어지는지 검증 가능
- Web/Service/Repository 계층의 연동이 의도대로 동작하는지 검증 가능
- 실제 설정 파일(`application.yml`)과의 결합이 잘 되는지 검증 가능

#### 1) 테스트 프로파일 설정

테스트 환경은 운영 환경과 분리되어야 하며, DB 연결, API 주소, 로깅 레벨 등 모든 설정이 달라질 수 있다.

`application-test.yml`을 작성하고, `@ActiveProfiles`로 선택하면 테스트 실행 시 해당 설정이 적용

<br>

### 7-02. 테스트 데이터 관리

#### 1) 데이터 초기화 전략

- 트랜잭션 롤백 기반
- `@Sql` / `data.sql` 스크립트
- 마이그레이션 도구 활용

#### 2) 테스트 데이터 작성 방식

- Builder/Fixture

#### 3) 격리된 테스트 환경 구성

- 롤백 : 가장 간단하고 빠른 데이터 격리 방식
- TRUNCATE : 멀티 트랜잭션 환경이나 외부 시스템 연동 시 유용한 정리 방식
- `@Testcontainers` : 실제 DB와 유사한 독립적인 테스트 환경을 구성하는 방식
- 시간/랜덤 값 제어: 테스트 결과의 재현 가능성을 높이기 위한 방식

<br>

### 7-03. End-to-End 테스트

실제 사용자가 겪는 단일 시나리오를 시스템 경계를 넘어 끝까지 검증하는 테스트

- 단위/통합 테스트 : 구현 디테일과 계층 연동을 확인
- E2E : 계약과 구성의 총체적 적합성을 확인

#### 1) 필요성

- 장점
  - 기능의 완전성을 검증
  - 사용자 관점 흐름을 확인
- 한계
  - 느리고, 때때로 불안정
  - 실패 시 원인 파악 비용이 큼
- 결론
  - 핵심 사용자 흐름 위주로 적게, 정확히 운영
  - 나머지 대부분은 단위/슬라이스/통합 테스트에서 커버

#### 2) 실제 요청-응답 시나리오

- 테스트 목적
  - Controller ➡️ Service ➡️ Repository까지 HTTP 레벨에서 실제 실행 경로를 검증
- 테스트 범위
  - Tomcat 내장 서버를 띄우고 실제 포트로 요청을 보내며, 결과로 내려오는 상태 코드, 헤더, 본문(JSON)을 계약으로 고정
- 테스트 가치
  - Spring MVC 바인딩, Jackson 직렬화/역직렬화, 트랜잭션 경계, JPA 플러시 타이밍 문제를 조기에 발견
- 환경과 도구
  - 데이터베이스: H2 메모리 DB
  - HTTP 클라이언트 : TestRestTemplate 또는 RestAssured
  - 서버 모드 : `@SpringBootTest(webEnvironment = RANDOM_PORT)`
  - 로깅 : 테스트 프로파일에서 로그만 `debug`, 나머지는 `warn`
- 시나리오 설계 원칙
  - `Given-When-Then` 패턴을 명시적으로 분리
  - 성공 1 + 실패 N
  - API 문서를 계약으로 간주하고 테스트가 그 계약을 강제

#### 3) 외부 시스템 통합

외부 호출을 감싸는 인터페이스를 만들고, 운영에서는 실제 구현된 모듈을, 테스트에서는 임시로 구현된 모듈(테스트 전용 가짜 구현 `@Profile("test")`)을 사용한다. 이렇게 하면 WireMock 같은 도구 없이 외부 의존 통제 가능

#### 4) 전체 기능 검증

여러 엔트포인트를 사용자가 경험할 수 있는 흐름으로 엮어 한 방에 검증

---

## <span style="background-color: #FFF9C4">8. 테스트 주도 개발(TDD)</span>

### 8-01. TDD (Test-Driven Development)

테스트 주도 개발 방식으로, 개발 전에 먼저 테스트를 작성한 후 기능을 구현하는 개발 방법

- 테스트 작성 ➡️ 기능 구현 ➡️ 리팩터링

#### **1) TDD 주기**

- Red : 실패하는 테스트 먼저 작성
- Green : 테스트를 통과할 수 있을 정도로 최소한의 기능 구현
- Refactor : 테스트가 통과한 코드를 리팩터링

#### 2) TDD의 장단점

- 장점
  - 요구사항 분석이 선행되어 명확한 개발 가능
  - 테스트 커버리지가 높아져 안정적인 코드 제공
  - 리팩터링이 안전하게 가능
  - 디버깅 시간 단축
  - 분할 정복에 적합한 구조 유도
  - 결합 발견 시점이 빨라짐
- 단점
  - 초기 개발 속도가 느릴 수 있음
  - 모든 상황에 TDD가 적합하지 않음
  - 경험 부족 시 테스트 품질 저하
  - 테스트 코드 유지에 리소스 소요

#### 3) TDD vs BDD

| 구분 | TDD                                       | BDD                                             |
| ---- | ----------------------------------------- | ----------------------------------------------- |
| 중심 | 개발자 중심의 단위 기능 테스트            | 사용자 중심의 시나리오 테스트                   |
| 문법 | JUnit, Assert 등                          | Given-When-Then 기반 (Cucumber, RestAssured 등) |
| 적합 | 내부 로직 검증, 유틸성 기능 테스트에 적합 | 사용자 시나리오, 비즈니스 로직 테스트에 적합    |
