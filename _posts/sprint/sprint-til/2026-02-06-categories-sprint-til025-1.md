---
title: '[TIL 25일 차] Spring MVC: 비즈니스 로직'
excerpt: '응답 처리 이해하기-응답 데이터 구성 및 활용하기 ~ Spring Web의 두 가지 스택 소개'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til025-1/

toc: true
toc_sticky: true

date: 2026-02-06
last_modified_at: 2026-02-06
---

# 오늘의 학습

## <span style="background-color: #FFF9C4">1. 응답 처리 이해하기</span>

### 1-01. 응답 데이터 구성

- **기본 응답 처리** - Model 기반 SSR 응답
  - **서버 사이드 렌더링(Server-Side Rendering, SSR)**
    - 서버에서 HTML 페이지를 렌더링하여 응답하는 방식
  - `ViewResolver`가 View 템플릿(예: Thymeleaf)을 찾아서 HTML 생성

  ```java
  @PostMapping("/v1/members")
  public String postMember(@RequestParam("email") String email,
                           @RequestParam("name") String name,
                           @RequestParam("phone") String phone,
                           Model model) {
      model.addAttribute("email", email);
      model.addAttribute("name", name);
      model.addAttribute("phone", phone);
      return "memberResult"; // templates/memberResult.html
  }

  ```

- **JSON 응답으로 개선** - Map 객체 사용
  - **API 서버**나 **JavaScript 기반 클라이언트(SPA)** 와 통신하려면,
    HTML이 아니라 **JSON 데이터로 응답**하는 것이 적절
  - `@ResponseBody` 또는 `@RestController`를 활용할 수 있으며,
    객체를 반환하면 자동으로 JSON으로 변환 - `@RestController`는 내부적으로 `@ResponseBody` 사용
  - **만약 `@ResponseBody`가 없다면**
    - 반환 값이 View 이름으로 처리되어 `반환값.html`로 찾게 된다. ➡️ JSON 응답이 아님
    - `@ResponseBody`는 **`ViewResolver` → `HttpMessageConverter`** 흐름으로 변경해 주는 핵심 역할

  ```java
  @PostMapping("/v1/members/json")
  @ResponseBody
  public Map<String, String> postMemberJson(@RequestParam("email") String email,
                                            @RequestParam("name") String name,
                                            @RequestParam("phone") String phone) {
      Map<String, String> response = new HashMap<>();
      response.put("email", email);
      response.put("name", name);
      response.put("phone", phone);
      return response;
  }

  ```

  - **Jackson 라이브러리**가 포함되어 있어, Java 객체 → JSON 변환이 자동으로 이루어짐
    - 내부적으로 `MappingJackson2HttpMessageConverter`가 처리함
    - 반환 값이 객체일 경우, Map 대신 DTO 클래스를 만들어도 자동으로 JSON 변환이 이루어짐
    - `@ModelAttribute`와 달리, **응답 객체**로 사용되는 DTO는 **getter가 필수**
  - **실무**에서는 Map보다는 명확한 구조를 가진 DTO 클래스를 만들어 응답하는 것이 유지보수에 유리

- **ResponseEntity로 개선** - 상태 코드 포함
  - `ResponseEntity`는 Spring MVC에서 가장 유연하게 응답을 구성할 수 있는 도구
  - 기존의 `@ResponseBody` 또는 단순 Map 반환 방식과는 달리, **본문, 상태 코드, 헤더를 모두 조작 가능**
  - `ResponseEntity`를 사용할 때 `@ResponseBody`를 생략할 수 있지만 잘 생략하지 않음

  ```java
  @PostMapping("/v1/members/response")
  public ResponseEntity<Map<String, String>> postMemberResponse(@RequestParam("email") String email,
                                                                 @RequestParam("name") String name,
                                                                 @RequestParam("phone") String phone) {
      Map<String, String> response = new HashMap<>();
      response.put("email", email);
      response.put("name", name);
      response.put("phone", phone);

      return new ResponseEntity<>(response, HttpStatus.CREATED);
  }

  ```

  - **응답 헤더 추가**

    ```jsx
    HttpHeaders headers = new HttpHeaders();
    headers.set("X-Custom-Header", "my-custom-value");

    return new ResponseEntity<>(responseBody, headers, HttpStatus.OK);
    ```

- **파일 다운로드 응답 구성**
  - 파일을 다운로드할 때, **파일 내용을 HTTP 응답 본문에 실어 보내면서도 브라우저가 ‘파일 저장’을 인식하도록 적절한 헤더를 포함해야 함**
  - Spring에서는 보통 `ResponseEntity<Resource>` 또는 `ResponseEntity<byte[]>`를 사용해 구현

  ```jsx
  @GetMapping("/v1/files/image")
  public ResponseEntity<Resource> downloadImage() throws IOException {
      // 서버 파일 시스템의 파일 위치
      Path filePath = Paths.get("files/image.jpg");

      // 파일을 InputStream 형태로 읽어서 Spring의 Resource로 래핑
      Resource resource = new InputStreamResource(Files.newInputStream(filePath));

      return ResponseEntity.ok()
              .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"image.jpg\"")
              .contentType(MediaType.IMAGE_JPEG)
              .body(resource);
  }
  ```

---

## <span style="background-color: #FFF9C4">2. 예외 처리하기</span>

### 2-01. `@ExceptionHandler`

```json
{
  "status": 400,
  "error": "Bad Request",
  "path": "/v1/members"
}
```

클라이언트가 전달 받는 Response Body는 애플리케이션에서 예외(Exception)가 발생했을 때, 내부적으로 Spring에서 전송해 주는 에러 응답 메시지 중 하나

