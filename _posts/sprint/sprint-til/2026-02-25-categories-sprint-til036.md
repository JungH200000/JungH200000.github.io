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

# <span style="background-color: #FFF9C4">1. RESTful API 구현: 기본</span>

## 1-01. `@RestController` 활용

`@Controller`는 요청에 대해 **HTML View 템플릿**을 반환데 사용되는데 반해, `@RestController`는 **JSON, XML, 파일 등 실제 데이터 자체를 반환**한다. ➡️ REST API 개발에 주로 사용됨

- `@RestController = @Controller + @ResponseBody`

### 1) `ResponseEntity`로 응답 제어

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

### 2) HTTP 메시지 컨버터(`MessageConverter`)의 동작 방식

`MessageConverter`는 Spring에서 요청 본문을 자바 객체로 변환하거나, 자바 객체를 응답 본문으로 직렬화할 때 사용하는 컴포넌트

- 요청 흐름: `HTTP JSON 요청 → HttpMessageConverter → @RequestBody → Java 객체`
- 응답 흐름: `Java 객체 → @ResponseBody or ResponseEntity → HttpMessageConverter → HTTP 응답 JSON`

### 3) Content Negotiation (콘텐츠 협상)

클라이언트 요청의 `Accept` 헤더에 따라 응답의 `Content-Type`을 결정하는 것

`Accept: application/json` ➡️ JSON 응답

## 1-02. Controller에서의 요청 처리

### 1) `@PathVariable` 활용

URI 경로의 일부를 변수로 받아오는 애너테이션

```java
@GetMapping("/users/{id}")
public UserDto get(@PathVariable UUID id) { ... }
```

### 2) `@RequestParam` 활용

HTTP 요청의 쿼리 파라미터 또는 form-data를 컨트롤러 메서드 파라미터로 바인딩

- 여러 값이 전달될 경우 ➡️ `List<String>` 또는 `MultiValueMap<String, String>` 사용 가능

```java
@GetMapping
public Page<ProductDto> search(@RequestParam(defaultValue = "all") String category) {...}
```

### 3) `@RequestBody` 활용과 검증

HTTP Body(JSON/XML 등)를 객체로 역직렬화하여 컨트롤러에 전달

- `@Valid` 애너테이션과 함께 사용하면 자동 유효성 검증 가능

```java
@PostMapping("/signup")
public ResponseEntity<MemberDto> signup(@Valid @RequestBody SignupRequest request) {...}
```

# <span style="background-color: #FFF9C4">3. API 문서화</span>

## 3-01. Spring REST Docs

테스트 코드를 기반으로 실제 API 요청과 응답을 기록하여 문서를 자동으로 만들어주는 도구

- 테스트가 통과한 스펙만 스니펫이 생성되므로 **문서 신뢰도가 높다**
- 문서 스니펫 생성 로직은 보통 `src/test`**의 테스트 코드**에서 작성한다
- 스니펫은 `build/generated-snippets`에 아래에 엔드포인트별 `.adoc` 조각으로 생성됨
  - Asciidoctor로 `.adoc` 조각을 HTML 문서로 변환할 수 있다

## 3-02. Swagger UI 활용

**Swagger UI**는 REST API 문서를 **브라우저에서 시각화하고 테스트할 수 있는 도구**로, Spring 애플리케이션에서 Swagger 문서를 자동 생성해주는 **SpringDoc OpenAPI 라이브러리**를 사용해서 구현함

- Swagger UI가 출력되는 경로: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
- Swagger UI 접근 경로를 수정하려면 `application.yml`에서 수정 가능
- 문서에 표시되는 타이틀, 설명, 연락처, 버전 등은 `@Configuration`을 이용해서 설정 가능

### 1) API 그룹화

- `GroupedOpenApi`로 URI 단위로 API 그룹화 가능
- `@Tag`로 API를 기능 단위로 묶어 정리 가능

### 2) 요청/응답에 설명 달기

- `@Schema`로 Swagger UI에 DTO 필드 설명과 예시를 달 수 있음
- `@ApiResponse`로 Swagger UI에 메서드의 응답 예시를 달 수 있음

## 3-03. 문서화 전략

### 1) REST Docs vs Swagger (OpenAPI)

- Swagger가 적합한 경우
  - 프론트와 협업이 많고 API 빠른 공유가 필요한 경우
  - Try-it 버튼을 통한 UI 기반 실시간 테스트가 필요한 경우
- REST Docs가 적합한 경우
  - 공공기관·금융사 등 문서 정확성이 중요한 환경
  - CI에서 자동 문서화를 구축하고자 하는 경우

### 2) API 문서 작성 시점

```bash
[기획/요구] → [엔드포인트 정의] → [Swagger or Test 기반 문서화] → [코드 리뷰] → [문서 자동 생성 or 수동 PR] → [문서 배포]
```
