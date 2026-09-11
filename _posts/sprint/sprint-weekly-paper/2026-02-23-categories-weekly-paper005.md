---
layout: single-editorial
title: '위클리페이퍼05: RESTful APIs 구현하기'
excerpt: ''

categories:
  - Sprint Weekly Paper
tags:
  - [Codeit Sprint, Codeit Sprint Weekly Paper]

permalink: /categories/codeit-sprint/sprint-weekly-paper/weekly-paper005

toc: true
toc_sticky: true

date: 2026-02-23
last_modified_at: 2026-09-11
---

## Q1. 웹 API의 발전 과정에서 SOAP에서 REST로의 전환이 일어난 이유와 그 장단점에 대해 설명하세요.

### Q1-1. SOAP과 REST

SOAP과 REST는 성격이 조금 다르다고 볼 수 있다.

**SOAP(Simple Object Access Protocol)**은 XML을 기반으로 메시지를 주고받기 위한 **프로토콜**이다.

반면 **REST(Representational State Transfer)**는 리소스를 URI로 표현하고 HTTP 메서드를 이용해 상태를 주고받도록 설계하는 **아키텍처 스타일**이다.

예를 들어 사용자를 조회한다고 가정해보자.

**SOAP**에서는 아래처럼 XML 메시지를 만들어 요청할 수 있다.

```xml
<soap:Envelope>
  <soap:Body>
    <getUser>
      <id>1</id>
    </getUser>
  </soap:Body>
</soap:Envelope>
```

반면 **REST API**에서는 보통 아래처럼 표현할 수 있다.

```http
GET /users/1
```

응답도 JSON을 사용하면 아래처럼 단순하게 표현할 수 있다.

```json
{
  "id": 1,
  "name": "박정현"
}
```

REST가 반드시 JSON만 사용하는 것은 아니다. XML 등 다른 표현 형식도 사용할 수 있지만, 웹 API에서는 JSON을 많이 사용한다.

### Q1-2. SOAP에서 REST로 전환된 이유는?

SOAP에서 REST로 전환되기 시작한 가장 큰 이유는 **웹 환경에서 더 단순하고 가벼운 통신 방식이 필요해졌기 때문**이다.

**SOAP**는 XML 기반의 정해진 메시지 구조를 사용한다.

```text
SOAP Envelope
⬇️
Header
⬇️
Body
⬇️
실제 데이터
```

그래서 위 구조처럼 단순한 데이터 하나를 주고받더라도 여러 개의 XML 태그와 구조가 필요할 수 있다.

웹 서비스가 발전하면서 브라우저, 모바일 앱, 다양한 클라이언트가 서버 API를 호출하게 되자 아래와 같은 요구가 커졌다.

- 더 단순한 요청 구조
- 더 작은 메시지
- HTTP를 그대로 활용
- 웹 캐시 같은 기존 인프라 활용
- 클라이언트와 서버의 느슨한 결합

**REST**는 HTTP의 URI, 메서드, 상태 코드 등을 활용하여 비교적 단순한 인터페이스를 만들 수 있기 때문에 이러한 환경과 잘 맞았다.

예를 들면 아래처럼 HTTP 메서드 자체를 리소스에 대한 동작을 표현하는 데 활용할 수 있다.

```http
GET    /users/1
POST   /users
PUT    /users/1
DELETE /users/1
```

### Q1-3. REST의 장점

#### 1. HTTP 그대로 활용 가능

REST API는 웹에서 이미 사용하고 있는 HTTP의 기능을 활용할 수 있다.

- URI
- HTTP Method
- HTTP Status Code
- Header
- Cache

예를 들어 `GET /users/1`로 사용자를 조회했는데 해당 사용자가 없다면 `404 Not Found`를 사용할 수 있다.

별도의 통신 규칙을 새롭게 만드는 것보다 웹의 기본 구조를 활용하기가 쉽다.

#### 2. 비교적 가벼운 데이터 형식을 사용할 수 있다.

REST API는 XML보다 JSON 같은 비교적 단순하고 가벼운 데이터 형식을 많이 사용한다.

