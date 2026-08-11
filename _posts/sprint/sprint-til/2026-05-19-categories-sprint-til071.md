---
layout: single-editorial
title: '[TIL 71일 차] Sprint Mission9'
excerpt: '4-08.인가 - 권한 적용 ~ 5-01.세션 관리 고도화'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til071

toc: true
toc_sticky: true

date: 2026-05-19
last_modified_at: 2026-05-19
---

# 오늘의 성취

## 1. 개발 진행 상황

- 인가 - 권한 적용
  - `authorizeHttpRequests` 활성화
  - Method Security 활성화
  - Service 메서드별 권한 수정
    - public 채널 생성, 수정, 삭제 : `CHANNEL_MANAGER`
    - 사용자 권한 수정 : `ADMIN`
  - 인증/인가 예외 처리 핸들러 구현
  - 권한 계층 구조 정의
- QA 및 Feedback
  - Private 채널 삭제를 `CHANNEL_MANAGER`가 할 수 있다고 명시되어 있지 않은데, 현재 구현한 코드로는 `ChannelType`이 `public`인지 `private`인지 확인하기 전에, 삭제 요청 전체가 `CHANNEL_MANAGER` 권한만으로 통과됨
    - 심화 요구사항에 존재하므로 나중에 Evaluator로 구현
- 세션 관리 고도화
  - 동일한 계정으로 동시 로그인 불가능하도록 설정
  - 권한이 변경된 사용자가 로그인 상태라면 세션 무효화

## 2. 질문

### `MethodSecurityExpressionHandler`를 `static`으로 선언하는 이유

```java
@Configuration
@Slf4j
@RequiredArgsConstructor
@EnableMethodSecurity(prePostEnabled = true) // Method Security 활성화
public class SecurityConfig {

    // ...

    // Role Hierarchy (권한 계층 구조)
    @Bean
    public RoleHierarchy roleHierarchy() {
        // builder 방식
        // `withDefaultRolePrefix` 사용 시 `ROLE_` prefix를 자동으로 붙여줌
        return RoleHierarchyImpl.withDefaultRolePrefix()
                .role("ADMIN").implies("CHANNEL_MANAGER")
                .role("CHANNEL_MANAGER").implies("USER")
                .build();
    }

    // Method Security 표현식을 처리하는 핸들러 설정
    @Bean
    static MethodSecurityExpressionHandler methodSecurityExpressionHandler(RoleHierarchy roleHierarchy) {
        // @PreAuthorize, @PostAuthorize 같은 Method Security 표현식을 처리하는 핸들러
        DefaultMethodSecurityExpressionHandler handler = new DefaultMethodSecurityExpressionHandler();

        // Method Security에서도 RoleHierarchy가 적용되도록 설정
        handler.setRoleHierarchy(roleHierarchy);

        return handler;
    }
}
```

Spring Security 공식 문서에서는 아래처럼 설명한다.

`MethodSecurityExpressionHandler`를 `static` 메서드로 노출하면, Spring이 Spring Security의 method security `@Configuration` 클래스들을 초기화하기 전에 해당 Bean을 먼저 publish할 수 있다.

- 즉, Method Security 설정이 만들어지기 전에 작성한 `MethodSecurityExpressionHandler`를 먼저 Bean으로 등록한다.
- 그래야 `@PreAuthorize`, `@PostAuthorize`에서 RoleHierarchy가 반영된 handler를 사용할 수 있다.

조금 더 보충 설명해보자면

```text
`@EnableMethodSecurity` 활성화
➡️ Spring Security가 메서드 보안용 내부 설정(Bean)들을 초기화
➡️ 이때 `MethodSecurityExpressionHandler`가 필요함
➡️ 구현한 handler가 아직 Bean으로 등록되지 않았다면
➡️ 기본 handler를 사용하게 될 수 있음
➡️ 그러면 RoleHierarchy가 반영되지 않음
```

<br>

### Evaluator란?

- SpEL 자체가 아니라, SpEL 안에서 호출할 수 있는 권한 판단 컴포넌트
- 추후 구현할 때 코드를 통해 알아볼 예정

---

