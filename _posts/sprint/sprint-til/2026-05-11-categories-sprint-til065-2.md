---
title: '[TIL 65-2일 차] 유저 관리 기능'
excerpt: '5.인가(Authorization)와 권한 관리 ~ 6.OAuth와 OpenID Connect'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til065-2

toc: true
toc_sticky: true

date: 2026-05-11
last_modified_at: 2026-05-11
---

# <span style="background-color: #FFF9C4">5. 인가(Authorization)와 권한 관리</span>

## 5-01. 인가 (Authorization)

**인증된 사용자가 어떤 자원(Resource)에 접근할 수 있는지 결정하는 과정**

- **인증(Authentication)** : 사용자가 누구인지 확인하는 절차
- **인가(Authorization)** : 인증된 사용자가 무엇을 할 수 있는지 결정하는 절차

<br>

### 1) 인증과 인가의 차이점

| 구분 | 인증(Authentication)             | 인가(Authorization)               |
| ---- | -------------------------------- | --------------------------------- |
| 목적 | 사용자가 누구인지 확인           | 사용자가 무엇을 할 수 있는지 결정 |
| 예시 | 로그인 시 아이디와 비밀번호 검증 | 관리자만 게시글 삭제 가능         |
| 시점 | 항상 먼저 수행                   | 인증 후에 수행                    |
| 결과 | 사용자 신원 확인                 | 권한에 따른 접근 제어             |

<br>

### 2) 인가의 필요성과 역할

- **보안 강화**: 각 사용자마다 허용된 범위를 제한
- **자원 보호**: 중요 데이터나 관리자 기능은 권한이 있는 사용자만 접근하게 제한
- **사용자 경험**: 불필요한 접근을 막아 사용자가 본인 권한 내에서만 기능을 이용하게 도움

<br>

### 3) 인증과 인가를 분리한 이유

- **보안 경계 명확화**: 인증은 신원 확인, 인가는 행위 허용 여부
- **책임 분리(SRP)**: 인증-크리덴셜 검증에 집중, 인가-정책(규칙) 판단에 집중 ➡️ 코드 단순화/테스트 용이성, 교체 용이성 향상
- **정책 진화/확장 용이**: 비즈니스가 커질수록 권한 규칙은 잦은 변경이 필요함. 인증과 분리하면 **정책만** 변경하면 됨
- **추적/감사(Audit) 품질 향상**: “누가 무엇을 시도했고, 왜 허용/거부되었는지”를 분리 로깅하면 사고 분석이 쉬워짐
- **취약점 예방**: 인증과 인가가 섞이면 대표적으로 **IDOR**(수평 권한 상승), **권한 누락 체크** 같은 문제 자주 발생

<br>

### 4) 인증 후 인가 workflow

<image src="../../../assets/images/posts_img/til/sprint-til/65/authorization_workflow.png" width=650px>

- PEP(Policy Enforcement Point) : 검사 적용 지점
- PDP(Policy Decision Posint) : 정책 판단 지점

<br>

## 5-02. 권한 기반 접근 제어

인증된 주체가 어떤 리소스에 어떤 행위를 할 수 있는가를 규칙으로 명시하고, 요청 시 규칙에 따라 허용/거부를 결정하는 체계

권한을 설계할 때 아래의 요소를 기준으로 나눔

| 용어             | 의미                                  | 예시                                  |
| ---------------- | ------------------------------------- | ------------------------------------- |
| 사용자(User)     | 시스템을 이용하는 주체                | alice, bob                            |
| 역할(Role)       | 사용자의 업무 묶음                    | ADMIN, EDITOR, VIEWER                 |
| 권한(Permission) | 특정 리소스에 대한 **행위 허용 규칙** | `POST:READ`, `POST:WRITE`             |
| 리소스(Resource) | 보호 대상                             | 게시글(Post), 파일(File), 주문(Order) |
| 행위(Action)     | 리소스에 대한 조작                    | READ, CREATE, UPDATE, DELETE          |
| 정책(Policy)     | 조건이 있는 권한 규칙                 | "본인 소유 글만 UPDATE 허용"          |

<br>

### 1) RBAC(역할 기반 접근 제어)

개별 사용자가 아닌 조직 내 **역할(Role)**에 기반해 시스템 접근 권한을 관리하는 보안 방식

**사용자** ➡️ **역할** ➡️ **권한** 매핑하여 관리 단순화. 사용자는 **역할을 부여**받고, 역할에 **권한을 부여**함

