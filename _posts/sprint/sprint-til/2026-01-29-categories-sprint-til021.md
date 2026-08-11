---
layout: single-editorial
title: '[TIL 21일 차] Sprint Mission3 - 디스코드:  `AuthService` 구현과 `ChannelService` 고도화'
excerpt: ''

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til021/

toc: true
toc_sticky: true

date: 2026-01-29
last_modified_at: 2026-01-29
---

# 오늘의 성취

## 1. 개발 진행 상황

- **피드백 받은 부분 수정 진행** : [26.01.28 - Sprint3 Feedback](https://www.notion.so/jungh20000/26-01-28-Sprint3-Feedback-2f6f59816c0280898898d1580294c2a9?source=copy_link)
- `AuthService` 구현
  - `login` 메서드 구현
- `ChannelService` 고도화
  - DTO를 활용해 `create`, `find`, `findAll`, `update`, `delete` 메서드 고도화

---

# 프로젝트 요구사항

`// ...`

## 2) AuthService 구현

- `login`
  - [x] `username`, `password`과 일치하는 유저가 있는지 확인합니다.
    - [x] 일치하는 유저가 있는 경우: 유저 정보 반환
    - [x] 일치하는 유저가 없는 경우: 예외 발생
    - [x] DTO를 활용해 파라미터를 그룹화합니다.
- 의존성
  - 같은 레이어 간 의존성 주입은 순환 참조 방지를 위해 지양합니다. 다른 Service 대신 필요한 Repository 의존성을 주입해보세요.

    <img src="{{ '/assets/images/posts_img/til/sprint-til/spring-mission/21/authservice_dependency.png' | relative_url }}" width=150px>

<br>

## 3) ChannelService 고도화

- 고도화
  - `create`
    - PRIVATE 채널과 PUBLIC 채널을 생성하는 메서드를 분리합니다.
    - [x] 분리된 각각의 메서드를 DTO를 활용해 파라미터를 그룹화합니다.
    - PRIVATE 채널을 생성할 때:
      - [x] 채널에 참여하는 `User`의 정보를 받아 `User` 별 `ReadStatus` 정보를 생성합니다.
      - [x] `name`과 `description` 속성은 생략합니다.
    - PUBLIC 채널을 생성할 때에는 기존 로직을 유지합니다.
  - `find`
    - DTO를 활용하여:
      - [x] 해당 채널의 가장 최근 메시지의 시간 정보를 포함합니다.
      - [x] PRIVATE 채널인 경우 참여한 `User`의 `id` 정보를 포함합니다.
  - `findAll`
    - DTO를 활용하여:
      - [x] 해당 채널의 가장 최근 메시지의 시간 정보를 포함합니다.
      - [x] PRIVATE 채널인 경우 참여한 `User`의 `id` 정보를 포함합니다.
    - [x] 특정 `Use`r가 볼 수 있는 Channel 목록을 조회하도록 조회 조건을 추가하고, 메서드 명을 변경합니다. `findAllByUserId`
    - [x] PUBLIC 채널 목록은 전체 조회합니다.
    - [x] PRIVATE 채널은 조회한 `User`가 참여한 채널만 조회합니다.
  - `update`
    - [x] DTO를 활용해 파라미터를 그룹화합니다.
      - 수정 대상 객체의 id 파라미터, 수정할 값 파라미터
    - [x] PRIVATE 채널은 수정할 수 없습니다.
  - `delete`
    - [x] 관련된 도메인도 같이 삭제합니다.
      - `Message`, `ReadStatus`

- 의존성
  - 같은 레이어 간 의존성 주입은 순환 참조 방지를 위해 지양합니다. 다른 Service 대신 필요한 Repository 의존성을 주입해보세요.

  <img src="{{ '/assets/images/posts_img/til/sprint-til/spring-mission/21/channelService_dependency.png' | relative_url }}" width=600px>

`//...`

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint3](https://github.com/JungH200000/10-sprint-mission/tree/sprint3)
