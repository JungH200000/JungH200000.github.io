---
layout: single-editorial
title: '위클리페이퍼04-3: Spring과 Spring Boot'
excerpt: ''

categories:
  - Sprint Weekly Paper
tags:
  - [Codeit Sprint, Codeit Sprint Weekly Paper]

permalink: /categories/codeit-sprint/sprint-weekly-paper/weekly-paper004-3

toc: true
toc_sticky: true

date: 2026-02-09
last_modified_at: 2026-09-12
---

## Q5. Spring에서 AOP(Aspect Oriented Programming)가 필요한 이유와 이를 활용한 실제 애플리케이션 개발 사례에 대해 설명하세요.

### Q5-1. AOP란?

**AOP(Aspect Oriented Programming, 관점 지향 프로그래밍)**는 여러 비즈니스 로직에 공통적으로 적용되는 기능을 핵심 로직에서 분리하여 관리하는 방식이다.

예를 들어 애플리케이션에는 회원가입, 주문, 결제, 상품 조회 등 서로 다른 비즈니스 로직이 존재한다.

하지만 이 기능들에는 아래와 같은 공통적인 처리가 필요할 수 있다.

- 로깅
- 실행 시간 측정
- 보안 / 권한 확인
- 예외 기록

이러한 기능을 **횡단 관심사(Cross-Cutting Concern)**라고 볼 수 있다.

```text
             로깅
             ⬇️
회원가입 ─────────────
주문     ─────────────
결제     ─────────────
상품조회 ─────────────
             ⬆️
          실행 시간 측정
```

AOP는 이런 공통 관심사를 별도의 모듈로 분리하여 여러 비즈니스 로직에 일관되게 적용할 수 있도록 한다.

### Q5-2. AOP가 필요한 이유

예를 들어 모든 Service 메서드의 실행 시간을 측정해야 한다고 가정해보자.

AOP를 사용하지 않는다면 각각의 비즈니스 메서드에 직접 시간 측정 코드를 작성한다.

```java
public class UserService {

  public void createUser(User user) {

    long start = System.currentTimeMillis();

    // 실제 비즈니스 로직
    validateUser(user);
    userRepository.save(user);
    sendWelcomeEmail(user);

    long end = System.currentTimeMillis();

    System.out.println(
      "실행 시간: " + (end - start) + "ms"
    );
  }
}
```

처음에는 문제가 없을지도 모르지만, 아래의 경우처럼 실행 시간을 측정해야 하는 메서드가 많아지게 되면 같은 코드가 반복된다.

```text
UserService.createUser()
➡️ 시간 측정 코드

OrderService.createOrder()
➡️ 시간 측정 코드

PaymentService.pay()
➡️ 시간 측정 코드

ProductService.findProduct()
➡️ 시간 측정 코드
```

이 경우 아래와 같은 문제가 발생한다.

- 동일한 부가 기능이 여러 메서드에 반복된다.
- 핵심 비즈니스 로직과 시간 측정 같은 부가 기능이 섞인다.
- 시간 측정 방식을 변경하려면 여러 메서드를 수정해야 한다.

### Q5-3. AOP를 이용한 해결

실행 시간 측정 로직을 **Aspect**로 분리하고 `@Aspect`로 선언할 수 있다.

```java
@Aspect
@Component
public class TimeTraceAspect {

  @Around("execution(* com.example.service..*(..))")
  public Object trackTime(
      ProceedingJoinPoint joinPoint
  ) throws Throwable {

    long start = System.currentTimeMillis();

    try {
      // 실제 비즈니스 메서드 실행
      return joinPoint.proceed();

    } finally {
      long end = System.currentTimeMillis();

      System.out.println(
        joinPoint.getSignature()
          + " 실행 시간: "
          + (end - start)
          + "ms"
      );
    }
  }
}
```

위 코드처럼 구현한다면 아래와 같은 Service의 비즈니스 코드에는 실행 시간 측정 코드가 들어갈 필요가 없다.

```java
public void createUser(User user) {

  validateUser(user);
  userRepository.save(user);
  sendWelcomeEmail(user);
}
```

실행 흐름을 정리해 보면 아래와 같다.

```text
Service 메서드 호출
⬇️
Spring AOP Proxy
⬇️
Advice 실행
- 실행 시간 측정 시작
⬇️
`joinPoint.proceed()`
⬇️
실제 비즈니스 메서드 실행
⬇️
Advice로 복귀
- 실행 시간 측정 종료
⬇️
결과 반환
```

따라서 비즈니스 로직은 자신의 핵심 기능에 집중하고, 실행 시간 측정은 Aspect가 담당하게 된다.

