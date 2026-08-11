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
last_modified_at: 2026-02-09
---

## Q5. Spring에서 AOP(Aspect Oriented Programming)가 필요한 이유와 이를 활용한 실제 애플리케이션 개발 사례에 대해 설명하세요.

### Q5-1. 답변

#### 01. Spring에서 AOP가 필요한 이유

AOP는 로깅이나 트랜잭션, 보안 검사, 실행 시간 측정 등 모든 모듈에서 반복적으로 등장하는 로직에 사용되는데,

- AOP가 없다면
  - 모든 비즈니스 메서드에 중복해서 들어가는 코드가 존재
  - 로직을 변경해야 할 경우, 모든 메서드를 수정해야 함

그래서 AOP를 사용해 모든 모듈에 반복적으로 등장하는 로직을 공통화하여 재사용 가능하게 만들기 위해 필요하다.

#### 02. AOP를 활용한 실제 애플리케이션 개발 사례

- 메서드 실행 전 해당 유저의 존재 여부나 권한 확인
- 디버깅을 위한 로깅

<br>

### Q5-2. 정리

#### AOP의 필요성

비즈니스 로직을 개발할 때 핵심 기능과 부가 기능이 섞여 있으면 다음과 같은 문제가 발생합니다. 예를 들어, 모든 비즈니스 메서드의 실행 시간을 측정해야 한다고 가정해보겠습니다.

```java

java
Copy
public class UserService {
    public void createUser(User user) {
        // 시간 측정 시작
        long start = System.currentTimeMillis();

        // 실제 비즈니스 로직
        validateUser(user);
        userRepository.save(user);
        sendWelcomeEmail(user);

        // 시간 측정 종료 및 로깅
        long end = System.currentTimeMillis();
        System.out.println("실행 시간: " + (end - start) + "ms");
    }
}

```

위와 같은 코드는 다음과 같은 문제를 발생시킵니다:

- 시간 측정 코드가 모든 비즈니스 메서드에 중복해서 들어가게 됩니다.
- 핵심 비즈니스 로직과 부가 기능이 섞여 있어 코드의 가독성이 떨어집니다.
- 시간 측정 로직을 변경해야 할 경우, 모든 메서드를 수정해야 합니다.

#### AOP를 통한 해결

AOP를 사용하면 이러한 문제를 다음과 같이 해결할 수 있습니다:

```java

@Aspect
@Component
public class TimeTraceAspect {
    @Around("execution(* com.example.service..*(..))")
    public Object trackTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();

        try {
            // 실제 비즈니스 메서드 실행
            return joinPoint.proceed();
        } finally {
            long end = System.currentTimeMillis();
            System.out.println(joinPoint.getSignature() + " 실행 시간: " + (end - start) + "ms");
        }
    }
}

```

이렇게 AOP를 적용하면 다음과 같은 장점을 얻을 수 있습니다:

- 비즈니스 로직과 부가 기능이 명확히 분리됩니다.
- 코드 중복이 제거되어 유지보수가 용이해집니다.
- 애플리케이션의 여러 부분에 일관된 방식으로 기능을 적용할 수 있습니다.

#### 실제 활용 사례

실무에서 AOP는 다음과 같은 상황에서 주로 활용됩니다:

- 메서드 실행 시간 모니터링
  - 성능 병목 지점을 찾기 위해 각 메서드의 실행 시간을 측정할 때 사용
  - 특정 임계값을 초과하는 경우 경고를 발생시키는 등의 모니터링 가능
- 보안 및 인증 처리
  - 특정 메서드 실행 전에 사용자의 권한을 확인
  - API 호출 시 인증 토큰의 유효성 검사
- 로깅
  - 메서드 호출과 관련된 다양한 정보(파라미터, 반환값, 예외 등)를 일관된 형식으로 기록
  - 디버깅 및 모니터링에 활용

이처럼 AOP는 애플리케이션의 부가적인 관심사를 효과적으로 모듈화하여 관리할 수 있게 해주며, 이는 코드의 품질과 유지보수성을 크게 향상시킵니다. 특히 기업의 대규모 애플리케이션에서 공통 관심사를 처리할 때 그 진가를 발휘하며, Spring 프레임워크의 핵심적인 기능 중 하나로 자리 잡고 있습니다.