<image src="../../../assets/images/posts_img/til/sprint-til/65/rbac.png" width=500px>

#### RBAC를 선택하는 이유

- **관리 용이**: 사용자 수가 많아도 역할 단위로 권한을 변경하면 끝
- **일관성**: 비슷한 사용자들에게 동일 정책 적용이 쉬움
- **감사 용이**: “이 역할은 어떤 권한을 갖는지”에 대해 빠르게 답할 수 있음

#### 그 외 방법

- ACL : 리소스 주체별 목록
- ABAC : 속성 기반(시간/부서/위치 등)

<br>

### 2) 권한 설계 5대 원칙

- 최소 권한(Least Privilege)
  - 필요한 최소 권한만 부여합니다.
- 기본 거부(Default Deny)
  - 명시적으로 허용된 것만 허용합니다.
- 책임 분리(Separation of Duties)
  - 서로 충돌 가능한 권한을 분리합니다.
- 감사 가능성(Auditability)
  - 누가/무엇을/왜 했는지 추적 가능해야 합니다.
- 단순성 우선(Keep It Simple)
  - 정책은 이해·검토·운영이 쉬워야 합니다.

<br>

### 3) 권한 매트릭스 작성(Roles × Resources × Actions)

권한 설계에서 가장 중요한 산출물로, 역할별로 어떤 리소스에 어떤 행위를 할 수 있는지 정리한 표

| 역할\리소스:행위 | POST\:READ | POST\:CREATE | POST\:UPDATE     | POST\:DELETE    | FILE\:EXPORT |
| ---------------- | ---------- | ------------ | ---------------- | --------------- | ------------ |
| VIEWER           | ✅(공개만) | ❌           | ❌               | ❌              | ❌           |
| EDITOR           | ✅         | ✅           | ✅(소유자만)     | ❌              | ❌           |
| REVIEWER         | ✅         | ❌           | ✅(승인 전 검수) | ✅(규정에 한함) | ❌           |
| ADMIN            | ✅         | ✅           | ✅               | ✅              | ✅           |

<br>

### 4) 정책(Policy) 조건을 설계하여 RBAC 한계 보완

- **소유 기반**: "POST.UPDATE는 `userId == ownerId`일 때만 허용한다"
- **상태 기반**: "POST.DELETE는 `status == DRAFT`일 때만 허용한다"
- **시간/위치 기반**(선택): "EXPORT는 근무시간(09~18시) 내 사내망에서만 허용"
- **리스크 기반**(선택): "고액 ORDER.REFUND는 2인 승인 필요"

정책은 역할 권한을 **필터링**하거나 **추가 제약**을 주는 형태로 동작합니다.

<br>

## 5-03. 세션/토큰 기반 인증에서의 인가 구현

### 1) 세션 기반 인가 구현

사용자가 로그인하면 서버는 **세션 객체(Session Object)**를 생성. 이 객체 안에 사용자 정보와 함께 **권한(Role/Permission)** 정보도 함께 저장

- 서버 메모리 또는 Redis 같은 세션 저장소에 보관
- 클라이언트는 세션 ID 쿠키만 전달
- 서버는 세션 ID를 바탕으로 사용자와 권한 정보를 복원

<br>

### 2) 토큰 기반 인가 구현 (JWT)

JWT는 인증 정보를 **클라이언트가 직접 보관**하는 방식.

- 서버는 JWT를 검증하기만 하면 되므로 확장성이 높음

JWT 구조는 `Header.Payload.Signature` 로 이루어져 있으며, **Payload에 권한 정보(roles)** 를 포함시킬 수 있습니다.

<br>

### 3) 권한 정보 관리의 모범 사례

#### 최소 권한 원칙 (Principle of Least Privileage)

- 사용자가 **업무 수행에 꼭 필요한 최소한의 권한**만 가지도록 설계

#### 중앙 집중 관리

- 권한 정책은 코드 여러 곳에 흩트리지 않고, **중앙 관리 모듈**을 통해 관리

#### 로그와 모니터링

- 권한 검증 실패는 보안 이벤트로 기록

#### 계층적 권한 설계

- `USER < EDITOR < ADMIN`처럼 계층적 구조를 도입하면 권한 관리가 단순해

---

# <span style="background-color: #FFF9C4">6. OAuth와 OpenID Connect</span>

## 6-01. OAuth 2

### 1) 전통적인 인증 처리 방식의 한계