### Q5-4. 위 예시 코드에서 사용된 AOP 용어

#### Aspect

```java
@Aspect
public class TimeTraceAspect
```

공통 관심사를 하나로 모아 놓은 모듈이라고 볼 수 있다.

위 예시에서는 **실행 시간 측정**이라는 공통 관심사를 담당하는 `TimeTraceAspect`가 하나의 Aspect다.

#### Advice

실제로 공통 기능을 수행하는 코드다.

예시 코드에서

```java
@Around(...)
public Object trackTime(...)
```

이 코드가 Advice 역할을 한다.

`@Around`는 대상 메서드의 **실행 전과 실행 후 모두에 개입할 수 있는 Advice**다.

#### Pointcut

**AOP를 어디에 적용할 것인지**를 지정한다.

```java
@Around("execution(* com.example.service..*(..))")
```

위 표현식은 `com.example.service` 아래의 모든 메서드들을 대상으로 공통 로직을 적용하는 예시라고 볼 수 있다.

#### Join Point

AOP를 적용할 수 있는 실행 지점을 의미한다.

Spring AOP에서는 주로 **메서드 실행 지점**이라고 이해하면 된다.

`ProceedingJoinPoint`의 `joinPoint.proceed()`를 호출하면 실제 대상 메서드가 실행된다.

### Q5-5. 실제 활용 사례 1 - 메서드 실행 시간 모니터링

각 메서드의 실행 시간을 측정하면 성능 병목 지점을 찾는 데 사용할 수 있다.

```text
UserService.createUser()
➡️ 45ms

OrderService.createOrder()
➡️ 70ms

PaymentService.pay()
➡️ 1500ms
```

만약 특정 기준을 초과하는 경우 경고 로그를 남길 수도 있다.

```text
실행 시간 > 1000ms
➡️ Slow Method 경고 로그 기록
```

모든 Service 메서드에 측정 코드를 직접 작성하는 대신 하나의 Aspect에서 관리할 수 있다는 것이 장점이다.

### Q5-6. 실제 활용 사례 2 - 로깅

여러 메서드에서 아래와 같은 정보를 공통적으로 기록하고 싶을 수 있다.

- 실행된 메서드
- 파라미터
- 반환값
- 발생한 예외
- 실행 시간

각 메서드에서 직접 로그를 작성하면 아래 같은 코드가 반복될 수 있다.

```java
log.info(...);

// 비즈니스 로직

log.info(...);
```

AOP를 사용하면 메서드 호출 정보를 공통적으로 가로채서 일관된 형태로 기록할 수 있다.

### Q5-7. 실제 활용 사례 3 - 보안 및 권한 확인

특정 메서드가 실행되기 전에 사용자의 권한을 확인해야 하는 경우에도 공통 관심사로 분리할 수 있다.

예를 들어 아래와 같은 권한 확인 로직을 모든 비즈니스 메서드에 직접 작성하면 중복이 발생할 수 있다.

```text
관리자 기능 호출
⬇️
권한 확인
⬇️
권한 있음 ➡️ 메서드 실행
권한 없음 ➡️ 접근 거부
```

### Q5-8. AOP를 적용할 때 얻을 수 있는 장점

#### AOP 적용 전

```text
비즈니스 로직
+ 로깅
+ 시간 측정
+ 보안
+ 기타 공통 기능

➡️ 코드 중복
➡️ 핵심 로직 가독성 저하
➡️ 변경 범위 증가
```

#### AOP 적용 시

```text
[비즈니스 로직]
회원 / 주문 / 결제 ...

+

[공통 관심사]
로깅 / 성능 측정 / 보안
```

위처럼 책임 분리가 가능해서 아래의 장점이 있다.

- 핵심 비즈니스 로직에 집중할 수 있다.
- 중복 코드를 줄일 수 있다.
- 공통 로직을 한 곳에서 변경할 수 있다.
- 여러 대상에 동일한 정책을 일관되게 적용할 수 있다.

### Q5-9. AOP를 적용하기 적절한 기능

AOP는 **여러 비즈니스 로직에서 반복되지만 핵심 비즈니스 로직 자체는 아닌 기능**에 적합하다.

```text
[적합한 예시]

로깅
실행 시간 측정
모니터링
권한 검사
```

```text
[일반적으로 AOP로 분리하지 않는 예시]
주문 생성
재고 차감
결제 금액 계산
```

이런 핵심 비즈니스 규칙까지 Aspect로 숨기기 시작하면 코드의 실제 실행 흐름을 파악하기 어려워질 수 있다.