예를 들어 같은 사용자 정보를 표현한다면

```xml
<user>
  <id>1</id>
  <name>홍길동</name>
</user>
```

```json
{
  "id": 1,
  "name": "홍길동"
}
```

JSON은 웹 브라우저나 모바일 애플리케이션에서도 다루기 편하기 때문에 웹 API에서 널리 사용된다.

#### 3. 웹의 기존 인프라 활용 가능

HTTP 캐싱 같은 웹 인프라를 활용할 수 있다.

예를 들어 자주 변경되지 않는 데이터를 아래와 같은 HTTP 요청으로 조회한다면

```http
GET /categories
```

적절한 HTTP 캐시 정책을 적용해 서버 요청을 줄일 수도 있다.

#### 4. 인터페이스가 비교적 단순함

예를 들어 사용자의 API를 아래처럼 구성하면

```http
GET    /users
GET    /users/{id}
POST   /users
DELETE /users/{id}
```

URI와 HTTP Method만 보고도 어느 정도 동작을 예상할 수 있다.

따라서 SOAP의 복잡한 메시지 구조에 비해 API를 이해하고 사용하는 데 부담이 상대적으로 낮다.

### Q1-4. REST의 한계

REST가 SOAP보다 무조건 우수한 것은 아니다.

#### 1. 에러 처리 방식이 완전히 통일되어 있지 않다.

REST에서는 HTTP Status Code를 사용할 수 있지만, 에러 응답의 실제 Body 구조까지 하나의 방식으로 강제하는 것은 아니다.

예를 들어 같은 400 오류라도 서비스마다 아래의 두 경우처럼 서로 다른 형태를 사용할 수 있다.

```json
{
  "message": "잘못된 요청입니다."
}
```

```json
{
  "code": "INVALID_REQUEST",
  "errorMessage": "잘못된 요청입니다."
}
```

따라서 API 설계자가 **에러 응답 형식을 별도로 일관성 있게 정의**해야 한다.

#### 2. SOAP 기반 엔터프라이즈 환경에서 제공되던 기능을 별도로 구성해야 할 수 있다.

SOAP 생태계에서는 보안, 트랜잭션 같은 복잡한 엔터프라이즈 요구를 지원하기 위한 규격들이 발전해왔다.

REST 자체는 이런 기능을 하나의 표준 세트로 제공하지 않는다.

그래서 REST 기반 시스템에서는 필요에 따라 아래의 전략들을 조합해서 설계할 수 있다.

- 보안
  - HTTPS
  - OAuth
  - JWT 등

- 분산 시스템의 데이터 일관성
  - 별도의 트랜잭션 전략
  - 보상 트랜잭션 등

#### 3. REST 제약을 완전히 지키기 어려울 수 있다.

REST에는 리소스 중심 설계, Stateless, 일관된 인터페이스 등의 제약이 있다.

하지만 실제 프로젝트에서는 완전히 RESTful하게 구현하지 않고 아래처럼 동작 중심 URI를 만들기도 한다.

```http
POST /users/1/activate
POST /orders/1/cancel
```

따라서 현실에서는 REST 원칙을 어느 정도 적용한 **HTTP API**가 많이 존재하고, 모든 REST 제약을 완벽히 지키는 것은 쉽지 않을 수 있다.

### Q1-5. SOAP과 REST 비교

| 구분              | SOAP                         | REST                      |
| ----------------- | ---------------------------- | ------------------------- |
| 성격              | 프로토콜                     | 아키텍처 스타일           |
| 데이터 표현       | XML                          | JSON, XML 등              |
| 메시지 구조       | 상대적으로 복잡              | 상대적으로 단순           |
| HTTP 활용         | 전송 수단으로 사용 가능      | HTTP의 기능을 적극 활용   |
| 웹 캐시 활용      | 상대적으로 제한적            | HTTP 캐시 활용 용이       |
| 학습/구현 난이도  | 상대적으로 높음              | 상대적으로 낮음           |
| 엔터프라이즈 기능 | 관련 표준이 잘 발달          | 필요한 기능을 별도로 조합 |
| 주 사용 영역      | 엄격한 계약과 기업 시스템 등 | 일반적인 웹/모바일 API    |

