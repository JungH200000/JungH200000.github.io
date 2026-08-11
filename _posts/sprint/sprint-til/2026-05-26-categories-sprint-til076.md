---
layout: single-editorial
title: '[TIL 76일 차] Sprint Mission10'
excerpt: '4.심화 요구사항'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til076

toc: true
toc_sticky: true

date: 2026-05-26
last_modified_at: 2026-05-26
---

# 오늘의 성취

## 1. 개발 진행 상황

- 리팩터링 - 토큰 상태 관리
  - `JwtRegistry` 인테페이스 구현 후 `InMemoryJwtRegistry` 구현체 구현
  - `JwtAuthenticationFilter`에서 `JwtRegistry`를 활용해 토큰의 상태를 검사하는 로직을 추가
  - `JwtRegistry`를 활용해 동시 로그인 제한 기능을 리팩토링
    - 동일한 계정으로 로그인 시 기존 로그인 세션을 무효화
  - `JwtRegistry`를 활용해 권한이 변경된 사용자가 로그인 상태라면 강제로 로그아웃되도록 구현
  - `JwtRegistry`를 활용해 사용자의 로그인 여부를 판단하도록 리팩토링.
  - `JwtLogoutHandler`에서 `JwtRegistry`를 활용해 로그아웃 시 토큰을 무효화
  - `@Scheduled`를 활용해 주기적으로 만료된 토큰 정보를 레지스트리에서 삭제

---

# 프로젝트 요구 사항

`//...`

## 4. 심화 요구사항

### 4-01. 리팩토링 - 토큰 상태 관리

- 토큰 기반 인증 방식은 세션 기반 인증 방식과 달리 무상태(stateless)이기 때문에 사용자의 로그인 상태를 제어하기 어렵습니다.
- 따라서 `SessionRegistry`를 통해 세션의 상태를 관리했던 것처럼, JWT의 상태를 관리할 수 있는 컴포넌트를 추가해야합니다.
- [x] 토큰의 상태를 관리하는 `JwtRegistry`를 구현하세요.
  - `JwtRegistry`
    - `registerJwtInformation`
      - 로그인 성공 시 `JwtInformation`을 등록합니다.
      - 최대 동시 로그인 수(`1`)를 제어합니다.
    - `invalidateJwtInformationByUserId`: UserId로 해당 유저의 모든 `JwtInformation` 정보를 삭제합니다.
    - `hasActiveJwtInformationBy*`: `JwtInformation`이 Registry에 존재하는지 확인합니다.
      - `ByUserId`: 사용자의 로그인 상태를 판단할 때 활용합니다.
      - `ByAccessToken`: 필터에서 유효한 토큰인지 확인할 때 활용합니다.
      - `ByRefreshToken`: 토큰 재발급 시 유효한 토큰인지 확인할 때 활용합니다.
    - `rotateJwtInformation`: 토큰 재발급 시 토큰 로테이션을 수행합니다.
    - `clearExpiredJwtInformation`: 만료된 `JwtInformation`을 삭제합니다.
  - `InMemoryJwtRegistry`
    - 메모리에 `JwtInformation`을 저장하는 `JwtRegistry` 구현체입니다.
    - 동시성 처리를 위해 다음과 같이 구성하세요. 동시성에 대해서는 다음 미션에서 학습합니다.

      ```java

      public class InMemoryJwtRegistry implements JwtRegistry {

        // <userId, Queue<JwtInformation>>
        private final Map<UUID, Queue<JwtInformation>> origin = new ConcurrentHashMap<>();
        private final int maxActiveJwtCount;
          ...
      }
      ```

<img src="../../../assets/images/posts_img/til/sprint-til/76/jwtregistry.png" width=600px>

- [x] `JwtAuthenticationFilter`에서 `JwtRegistry`를 활용해 토큰의 상태를 검사하는 로직을 추가하세요.
- [x] `JwtRegistry`를 활용해 동시 로그인 제한 기능을 리팩토링하세요.
  - 동일한 계정으로 로그인 시 기존 로그인 세션을 무효화합니다.
- [x] `JwtRegistry`를 활용해 권한이 변경된 사용자가 로그인 상태라면 강제로 로그아웃되도록 하세요.
- [x] `JwtRegistry`를 활용해 사용자의 로그인 여부를 판단하도록 리팩토링하세요.
- [x] `JwtLogoutHandler`에서 `JwtRegistry`를 활용해 로그아웃 시 토큰을 무효화하세요.

  ```java

    @Override
    public void logout(HttpServletRequest request, HttpServletResponse response,
        Authentication authentication) {
      ...
      Arrays.stream(request.getCookies())
          .filter(cookie -> cookie.getName().equals(JwtTokenProvider.REFRESH_TOKEN_COOKIE_NAME))
          .findFirst()
          .ifPresent(cookie -> {...});
          ...
    }
  ```

  - 로그아웃 API는 인증이 필요없기 때문에 `Authentication` 정보가 없을 수 있습니다.
  - 따라서 요청 쿠키의 리프레시 토큰을 활용해 토큰을 무효화합니다.

- [x] 주기적으로 만료된 토큰 정보를 레지스트리에서 삭제하세요.
  - `@EnableScheduling`를 추가하세요.

    ```java

        @Configuration
        @EnableJpaAuditing
        @EnableScheduling
        public class AppConfig {

        }
    ```

  - `@Scheduled`를 활용해서 5분마다 만료된 토큰을 삭제하세요.

    ```java

      @Scheduled(fixedDelay = 1000 * 60 * 5)
      @Override
      public void clearExpiredJwtInformation() {...}
    ```

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint10](https://github.com/JungH200000/10-sprint-mission/tree/sprint10)

---