따라서 핵심 비즈니스 로직은 명시적으로 유지하고, **여러 곳에 공통적으로 적용되는 횡단 관심사를 AOP로 분리하는 것**이 중요하다.

---

## Q6. Spring MVC에서 클라이언트의 요청 흐름을 `@Controller`와 `@RestController`의 차이점을 중심으로 각각의 처리 과정과 특징을 포함하여 설명하세요.

### Q6-1. `@Controller`와 `@RestController`

Spring MVC에서 `@Controller`와 `@RestController`는 모두 클라이언트의 HTTP 요청을 처리하는 Controller를 만들 때 사용한다.

하지만 **반환값을 처리하는 방식과 주된 사용 목적이 다르다.**

```text
`@Controller`
➡️ View 반환 중심
➡️ HTML 응답
➡️ 서버 사이드 렌더링에 주로 사용

`@RestController`
➡️ 데이터 반환 중심
➡️ JSON / XML 응답
➡️ HTTP API 개발에 주로 사용
```

### Q6-2. 공통적인 처리 흐름

두 Controller 모두 요청이 들어오는 초기 흐름은 비슷하다.

```text
Client
⬇️
DispatcherServlet
⬇️
HandlerMapping
⬇️
HandlerAdapter
⬇️
Controller
```

먼저 클라이언트가 HTTP 요청을 보내면 `DispatcherServlet`이 요청을 받는다.

이후 `HandlerMapping`을 통해 현재 요청 URL과 HTTP Method에 맞는 Controller를 찾는다.

예를 들어 `GET /users/1` 같은 요청이 들어왔다면 Spring MVC는 해당 요청과 매핑된 Controller 메서드를 찾고 실행한다.

이후 **Controller가 무엇을 반환하느냐에 따라 `@Controller`와 `@RestController`의 처리 과정이 달라진다.**

### Q6-3. `@Controller`의 처리 과정

`@Controller`는 기본적으로 **View를 반환하기 위한 Controller**다.

예를 들어 아래와 같은 Controller가 있다고 가정해보자.

```java
@Controller
public class UserController {

  @GetMapping("/users/{id}")
  public String getUser(
      @PathVariable Long id,
      Model model
  ) {

    User user = userService.getUser(id);

    model.addAttribute("user", user);

    return "userDetail";
  }
}
```

여기서 `return "userDetail"`는 `"userDetail"`이라는 문자열 자체를 HTTP Body로 반환한다는 의미가 아니라 **View의 이름을 반환한다는 의미**이다.

처리 과정은 아래와 같다.

```text
Client 요청
⬇️
DispatcherServlet
⬇️
HandlerMapping
⬇️
HandlerAdapter
⬇️
`@Controller` 메서드 실행
⬇️
비즈니스 로직 처리
⬇️
View 이름 반환 (ex: `"userDetail"`)
⬇️
ViewResolver
⬇️
실제 View 결정
⬇️
View가 Model 데이터를 이용해 HTML 생성
⬇️
HTML 응답
⬇️
Client
```

#### Model의 역할

위 코드에서 `model.addAttribute("user", user)`를 사용했다.

`Model`은 Controller에서 View에 전달할 데이터를 담는 역할을 한다.

```text
Controller
⬇️
Model에 데이터 저장

"user" ➡️ User 객체
            ⬇️
           View
            ⬇️
         HTML 생성
```

예를 들어 View에서는 Model의 `user` 데이터를 이용해서 `<h1>박정현</h1>`과 같은 HTML을 생성할 수 있다.

즉, `@Controller`에서는 보통

```text
데이터
➡️ Model

화면
➡️ View 이름
```

을 함께 준비한다고 이해하면 된다.

### Q6-4. `@RestController`의 처리 과정

`@RestController`는 View를 반환하는 것이 아니라 **객체 등의 데이터를 직접 HTTP Response Body에 반환하는 데 사용**한다.

예를 들어 아래처럼 코드가 구현되어 있다고 가정하자.

```java
@RestController
public class UserApiController {

  @GetMapping("/api/users/{id}")
  public UserDto getUser(
      @PathVariable Long id
  ) {

    User user = userService.getUser(id);

    return new UserDto(user);
  }
}
```

여기서는 Controller가 `return new UserDto(user)`처럼 Java 객체를 반환한다.

처리 과정은 아래와 같다.

```text
Client 요청
⬇️
DispatcherServlet
⬇️
HandlerMapping
⬇️
HandlerAdapter
⬇️
`@RestController` 메서드 실행
⬇️
비즈니스 로직 처리
⬇️
Java 객체 반환
⬇️
HttpMessageConverter
⬇️
객체를 JSON/XML 등의 형식으로 변환
⬇️
HTTP Response Body
⬇️
Client
```

