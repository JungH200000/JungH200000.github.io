---
title: '[Sprint 백엔드 고급 프로젝트] MOPL 프로젝트 회고록'
excerpt: ''

categories:
  - Sprint 백엔드 고급 프로젝트
tags:
  - [Codeit Sprint, Codeit Sprint 백엔드 고급 프로젝트]

permalink: /categories/codeit-sprint/sprint-advanced-project/sprint-advanced-project09

toc: true
toc_sticky: true

date: 2026-07-27
last_modified_at: 2026-07-27
---

# MOPL 프로젝트 회고록

모두의 플리(MOPL)는 영화·드라마·스포츠 콘텐츠를 탐색하고, 플레이리스로 만들어 다른 사용자와 공유하는 서비스다. 플레이리스트 구독과 콘텐츠 추가, 팔로우, DM 같은 활동은 알림으로 이어진다. 다른 사용자와 콘텐츠를 같이 보며 대화하는 기능도 제공한다.

나는 Playlist, Notification, SSE 영역을 맡았다. 프로젝트를 시작할 때 각 영역의 기능을 구현하는 것에서 Kafka 이벤트 처리, Redis Pub/Sub을 이용한 다중 App 인스턴스 알림 전달, Spring Batch, 커스텀 메트릭과 Grafana 대시보드까지 담당 범위가 넓어졌다.

더불어 트랜잭션이 끝난 뒤 이벤트가 제대로 발행되는지, 같은 메시지가 다시 와도 데이터가 한 건만 생기는지, 사용자가 다른 App 인스턴스에 연결돼 있어도 알림이 도착하는지까지도 확인했다.

## 플레이리스트 API 구현에도 신경쓸 것들이 있었다.

처음 구현한 기능은 플레이리스트 생성 기능이었다. 처음에는 단순히 Spring Security의 공통 인증 구조가 준비되지 않아 사용자 ID를 임시 Header로 받았고 플레이리스트 응답에 필요한 사용자 요약 DTO도 전용 형태로 먼저 만들었다. 이후 `MoplUserDetails`와 공통 사용자 요약 DTO가 준비되면서 임시 구조를 교체했다. 내 기능을 진행하되 다른 담당자의 영역을 임의로 구현하지 않고, 나중에 공통 구조로 바꿀 부분은 미리 구분해 둬야 했다.

목록 조회에서는 SQL을 좀 더 깊게 구현했다. 제목·소유주·수정 시간처럼 table에 저장된 값을 이용하는 조건은 `WHERE`에서 처리했다. 구독자 수는 `GROUP BY` 이후 계산되는 값이어서 `HAVING`에 조건을 적용했다. 정렬값이 같은 플레이리스트도 순서가 바뀌지 않도록 ID를 보조 정렬값과 커서 조건으로 사용했다.

응답 DTO를 만들 때는 쿼리 수도 신경 썼다. 플레이리스트마다 구독 여부와 콘텐츠를 따로 조회하면 페이지 크기만큼 쿼리가 늘어날 수 있었다. 현재 페이지의 Playlist ID를 모은 다음 구독 여부와 콘텐츠 정보를 각각 한 번에 가져와 응답을 조립했다.

## 삭제 Batch 진행 시 데이터 삭제가 제대로 수행되지 않음

플레이리스트를 삭제하면 요청 시점에는 `deletedAt`만 기록하고 보관 기간이 지난 뒤 Spring Batch가 실제 데이터를 삭제하도록 구현했다. 삭제 대상은 처음에 `JpaPagingItemReader`로 읽었다.

문제는 테스트에서 발견됐다. 삭제 대상 네 건을 `chunk(1)`로 처리했더니 1번과 3번만 삭제되고 2번과 4번이 남았다. Writer가 앞에서 읽은 행을 삭제하면 남은 행의 위치가 앞으로 당겨진다. 다음 페이지는 기존 offset을 기준으로 조회하기 때문에 일부 행을 건너뛰고 있었다.

```text
삭제 대상: 1, 2, 3, 4

1을 읽고 삭제
남은 데이터: 2, 3, 4

다음 페이지를 기존 offset으로 조회
2를 건너뛰고 3을 읽음
```

처리하는 동안 조회 대상 자체가 바뀌는 작업에는 offset 방식이 맞지 않았다. Reader를 `JdbcCursorItemReader`로 바꿔 하나의 조회 결과를 순서대로 읽게 했다. 여러 chunk로 나눠 처리해도 삭제 대상이 빠지지 않는 것을 테스트로 확인했다.

