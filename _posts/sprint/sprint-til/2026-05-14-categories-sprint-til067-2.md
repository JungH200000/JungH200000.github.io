---
layout: single-editorial
title: '[TIL 67-2일 차] Spring Security 쿠키/세션 기반 인증/인가'
excerpt: '4.동시 세션 제어와 세션 고정 보호 ~ 6.세션 기반 사용자 인가 구현'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til067-2

toc: true
toc_sticky: true

date: 2026-05-14
last_modified_at: 2026-05-14
---

# <span style="background-color: #FFF9C4">4. 동시 세션 제어와 세션 고정 보호</span>

## 4-01. 동시 세션 제어

웹 애플리케이션은 기본적으로 하나의 계정으로 여러 기기나 브라우저에서 동시 접속 가능하다. 하지만 보안상 또는 비즈니스 정책상 제한할 필요가 있다.

- 은행, 금융 서비스 ➡️ 한 계정이 여러 곳에서 동시 로그인하면 위험
- 온라인 시험 시스템 ➡️ 한 계정이 여러 기기에서 동시 시험 응시 불가

➡️ **동일 사용자의 동시 세션 수를 제어**하는 기능 필요

<br>

## 1) 동시 세션 제어 필요성

- **보안 강화**: 계정 공유, 세션 탈취 등을 방지
- **정책 준수**: 특정 서비스 이용 약관 (1인 1계정 원칙 등)
- **리소스 절약**: 불필요한 세션 사용을 줄여 서버 부하 완화

<br>

### 2) Spring Security에서 동시 세션 제어

`SessionManagementConfigurer`를 통해 동시 세션 제어

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            //...
            .sessionManagement(session -> session
                .maximumSessions(1) // 최대 허용 세션 수 설정
                .maxSessionsPreventsLogin(true) // 새로운 로그인 차단 여부 설정
            );
            //../
    }
}
```

#### `maximumSessions(...)`

동일 사용자가 동시에 가질 수 있는 세션의 최대 개수

- `(...)` 안에 들어가는 수만큼 세션 허용

#### `maxSessionsPreventsLogin(...)`

최대 세션 수를 초과했을 때의 동작 방식 정의

- `true` : 새로운 로그인 시도 차단 ➡️ 기존 세션 유지 ➡️ **보안 민감 서비스(금융, 공공기관)**
- `false`(기본값) : 새로운 로그인 허용 ➡️ 기존 세션 중 하나 만료 ➡️ **일반 서비스(커뮤니트, 쇼핑몰 등)**

<br>

## 4-02. 세션 고정 보호

### 1) 세션 고정 (Session Fixation) 공격

공격자가 미리 발급받은 세션 ID를 피해자에게 강제로 사용하게 한 뒤, 해당 세션을 탈취하는 공격 기법

<img src="{{ '/assets/images/posts_img/til/sprint-til/67/session_fixation_workflow.png' | relative_url }}" style="width: 600px;">

- 핵심 문제는 **로그인 이후에도 세션 ID가 바뀌지 않고 그대로 유지**되는 상황

<br>

### 2) Spring Security의 세션 고정 보호 전략

로그인 시점에 세션 ID를 어떻게 다룰지 결정하는 **session fixation 보호 전략**을 제공

```java
http.sessionManagement(session -> session
    .sessionFixation(fixation -> fixation.migrateSession()));
