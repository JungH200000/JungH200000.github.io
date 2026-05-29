---
title: '위클리페이퍼10: Spring 보안으로 안전한 시스템 구축하기 - 2주차'
excerpt: ''

categories:
  - Sprint Weekly Paper
tags:
  - [Codeit Sprint, Codeit Sprint Weekly Paper]

permalink: /categories/codeit-sprint/sprint-weekly-paper/weekly-paper010-2

toc: true
toc_sticky: true

date: 2026-05-29
last_modified_at: 2026-05-29
---

## Q3. Spring 기반 웹 애플리케이션에서 발생할 수 있는 4가지 주요 보안 공격 (CSRF, XSS, 세션 고정, JWT 탈취)에 대해 설명하고, 각각에 대한 Spring Security 또는 일반적인 대응 전략을 설명하세요.

### Q3-1. 답변

#### 1. CSRF (Cross-Site Request Forgery)

사용자가 로그인된 상태를 악용해, 사용자 본인도 모르는 사이 의도하지 않은 요청을 서버로 전송하게 하는 공격

의도하지 않은 요청 : 송금, 비밀번호 변경 등

- **대응전략**
  - Spring Security의 세션 기반 애플리케이션에서 CSRF 방어를 기본적으로 활성화
  - 서버가 CSRF 토큰 생성 후 클라이언트로 보내고, 클라이언트가 요청 시 해당 토큰을 서버로 보내 CSRF 토큰 관련 Filter에서 일치 여부 검증

#### 2. XSS (Cross-Site Scripting)

공격자가 악성 스크립트(JavaScript)를 웹 페이지에 삽입해, 사용자의 브라우저에서 해당 스크립트가 실행되게 하는 공격으로, 쿠키나 세션 정보가 탈취될 수 있음

- **대응 전략**
  - JavaScript 접근을 차단하는 `HttpOnly` 속성 적용

#### 3. 세션 고정 (Session Fixation)

공격자가 미리 정상적으로 발급받은 세션 ID를 피해자에게 강제로 사용하게 유도하고, 피해자가 해당 세션으로 로그인하면 공격자가 그 세션을 이용해 권한을 탈취하는 공격

- **대응 전략**
  - 로그인 성공 시 세션 ID를 무조건 새로 발급하게 하는 것

#### 4. JWT 탈취

클라이언트에 보관된 JWT가 XSS 공격 등으로 인해 해커에게 탈취당하는 것

- **대응 전략**
  - Access Token 유효 시간을 매우 짧게 설정
  - HTTPS 통신 사용
  - 로컬 스토리지가 아닌 `Secure`과 `HttpOnly`가 설정된 쿠키에 저장

---

## Q4. JWT(JSON Web Token)의 구조와 각 구성 요소가 어떤 역할을 하는지 구체적으로 설명하세요.

### Q4-1. 답변

#### 1. Header (헤더)

토큰의 타입과 서명(Signature)을 생성할 때 사용된 암호화 알고리즘의 정보를 담고 있음

- **구성**
  - `typ` (토큰 타입, 예시: JWT),
  - `alg` (서명 알고리즘: 예시: HMAC SHA256)
- **특징**
  - JSON 객체 형태
  - Base64URL 방식으로 인코딩됨

#### 2. Payload (페이로드)

토큰에 실제로 담을 데이터(Claim)

- **구성**
  - 표준 Claim
    - `iss` (토큰 발급자)
    - `exp` (만료 시간)
    - `iat` (발급 시간)
  - 기타 인증 처리에 필요한 고유 정보 Claim
    - 사용자 ID
    - 권한(Role) 등
- **특징**
  - Base64URL로 인코딩됨

#### 3. Signature (서명)

토큰이 전송 과정 중에 위변조되지 않았고, 신뢰할 수 있는 서버에서 발급되었음을 검증

- **구성**
  - 인코딩된 Header와 Payload를 합친 문자열에 Secret Key(비밀키)와 헤더에 지정된 알고리즘을 사용해 해시값을 생성
- **특징**
  - Payload 내용이 변경되면 서명이 완전히 달라짐

---
