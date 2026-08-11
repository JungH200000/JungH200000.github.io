---
layout: single-editorial
title: '[Sprint 백엔드 고급 프로젝트 2일차] 프로젝트 초기 설정과 GitHub Issue 작성'
excerpt: ''

categories:
  - Sprint 백엔드 고급 프로젝트
tags:
  - [Codeit Sprint, Codeit Sprint 백엔드 고급 프로젝트]

permalink: /categories/codeit-sprint/sprint-advanced-project/sprint-advanced-project02

toc: true
toc_sticky: true

date: 2026-06-22
last_modified_at: 2026-06-22
---

# 프로젝트 초기 설정과 GitHub Issue 작성

오전에는 저번주 작성한 요구사항을 바탕으로 ERD를 작성했고, 강사님께 검토를 받았다.

오후에는 프로젝트 초기 설정 역할 분담을 진행했다. 나는 공통 Entity와 Docker 기반 로컬 개발 환경 구성을 담당했다.

프로젝트 초기 설정을 진행하기 전에 앞에서 작업했던 내용들을 GitHub Issue 카드로 정리하기로 했다.

처음에는 상위 Issue 아래에 여러 하위 Issue를 연결하는 구조로 작성했다. 하지만 GitHub Projects의 Board 레이아웃에서는 상위 이슈만 바로 표시되고, 하위 이슈에서는 추가로 들어가야 확인할 수 있었다.

강사님께서는 취업 시에 작업 구조의 깊이가 깊어질수록 담당자님이 세부 내용을 확인하지 않을 가능성이 커진다고 설명해주셨다. 그래서 하위 이슈 관계를 해제하고 모든 작업이 Board에 보이도록 플랫한 구조로 수정했다.

- 예시

  ```markdown
  title: [박정현|0622] 공통 Entity 및 로컬 개발 환경 구성

  ## Description

  프로젝트 개발에 필요한 공통 Entity 구조와 Docker 기반 로컬 개발 환경 구성

  ## Todos

  - [ ] 공통 `BaseEntity` 구현
  - [ ] Docker 기반 로컬 개발 환경 구성
  - [ ] 각 서비스 연동 확인

  ## SubTasks

  - [x] #8
  - [x] #13
  ```

  ```markdown
  title: [박정현|0622] Docker Compose 기반 로컬 개발 환경 설정

  ## Description

  로컬 개발 환경에서 PostgreSQL, Redis, Kafka를 실행할 수 있게 Dockerfile과 Docker Compose 설정 구성

  ## Todos

  - [ ] `Dockerfile` 작성
    - [ ] Spring Boot 애플리케이션 build 및 실행 환경 구성
  - [ ] `docker-compose.yml` 작성
    - [ ] PostgreSQL 컨테이너 및 Volume 설정
    - [ ] Redis 컨테이너 및 Volume 설정
    - [ ] Kafka 컨테이너 설정
    - [ ] 각 서비스 환경 변수 및 네트워크 설정
  - [ ] `docker-compose`로 실행 및 연동 확인 테스트

  ## SubTasks
  ```

수업이 끝난 후에 맡은 초기 설정을 마무리했다. `BaseEntity`와 `BaseUpdatableEntity`를 구현하고 `Dockerfile`과 `docker-compose.yml`을 이용해 PostgreSQL, Redis, Kafka를 실행할 수 있는 로컬 개발 환경을 구성했다. 서비스별 네트워크와 환경변수를 설정하고 실제 연결 여부도 확인했다.

마지막으로 작업 내용을 PR로 올렸다. 내일 팀원 리뷰를 반영한 뒤 병합할 것이다.

---

# 팀 Notion 주소

[[SB10-4팀] Sprint Spring 백엔드 고급 팀 프로젝트](https://app.notion.com/p/Codeit-Sprint-10-4-daa65902e5ef834d9f3001309ddcf53d)

---

# GitHub Repository 주소

[https://github.com/Codeit-SB10-final-team04/sb10-mopl-team04](https://github.com/Codeit-SB10-final-team04/sb10-mopl-team04)