Response Body의 내용만으로는 요청 데이터 중에서 어떤 항목이 유효성 검증에 실패했는지 알 수가 없음

클라이언트 쪽에서 에러메시지를 조금 더 구체적으로 친절하게 알 수 있도록 바꾸는 작업이 필요

- **`@ExceptionHandler`**
  - 특정 예외가 발생했을 때, 해당 예외를 처리할 **메서드**를 지정할 수 있는 애너테이션
  - `@Controller`, `@RestController` 내부에서 사용되며, 특정 컨트롤러에서만 예외를 처리하고 싶을 때 유용

  ```java
  @Controller
  @RequestMapping("/members")
  public class MemberController {
  		//...
      @ExceptionHandler(MemberNotFoundException.class)
      public ResponseEntity<String> handleMemberNotFound(MemberNotFoundException e) {
          return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
      }
  }
  ```

  - `MemberNotFoundException`이 발생하면, `handleMemberNotFound` 메서드가 호출됨
  - 응답은 404 NOT FOUND 상태 코드와 함께 예외 메시지를 반환

<br>

### 2-02. `@ControllerAdvice`

애플리케이션 규모가 커질수록 여러 컨트롤러에서 유사한 예외 처리 코드가 반복되기 시작함

공통 예외를 **모든 컨트롤러에서 일일이 처리하면 코드 중복과 유지보수 이슈**가 발생하므로, **전역에서 한 번에 처리하는 구조**가 필요

`@ControllerAdvice`는 **여러 컨트롤러에서 공통적으로 발생할 수 있는 예외를 하나의 클래스에서 처리할 수 있도록 해주는 기능**으로, 모든 컨트롤러의 예외를 한 곳에서 모아서 처리할 수 있습니다.

- `@RestControllerAdvice` = `@ControllerAdvice` + `@ResponseBody`
- **애플리케이션의 모든 `@Controller` 또는 `@RestController` 클래스에 대해 전역적으로 적용**

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity handelException(IllegalArgumentException e) {

        ErrorResponse errorResponse = new ErrorResponse(HttpStatus.BAD_REQUEST.getReasonPhrase(), e.getMessage());
        return new ResponseEntity(errorResponse, HttpStatus.BAD_REQUEST);
    }
}
```

- **`@ControllerAdvice`의 예외 처리 우선순위**
  1. 해당 컨트롤러 내부의 `@ExceptionHandler`
  2. 범위 제한이 있는 `@ControllerAdvice`
  3. 범위 제한 없는 `@ControllerAdvice`

---

## <span style="background-color: #FFF9C4">3. Spring Web의 두 가지 스택 소개</span>

### 3-01. 전통적인 서블릿 기반 웹 애플리케이션

- **서블릿(Servlet)**
  - Java EE 기반에서 제공하는 서버 측 웹 컴포넌트
  - `HttpServlet` 클래스를 상속받아 요청을 처리하며, 직접 HTTP 요청/응답을 다뤄야 했음
  - **문제점**
    - HTTP 요청/응답 객체를 직접 다루어야 하므로 코드가 장황
    - 재사용/테스트가 어렵고, 유지보수성이 낮음
    - 로직과 표현이 섞여 있음 (Separation of Concerns 미흡)
- **Spring MVC**
  - 서블릿을 기반으로 하되, **추상화된 방식으로 웹 요청을 처리**할 수 있도록 설계
  - 핵심 개념은 **`DispatcherServlet`**
  - Spring MVC는 내부적으로 `HttpServletRequest`, `HttpServletResponse`을 다루지만,
    개발자는 추상화된 API만 사용

<br>

### 3-02. 리액티브 프로그래밍(Reactive Programming)

- **블로킹 I/O vs 논블로킹 I/O**
  - **블로킹 I/O**
    - **하나의 스레드가 전체 작업이 끝날 때까지 계속 점유**하는 것
      - 전통적인 웹 애플리케이션(Spring MVC 포함)은 요청을 처리할 때 사용됨
    - 중간에 외부 시스템(DB, API 등) 응답을 기다리는 동안에도 스레드는 **멈춰 있는 채로 점유됨**
    - 즉, 응답을 받기 전까지는 **아무 일도 하지 못하고 기다리는 스레드 낭비**가 발생
  - **논블로킹 I/O**
    - 논블로킹 I/O는 **응답이 올 때까지 스레드가 점유되지 않고 반환되며**, 이벤트 루프(event loop)를 통해 콜백이나 푸시 방식으로 결과를 처리하는 것
    - 요청을 맡긴 뒤 → 다른 작업 수행 → 응답 오면 콜백 처리
    - 자원을 더 효율적으로 사용 가능
- **리액티브 프로그래밍 등장 배경**
  - 아래의 문제를 해결하기 위해 등장
    - 다수의 사용자 동시 접속 (ex. 채팅, 주문 처리) ➡️ 서버 스레드가 급격히 소진됨
    - 외부 API에 의존하는 요청 (ex. 배송조회, 날씨 조회 등) ➡️ 외부 응답 지연 시 전체 TPS 저하
    - IoT, 실시간 데이터 스트리밍 서비스 ➡️ 대량의 병렬 요청을 처리할 방법이 필요
- **이벤트 기반(event-driven)**, **비동기 흐름(asynchronous)**, **데이터 스트림 처리(stream processing)**를 중심으로 설계됨
- Spring에서는 **Spring WebFlux** 모듈이 제공
- **기존 시스템과의 호환성**
  - 기업에서 사용하는 라이브러리(JPA, MyBatis 등)는 대부분 **동기 처리 전용**
  - Spring Security, Swagger, Validation 등도 Spring MVC에 기본 최적화
  - WebFlux는 별도의 리액티브 생태계(R2DBC, WebClient 등)를 요구함
