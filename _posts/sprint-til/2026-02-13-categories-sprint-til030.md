---
title: '[TIL 30일 차] RESTful APIs 설계와 구현'
excerpt: 'RESTful API 구현: 기본 ~ API 문서화'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til030/

toc: true
toc_sticky: true

date: 2026-02-13
last_modified_at: 2026-02-13
---

# 오늘의 학습

## <span style="background-color: #FFF9C4">1. RESTful API 구현: 기본</span>

### 1-01. `@RestController` 활용

`@Controller`는 요청에 대해 **HTML View 템플릿**을 반환데 사용되는데 반해, `@RestController`는 **JSON, XML, 파일 등 실제 데이터 자체를 반환**한다. ➡️ REST API 개발에 주로 사용됨

- `@RestController = @Controller + @ResponseBody`

#### 1) `ResponseEntity`로 응답 제어

`ResponseEntity<T>`는 HTTP 응답의 **전체 구조(상태 코드, 헤더, 바디)**를 개발자가 직접 제어할 수 있도록 도와주는 스프링 클래스

```java
@PostMapping("/api/users")
public ResponseEntity<UserDto> create(@RequestBody CreateUserDto dto) {
    UserDto saved = userService.create(dto);
    URI location = URI.create("/api/users/" + saved.getId());

    return ResponseEntity.created(location)       // 201 상태 코드 + Location 헤더
                         .header("X-Request-ID", UUID.randomUUID().toString())
                         .body(saved);            // 응답 본문
}
```

<br>

#### 2) HTTP 메시지 컨버터(`MessageConverter`)의 동작 방식

`MessageConverter`는 Spring에서 요청 본문을 자바 객체로 변환하거나, 자바 객체를 응답 본문으로 직렬화할 때 사용하는 컴포넌트

- 요청 흐름: `HTTP JSON 요청 → HttpMessageConverter → @RequestBody → Java 객체`
- 응답 흐름: `Java 객체 → @ResponseBody or ResponseEntity → HttpMessageConverter → HTTP 응답 JSON`

<br>

#### 3) Content Negotiation (콘텐츠 협상)

클라이언트 요청의 `Accept` 헤더에 따라 응답의 `Content-Type`을 결정하는 것

`Accept: application/json` ➡️ JSON 응답

<br>

### 1-02. Controller에서의 요청 처리

#### 1) `@PathVariable` 활용

URI 경로의 일부를 변수로 받아오는 애너테이션

```java
@GetMapping("/users/{id}")
public UserDto get(@PathVariable UUID id) { ... }
```

<br>

#### 2) `@RequestParam` 활용

HTTP 요청의 쿼리 파라미터 또는 form-data를 컨트롤러 메서드 파라미터로 바인딩

- 여러 값이 전달될 경우 ➡️ `List<String>` 또는 `MultiValueMap<String, String>` 사용 가능

```java
@GetMapping
public Page<ProductDto> search(@RequestParam(defaultValue = "all") String category) {...}
```

<br>

#### 3) `@RequestBody` 활용과 검증

HTTP Body(JSON/XML 등)를 객체로 역직렬화하여 컨트롤러에 전달

- `@Valid` 애너테이션과 함께 사용하면 자동 유효성 검증 가능

```java
@PostMapping("/signup")
public ResponseEntity<MemberDto> signup(@Valid @RequestBody SignupRequest request) {...}
```

<br>

### 1-03. Controller에서의 응답 처리

#### 1) API 응답 객체 설계

- **응답 객체 설계 이유**
  - 프론트엔드와의 **예측 가능한 통신**
  - 응답 결과에 대한 **정형화된 처리 로직** 구현
  - 응답 정보의 **확장성과 유지보수성** 확보
- **장점**
  - 성공/실패 응답을 명확히 구분
  - 모든 응답이 동일한 형태 ➡️ 클라이언트에서 예외 처리 일관성 확보

<br>