애플리케이션은 자체 회원을 만들고 **ID/Password(credential)를 직접 저장**

- **문제점**
  - 서비스가 늘수록 사용자 비밀번호가 여러 곳에 흩어져 저장됨
  - Google Calendar 같은 외부 API를 쓰려면 **그 서비스의 비밀번호까지** 보관해야 할 수 있음
    - 유출 시 피해가 크고, 비밀번호 변경 시 동기화가 어려움
    - 다른 서비스가 **내 비밀번호를 갖고 있다는 사실 자체**가 큰 보안 리스크

<br>

### 2) OAuth 2 란?

**보호된 자원(Resource)에 안전하게 접근하기 위한 표준 프로토콜**로, 사용자의 비밀번호를 제 3자 앱이 **알 필요가 없도록** 토큰으로 권한을 위임

- 보호된 자원 = 구글 같은 3rd party 자원

신뢰 가능한 **인증 서버**(예: Google)가 인증을 담당하고, 애플리케이션(클라이언트)에게 **Access Token**을 발급하고, 애플리케이션은 이 토큰으로 리소스(API)를 사용

- 비밀번호는 **절대 공유/저장되지 않음**
- 관리해야 할 credential 수가 줄어들어 **보안성 향상**
- **토큰 + 범위(Scope)**로 필요한 권한만 위임
- 하나의 계정으로 다수 서비스 연동 가능 ➡️ UX 향상

<br>

### 3) OAuth 2를 사용하는 애플리케이션 유형

#### 3rd party API를 직접 사용하는 서비스

- 우리 서비스가 Google Drive, Calendar, GitHub, Slack 등의 API 호출
- 사용자가 해당 서비스에 로그인/동의 ➡️ **Access Token** 발급 ➡️ 우리 서비스가 API 호출
- 비밀번호 몰라도 되고, 허용된 **Scope 내에서만** 접근 가능

#### 로그인 수단으로 제공(소셜 로그인)

- “구글로 로그인”, “네이버로 로그인” 등
- 회원가입/로그인이 간편해짐
- 서비스는 자체 비밀번호 저장소를 최소화 가능

<br>

## 6-02. OAuth 2 인증 컴포넌트

### 1) OAuth 2 인증 컴포넌트

#### Resource Owner (User)

- Resource(자원)의 실제 소유자로, **서비스 사용자(User)**라고 볼 수 있다.
- OAuth 2 프로세스에서 **최종 결정권을 가진 주체**

#### Client

- Resource Owner를 대신해 Resource에 접근하는 애플리케이션
  - 서비스 제공자가 아니라 **서비스를 이용하고자 하는 쪽**
  - **Resource Owner의 대리인 역할을 함**
- 서버, 웹, 모바일 등 다양한 형태
  - 사용자가 일정 관리 앱(A)을 사용하고, 이 앱(A)이 Google Calendar API에 접근한다면 **앱 A가 Client**

#### Resource Server

- 보호된 자원을 **실제로 저장하고 있는** 서버 (**실제 데이터가 존재하는 곳**)
- Client 요청을 Access Token으로 검증하고, 올바르다면 자원을 반환

#### Authorization Server

- Resource Owner의 인증을 처리하고, Client에게 **Access Token을 발급**하는 서버
- OAuth 2에서 가장 중요한 역할을 맡으며, 자격 증명의 신뢰성을 보장
- Google 로그인 서버를 예시로 들 수 있음

<br>

### 2) 권한 범위(Scope) 설정

OAuth에서 **Scope**는 Client가 Resource Owner(사용자)를 대신하여 접근할 수 있는 권한 범위로, **“어떤 자원(Resource)에 대해, 어느 정도까지 접근을 허용할 것인가?”**를 지정하는 제한 장치

- 사용자의 **데이터 보호**와 **최소 권한 원칙(Principle of Least Privilege)**을 적용하기 위한 핵심 메커니즘
- **사용자의 동의**와 **보안 경계**를 동시에 담당
  - **데이터 유출 범위를 제한함**

#### Scope가 중요한 이유

- 보안 사고 위험 감소
  - “전체 계정 접근” 허용 시, 다른 정보를 무단으로 읽을 수 있음
- 사용자 신뢰 확보
  - 불필요한 권한을 요구하는 앱 거부

#### Scope 설계 원칙

- 최소 권한 원칙
  - 앱이 동작하는데 꼭 필요한 권한만 요청