---

## Q6. Spring MVC에서 클라이언트의 요청 흐름을 `@Controller`와 `@RestController`의 차이점을 중심으로 각각의 처리 과정과 특징을 포함하여 설명하세요.

### Q6-1. 답변

#### 01. `@Controller`와 `@RestController`

- `@Controller`
  - 전통적인 Spring MVC 컨트롤러로, View 반환이 목적
- `@RestController`
  - `@Controller` + `@ResponseBody`
  - 데이터 자체를 반환하는 것이 목적이라, HTTP API에 개발에 특화

#### 02. `@Controller`와 `@RestController`의 처리 과정

##### 1) `@Controller`의 처리 과정

- `DispatcherServlet`이 요청을 받아
- `HandlerMapping`와 `HandlerAdapter`가 적합한 컨트롤러를 찾고
- 컨트롤러 로직을 처리 후 View 이름을 반환
- `ViewResolver`가 View를 찾고,
- View가 HTML 생성
- 생성된 HTML을 클라이언트로 반환

##### 2) `@RestController`

- `DispatcherServlet`이 요청을 받아
- `HandlerMapping`와 `HandlerAdapter`가 적합한 컨트롤러를 찾고
- 컨트롤러 로직 처리 후 객체 반환
- `HttpMessageConverter`가 객체를 JSON/XML로 변환
- 변환된 데이터를 클라이언트에 반환

<br>

### Q6-2. 정리

#### `@Controller` vs `@RestController`

- `@Controller`
  - 전통적인 Spring MVC 컨트롤러
  - View 반환이 기본 목적
  - ViewResolver를 통한 View 처리 수행
- `@RestController`
  - @Controller + @ResponseBody의 조합
  - 데이터 자체를 반환하는 것이 목적
  - HTTP API 개발에 특화

#### `@Controller`의 처리 흐름

```java

@Controller
public class UserController {
    @GetMapping("/users/{id}")
    public String getUser(@PathVariable Long id, Model model) {
        User user = userService.getUser(id);
        model.addAttribute("user", user);
        return "userDetail";// View 이름 반환
    }
}

```

- DispatcherServlet이 요청을 받음
- HandlerMapping으로 적절한 컨트롤러 찾음
- 컨트롤러에서 로직 처리 후 View 이름 반환
- ViewResolver가 View 이름을 실제 View로 변환
- View가 Model 데이터를 사용하여 HTML 생성
- 생성된 HTML이 클라이언트에게 반환

#### `@RestController`의 처리 흐름

```java

@RestController
public class UserApiController {
    @GetMapping("/api/users/{id}")
    public UserDto getUser(@PathVariable Long id) {
        User user = userService.getUser(id);
        return new UserDto(user);// 객체 직접 반환
    }
}

```

- DispatcherServlet이 요청을 받음
- HandlerMapping으로 적절한 컨트롤러 찾음
- 컨트롤러에서 로직 처리 후 객체 직접 반환
- HttpMessageConverter가 객체를 JSON/XML로 변환
  - 기본적으로 Jackson2가 JSON 변환을 담당
- 변환된 데이터가 클라이언트에게 반환

#### 응답 형식의 차이

- `@Controller`
  - 기본적으로 View를 반환
  - HTML 형태의 응답
  - Content-Type: text/html
- `@RestController`
  - 데이터를 직접 반환
  - JSON/XML 형태의 응답
  - Content-Type: application/json (기본값)

#### 사용 용도의 차이

- `@Controller`
  - 웹 페이지 제공
  - 서버 사이드 렌더링
  - 동적 HTML 생성

    ```java

    @Controller
    public class ViewController {
        @GetMapping("/dashboard")
        public String dashboard(Model model) {
            model.addAttribute("stats", statsService.getStats());
            return "dashboard";// dashboard.html 뷰 반환
        }
    }

    ```

- `@RestController`
  - RESTful API 개발
  - 클라이언트-서버 분리 아키텍처
  - 마이크로서비스 간 통신

    ```java

    @RestController
    public class ApiController {
        @PostMapping("/api/users")
        public ResponseEntity<UserDto> createUser(@RequestBody UserRequest request) {
            UserDto user = userService.createUser(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(user);
        }
    }

    ```