여기서 중요한 점은

> **REST가 SOAP을 완전히 대체했다고 보는 것보다는, 일반적인 웹 API에서 REST 방식이 더 적합한 경우가 많아 널리 사용되게 되었다고 이해하는 것이 좋다.**

SOAP 역시 엄격한 메시지 계약이나 기존 엔터프라이즈 시스템과의 연동이 중요한 경우에는 사용할 수 있다.

### Q1-6. 왜 REST가 웹 환경에 더 잘 맞는가?

```text
[SOAP]
XML 기반
복잡한 메시지 구조
비교적 큰 메시지
엔터프라이즈 중심
⬇️
⬇️ - 웹 · 모바일 서비스 성장
⬇️
⬇️ - 더 단순하고 가벼운 API 필요
⬇️
[REST]
HTTP 활용
간단한 URI + Method
JSON 등 가벼운 표현
HTTP 캐시 활용
```

즉 **SOAP 자체가 잘못된 기술이라서 REST로 바뀐 것이 아니라**, 웹과 모바일 중심 환경이 성장하면서 요구사항이 달라졌고, REST가 그 요구에 더 잘 맞았다고 보는 게 정확하다.

---

## Q2. Spring Boot에서 `@RestController`로 들어온 HTTP 요청이 처리되어 응답으로 변환되는 전체 과정을 설명하세요. 특히 HTTP 메시지 컨버터가 동작하는 시점과 역할을 포함해서 설명하세요.

### Q2-1. 전체 흐름

Spring MVC에서 HTTP 요청이 들어와서 `@RestController`의 메서드가 실행되고 응답이 반환되는 과정은 아래처럼 볼 수 있다.

```text
Client
⬇️
`DispatcherServlet`
⬇️
`HandlerMapping`
⬇️
`HandlerAdapter`
⬇️
Controller 메서드의 파라미터 처리
⬇️
`@RequestBody`가 있다면 `HttpMessageConverter`
- HTTP Body ➡️ Java 객체
⬇️
Controller 메서드 실행
⬇️
Service 등 비즈니스 로직 실행
⬇️
Controller 반환값 생성
⬇️
`HttpMessageConverter`
- Java 객체 ➡️ HTTP Body
⬇️
Client
```

### Q2-2. 요청(Request)

#### 1. `DispatcherServlet`이 요청을 받는다.

클라이언트에서 HTTP 요청이 들어오면 Spring MVC에서는 먼저 **`DispatcherServlet`**이 요청을 받는다.

`DispatcherServlet`은 **Front Controller** 역할을 하며 웹 요청의 공통 진입점 역할을 한다.

아래의 요청이 들어왔다고 가정해보자.

```http
POST /users
Content-Type: application/json

{
  "name": "박정현",
  "email": "test@example.com"
}
```

이 요청을 어떤 Controller의 어떤 메서드가 처리해야 하는지 `DispatcherServlet`이 직접 결정하지는 않는다.

적절한 Handler를 찾기 위해서 `HandlerMapping`을 사용한다.

#### 2. `HandlerMapping`이 요청을 처리할 Controller를 찾는다.

`DispatcherServlet`은 `HandlerMapping`에 현재 요청을 처리할 Handler를 요청한다.

Spring MVC에서는 일반적으로 `RequestMappingHandlerMapping`이 아래의 정보를 바탕으로 실행할 Controller를 찾는다.

```text
요청 URL
HTTP Method
`@RequestMapping`
`@GetMapping`
`@PostMapping`
...
```

예를 들어 아래와 같은 코드가 있다면

```java
@RestController
@RequestMapping("/users")
public class UserController {

  @PostMapping
  public UserResponse create(
    @RequestBody CreateUserRequest request
  ) {
    //...
  }
}
```

`POST /users` 요청과 연결되는 `create()` 메서드를 찾는다.