#### `@RestController`는 왜 `ViewResolver`를 거치지 않을까?

`@RestController`는 `@Controller` + `@ResponseBody`의 역할을 결합한 형태라고 볼 수 있다.

`@ResponseBody`는 Controller의 반환값을 **View 이름으로 해석하지 않고 HTTP Response Body에 작성하도록 한다.**

따라서

```java
@RestController
public class UserController {

  @GetMapping("/users/1")
  public UserDto getUser() {
    return new UserDto(1L, "박정현");
  }
}
```

위 코드처럼 객체를 반환하면 아래와 같은 과정으로 처리된다.

```text
UserDto
⬇️
ViewResolver ❌
⬇️
HttpMessageConverter
⬇️
JSON
```

#### `HttpMessageConverter`의 역할

`@RestController`에서 Java 객체를 반환한다고 해서 객체 자체를 그대로 네트워크에 보낼 수 있는 것은 아니다.

따라서 `HttpMessageConverter`가 객체를 HTTP Response Body에 쓸 데이터로 변환한다.

예를 들어 JSON 응답이 선택된 경우, `HttpMessageConverter`가 Java 객체를 JSON으로 **직렬화(Serialization)**한다.

예를 들어

```java
new UserDto(
  1L,
  "박정현"
);
```

같은 객체가 있다면

```json
{
  "id": 1,
  "name": "박정현"
}
```

과 같은 형태로 변환될 수 있다.

### Q6-5. `@Controller`와 `@RestController`의 가장 큰 차이

가장 중요한 차이는 **Controller 메서드가 반환값을 어떻게 처리하느냐**이다.

| 구분                | `@Controller`                 | `@RestController`         |
| ------------------- | ----------------------------- | ------------------------- |
| 기본 목적           | View 반환                     | 데이터 반환               |
| 반환값 처리         | View 이름으로 해석            | HTTP Response Body로 처리 |
| 주요 처리 구성 요소 | `ViewResolver`                | `HttpMessageConverter`    |
| 대표 응답           | HTML                          | JSON/XML                  |
| 주 사용 목적        | 웹 페이지, 서버 사이드 렌더링 | HTTP API                  |
| `@ResponseBody`     | 필요 시 개별 사용             | 기본적으로 포함           |

#### `@Controller`

```text
Controller
⬇️
View 이름
⬇️
ViewResolver
⬇️
View
⬇️
HTML
```

#### `@RestController`

```text
Controller
⬇️
Java 객체
⬇️
HttpMessageConverter
⬇️
JSON 또는 XML 등
```

### Q6-6. `@Controller`에서도 JSON을 반환할 수 있는가?

가능하다.

`@Controller`를 사용하면서 메서드에 `@ResponseBody`를 붙이면 반환값을 View 이름이 아니라 HTTP Body에 작성할 수 있다.

```java
@Controller
public class UserController {

  @GetMapping("/api/users/{id}")
  @ResponseBody
  public UserDto getUser(
      @PathVariable Long id
  ) {

    User user = userService.getUser(id);

    return new UserDto(user);
  }
}
```

해당 메서드는 `@RestController`와 동일한 방식으로 응답 데이터를 처리한다.

그래서 여러 메서드가 모두 API 응답을 반환하는 Controller라면 보통 `@RestController`를 사용하는 편이 간단하다.

### Q6-7. `@Controller`와 `@RestController`는 언제 사용하는가?

`@Controller`는 주로 서버에서 View를 렌더링하여 HTML을 반환할 때 사용한다.

반면 `@RestController`는 **HTTP API 개발, 클라이언트·서버 분리 구조, 서비스 간 데이터 통신** 등에 사용한다.

### Q6-8. 전체 과정 비교

```text
[공통 흐름]

Client
⬇️
DispatcherServlet
⬇️
HandlerMapping
⬇️
HandlerAdapter
⬇️
Controller 메서드 실행
       ⬇️
        ├────────────────────────────┐
       ⬇️                           ⬇️
  `@Controller`               `@RestController`
       ⬇️                           ⬇️
    View 이름 반환                 객체 반환
       ⬇️                           ⬇️
  `ViewResolver`            `HttpMessageConverter`
       ⬇️                           ⬇️
      View                       JSON / XML
       ⬇️                           ⬇️
 Model 데이터로 HTML 생성       HTTP Response Body
       ⬇️                           ⬇️
      Client                       Client
```

**요청을 받아 Controller를 찾고 실행하는 전반부는 비슷하지만, 반환값 처리 방식에서 `ViewResolver`와 `HttpMessageConverter`로 갈린다.**
