---
title: '[Sprint 백엔드 고급 프로젝트 2주차] 모두의 플리 2주차 회고'
excerpt: ''

categories:
  - Sprint 백엔드 고급 프로젝트
tags:
  - [Codeit Sprint, Codeit Sprint 백엔드 고급 프로젝트]

permalink: /categories/codeit-sprint/sprint-advanced-project/sprint-advanced-project04

toc: true
toc_sticky: true

date: 2026-07-05
last_modified_at: 2026-07-05
---

# 모두의 플리 2주차 회고

1주차는 플레이리스트의 기본 CRUD와 QueryDSL 목록 조회를 구현했다면, 2주차에는 플레이리스트 구독, 플레이리스트에 콘텐츠 추가/삭제, 알림 저장과 조회, Kafka 기반 도메인 이벤트, SSE 실시간 전송까지 구현했다.

## 플레이리스트 구독/구독 취소

가장 먼저 진행한 것은 플레이리스트 **구독과 구독 취소**였다. 구현할 때 이미 구독한 경우, 본인 플레이리스트를 구독하려는 경우, 구독하지 않은 플레이리스트를 취소하는 경우 등을 각각 다르게 처리해야 했다.  
특히 중복 구독은 `exists`로 확인하는 걸로 충분하지 않았다. 만약 동시 요청이 들어올 경우 요청들 전부 중복이 아니라고 판단한 뒤 저장을 시도할 수 있기 때문이다. 그래서 DB의 `unique` 제약 조건을 걸고, `saveAndFlush()`에서 발생할 수 있는 `DataIntegrityViolationException`을 커스텀 예외로 변환하는 방식으로 구현했다.

## 플레이리스트 콘텐츠 추가/삭제

이 기능도 구독/구독 취소와 비슷했다. 같은 콘텐츠를 중복 추가하면 현재 상태와 충돌하기에 `409 Conflict`를 발생시켰고, 삭제되면 플레이리스트 구성이 변경되므로 `updatedAt`도 갱신했다.

## Spring Security 추가로 JWT 인증 활용

기존에는 Spring Security가 적용되어 있지 않아 임시 헤더 `X-MOPL-USER-ID` 기반으로 인증하던 방식에서 JWT 필터가 인증을 처리하고 Controller에서 `@AuthenticationPrincipal`에서 사용자 정보를 꺼내는 방식으로 변경했다.

또한 플레이리스트 수정/삭제에서 권한 여부를 판단하는 `@PreAuthorize`를 적용해 서비스 메서드에 들어가기 전에 수정/삭제가 가능한 권한을 가지고 있는지 검증했다.

## 알림 저장

알림은 여러 사용자에게 동시에 생성될 수 있기 때문에 처음부터 `Set<UUID>` 기반의 다건 저장으로 구현했다.

## 알림 목록 조회

알림 목록 조회에서는 읽지 않은 알림만 조회하고 `createdAt`과 `id`로 커서 페이지네이션을 구현했다. `id`도 같이 사용한 이유는 같은 시간에 생성된 알림이 있을 수 있기 때문에 `createdAt` 정렬만 있는 알림은 안정적이지 않기 때문이다.

## 알림 읽음 처리

처음 구현했을 때 이미 읽은 알림에 다시 `DELETE` 요청이 들어오면 `404 Not Found`가 발생하는 문제가 있었다. `DELETE` 요청은 멱등성을 가져야 하기 때문에 같은 요청을 여러 번 보내도 일관적인 결과가 출력되어야 한다. 그래서 알림은 수신자 기준으로 조회하고, Entity 내부에서 `readAt`이 `null`일 때만 `readAt`을 갱신하도록 수정했다.

## Kafka를 이용한 도메인 이벤트 알림 생성

이벤트는 "어떤 일이 발생했는가"를 표현해야 하기 때문에 `playlistId`, `subscriverId`, `occurredAt`처럼 발생한 사건에 대한 값을 담고, 실제 알림 제목, 내용, 타입은 Consumer에서 구현하는 것으로 결정했다.