# 프로젝트 요구 사항

## 2. 기본 요구사항

`//...`

### 4-08. 인가 - 권한 적용

- [x] `authorizeHttpRequests`를 활성화하고, 모든 요청을 인증하도록 설정하세요.
  ```java
  http
      .authorizeHttpRequests(auth -> auth
        .anyRequest().authenticated()
    )
  ```
- [x] 다음의 요청은 인증하지 않도록 설정하세요.

  ```java
  http
      .authorizeHttpRequests(auth -> auth
        ...
        .requestMatchers(...).permitAll()
    )
  ```

  - Csrf Token 발급
  - 회원가입
  - 로그인
  - 로그아웃
  - API가 아닌 요청(Swagger, Actuator 등)

- [x] Method Security를 활성화하세요.
  ```java
  ...
  @EnableMethodSecurity
  public class SecurityConfig {...}
  ```
- [x] Service의 메소드 별로 아래의 조건에 맞게 권한을 수정하세요.
  - 퍼블릭 채널 생성, 수정, 삭제는 `CHANNEL_MANAGER` 권한을 가져야합니다.
  - 사용자 권한 수정은 `ADMIN` 권한을 가져야합니다.
- [x] 적절한 권한이 없는 경우 403 응답을 반환하세요.
  - `SecurityFilterChain`
    ```java
    http
        .exceptionHandling(ex -> ex
          .authenticationEntryPoint(...)
          .accessDeniedHandler(...)
      )
    ```
  - `GlobalExceptionHandler`
    ```java
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {...}
    ```
- [x] `RoleHierarchy`를 활용해 권한의 계층 구조를 정의하세요.
  - 관리자 > 채널 매니저 > 일반 사용자
    - 관리자 권한은 채널 매니저, 일반 사용자 권한을 포함합니다.
    - 채널 매니저 권한은 일반 사용자 권한을 포함합니다.

  ```java
  @Bean
  public RoleHierarchy roleHierarchy() {...}

  @Bean
  static MethodSecurityExpressionHandler methodSecurityExpressionHandler(
      RoleHierarchy roleHierarchy) {
    DefaultMethodSecurityExpressionHandler handler = new DefaultMethodSecurityExpressionHandler();
    handler.setRoleHierarchy(roleHierarchy);
    return handler;
  }
  ```

---

## 5. 심화 요구사항

### 5-01. 세션 관리 고도화

- [x] 동일한 계정으로 동시 로그인할 수 없도록 설정하세요.
  - `sessionConcurrency` 설정을 활용하세요.
    ```java
    http
        .sessionManagement(management -> management
            .sessionConcurrency(concurrency -> concurrency
                ...
            )
        )
    ```
  - 세션의 동일성을 보장하기 위해 `DiscodeitUserDetails`의 `equals()`, `hashcode()` 메소드를 오버라이딩하세요.
    > [공식 문서](https://docs.spring.io/spring-security/reference/servlet/authentication/session-management.html#ns-concurrent-sessions)
    >
    > If you are using a custom implementation of `UserDetails`, ensure you override the **equals()** and **hashCode()** methods. The default `SessionRegistry` implementation in Spring Security relies on an in-memory Map that uses these methods to correctly identify and manage user sessions. Failing to override them may lead to issues where session tracking and user comparison behave unexpectedly.
- [x] 권한이 변경된 사용자가 로그인 상태라면 세션을 무효화하세요.
  - `sessionRegistry`를 활용하세요.

  ```java
  @Bean
  public SecurityFilterChain filterChain(
        ...
      HttpSecurity http,
      SessionRegistry sessionRegistry
      ) {
      http
          .sessionManagement(management -> management
              .sessionConcurrency(concurrency -> concurrency
                  ...
                  .sessionRegistry(sessionRegistry)
              )
          )
      ...
  }

  @Bean
  public SessionRegistry sessionRegistry() {...}
  ```

  ```java
  @Service
  public class BasicAuthService implements AuthService {
    ...
    private final SessionRegistry sessionRegistry;
    ...
  }
  ```

`//...`

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint9](https://github.com/JungH200000/10-sprint-mission/tree/sprint9)