#### 3. `HandlerAdapter`가 Controller 호출을 준비한다.

처리할 Controller 메서드를 찾았다고 해서 `DispatcherServlet`이 직접 해당 메서드를 호출하는 것이 아니다.

해당 Handler를 실행할 수 있는 **HandlerAdapter**를 사용한다.

역할을 아래처럼 정리해볼 수 있다.

```text
`HandlerMapping`
➡️ "어떤 Controller 메서드를 실행할 것인가?"

`HandlerAdapter`
➡️ "그 Controller 메서드를 어떻게 실행할 것인가?"
```

`HandlerAdapter`는 Controller 메서드를 호출하기 전에 메서드에 필요한 파라미터를 준비한다.

#### 4. Controller 메서드의 파라미터를 처리한다.

Controller를 실행하기 위해서는 먼저 Controller 메서드에 선언된 파라미터를 준비해야 한다.

예를 들어 아래와 같은 코드가 있다면

```java
@PostMapping("/{userId}")
public UserResponse update(
  @PathVariable Long userId,
  @RequestParam boolean notify,
  @RequestBody UpdateUserRequest request
) {
  // ...
}
```

Spring은 `@PathVariable`, `@RequestParam`, `@RequestBody`를 각각 해석해서 Controller 메서드의 인자로 전달해야 한다.

#### 5. 요청에서 HTTP 메시지 컨버터가 동작하는 시점

아래 코드와 같이 `@RequestBody`가 있다고 가정해보자.

```java
@PostMapping
public UserResponse create(
  @RequestBody CreateUserRequest request
) {
  // ...
}
```

클라이언트는 Java 객체를 전송하는 것이 아니라 HTTP Body에 JSON 등의 데이터를 담아 전송한다.

```JSON
{
  "name": "박정현",
  "email": "test@example.com"
}
```

하지만 Controller는 `CreateUserRequest request`라는 Java 객체를 필요로 한다.

따라서 아래와 같은 변환이 필요하다.

```text
HTTP Request Body
(JSON)
⬇️
HttpMessageConverter
⬇️
Java Object
(CreateUserRequest)
```

이때 **HTTP 메시지 컨버터(`HttpMessageConverter`)가 동작한다.**

#### 6. 어떤 HTTP 메시지 컨버터를 사용할지 어떻게 결정하는가?

Spring은 요청의 `Content-Type`을 보고 데이터를 읽을 수 있는 메시지 컨버터를 선택한다.

예를 들어 `Content-Type: application/json`이라면 JSON 데이터를 처리할 수 있는 메시지 컨버터가 필요하다.

Spring Boot에서는 JSON 처리 시 일반적으로 `MappingJackson2HttpMessageConverter`가 사용되며, 내부적으로 Jackson을 이용해 JSON을 Java 객체로 변환한다.

```text
{
  "name": "박정현"
}
⬇️
⬇️ - Jackson / HttpMessageConverter
⬇️
CreateUserRequest(
  name = "박정현"
)
```

이 과정을 **역직렬화(Deserialization)**라고 한다.

#### 7. `@PathVariable`, `@RequestParam`도 HTTP 메시지 컨버터가 처리하는가?

**HTTP 메시지 컨버터가 직접 처리하는 핵심 대상은 HTTP Body**이다.

```text
`@RequestBody`
➡️ `HttpMessageConverter`

`@PathVariable`
`@RequestParam`
➡️ 별도의 Argument Resolver / 타입 변환 과정
```

즉, 아래와 같은 HTTP 요청에서

```http
GET /users/10?page=2
```

아래처럼 변환되는 것은

```java
@GetMapping("/{userId}")
public UserResponse getUser(
  @PathVariable Long userId,
  @RequestParam int page
) {
  // ...
}
```

`HttpMessageConverter`가 JSON을 변환하는 과정과는 다른 파라미터 바인딩 과정이다.

#### 8. Controller 메서드 실행

모든 파라미터가 준비되면 Controller 메서드가 실행된다.

Controller 내부에서는 필요에 따라 Service를 호출하여 비즈니스 로직을 처리한다.

