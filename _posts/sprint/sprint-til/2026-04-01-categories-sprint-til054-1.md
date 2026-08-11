---
layout: single-editorial
title: '[TIL 54일 차]  Docker: 빌드, 배포, 컨테이너 실행하기'
excerpt: '7.Docker Compose 활용 ~ 8.Docker 실무 활용 팁'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til054-1

toc: true
toc_sticky: true

date: 2026-04-01
last_modified_at: 2026-04-01
---

# Docker: 빌드, 배포, 컨테이너 실행하기

## <span style="background-color: #FFF9C4">7. Docker Compose 활용</span>

### 7-01. Docker Compose

#### 1) 등장 배경

단일 컨테이너는 `docker run` 하나로 충분하지만, 실제 개발/운영 환경은 보통 여러 컨테이너가 함께 동작한다. 이때 아래의 문제가 밸상한다.

- 컨테이너를 여러 개 순서대로 실행/중지하는 작업이 번거로움
- 포트/볼륨/네트워크/환경변수 등 긴 명령어 옵션을 매번 기억/복붙해야 함
- 팀원이 바뀌면 환경 셋업이 달라져 재현성이 떨어짐
- `docker run` 조합은 선언형 문서가 아니라서 버전 관리/코드 리뷰가 어려움

<br>

#### 2) Compose의 등장으로 해결한 것

- 선언형(Declarative) 설정 파일인 `docker-compose.yml` 하나로 전체 스택을 정의하여 네트워크/볼륨/환경변수/헬스체크 등 운영 설정을 표준화하여 재현성 확보
- `docker compose up -d` 한 줄로 멀티 컨테이너를 실행/중지/정리
- 서비스 간 DNS 서비스명으로 통신 가능
  - 별도 IP 관리 불필요

<br>

#### 3) Compose 템플릿

```yaml
services: # 여러 컨테이너(서비스)를 정의
  # 1. DB 서비스 정의
  db:
    image: postgres:15.6
    volumes:
      - pg-data:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    networks:
      - app-network
    restart: always

  # 2. 애플리케이션 서비스 정의
  app:
    build: . # 이미지를 만듦
    ports:
      - '8080:8080'
    environment:
      DATASOURCE_URL: jdbc:postgresql://postgres-db:5432/${POSTGRES_DB}
    depends_on: # 컨테이너가 시작되는 순서만 보장(준비 상태 보장 X)
      - db
    networks:
      - app-network
    restart: on-failure

# 볼륨 및 네트워크 정의
volumes:
  pg-data:

networks: # 같은 네트워크에 있으면 서비스명으로 DNS 해석됨
  app-network:
```

---

## <span style="background-color: #FFF9C4">8. Docker 실무 활용</span>

### 8-01. Docker 실무 활용

#### 1) 개발 환경 표준화

로컬/서버 환경 불일치로 인한 버그를 줄이고, 개발 속도를 높임

<br>

#### 2) 테스트 환경 격리 (Trstcontainers)

Testcontainers는 JUnit 테스트 실행 시점에 필요한 인프라(DB, 메시지 브로커 등)를 Docker 컨테이너로 자동 생성해주는 라이브러리

- 테스트가 끝나면 컨테이너를 삭제하여 테스트 환경을 깨끗하게 유지함
- 로컬 개발환경 차이 제거
- 운영환경과 유사한 환경 제공
- CI/CD 연동

<br>

#### 3) 보안 이슈

- Docker Daemon 접근 권한
  - `/var/run/docker.sock` 파일은 Docker 클라이언트와 Daemon 간 통신에 사용됨
  - 이 파일에 접근할 수 있다는 것은 사실상 root 권한과 유사하므로, 접근 가능한 사용자와 서비스는 최소화해야 한다.
- 이미지 보안 스캔
  - 운영에 사용하는 Docker 이미지에 취약점이 포함되어 있는지 주기적으로 점검 필요

<br>

#### 4) 비밀번호 및 민감정보 노출 방지

- Dockerfile에 비밀번호를 하드코딩하면 안됨

---
