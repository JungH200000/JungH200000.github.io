---
title: '[Sprint 백엔드 고급 프로젝트 3주차] 모두의 플리 3주차 회고'
excerpt: ''

categories:
  - Sprint 백엔드 고급 프로젝트
tags:
  - [Codeit Sprint, Codeit Sprint 백엔드 고급 프로젝트]

permalink: /categories/codeit-sprint/sprint-advanced-project/sprint-advanced-project05

toc: true
toc_sticky: true

date: 2026-07-11
last_modified_at: 2026-07-11
---

# 모두의 플리 3주차 회고

2주차에는 도메인 이벤트와 Kafka를 기반으로 알림을 저장하고, SSE를 통해 실시간으로 전달하는 흐름을 구현했다. 3주차에는 이미 동작하는 알림 기능을 운영 환경과 다중 서버에서도 안정적으로 사용할 수 있도록 리팩터링했다.

이번 주의 작업은 SSE 안정성 개선, 읽은 알림 물리 삭제 배치 구현, Redis Pub/Sub 기반 다중 서버 대응이었다. 새로운 기능을 추가하는 것보다 동시성, 장애 범위, 데이터 보존, 서버 확장성에 대해 고민했다.

## SSE 안정성 개선

먼저 기존 SSE 구현에 대한 PR 리뷰를 반영했다. 첫 구현에서 알림 저장과 전송, 재연결 시 누락 알림 복구가 정상적으로 동작하는지를 확인했다. 하지만 PR 리뷰를 거치면서 "기능이 동작한다"와 "운영 환경에서 안정적으로 버틴다"는 서로 다른 문제라는 것을 느꼈다.

가장 먼저 보완한 부분은 `SseEmitterRepository`의 동시성이었다. 사용자별 연결을 `ConcurrentHashMap`과 `CopyOnWriteArrayList`로 관리하고 있었지만, 스레드 안전한 자료구조를 사용했다고 해서 여러 연산의 조합까지 자동으로 안전해지는 것은 아니었다.

기존에는 `computeIfAbsent()`로 목록을 가져온 뒤 emitter를 추가했다. 그러나 그 사이 다른 스레드가 마지막 emitter를 제거하면서 Map의 키를 삭제하면, 이미 Map에서 분리된 목록에 새 emitter가 추가될 가능성이 있었다.

이를 해결하기 위해 `compute()` 내부에서 목록 생성과 emitter 추가를 하나의 연산으로 처리했다.

알림 수신자가 없는 경우도 보완했다. 팔로워가 없는 사용자가 플레이리스트를 만들거나 구독자가 없는 플레이리스트에 콘텐츠가 추가되면 수신자 목록이 비어 있을 수 있다. 이때는 알림 저장과 SSE 전송을 호출할 이유가 없기 때문에 Consumer에서 바로 종료하도록 했다.

## 읽은 알림 물리 삭제 Batch

SSE 보완 이후에는 읽은 알림을 일정 기간이 지난 뒤 물리적으로 삭제하는 Spring Batch 작업을 구현했다.

처음에는 알림 삭제 기능이라고 단순하게 생각했지만, API와 데이터 흐름을 다시 확인해 보니 `DELETE /api/notifications/{notificationId}`는 실제 레코드를 삭제하는 API가 아니라 알림을 읽음 상태로 변경하는 API였다. 알림에는 `readAt`이 기록되고, 일정 기간이 지난 읽은 알림만 별도의 배치에서 물리적으로 삭제해야 했다.

배치 흐름은 Scheduler, Runner, Job 설정으로 역할을 나눴다. Reader는 삭제 기준일보다 `readAt`이 오래된 알림 ID를 `readAt`, `id` 순서로 조회하고, Writer는 전달받은 ID를 청크 단위로 일괄 삭제한다.

배치 실행 결과가 `COMPLETED`가 아니라면 성공으로 간주하지 않고 `BatchException`을 발생시키도록 했다. Scheduler 입장에서는 Job이 실행되었다는 사실보다 실제로 정상 완료되었는지를 구분할 수 있어야 하기 때문이다.

물리 삭제는 되돌리기 어려운 작업이므로 테스트도 삭제 대상과 보존 대상을 명확하게 나누어 작성했다. 기준일 이전에 읽은 알림은 삭제하고, 기준일과 같거나 이후에 읽은 알림 및 읽지 않은 알림은 유지되는지 검증했다. 여러 ID 삭제, 존재하지 않는 ID 포함, 빈 목록 전달과 같은 Repository 경계 조건도 함께 확인했다.