- Resource 단위로 구분
- 읽기/쓰기 분리
- 사용자에게 직관적인 이름 부여

<br>

## 6-03. OAuth workflow

### 1) Authorization Code Grant

권한 부여 승인을 위해 자체 생성한 Authorization Code를 전달하는 방식으로, 가장 많이 쓰이고 기본이 되는 방식

- Authorization Grant
  - Client 애플리케이션이 Access Token을 얻기 위한 Resource Owner의 권한을 표현하는 credential을 의미
  - 즉, **Client가 Access Token을 얻기 위한 수단**이라고 생각하면
  - 만료 시간이 매우 짧음
- Refresh Token을 사용 가능
- 권한 부여 승인 요청 시 응답 타입(`response_type`)을 `code`로 지정하여 요청

<image src="../../../assets/images/posts_img/til/sprint-til/65/authorization_code_grant_workflow.png" width=600px>

<br>

### 2) Implicit Grant

별도의 Authorization Code 없이 바로 Access Token을 발급하는 방식

- 자격증명을 안전하게 저장하기 힘든 Client(자바스크립트 등 스크립트 언어를 사용하는 브라우저)에게 최적화된 방식
- Refresh Token 사용이 불가능
- Authorization Server는 Client Secret을 통해 클라이언트 인증 과정을 생략

<image src="../../../assets/images/posts_img/til/sprint-til/65/iImplicit_grant_workflow.png" width=600px>

<br>

### 3) Resource Owner Password Credential Grant

간단하게 로그인 시 필요한 정보(username, password)로 Access Token을 발급받는 방식

- 자신의 서비스에서 제공하는 애플리케이션의 경우에만 사용되는 인증 방식
- 즉, 자사의 같은 서비스를 이용할 때 사용하는 방식
  - 네이버 계정으로 네이버 웹툰 애플리케이션에 로그인하는
- Refresh Token의 사용 가능
- 정리하자면, **Authorization Server, Resource Server, Client가 모두 같은 시스템에 속해 있을 때만 사용이 가능**

<image src="../../../assets/images/posts_img/til/sprint-til/65/resource_owner_password_credential_grant_workflow.png" width=600px>

<br>

### 4) Client Credentials Grant

Client 자신이 관리하는 Resource 혹은 Authorization Server에 해당 Client를 위한 제한된 Resource 접근 권한이 설정되어 있는 경우 사용할 수 있는 방식

- 자격 증명을 안전하게 보관할 수 있는 Client에서만 사용되어야 함
- Refresh Token의 사용은 불가능

<image src="../../../assets/images/posts_img/til/sprint-til/65/client_credentials_grant_workflow.png" width=600px>

<br>

## 6-04. OIDC (OpenID Connect)

**OAuth 2를 확장한 인증(Authentication) 프로토콜**

- OAuth2의 Access Token 발급 과정에 더해 **ID Token(JWT 기반)** 을 추가로 발급하여 사용자의 인증 정보를 제공
- OIDC를 사용하면 클라이언트 애플리케이션은 사용자가 누구인지(예: 이름, 이메일, 프로필 사진 등)를 식별 가능
- **소셜 로그인(Google, Facebook, Github 로그인)** 의 기반

<br>

### 1) OAuth 2 vs OIDC

| 구분      | OAuth2                        | OIDC                                   |
| --------- | ----------------------------- | -------------------------------------- |
| 초점      | 인가(Authorization)           | 인증(Authentication) + 인가            |
| 주요 토큰 | Access Token                  | Access Token + ID Token                |
| 목적      | 제3자 API 자원 접근 권한 위임 | 사용자 인증 + 자원 접근                |
| 사용 예시 | 캘린더 API 읽기 권한 위임     | 구글 계정으로 로그인, 사용자 정보 조회 |

- **실제 소셜 로그인**
  - **OAuth 2만 사용**: 앱은 Google API를 대신 호출할 수 있지만, "사용자가 누구인지"는 알 수 없음.
  - **OIDC 사용**: 앱은 Google API 접근 권한을 얻는 동시에, 사용자의 이름·이메일·프로필을 안전하게 전달받음.

<br>

### 2) ID 토큰

OIDC가 OAuth2를 확장하면서 추가된 핵심 요소

- JWT(JSON Web Token) 형식으로 발급
- 사용자 인증 결과와 기본 프로필 정보를 포함

<image src="../../../assets/images/posts_img/til/sprint-til/65/oidc_workflow.png" width=650px>

---
