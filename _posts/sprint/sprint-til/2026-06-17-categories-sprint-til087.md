---
title: '[TIL 87일 차] Sprint Mission12'
excerpt: '3.기본 요구사항'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til087

toc: true
toc_sticky: true

date: 2026-06-17
last_modified_at: 2026-06-17
---

# 오늘의 성취

## 1. 개발 진행 상황

- 배포 아키텍처 구성하기
  - Nginx 기반 리버스 프록시 컨테이너 구성
  - 애플리케이션 서버, DB, Redis, Kafka가 외부 네트워크와 단절되도록 설정

---

# 프로젝트 요구 사항

## 3. 기본 요구사항

### 3-03. 배포 아키텍처 구성하기

<img src="../../../assets/images/posts_img/til/sprint-til/spring-mission/87/gtwxscalk-image.png" width=500px>

- [x] 다음의 다이어그램에 부합하는 배포 아키텍처를 Docker Compose를 통해 구현하세요.
  - `Reverse Proxy`
    - Nginx 기반의 리버스 프록시 컨테이너를 구성하세요.
    - 역할 및 설정은 다음과 같습니다:
      - `/api/*`, `/ws/*` 요청은 **Backend 컨테이너**로 프록시 처리합니다.
      - 이 외의 모든 요청은 **정적 리소스(프론트엔드 빌드 결과)**를 서빙합니다.
        - 프론트엔드 정적 리소스는 Nginx 컨테이너 내부의 적절한 경로(`/usr/share/nginx/html` 등)에 복사하세요.
    - 외부에서 접근 가능한 유일한 컨테이너이며, `3000`번 포트를 통해 접근할 수 있어야 합니다.
  - `Backend`
    - Spring Boot 기반의 백엔드 서버를 Docker 컨테이너로 구성하세요.
    - `Reverse Proxy`를 통해 `/api/*`, `/ws/*` 요청이 이 서버로 전달됩니다.
  - `DB`, `Memory DB`, `Message Broker`
    - `Backend` 컨테이너가 접근 가능한 다음의 인프라 컨테이너들을 구성하세요
      - **DB**: PostgreSQL
      - **Memory DB**: Redis
      - **Message Broker**: Kafka
    - 각 컨테이너는 Docker Compose 네트워크를 통해 백엔드에서 통신할 수 있어야 합니다.
    - 외부 네트워크와 단절되어야 합니다.

`//...`

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint12](https://github.com/JungH200000/10-sprint-mission/tree/sprint12)

---