구조는 "도메인 서비스 성공" ➡️ "내무 이벤트 발행" ➡️ "트랜잭션 commit 후 Kafka topic 발행" ➡️ "Comsumer에서 이벤트 소비" ➡️ "알림 저장 및 전송"으로 나눴다.

## SSE를 이용한 실시간 알림 전송

알림은 DB에 저장하는 것으로 끝내는 것이 아니라 사용자가 접속 중이라면 클라이언트로 바로 전달되어야 했다. 그래서 `SseEmitter`를 이용해 사용자별 SSE 연결을 관리하고, 알림이 생성되면 사용자에게 `notifications` 이벤트를 전송하는 로직을 구현했다.

사용자가 `/api/sse`로 연결하면 서버는 해당 사용자의 id를 기준으로 `emitter`를 저장하고, 알림 발생 시 그 `emitter`로 이벤트를 전송한다. 도중에 연결이 끊기거나 전송 중 예외가 발생하면 emitter를 제거했다. 제거한 이유는 이미 끊어진 연결에 이벤트를 계속 보내거나 메모리에 불필요한 정보를 남길 수 있기 때문이다.

다음으로 재연결 상황에 대해 구현했는데, SSE는 네트워크 상황에 따라 연결이 끊기거나 다시 연결될 수 있다. 이때 알람을 놓치면 안된다. 그래서 처음에는 배운대로 `SseMessageRepository`를 인메모리로 구현했다.  
서버가 전송한 SSE 메시지를 메모리에 저장해두고, 클라이언트가 `lastEventId`를 가지고 다시 연결하면 해당 id 이후의 메시지를 찾아 다시 전송하는 방식이었다.

다만 실제 서비스를 생각했을 때 한계가 명확했다.  
인메모리 저장소는 서버가 재시작되면 데이터가 사라진다. 또한, 서버가 여러 대로 늘어나면 사용자가 어느 서버에 다시 연결되는지에 따라서도 알림 복구 결과가 달라진다. 무엇보다도 알림은 이미 `notifications` table에 저장되고 있다. 그렇다면 SSE 복구 기준도 별도의 인메모리 저장소가 아닌 실제 알림 DB가 되는 편이 더 효과적이라고 판단했다.

그래서 이후 `SseMessageRepository`를 제거하고 DB 기준으로 누락된 알림을 복구하는 구조로 리팩터링했다. `NotificationRestoreService`를 새롭게 구현해서 `lastEventId`를 가진 알림을 기준으로 그 이후에 읽지 않은 알림을 DB에서 조회하도록 구현했다.

## 보완 작업

### Kafka Consumer와 Publisher에 로그 추가

Kafka 기반 알림은 백그라운드 처리로, 사용자의 요청 흐름이 바로 보이지 않는다. 그래서 문제가 발생했을 때 어떤 이벤트를 처리하다가 실패했는지 알기 어렵다.

Consumer에는 이벤트 처리 시작, 알림 저장, SSE 전송 시작과 완료 로그를 추가했고, Pulisher에도 이벤트 발행 시작 로그를 추가했다.  
로그는 전체 `payload`를 남기기 보다는 `topic`, `eventType`, `eventId` 같은 예외 추적에 필요한 최소 정보만 추가했다.

### SSE 전송 실패

기존에는 여러 수신자에게 알림을 보내다가 한 명의 연결에서 전송이 실패한다면 전체 알림 전송에 영향을 줄 수 있고, Kafka 재시도 발생 시 중복 알림을 발생시킬 수 있기 때문에 `try...catch`문으로 수신자별 실패를 로그로 보내는 방법을 사용해 다음 수신자 전송이 계속 진행되도록 리팩터링했다.

---

# 팀 Notion 주소

[[SB10-4팀] Sprint Spring 백엔드 고급 팀 프로젝트](https://app.notion.com/p/Codeit-Sprint-10-4-daa65902e5ef834d9f3001309ddcf53d)

---

# GitHub Repository 주소

[https://github.com/Codeit-SB10-final-team04/sb10-mopl-team04](https://github.com/Codeit-SB10-final-team04/sb10-mopl-team04)
