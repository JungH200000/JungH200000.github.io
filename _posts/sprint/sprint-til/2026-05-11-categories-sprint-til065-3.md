---
title: '[TIL 65-3일 차] Spring Security 기초'
excerpt: '1.Spring Security 소개와 설정'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til065-3

toc: true
toc_sticky: true

date: 2026-05-11
last_modified_at: 2026-05-11
---

# <span style="background-color: #FFF9C4">1.Spring Security 소개와 설정</span>

## 1-01. Spring Security

### 1) 보안이 없는 애플리케이션의 문제점

#### 로그인 기능(인증, Authentication) 없음

- 사용자가 본인의 정체성을 증명할 방법이 없음
- 다른 사람이 내 계정으로 등록한 정보나 주문 정보를 **제한 없이 열람 가능**

#### API에 대한 권한 부여(인가, Authorization) 기능 없음

- **Resource 접근 권한이 구분되지 않아** 보안상 큰 위험

#### 웹 보안 취약점에 대한 대비 부족

- 세션 고정 (Session Fixation)
- 클릭재킹 (Clickjacking)
- CSRF (Cross-Site Request Forgery)

<br>

### 2) Spring Security

Spring MVC 기반 애플리케이션에서 **인증(Authentication)**과 **인가(Authorization)** 기능을 지원하는 보안 프레임워크

- 사실상 표준(Security De-facto Standard)

#### Spring Security로 가능한 보안 기능

- **다양한 인증 방식 지원**: form 로그인, 토큰 기반 인증, OAuth 2 등
- **사용자 권한(Role)에 따른 접근 제어**
- **Resource 접근 제어**
- **민감한 정보 암호화**
- SSL 연동(HTTPS) 및 전송구간 보안 강화
- 알려진 주요 웹 보안 공격 차단
  - 세션 고정 공격 방지
  - 클릭재킹 방지
  - CSRF 방어
- **SSO(Single Sign-On), 메서드 보안, Access Control List** 같은 고급 기능도 제공

<br>

### 3) Spring Security에서 사용하는 용어

| 용어                               | 설명                                                                                                       |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| ⭐**Principal (주체)**             | 애플리케이션에서 작업을 수행할 수 있는 사용자, 디바이스 또는 시스템. 일반적으로 인증에 성공한 사용자 계정. |
| **Authentication (인증)**          | 사용자가 본인이 맞음을 증명하는 절차. 아이디/비밀번호 입력, 주민등록증 제시 등.                            |
| ⭐**Credential (자격 증명 정보)**  | 사용자를 식별하는 정보. 비밀번호, 토큰, 인증서 등이 이에 해당.                                             |
| **Authorization (인가/권한 부여)** | 인증된 사용자에게 역할(Role) 또는 권한(authority)을 부여하여 특정 리소스 접근 허용.                        |
| **Access Control (접근 제어)**     | 사용자가 애플리케이션의 리소스에 접근하는 행위를 제어하는 과정.                                            |

<br>

## 1-02. 플랫폼별 Spring Security

### 1) 서블릿 기반(Spring MVC)에서의 Spring Security

서블릿 기반 애플리케이션은 **동기·블로킹 I/O** 모델로 동작

요청이 들어오면 **요청당 스레드(Per-Request Thread)** 가 할당되어 컨트롤러까지 진행

Spring Security는 이 경로 앞단에 **FilterChainProxy**를 두고, 다수의 **서블릿 필터**를 순서대로 통과시키며 인증·인가·예외 처리·CSRF 등을 수행

```
클라이언트
➡️ 서블릿 컨테이너
➡️ Security Filter Chain
➡️ 인증 처리
➡️ 성공 여부 ➡️ (성공) ➡️ Controller 핸들러
            ➡️ (실패) ➡️ 예외 변환 및 응답
```

- 모든 요청이 Filter를 반드시 거침

<br>

### 2) 리액티브 기반(WebFlux)에서의 Spring Security

리액티브(WebFlux)는 **비동기·논블로킹 I/O**와 **리액티브 스트림** 모델로 동작

요청은 이벤트 루프에 등록되어 **스레드를 점유하지 않고** 파이프라인을 타고 흐름

보안은 **SecurityWebFilterChain(리액티브 웹 필터 체인)** 으로 처리

```
클라이언트
➡️ 리액티브 파이프라인
➡️ 보안 웹 Filter Chain
➡️ 인증·인가 판단
➡️ 핸들러 함수 또는 Controller
```

- 모든 단계가 논블로킹으로 연결됨
- 인증 토큰·권한 판단 역시 리액티브 타입(Mono/Flux) 로 처리

---
