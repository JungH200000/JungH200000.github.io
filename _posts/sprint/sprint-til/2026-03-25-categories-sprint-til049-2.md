---
title: '[TIL 49일 차] Sprint Mission7 - 환경별 프로파일 분리 및 로그 정책 설정'
excerpt: '2-1.프로파일 기반 설정 관리 ~ 2-2.로그 관리'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til049-2

toc: true
toc_sticky: true

date: 2026-03-25
last_modified_at: 2026-03-25
---

#

# [TIL 일차] Sprint Mission

# 오늘의 성취

- 개발(dev), 운영(prod) 환경에 따라 프로파일 생성
  - `application-dev.yaml`, `application-prod.yaml`
  - 데이터베이스 연결 정보와 서버 포트 설정값을 분리
- 환경별 로깅 레벨 설정
  - `application.yaml`에 기본적인 로그 레벨(`root`) 설정
  - `application-dev.yaml`, `application-prod.yaml`에 애플리케이션 패키지 레벨 설정
- 로깅 패턴과 출력 방식 설정
- 로그 파일 정책 설정
  - `logback-spring.xml` 파일에 로그 정책 설정
    - 저장 경로, 저장 파일 이름 설정
    - 일자별 롤링, 최대 보관일 설정

# 프로젝트 요구 사항

## 2. 기본 요구사항

### 2-1. 프로파일 기반 설정 관리

- [x] 개발, 운영 환경에 대한 프로파일을 구성하세요.
  - [x] `application-dev.yaml`, `application-prod.yaml` 파일을 생성하세요.
  - [x] 다음과 같은 설정값을 프로파일별로 분리하세요.
    - [x] 데이터베이스 연결 정보
    - [x] 서버 포트

<br>

### 2-2. 로그 관리

- [x] Lombok의 `@Slf4j` 애너테이션을 활용해 로깅을 쉽게 추가할 수 있도록 구성하세요.
- [x] `application.yaml`에 기본 로깅 레벨을 설정하세요.
  - 기본적으로 `info` 레벨로 설정합니다.
- [x] 환경 별 적절한 로깅 레벨을 프로파일 별로 설정해보세요.
  - SQL 로그를 보기위해 설정했던 레벨은 유지합니다.
  - 우리가 작성한 프로젝트의 로그는 개발 환경에서 `debug`, 운영 환경에서는 `info` 레벨로 설정합니다.
- [x] Spring Boot의 기본 로깅 구현체인 Logback의 설정 파일을 구성하세요.
  - [x] `logback-spring.xml` 파일을 생성하세요.
  - [x] 다음 예시와 같은 로그 메시지를 출력하기 위한 로깅 패턴과 출력 방식을 커스터마이징하세요.
    - 로그 출력 예시

      ```java
      # 패턴
      {년}-{월}-{일} {시}:{분}:{초}:{밀리초} [{스레드명}] {로그 레벨(5글자로 맞춤)} {로거 이름(최대 36글자)} - {로그 메시지}{줄바꿈}

      # 예시
      25-01-01 10:33:55.740 [main] DEBUG c.s.m.discodeit.DiscodeitApplication - Running with Spring Boot v3.4.0, Spring v6.2.0
      ```

  - [x] 콘솔과 파일에 동시에 로그를 기록하도록 설정하세요.
    - [x] 파일은 `{프로젝트 루트}/.logs` 경로에 저장되도록 설정하세요.
  - [x] 로그 파일은 일자별로 롤링되도록 구성하세요.
  - [x] 로그 파일은 30일간 보관하도록 구성하세요.

`//...`

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint7](https://github.com/JungH200000/10-sprint-mission/tree/sprint7)