```

- **전략**
  - `none` : 기존 세션 그대로 유지 ➡️ 보호 없음
  - `newSession` : 새로운 세션 생성하고 기존 속성 복사 X ➡️ 세션 완전 초기화
    - **권장**: 극단적 보안이 필요한 곳
  - `migrateSession` : 새로운 세션을 생성하고 **속성 복사** ➡️ “보안 + 사용자 편의” 균형
    - **권장**: 일반 웹 서비스
  - `changeSessionId` : 세션 ID만 새로 발급, 속성 그대로 유지 ➡️ Servlet 3.1 + 환경 권장
    - **권장**: 최신 톰캣/서블릿 컨테이너를 사용하는 환경

---

# <span style="background-color: #FFF9C4">5. Remember-Me 인증 구현</span>

## 5-01. Remember-Me 인증

사용자가 로그인할 때 “자동 로그인” 옵션을 선택하면, 브라우저를 닫았다가 다시 열어도 로그인 상태를 유지하게 해주는 기능

- 주로 쿠키를 활용하여 사용자 인증 정보를 저장하고, 이것을 서버에서 확인하여 다시 인증을 거치지 않고 바로 접근할 수 있도록 함
- 사용자가 매번 아이다와 비밀번호를 입력하지 않아도 되는 편의성을 제공

<br>

### 1) 자동 로그인의 사용자 경험

Remember-Me 기능은 **보안과 편의성 사이의 트레이드오프**를 다루는 주제

- **긍정적 측면**
  - 매번 로그인할 필요 없어 사용성 향상
  - 자주 방문하는 웹 서비스(예: 이메일, 쇼핑몰, SNS)에서 편리하게 접근 가능
- **부정적 측면**
  - 자동 로그인 상태에서 기기 분실 시 계정 탈취 위험
  - 공용 PC에서 사용할 경우 보안 사고 위험

<br>

### 2) Remember-Me workflow

<img src="{{ '/assets/images/posts_img/til/sprint-til/67/remember-me-workflow.png' | relative_url }}" style="width: 800px;">

- ➡️ **쿠키를 이용한 인증 유지 메커니즘**

<br>

## 5-02. Remember-Me 구현 방식

### 1) 쿠키 기반 Remember-Me

**쿠키 안에 사용자 인증 정보를 직접 포함하는 방식**

#### 쿠키 구조

Spring Security의 기본 구현체인 `TokenBasedRemeberMeServices`를 사용하여 아래의 정보를 담음

- **사용자명**: 로그인한 사용자 ID
- **만료 시간**: 토큰이 유효한 시간 (타임스탬프)
- **비밀번호 해시**: 사용자의 비밀번호를 해시한 값
- **키**: 서버에서 설정한 고정 키

쿠키는 위의 정보를 결합하여 **Base64 인코딩 문자열**로 저장

```
username:expiryTime:MD5(username + ":" + expiryTime + ":" + password + ":" + key)
```

#### workflow

<img src="{{ '/assets/images/posts_img/til/sprint-til/67/TokenBasedRemeberMeServices.png' | relative_url }}" style="width: 600px;">

#### 비밀번호 변경 시 쿠키 무효화 원리

**비밀번호 해시가 쿠키 생성에 직접 사용**되기 때문에 **비밀번호 변경 시 기존 쿠키가 자동으로 무효화되므로 보안성 안전**

#### 장단점

- **장점**
  - 구현 간단
  - DB 조회 불필요하기 때문에 빠름
- **단점**
  - 쿠키 자체가 인증 수단 ➡️ **탈취당하면 큰 보안 위협**

<br>

### 2) 영구 토큰 기반 Remember-Me

쿠키 안에 전체 정보를 담지 않고, **토큰을 식별자로 사용하여 서버(DB)에 정보를 조회**하는 방식

#### table 설계

- `username` : 사용자 ID
- `series` : 토큰 시리즈 ID (일종의 기본키 역할)
  - 사용자를 특정 Remember-Me 세션과 연결하는 **고정 식별자**
- `token` : 토큰 값
  - 각 로그인 세션에서 매번 새롭게 갱신/저장되는 **일회성 난수 값**
- `last_used` : 마지막 사용 시각

`series`와 `token`을 사용해 **재사용 공격 방지** 가능

#### workflow

<img src="{{ '/assets/images/posts_img/til/sprint-til/67/PersistentTokenBasedRememberMeServices.png' | relative_url }}" style="width: 550px;">

<br>

### 3) 쿠키 기반 vs 영구 토큰 기반

#### 쿠키 기반 방식

- 비밀번호 해시를 포함하기 때문에 비밀번호 변경 시 자동 무효화

#### 영구 토큰 기반 방식

- 비밀번호와 무관하게 동작
- 매번 `token`이 갱신되므로, **쿠키 탈취 후 재사용 공격 방지**
- 보안성 측면에서 쿠키 기반보다 안전
- 매 요청마다 DB 접근이 필요하기에 **성능 비용** 발생

<br>

## 5-03. Remember-Me 설정

`HttpSecurity.rememberMe()` 메서드로 설정 가능

<br>

### 1) 기본 구성 요소

- `rememberMeParameter` : 로그인 form에 전달되는 파라미터 이름
  - 기본값 : `remember-me`
- `rememberMeCookieName` : 생성되는 쿠키 이름
  - 기본값 : `remember-me`
- `tokenValiditySeconds` : 쿠키의 유효 시간 (초 단위)
  - 너무 길게 잡으면 보안상 위
- `key` : 쿠키 서명에 사용되는 고정 키
  - 예측 불가능한 값 사용

<br>

## 5-04. Remember-Me와 보안

Remember-Me를 켤 때는 반드시 **보안 플래그**(`Secure`, `HttpOnly`)를 설정해야 함

Remember-Me는 편의 기능일 뿐, **항상 보안과 균형을 맞춰야 함**

### 1) 보안 위험 요소

- **쿠키 탈취**: 브라우저 쿠키를 훔쳐내면, 공격자가 자동 로그인 가능
- **세션 고정 공격**: 공격자가 미리 발급받은 쿠키를 사용자에게 쓰게 만든 후 계정 탈취
- **로그아웃 불완전**: 서버에서 Remember-Me 쿠키를 무효화하지 않으면, 탈취된 쿠키는 여전히 유효

<br>

### 2) XSS 공격과 쿠키 탈취 방지

Remember-Me 기능에서 가장 치명적인 공격은 **XSS(Cross-Site Scripting)**을 통한 쿠키 탈취

#### 쿠키 탈취 방지 전략

- `HttpOnly` : JavaScript에서 쿠키 접근 차단
- `Secure` : HTTPS 연결에서만 쿠키 전송 허용
- `SameSite` : 교차 사이트 요청 시 쿠키 전송 제한 (`Lax` or `Strict` 모드 권장)

---

# <span style="background-color: #FFF9C4">6. 세션 기반 사용자 인가 구현</span>

## 6-01. 세션 기반 인가

웹 애플리케이션에서 **인가(Authorization)**란 사용자가 특정 Resource나 기능에 접근할 수 있는지 결정하는 과정

세션 기반 인증이 완료되면, 서버는 **세션(Session)** 안에 사용자 정보를 저장. 이후 사용자의 모든 요청은 세션에 담긴 정보를 통해 인가 과정을 거침

<img src="{{ '/assets/images/posts_img/til/sprint-til/67/session_authorization.png' | relative_url }}" style="width: 500px;">

<br>

### 1) `GrantedAuthority`를 통한 권한 표현

Spring Security에서 권한은 **`GrantedAuthority` 인터페이스**로 표현

보통 문자열 형태의 권한 값(`ROLE_USER`, `ROLE_ADMIN`)으로 사용

```java
UserDetails user = User.withUsername("student")
    .password("{noop}1234")
    .roles("USER") // ROLE_USER 부여
    .build();
