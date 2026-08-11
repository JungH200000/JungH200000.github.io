---
layout: single-editorial
title: '[TIL 88일 차] Sprint Mission12'
excerpt: '4.심화 요구사항'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til088

toc: true
toc_sticky: true

date: 2026-06-18
last_modified_at: 2026-06-18
---

# 오늘의 성취

## 1. 개발 진행 상황

- 웹소켓 인증/인가 처리
  - `ChannelInterceptor`의 구현체 `JwtAuthenticationChannelInterceptor` 구현해 인증 처리
  - `MessageMatcherDelegatingAuthorizationManager`를 활용해 인가 처리

---

# 프로젝트 요구 사항

`//...`

## 4. 심화 요구사항

### 4-01. 웹소켓 인증/인가 처리하기

- [x] 인증 처리
  - 디스코드잇 클라이언트는 `CONNECT` 프레임의 헤더에 다음과 같이 `Authorization` 토큰을 포함합니다.
    ```
    CONNECT
    Authorization:Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ3b29keSIsImV4cCI6MTc0OTM5MzA0OCwiaWF0IjoxNzQ5MzkyNDQ4LCJ1c2VyRHRvIjp7ImlkIjoiMDQwZTk2ZWMtMjdmNC00Y2MxLWI4MWQtNTMyM2ExZWQ5NTZhIiwidXNlcm5hbWUiOiJ3b29keSIsImVtYWlsIjoid29vZHlAZGlzY29kZWl0LmNvbSIsInByb2ZpbGUiOm51bGwsIm9ubGluZSI6bnVsbCwicm9sZSI6IlVTRVIifX0.JOkvCpnR0e0KMQYLh_hUWglgTvUIlfQOT58eD4Cym5o
    accept-version:1.2,1.1,1.0
    heart-beat:4000,4000
    ```
  - 서버 측에서는 `ChannelInterceptor`를 구현하여 연결 시 토큰을 검증하고, 인증된 사용자 정보를 `SecurityContext`에 설정해야 합니다.
    > 참고 문서: [Spring 공식 문서](https://docs.spring.io/spring-framework/reference/web/websocket/stomp/authentication-token-based.html)
    ```java
    @Configuration
    @EnableWebSocketMessageBroker
    @RequiredArgsConstructor
    public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
        ...
      @Override
      public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(...);
      }
    }
    ```
  - `CONNECT` 프레임일 때 엑세스 토큰을 검증하는 `JwtAuthenticationChannelInterceptor` 구현체를 정의하세요.

    ```java
    public class JwtAuthenticationChannelInterceptor implements ChannelInterceptor {

        @Override
      public Message<?> preSend(Message<?> message, MessageChannel channel) {
            StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message,
            StompHeaderAccessor.class);
          if (StompCommand.CONNECT.equals(accessor.getCommand())) {
              ... // 검증 로직

              UsernamePasswordAuthenticationToken authentication = ...
              accessor.setUser(authentication);
          }
          return message;
      }

    }
    ```

    - 검증 로직은 이전에 구현한 `JwtAuthenticationFilter`를 참고하세요.
    - 인증이 완료되면 `SecurityContext`에 인증정보를 저장하는 대신 `accessor` 객체에 저장하세요.

  - `SecurityContextChannelInterceptor`를 등록하여 이후 메시지 처리 흐름에서도 인증 정보를 활용할 수 있도록 구성하세요.
    ```diff
      @Override
      public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(
            jwtAuthenticationChannelInterceptor,
          new SecurityContextChannelInterceptor(),
        );
      }
    ```

- [x] 인가 처리
  - `AuthorizationChannelInterceptor`를 사용해 메시지 권한 검사를 수행합니다.
  - `AuthorizationChannelInterceptor`를 활용하기 위해 의존성을 추가하세요.
    ```groovy
    implementation 'org.springframework.security:spring-security-messaging'
    ```
  - `MessageMatcherDelegatingAuthorizationManager`를 활용해 인가 정책을 정의하고, 채널에 추가하세요.
    ```java
      private AuthorizationChannelInterceptor authorizationChannelInterceptor() {
        return new AuthorizationChannelInterceptor(
            MessageMatcherDelegatingAuthorizationManager.builder()
                .anyMessage().hasRole(Role.USER.name())
                .build()
        );
      }
    ```
    ```diff
      @Override
      public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(
            jwtAuthenticationChannelInterceptor,
          new SecurityContextChannelInterceptor(),
            authorizationChannelInterceptor()
        );
      }
    ```

`//...`

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint12](https://github.com/JungH200000/10-sprint-mission/tree/sprint12)

---

# 정리 및 보관용 코드
