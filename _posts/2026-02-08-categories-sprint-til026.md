---
title: '[TIL 25일 차] Sprint Mission4 - 디스코드: Controller Layer 구현'
excerpt: '3-1. 사용자 관리 ~ 3-4. 메시지 관리'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til026/

toc: true
toc_sticky: true

date: 2026-02-08
last_modified_at: 2026-02-08
---

# 오늘의 학습

1. 개발 진행 상황
   - Service 로직을 활용해 웹 API 구현
     - 사용자 관리를 위한 `UserController` 구현
       - User 삭제를 위한 `UserDeleteService` 서비스 클래스 구현
     - 권한 관리를 위한 `AuthController` 핸들러 클래스 구현
       - 사용자 로그인 API `login` 핸들러 메서드 구현
     - 채널 관리를 위한 `ChannelController` 핸들러 클래스 구현
       - 공개 채널 생성 API `createPublicChannel` 핸들러 메서드 구현
       - 비공개 채널 생성 API `createPrivateChannel` 핸들러 메서드 구현
       - 특정 사용자가 볼 수 있는 채널 조회 API `findAllByUserId` 핸들러 메서드 구현
       - PUBLIC 채널 정보 수정 API `updatePublicChannelInfo` 핸들러 메서드 구현
       - 채널 참여 API `joinChannel` 핸들러 메서드 구현
       - 채널 탈퇴 API `leaveChannel` 핸들러 메서드 구현
       - 채널 owner 변경 API `changeChannelOwner` 핸들러 메서드 구현
       - 채널 삭제 API `deleteChannel` 핸들러 메서드 구현
     - 메시지 관리를 위한 `MessageController` 핸들러 클래스 구현
       - 메시지 생성 API `createMessage` 핸들러 메서드 구현
       - 특정 채널 메시지 조회 API `findAllMessagesByChannelId` 핸들러 메서드 구현
       - 메시지 수정 API `updateMessage` 핸들러 메서드 구현
       - 메시지 삭제 API `updateMessage` 핸들러 메서드 구현

2. **고민** : 채널 참여/탈퇴, 채널 주인 교체 핸들러 메서드의 HTTP 메서드는 뭘로 해야 할까?
   - HTTP 메서드는 도메인 클래스의 필드 변경 여부가 아닌, API에서 어떤 데이터를 어떤 의미로 다루는지에 따라 결정하기

# 프로젝트 요구 사항

## 2. 기본 요구사항

### 2-1. 컨트롤러 레이어 구현

- [x] DiscodeitApplication의 테스트 로직은 삭제하세요.
- [진행 중] 지금까지 구현한 서비스 로직을 활용해 웹 API를 구현하세요.
  - 이때 `@RequestMapping`만 사용해 구현해보세요.
  - 아래의 "웹 API 요구사항" 참고

- [x] 웹 API의 예외를 전역으로 처리하세요.

`//...`

## 3. 웹 API 요구사항

### 3-1. 사용자 관리

`//...`

- [x] 사용자를 삭제할 수 있다.

`//...`

<br>

### 3-2. 권한 관리

- [x] 사용자는 로그인할 수 있다.

<br>

### 3-3. 채널 관리

- [x] 공개 채널을 생성할 수 있다.
- [x] 비공개 채널을 생성할 수 있다.
- [x] 공개 채널의 정보를 수정할 수 있다.
- [x] 채널을 삭제할 수 있다.
- [x] 특정 사용자가 볼 수 있는 모든 채널 목록을 조회할 수 있다.

<br>

### 3-4. 메시지 관리

- [x] 메시지를 보낼 수 있다.
- [x] 메시지를 수정할 수 있다.
- [x] 메시지를 삭제할 수 있다.
- [x] 특정 채널의 메시지 목록을 조회할 수 있다.

`//...`

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint4](https://github.com/JungH200000/10-sprint-mission/tree/sprint4)
