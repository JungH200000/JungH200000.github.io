---
layout: single-editorial
title: '[TIL 27일 차] Sprint Mission4 - 디스코드: Controller Layer 구현 및 테스트'
excerpt: '3-5. 메시지 수신 정보 관리 ~ 4. 심화 요구사항'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til027/

toc: true
toc_sticky: true

date: 2026-02-10
last_modified_at: 2026-02-10
---

# 오늘의 학습

## 1. 개발 진행 상황

- Service 로직을 활용해 웹 API 구현
  - 메시지 수신 정보 관리를 위한 `ReadStatusController` 구현
    - 특정 채널 메시지 수신 정보 생성 API `createReadStatus` 핸드러 메서드 구현
    - 특정 채널의 메시지 수신 정보 수정 API `updateReadStatus` 핸드러 메서드 구현
    - 특정 사용자의 메시지 수신 정보 조회 API `findAllReadStatusByUserId` 핸드러 메서드 구현
  - 바이너리 파일 다운로드 관리를 위한 `BinaryContentController` 구현
    - 바이너리 파일을 1개 조회 API `downloadFile` 핸들러 메서드 구현
    - 바이너리 파일을 여러 개 조회 API `downloadFiles` 핸들러 메서드 구현
- 사용자 목록을 보여주는 화면 출력

  <img src="{{ '/assets/images/posts_img/til/sprint-til/00_existing/sprint_mission04_test01.png' | relative_url }}" style="width: 700px;">

---

# 프로젝트 요구 사항

## 2. 기본 요구사항

### 2-1. 컨트롤러 레이어 구현

- [x] DiscodeitApplication의 테스트 로직은 삭제하세요.
- [x] 지금까지 구현한 서비스 로직을 활용해 웹 API를 구현하세요.
  - 이때 `@RequestMapping`만 사용해 구현해보세요.
  - 아래의 "웹 API 요구사항" 참고

- [x] 웹 API의 예외를 전역으로 처리하세요.

<br>

### 2-2. API 테스트

- [x] Postman을 활용해 컨트롤러를 테스트 하세요.
  - Postman API 테스트 결과를 다음과 같이 export하여 PR에 첨부해주세요.

`//...`

### 3-5. 메시지 수신 정보 관리

- [x] 특정 채널의 메시지 수신 정보를 생성할 수 있다.
- [x] 특정 채널의 메시지 수신 정보를 수정할 수 있다.
- [x] 특정 사용자의 메시지 수신 정보를 조회할 수 있다.

<br>

### 3-6. 바이너리 파일 다운로드

- [x] 바이너리 파일을 1개 또는 여러 개 조회할 수 있다.

---

## 4. 심화 요구사항

### 4-1. 정적 리소스 서빙

- [x] 사용자 목록 조회, BinaryContent 파일 조회 API를 다음의 조건을 만족하도록 수정하세요.
  - [x] 사용자 목록 조회
    - url: `/api/user/findAll`
    - 요청
      - 파라미터, 바디 없음
    - 응답
      - `ResponseEntity<List<UserDto>>`

        ```java
        public record UserDto(
                UUID id,
                Instant createdAt,
                Instant updatedAt,
                String username,
                String email,
                UUID profileId,
                Boolean online
        ) {
        }
        ```

  - [x] 사용자 목록 조회
    - url: `/api/binaryContent/find`
    - 요청
      - 파라미터: `binaryContentId`
      - 바디 없음
    - 응답: `ResponseEntity<BinaryContent>`

- [x] `static-resources.zip`을 활용하여 사용자 목록을 보여주는 화면을 서빙해보세요.

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint4](https://github.com/JungH200000/10-sprint-mission/tree/sprint4)
