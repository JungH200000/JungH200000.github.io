---
layout: single-editorial
title: '위클리페이퍼10: Spring 보안으로 안전한 시스템 구축하기 - 1주차'
excerpt: ''

categories:
  - Sprint Weekly Paper
tags:
  - [Codeit Sprint, Codeit Sprint Weekly Paper]

permalink: /categories/codeit-sprint/sprint-weekly-paper/weekly-paper010-1

toc: true
toc_sticky: true

date: 2026-05-20
last_modified_at: 2026-05-20
---

## Q1. 세션 기반 인증과 토큰 기반 인증의 차이점과 각각의 보안 고려사항에 대해 설명하세요.

### Q1-1. 답변

#### 세션 기반 인증 (Session-based Authentication)

**서버 중심**으로 사용자의 상태를 관리하는 방식

사용자가 로그인하면 메모리나 DB 등의 세션 저장소에 사용자 정보를 저장하고, 해당 세션을 식별할 수 있는 **세션 ID**를 생성해 **클라이언트의 쿠키(Cookie)**로 전달

클라이언트는 이후의 요청마다 해당 세션 ID가 담긴 쿠키를 서버로 전송해 신원을 증명

- **보안 고려사항**
  - **쿠키 보안 적용**
    - `HttpOnly` : JavaScript 접근 차단
    - `Secure` : HTTPS 통신에서만 전송
    - `SameSite` : 크로스 사이트 요청 시 전송 제어
  - **세션 고정(Session Fixation) 방어**
    - 공격자가 미리 발급받은 세션 ID를 피해자가 사용하도록 유도한 뒤 세션을 탈취하는 공격을 막기 위해
    - 로그인이나 권한 상승 성공 시에는 무조건 **새로운 세션 ID를 재발급** 해야 함
  - **타임아웃 설정**
    - 세션 하이재킹 위험을 줄이기 위해 일정 시간 반응이 없으면 만료되는 설정 추가

#### 토큰 기반 인증 (Token-based Authentication)

서버가 상태를 보관하지 않는 방식

로그인 시 서버는 사용자의 신원과 권한 정보를 담고 서명(Signature)을 거친 토큰(JWT 등)을 발급

클라이언트는 이 토큰을 보관하다가 API를 호출할 때마다 `Authorization` 헤더에 담아 전송하고, 서버는 별도의 저장소 조회 없이 토큰과 서명을 검증하여 요청을 처리

- **보안 고려사항**
  - **민감 정보 포함 금지**
    - JWT의 Payload는 Base64URL로 인코딩되어 있어서 누구나 디코딩 가능하기 때문에 비밀번호나 주민등록번호 같은 민감 정보 포함 금지
  - **토큰 탈취 및 만료 시간 관리**
    - 발급된 토큰은 만료 시간 전까지 무효화하기 어려움
    - 이 위험을 최소화하기 위해서는 **Access Token의 유효 기간을 분 단위로 매우 짧게 설정**하고, **갱신을 위한 Refresh Token을 별도로 두어** 안전하게 관리
  - **안전한 저장소 선택**
    - XSS 공격에 의한 토큰 탈취를 막기 위해 로컬 스토리지(localStorage)보다 `HttpOnly`가 적용된 쿠키에 보관
    - 통신 시에 HTTPS 사용

---

## Q2. OAuth 2.0의 주요 컴포넌트와 Authorization Code Grant 흐름을 설명하세요.

### Q2-1. 답변

#### OAuth 2.0

사용자가 자신의 비밀번호를 제3자 애플리케이션(Client)에게 제공하지 않고, 특정 Resource에 대한 접근 권한을 안전하게 위임할 수 있도록 돕는 표준 프로토콜

#### OAuth 2.0의 주요 컴포넌트

1. **Resource Owner (자원 소유자)**
   - 자원 실제 소유자
   - 권한 위임을 최종적으로 승인하는 주체
   - 보통 서비스를 이용하는 **사용자**
2. **Client (클라이언트)**
   - Resource Owner를 대리해 보호된 자원에 접근하는 애플리케이션
   - 예시: 구글 캘린더 API를 호출하는 **외부 일정 관리 앱**
3. **Authorization Server (인가 서버)**
   - 사용자를 인증하고 사용자의 동의를 얻은 후, Client에게 자원에 접근할 수 있는 **Access Token을 발급하는 서버**
   - 예시: 구글 로그인 서버
4. **Resource Server (Resource 서버)**
   - 실제 보호된 자원(데이터)을 보관하고 있는 서버
   - Cleint가 제시한 Access Token을 검증한 뒤 요청한 자원을 반환
   - 예시: 구글 캘린더 API 서버

#### Authorization Code Grant (권한 부여 승인 코드 방식) 흐름

OAuth 2.0의 여러 권한 부여 방식 중 가장 대표적이고 보안성이 높아 백엔드 서버가 있는 애플리케이션에서 널리 사용되는 방식

1. **서비스 요청 및 리다이렉트**
   - Resource Owner가 Client(앱)에서 “소셜 로그인” 버튼 클릭
2. **Authorization Code 요청**
   - Client는 Authorization Server로 미리 등록해 둔 `Client ID`, `Redirect URI`, `response_type=code` 등의 파라미터를 담아 권한 승인 코드(Authorization Code) 요쳥
3. **사용자 로그인 및 동의**
   - Resource Owner는 Authorization Server에서 본인 계정으로 직접 로그인 수행하고 권한 제공에 동의
4. **Authorization Code 발급**
   - 인증과 동의가 완료되면 Authorization Server는 사용자를 다시 Client의 `Redirect URI`로 돌려주면서 **Authorization Code**를 함께 전달
5. **Access Token 교환 요청**
   - Client는 전달 받은 Authorization Code와 `Client Secret`, `Redirect URI` 등을 Authorization Server에 전송해 Access Token 발급 요청
6. **Access Token 발급**
   - Authorization Server는 요청 정보를 검증한 뒤 Client에게 **Access Token** 발급
7. **자원 접근 및 반환**
   - Client는 발급 받은 Access Token을 가지고 Resource Server에 자원을 요청하고, Resource Server는 토큰을 검증한 뒤 Resource를 Client에 반환

---