## 알림 저장과 사용자가 알림을 받는 것은 다름

내가 처리한 알림 이벤트는 여섯 가지였다. 플레이리스트 구독, 구독한 플레이리스트의 콘텐츠 추가, 팔로우 생성, 팔로우한 사용자의 플레이리스트 생성, 사용자 권한 변경, DM 생성이다.

알림 이벤트의 전체적인 흐름은 아래와 같다.

```text
도메인 트랜잭션
➡️ Spring Event
➡️ 트랜잭션 커밋 이후 Kafka 발행
➡️ Kafka Consumer가 수신자와 알림 내용 결정
➡️ Notification 저장
➡️ Redis Pub/Sub에 실시간 전송 요청 발행
➡️ 사용자 연결을 가진 App에서 SSE 전송
```

Kafka 발행은 `@TransactionalEventListener(phase = AFTER_COMMIT)`에서 처리했다. 도메인 트랜잭션이 롤백됐는데 알림 이벤트만 먼저 실행되는 상황을 막기 위해서였다. Consumer는 이벤트별로 알림을 받을 사용자와 알림 유형·내용을 정했다. Playlist나 Follow 서비스에는 Notification의 저장 방식까지 넣지 않았다.

한 사용자가 여러 탭이나 기기로 접속할 수 있어서 SSE는 사용자별로 여러 `SseEmitter`를 관리했다. 한 연결에서 전송에 실패해도 나머지 연결에는 계속 보내고, 실패한 연결만 저장소에서 제거했다. 30초마다 작은 신호를 보내 연결 상태를 확인했으며, 이 전송에 실패한 연결도 정리했다.

단일 App에서는 이 방식으로 알림을 보낼 수 있었다. App 인스턴스가 두 개가 되면 상황이 달라졌다. 사용자의 SSE 연결은 `app-1` 메모리에 있는데 Kafka 메시지는 `app-2`가 소비할 수 있었다. `app-2`가 자신의 메모리만 확인하면 Notification은 DB에 저장되지만 실시간 알림은 전송되지 않는다.

Kafka Consumer가 SSE를 직접 호출하던 구조를 바꾸고, `NotificationRealtimePublisher`에 전송 요청을 맡겼다. 운영 모드에서는 요청을 Redis 채널에 발행한다. 모든 App의 Subscriber가 같은 요청을 받은 뒤, 각 App은 자신의 메모리에 해당 사용자의 연결이 있을 때만 SSE를 전송한다.

Kafka Consumer Group은 알림을 생성하고 저장할 App 한 곳을 정한다. Redis Pub/Sub은 저장을 마친 알림의 전송 요청을 모든 App에 알린다. 실제 사용자 연결은 각 App의 메모리에 있다. 같은 실시간 흐름에서 사용하더라도 세 기술이 맡은 역할은 서로 달랐다.

Redis Pub/Sub은 메시지를 보관하지 않는다. 사용자가 연결을 끊은 동안 생긴 알림은 DB에 남아 있는 미읽음 Notification을 기준으로 복원했다. 클라이언트가 `lastEventId` 쿼리 파라미터를 보내 재연결하면 그 시점 이후의 알림을 조회해 다시 전송했다.

## 아쉬움이 남는 부분

현재 알림 흐름에 한계가 있다. 다음 프로젝트에서는 아래 부분들을 적용해보고 싶다.

- 도메인 트랜잭션 커밋 이후 Kafka 발행에 실패한 사건을 영구 보관하고 다시 처리하는 Outbox는 구현하지 않았다.
- Notification과 DM은 같은 SSE 연결을 사용하지만 복원할 때 공통 순번이 없다.
- 연결 직후 DB 복원과 새 실시간 이벤트가 겹치면 같은 이벤트가 두번 전달될 가능성도 남아있다.

---

# 팀 Notion 주소

[[SB10-4팀] Sprint Spring 백엔드 고급 팀 프로젝트](https://app.notion.com/p/Codeit-Sprint-10-4-daa65902e5ef834d9f3001309ddcf53d)

---

# GitHub Repository 주소

[https://github.com/Codeit-SB10-final-team04/sb10-mopl-team04](https://github.com/Codeit-SB10-final-team04/sb10-mopl-team04)
