---
title: '[TIL 75일 차] Sprint Mission10'
excerpt: '3.기본 요구사항'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til075

toc: true
toc_sticky: true

date: 2026-05-23
last_modified_at: 2026-05-25
---

# 오늘의 성취

## 1. 개발 진행 상황

- JWT 컴포넌트 구현
  - 토큰 발급, 갱신, 검증을 담당하는 `JwtTokenProvider` 컴포넌트 구현
- 리팩터링 - 로그인
  - `AuthenticationSuccessHandler`를 `JwtLoginSuccessHandler`로 대체
    - 인증 성공 시, 토큰 발급
- JWT 인증 필터 구현
  - Access Token을 통해 인증하는 `JwtAuthenticationFilter` filter 구현
    - 요청당 한 번만 실행되도록 `OncePerRequestFilter` 상속
- Refresh Token으로 Access Token 재발급
  - Refresh Token Rotation 적용
- 리팩터링 - 로그아웃
  - 쿠키에 저장된 Refresh Token을 삭제하는 `JwtLogoutHandler` 구현

---

# 프로젝트 요구 사항

## 3. 기본 요구사항

### 3-01. JWT 컴포넌트 구현

- [x] JWT 의존성을 추가하세요.

  ```groovy

  implementation 'com.nimbusds:nimbus-jose-jwt:10.3'
  ```

- [x] 토큰을 발급, 갱신, 유효성 검사를 담당하는 컴포넌트(`JwtTokenProvider`)를 구현하세요.
      [s0yti3992-image.png](https://bakey-api.codeit.kr/api/files/resource?root=static&seqId=14437&version=1&directory=/s0yti3992-image.png&name=s0yti3992-image.png)

### 3-02. 리팩토링 - 로그인

- 미션 9와 마찬가지로 Spring Security의 formLogin + 미션 9의 인증 흐름은 그대로 유지하면서 필요한 부분만 대체합니다.
- [x] 세션 생성 정책을 `STATELESS`로 변경하고, `sessionConcurrency` 설정을 삭제하세요.

  ```java

  http
      .sessionManagement(session -> session
          ...
          .sessionCreationPolicy(...)
      )
  ```

- [x] `AuthenticationSuccessHandler` 컴포넌트를 대체하세요.
  - 기존 구현체는 `LoginSuccessHandler`입니다.
  - `JwtLoginSuccessHandler`를 정의하고 대체하세요.

    ```java

    @Component
    public class LoginSuccessHandler implements AuthenticationSuccessHandler {
        ...
        @Override
      public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
          Authentication authentication) throws IOException, ServletException {
          ...
      }
    }
    ```

    - 인증 성공 시 `JwtProvider`를 활용해 토큰을 발급하세요.
      - 엑세스 토큰은 응답 Body에 포함하세요.
      - 리프레시 토큰은 쿠키(`REFRESH_TOKEN`)에 저장하세요.
    - `200 JwtDto`로 응답합니다.
      [7s8mi349r-image.png](https://bakey-api.codeit.kr/api/files/resource?root=static&seqId=14438&version=1&directory=/7s8mi349r-image.png&name=7s8mi349r-image.png)

  - 설정에 추가하세요.

    ```java

    http
        .formLogin(login -> login
            ...
            .successHandler(jwtLoginSuccessHandler)
        )
    ```

### 3-03. JWT 인증 필터 구현

- [x] 엑세스 토큰을 통해 인증하는 필터(`JwtAuthenticationFilter`)를 구현하세요.

  ```java

  public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
        FilterChain filterChain) throws ServletException, IOException {...}
  ```

  - 요청 당 한번만 실행되도록 `OncePerRequestFilter`를 상속하세요.
  - 요청 헤더(`Authorization`)에 Bearer 토큰이 포함된 경우에만 인증을 시도하세요.
  - `JwtProvider`를 통해 엑세스 토큰의 유효성을 검사하세요.
  - 유효한 토큰인 경우 `UsernamePasswordAuthenticationToken` 객체를 활용해 인증 완료 처리하세요.

    ```java

    UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    userDetails.getAuthorities()
                );
    SecurityContextHolder.getContext().setAuthentication(authentication);
    ```

### 3-04. 리프레시 토큰을 활용한 엑세스 토큰 재발급

- [x] 리프레시 토큰을 활용해 엑세스 토큰을 재발급하는 API를 구현하세요.
  - API 스펙
    - 엔드포인트: `POST /api/auth/refresh`
    - 요청: `Header Cookie: REFRESH_TOKEN=…`
    - 응답
      - 리프레시 토큰이 유효한 경우: `200 JwtDto`
      - 리프레시 토큰이 유효하지 않은 경우: `401 ErrorResponse`
  - `permitAll` 설정에 포함하세요.
    - 이 API는 엑세스 토큰이 없거나 만료된 상태에서 호출하게 됩니다.
- [x] 리프레시 토큰 Rotation을 통해 보안을 강화하세요.
- [x] 토큰 재발급 API로 대체할 수 있는 컴포넌트를 모두 삭제하세요.
  - Me API (`GET /auth/me`)
    > - 프론트엔드 `2.0.x`과 마찬가지로 `2.1.x`에서는 사용자 정보와 엑세스 토큰 정보를 브라우저의 메모리에서 관리합니다.
    > - 따라서 새로고침 시 쿠키에 저장된 리프레시 토큰을 통해 엑세스 토큰을 갱신합니다.
- RememberMe
  - 쿠키에 저장된 리프레시 토큰이 RememberMe의 기능을 대체할 수 있습니다.

### 3-05. 리팩토링 - 로그아웃

- [x] 쿠키에 저장된 리프레시 토큰을 삭제하는 `LogoutHandler`를 구현하세요.

  ```java

  public class JwtLogoutHandler implements LogoutHandler {

    @Override
    public void logout(HttpServletRequest request, HttpServletResponse response,
        Authentication authentication) {...}
  ```

- [x] 구현한 핸들러를 추가하세요.

  ```java

  http
    .logout(logout -> logout
        ...
        .addLogoutHandler(jwtLogoutHandler)
    )
  ```

`//...`

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint10](https://github.com/JungH200000/10-sprint-mission/tree/sprint10)

---
