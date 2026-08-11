---
layout: single-editorial
title: '[TIL 23일 차] Spring MVC: 비즈니스 로직'
excerpt: '웹 애플리케이션 기초 - HTTP 프로토콜 기초'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til023/

toc: true
toc_sticky: true

date: 2026-02-04
last_modified_at: 2026-02-04
---

# 오늘의 학습

## <span style="background-color: #FFF9C4">1. 웹 애플리케이션의 기초</span>

### 1-01. HTTP 프로토콜 기초

#### 1) HTTP (HyperText Transfer Protocol)

Application Layer에 속하는 프로토콜로, 웹 브라우저와 웹 서버 간의 통신을 위한 표준

인터넷에서 서로 다른 클라이언트(Chrome, Safari 등)와 웹 서버(Apache, Nginx 등)가 원활하게 통신하기 위해서는 공통된 규칙이 필요하며, 이를 계층적으로 정의한 것이 TCP/IP 프로토콜 모델이다.

**HTTP**는 TCP/IP 모델의 Application Layer에 위치하며, 주로 HTML **문서**와 같은 웹 리소스를 요청(Request)하고 응답(Response)하는 데 사용된다.

- **특징**
  - **Stateless(무상태성)**
    - 각 요청(request)이 서로 독립적이라, 서버가 요청 간의 상태를 기억하지 않음
    - 같은 컨텍스트 임에도 불구하고 계속해서 새로운 연결을 시도하기 때문에 성능의 문제 발생 가능
    - 이에 대한 해결책으로 cookie 등을 사용
  - **Connectionless(비연결성)**
    - 요청-응답 한 번이 끝나면, 서버는 클라이언트와의 연결을 유지하지 않음
- **주요 HTTP 메서드**
  - GET : 리소스 조회
  - POST : 리소스 생성
  - PUT : 리소스 전체 수정
  - PATCH : 리소스 일부 수정
  - DELETE : 리소스 삭제
- **HTTP 상태 코드**
  - 클라이언트의 요청에 대한 **서버의 처리 결과를 숫자와 간단한 메시지로 나타낸 것**으로, 서버는 응답 메시지의 첫 줄(status line)에 상태 코드를 포함하여 클라이언트에게 요청 처리 결과를 알림
  - 100 ~ 599 범위의 숫자 코드
    - 1xx : 정보 전달
    - 2xx : 요청 성공 처리
    - 3xx : 리다이렉션
    - 4xx : 클라이언트 오류 (요청 문제)
    - 5xx : 서버 오류 (서버 내부 문제)
- `Content-Type`과 `Accept` 헤더
  - HTTP 요청/응답에서 데이터 포맷을 정의하거나 협상하는 역할로, API 설계에 매우 중요
  - `Content-Type` : 요청 바디(request body)의 데이터 형식 정의
  - `Accept` : 응답 데이터 형식 요청