이후 Controller는 응답으로 사용할 Java 객체를 반환한다.

```java
@PostMapping
public UserResponse create(
  @RequestBody CreateUserRequest request
) {
  User user = userService.create(request);

  return UserResponse.from(user);
}
```

### Q2-3. 응답(Response)

#### 1. `@RestController`의 반환값은 어떻게 처리되는가?

Controller가 아래의 객체를 반환한다고 해보자.

```java
new UserResponse(
  1L,
  "박정현"
);
```

`@RestController`에서는 위 반환값을 View 이름으로 해석하는 것이 아니라 **HTTP Response Body에 넣을 데이터로 처리한다.**

- `@RestController`
  - REST API Controller에서 반환값을 Response Body로 처리하도록 사용하는 애너테이션으로,
  - 일반적으로 `@Controller`와 `@ResponseBody`가 결합한 애너테이션으로 이해할 수 있다.

#### 2. 응답에서도 HTTP 메시지 컨버터가 동작

Controller의 반환값은 Java 객체이므로 그대로 HTTP 네트워크로 보낼 수 없다.

그래서 이번에는 반대 방향으로의 변환이 필요하다.

```text
Java Object
(UserResponse)
⬇️
HttpMessageConverter
⬇️
HTTP Response Body
(JSON)
```

예를 들어

```java
new UserResponse(
  1L,
  "박정현"
);
```

위 Java 객체가 아래의 JSON으로 변환된다.

```json
{
  "id": 1,
  "name": "박정현"
}
```

이 과정을 **직렬화(Serialization)**라고 한다.

즉, HTTP 메시지 컨버터는 요청과 응답에서 반대 방향으로 동작한다.

```text
[요청]
HTTP Body ➡️ Java Object
- 역직렬화

[응답]
Java Object ➡️ HTTP Body
- 직렬화
```

#### 3. 응답에서는 어떤 메시지 컨버터를 선택하는가?

응답 시에는 클라이언트가 받을 수 있는 데이터 형식을 고려해서 메시지 컨버터가 선택된다.

예를 들어 `Accept: application/json`이라면 JSON 형식으로 응답할 수 있는 메시지 컨버터가 사용될 수 있다.

즉, 아래와 같은 응답이 만들어진다.

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": 1,
  "name": "박정현"
}
```

#### 4. `ResponseEntity`를 사용한다면?

단순히 객체만 반환할 수 있지만 `ResponseEntity`를 이용하면 아래의 데이터를 직접 제어할 수 있다.

- HTTP Status
- HTTP Header
- HTTP Body

예를 들어

```java
@PostMapping
public ResponseEntity<UserResponse> create(
  @RequestBody CreateUserRequest request
) {
  UserResponse response = userService.create(request);

  return ResponseEntity
      .status(HttpStatus.CREATED)
      .body(response);
}
```

위와 같은 코드가 동작하면 아래와 함께 JSON Body를 응답할 수 있다.

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": 1,
  "name": "박정현"
}
```

### Q2-4. 전체 과정 정리

```text
1. Client가 HTTP 요청 전송
   ⬇️
2. `DispatcherServlet`이 요청 수신
   ⬇️
3. `HandlerMapping`이 요청을 처리할 Controller 메서드 탐색
   ⬇️
4. `HandlerAdapter`가 Controller 호출 준비
   ⬇️
5. Controller 파라미터 준비
   ⬇️
6. `@RequestBody` 파라미터가 있다면
  - 파라미터 처리과정에서 `HttpMessageConverter`가 HTTP Body ➡️ Java 객체로 역직렬화
   ⬇️
7. Controller 메서드 실행
   ⬇️
8. Service 등 비즈니스 로직 실행
   ⬇️
9. Controller가 Java 객체 반환
   ⬇️
10. `@RestController`이므로 `ViewResolver`를 거치지 않고 Response Body로 처리
   ⬇️
11. `HttpMessageConverter`가 Java 객체 ➡️ HTTP Body로 직렬화
   ⬇️
12. Client에게 HTTP Response 반환
```