#### 2) Jackson을 활용한 JSON 직렬화 제어

Jackson은 Spring에서 다양한 애너테이션을 통해 Java 객체를 JSON 문자열로 자동 변환하는 라이브러리

- 애너테이션 종류
  - `@JsonProperty("필드명의 별칭")`
  - `@JsonInclude(JsonInclude.Include.NON_NULL)`
  - `@JsonIgnore`
  - `@JsonFormat(pattern = ...)`

<br>

#### 3) 다양한 응답 형식 처리

- 파일 다운로드(PDF, 이미지 등)
  - `ResponseEntity<Resource>` 형태로 반환 + `Content-Type`과 `Content-Disposition` 지정
- XML 응답 처리
  - `produces = MediaType.APPLICATION_XML_VALUE`로 XML 응답 처리 가능

<br>

### 1-04. Spring 예외 처리

#### 1) `RestControllerAdvice`

여러 컨트롤러에서 발생한 예외를 **공통적으로 처리**할 수 있는 클래스에 사용하는 애너테이션

- 내부적으로 `@ControllerAdvice` + `@ResponseBody`가 결합된 구조

<br>

#### 2) 공통 예외 처리

- **기존 컨트롤러 방식**
  - 각 컨트롤러마다 `@ExceptionHandler`를 작성하기 때문에 **중복 코드가 증가하고, 유지 보수에 어려움**이 있다.
- **공통 처리 클래스** - GlobalExceptionAdvice 클래스 구현
  - 내부에 예외 핸들러 메서드 구현: `@Valid`에서 발생하는 예외 처리
    - DTO 검증 실패 예외 처리
    - URI 변수 검증 실패 예외 처리

---

## <span style="background-color: #FFF9C4">2. RESTful API 구현: 심화</span>

### 2-01. 연관 리소스의 URI 설계 전략 및 표현 방식

#### 1) 설계 전략

- 중첩 리소스 표현 (Nested Resource)
  - 계층적 관계에 있는 리소스의 URI를 표현할 때 사용하는 방식
  - 상위 리소스와 하위 리소스 사이의 소유 관계(has-a)를 표현할 때 사용
  - 예시 : `POST /articles/10/comments` = 특정 게시글(10)의 댓글 생성
- 독립 리소스 표현 (Flat Resource)
  - 연관된 리소스라 하더라도 **각각의 URI를 독립적으로 표현**하는 방식
  - **리소스 간 연관 관계는 쿼리 파라미터**를 통해 표현됨
  - 주로 리소스가 **서로 독립적**일 때 사용

<br>

#### 2) 표현 방식 (응답 페이로드)

- 리소스 식별자 포함 (Reference 방식)
  - 연관 리소스를 직접 포함하는 대신 **ID만 제공**
  - 필요 시 클라이언트에서 별도의 API 요청을 해야 함.
- 리소스 임베딩 (Embedded 방식)
  - 연관 리소스의 상세 정보를 함께 응답에 포함시키는 방식
  - 클라이언트가 추가 요청 없이 바로 정보 사용이 가능함.

<br>

### 2-02. HATEOAS

HATEOAS(Hypermedia As The Engin Of Application State)는 REST 아키텍처의 핵심 제약조건 중 하나로, **응답 안에 링크 정보를 포함시켜 클라이언트가 어떤 요청을 보낼 수 있는지를 안내하는 방식**

#### 1) Spring HATEOAS 주요 구성 요소

`EntityModel<T>`, `CollectionModel<T>`, `linkTo()`, `methodOn()`, `.withSelfRel()`, `.withRel("name")` 등

<br>

### 2-03. API 버전 관리

API는 시간이 지남에 따라 “요구사항 변화”와 “성능 개선 또는 내부 구조 변경”, “기능 분리 혹은 통합”으로 인해 변경될 수 있다.

이때 **기존 사용자에게 영향을 주지 않고 새로운 API를 제공하려면 버전 관리(versioning)**가 필요하다.