## PostgreSQL 부분 인덱스 추가

알림 조회와 삭제 쿼리에 맞춰 PostgreSQL 부분 인덱스도 추가했다.

미읽음 알림 조회는 `receiver_id`와 `read_at IS NULL` 조건을 사용하고, `created_at`, `id` 순서로 정렬한다. 따라서 전체 알림이 아닌 미읽음 알림만 대상으로 하는 인덱스를 구성했다.

반대로 물리 삭제 배치는 `read_at IS NOT NULL`인 데이터 중 오래된 알림을 찾기 때문에 `read_at`, `id`를 기준으로 부분 인덱스를 구성했다.

## Redis Pub/Sub으로 다중 서버 SSE에 대응하기

2주차에는 인메모리 `SseEmitterRepository`가 다중 서버 환경에서 가지는 한계를 향후 개선 과제로 남겼었다.  
이번 주에는 그 문제를 실제 Redis Pub/Sub 기반 구조로 개선했다.

기존에는 Kafka Consumer가 알림을 DB에 저장한 뒤 같은 서버의 `SseEmitter`로 바로 전송했다. 단일 서버에서는 문제가 없지만, 서버가 여러 대라면 사용자가 연결된 서버와 Kafka 메시지를 소비한 서버가 다를 수 있다.

예를 들어 사용자가 `app-1`에 연결되어 있는데 `app-2`가 Kafka 메시지를 소비하면, `app-2`의 메모리에는 해당 사용자의 emitter가 없다. 알림은 DB에 정상 저장되지만 실시간 전송은 누락될 수 있다.

먼저 Kafka Consumer에서 실시간 전송 책임을 분리하고 `NotificationRealtimePublisher` 인터페이스를 도입했다. 단일 서버에서는 로컬 구현을, 다중 서버에서는 Redis 구현을 사용할 수 있게 하여 Consumer가 구체적인 전송 방식에 의존하지 않도록 했다.

전체 흐름은 다음과 같다.

```text
Kafka Consumer
→ 알림 DB 저장
→ Redis 채널에 실시간 전송 요청 발행
→ 모든 서버의 Redis Subscriber가 요청 수신
→ 각 서버가 로컬 SseEmitter 확인
→ 실제 연결을 보유한 서버만 SSE 전송
```

여기서 Kafka와 Redis의 역할을 구분하는 것이 중요했다. Kafka는 도메인 이벤트를 비동기로 처리하고 알림을 생성·저장하는 파이프라인을 담당한다. Redis Pub/Sub은 이미 저장된 알림의 실시간 전송 요청을 모든 서버에 빠르게 전달하는 브로드캐스트 채널이다.

Redis Pub/Sub은 구독 중이지 않은 서버에 메시지를 다시 전달하거나 메시지를 보관하지 않는다. 따라서 알림 생성의 신뢰성을 Redis에 맡기지 않고, DB 저장은 Kafka 처리 흐름에서 완료한 뒤 Redis는 실시간 전달에만 사용하도록 책임을 나눴다.

## 재연결과 누락 알림 복구 검증

SSE 재연결도 직접 확인했다. 처음에는 Chrome DevTools의 Network를 Offline으로 변경했지만, 이미 열려 있던 SSE 스트림이 즉시 종료되지 않는 경우가 있었다. 그래서 백엔드 컨테이너를 재시작해 실제 연결 종료 상황을 만들고 프론트의 자동 재연결을 확인했다.

재연결 요청에 `lastEventId`가 전달되는지 확인했고, 백엔드는 해당 ID 이후에 저장된 미읽음 알림을 DB에서 조회해 복구할 수 있었다.

이를 통해 Redis Pub/Sub 메시지를 놓치더라도 알림 자체는 DB에 남아 있고, 클라이언트가 다시 연결되면 누락 알림을 복구할 수 있다는 점을 확인했다. 다만 실제 여러 애플리케이션 인스턴스를 동시에 운영하면서 장애와 재연결을 반복하는 수준의 검증은 추가로 필요하다.

---

# 팀 Notion 주소

[[SB10-4팀] Sprint Spring 백엔드 고급 팀 프로젝트](https://app.notion.com/p/Codeit-Sprint-10-4-daa65902e5ef834d9f3001309ddcf53d)

---

# GitHub Repository 주소

[https://github.com/Codeit-SB10-final-team04/sb10-mopl-team04](https://github.com/Codeit-SB10-final-team04/sb10-mopl-team04)