```

- 위 코드에서 `.roles("USER")`는 내부적으로 `ROLE_USER`라는 권한을 `GrantedAuthority`로 생

<br>

## 6-02. URL 패턴 기반 인가 설정

사용자가 특정 URL에 접근할 수 있는지를 **URL 패턴 인가 설정**을 통해 제어

`HttpSecurity`의 `authorizeHttpRequest()` 메서드를 사용해서 URL별 접근 권한 설정

<br>

### 1) `authorizeHttpRequest()` 기본 구조

- `requestMatchers()` : URL 패턴 기정
- `hasRole()` : 특정 역할(Role)이 있어야 접근 허용
  - 내부적으로 `ROLE_` prefix가 붙음
- `hasAuthority()` : 특정 권한(Authority)이 있어야 접근 허용
  - `ROLE_` prefix가 자동으로 붙지 않음
- `access()` : SpEL 표현식으로 접근 제어 가능
  - 복잡한 조건을 지정 가능
- `permitAll()` : 누구나 접근 가능
- `authenticated()` : 인증된 사용자만 접근 가능

<br>

## 6-03. 메서드 보안을 통한 인가

[메서드 보안을 통한 인가](https://jungh200000.github.io/categories/codeit-sprint/sprint-til/sprint-til066-2#5-04-%EB%A9%94%EC%84%9C%EB%93%9C-%EB%B3%B4%EC%95%88)

<br>

## 6-04. 도메인 객체 보안 (ACL)

URL 기반이나 메서드 기반 인가는 주로 요청 경로나 메서드 실행 전후를 기준으로 함

**도메인 객체 보안(ACL)**은 객체 자체의 속성을 기준으로 접근을 제어

- 예시: 사용자가 특정 문서를 수정할 때, 그 문서의 소유자(owner)가 본인인지 확인하는 방식

<br>

### 1) 소유권 기반(Owner-based) 접근 제어

가장 흔한 ACL 패턴

```java
@Service
public class DocumentService {

    @PreAuthorize("#document.owner == authentication.name")
    public void updateDocument(Document document) {
        // 문서 수정 로직
    }
}
```

- `#document.owner` : 메서드 파라미터로 전달된 문서의 소유자
- [`authentication.name`](http://authentication.name) : 현재 로그인한 사용자 이름
- 두 값이 같을 때만 허용

<br>

### 2) 커스텀 Evaluator 구현

`PermissionEvaluator` 인터페이스를 구현하여 객체 단위 보안 커스터마이징 가능

```java
public interface PermissionEvaluator {

    // 객체 자체를 전달받아 권한 확인
    boolean hasPermission(Authentication authentication, Object targetDomainObject, Object permission);

    // ID와 타입으로 객체를 식별하여 권한 확인
    boolean hasPermission(Authentication authentication, Serializable targetId, String targetType, Object permission);
}

```

- Evaluator를 구현하면 재사용성이 높아지고, 여러 객체 타입에 대한 보안 로직을 한 곳에서 관리 가능
- 다만, DB 조회를 포함하는 Evaluator는 성능에 유의

---