- **핵심 목표**
  - 하위 호환성 유지
  - 점진적 전환 유도
  - API 문서화에 용이

#### 1) URI 기반 버전 관리

가장 보편적인 방식으로, **URI 경로에 버전 정보를 포함**시키는 것

- 예시: `/v1/members` 와 `/v2/members`
- 이로 인해, 클라이언트는 어떤 버전을 호출할지 선택할 수 있고, RESTful한 구조에서 어긋나지 않는다.

<br>

#### 2) 헤더 기반 버전 관리

**HTTP 요청 헤더**에 버전 정보를 포함시켜 API버전을 분기하는 방식

- 클라이언트는 URI를 동일하게 유지하면서, **헤더 값에 따라** 버전 분기를 처리
- 예시
  - `@GetMapping(produces = "application/vnd.myapp.v1+json")`
  - `@GetMapping(produces = "application/vnd.myapp.v2+json")`

<br>

#### 3) 하위 호환성 유지 전략

- **전략**
  - Deprecated 표시 : 기존 버전 유지 및 문서화로 전환 유도
  - Graceful Degradation : 새 필드가 추가되어도, 기존 필드 유지
  - 응답 포맷 안정성 : 새 필드 선택적 적용
- **버전 제거 타이밍**
  - 로그 분석 후 구버전 사용률이 10% 미만일 때 폐기 고려
  - 공지 후 유예 기간 부여

---

## <span style="background-color: #FFF9C4">3. API 문서화</span>

### 3-01. Spring REST Docs

테스트 코드를 기반으로 실제 API 요청과 응답을 기록하여 문서를 자동으로 만들어주는 도구

- 테스트가 통과한 스펙만 스니펫이 생성되므로 **문서 신뢰도가 높다**
- 문서 스니펫 생성 로직은 보통 `src/test`**의 테스트 코드**에서 작성한다
- 스니펫은 `build/generated-snippets`에 아래에 엔드포인트별 `.adoc` 조각으로 생성됨
  - Asciidoctor로 `.adoc` 조각을 HTML 문서로 변환할 수 있다

<br>

### 3-02. Swagger UI 활용

**Swagger UI**는 REST API 문서를 **브라우저에서 시각화하고 테스트할 수 있는 도구**로, Spring 애플리케이션에서 Swagger 문서를 자동 생성해주는 **SpringDoc OpenAPI 라이브러리**를 사용해서 구현함

- Swagger UI가 출력되는 경로: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
- Swagger UI 접근 경로를 수정하려면 `application.yml`에서 수정 가능
- 문서에 표시되는 타이틀, 설명, 연락처, 버전 등은 `@Configuration`을 이용해서 설정 가능

#### 1) API 그룹화

- `GroupedOpenApi`로 URI 단위로 API 그룹화 가능
- `@Tag`로 API를 기능 단위로 묶어 정리 가능

<br>

#### 2) 요청/응답에 설명 달기

- `@Schema`로 Swagger UI에 DTO 필드 설명과 예시를 달 수 있음
- `@ApiResponse`로 Swagger UI에 메서드의 응답 예시를 달 수 있음

<br>

### 3-03. 문서화 전략

#### 1) REST Docs vs Swagger (OpenAPI)

- Swagger가 적합한 경우
  - 프론트와 협업이 많고 API 빠른 공유가 필요한 경우
  - Try-it 버튼을 통한 UI 기반 실시간 테스트가 필요한 경우
- REST Docs가 적합한 경우
  - 공공기관·금융사 등 문서 정확성이 중요한 환경
  - CI에서 자동 문서화를 구축하고자 하는 경우

<br>

#### 2) API 문서 작성 시점

```bash
[기획/요구] → [엔드포인트 정의] → [Swagger or Test 기반 문서화] → [코드 리뷰] → [문서 자동 생성 or 수동 PR] → [문서 배포]
```
