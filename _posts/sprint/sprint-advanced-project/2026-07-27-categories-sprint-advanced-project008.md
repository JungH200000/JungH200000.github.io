---
title: '[Sprint 백엔드 고급 프로젝트] 개인 개발 리포트'
excerpt: ''

categories:
  - Sprint 백엔드 고급 프로젝트
tags:
  - [Codeit Sprint, Codeit Sprint 백엔드 고급 프로젝트]

permalink: /categories/codeit-sprint/sprint-advanced-project/sprint-advanced-project08

toc: true
toc_sticky: true

date: 2026-07-27
last_modified_at: 2026-07-27
---

# 개인 개발 리포트

- 프로젝트명: 모두의 플리(MOPL)
- 작성자: 박정현
- 주요 담당 영역
  - Playlist·Notification 도메인
  - Kafka·Redis Pub/Sub·SSE 기반 실시간 알림
  - 커스텀 메트릭 및 Grafana

---

## 1. 프로젝트 개요

모두의 플리(MOPL)는 영화·드라마·스포츠 컨텐츠를 탐색하고, 플레이리스트로 큐레이팅해 다른 사용자와 공유할 수 있는 소셜 서비스다. 사용자는 플레이리스트를 구독하거나 콘텐츠를 추가할 수 있으며, 팔로우·권한 변경·DM·플레이리스트 활동과 관련된 알림을 실시간으로 받을 수 있다. 다른 사용자와 콘텐츠를 실시간으로 같이 보며 대화하는 기능도 제공한다.

백엔드는 Spring Boot 기반으로 구현했다. 데이터베이스는 PostgreSQL을 사용했고, 도메인 이벤트는 Kafka로 비동기 전달했다. 사용자가 어느 애플리케이션 인스턴스에 연결되어 있어도 알림을 받을 수 있도록 Redis Pub/Sub과 SSE를 함께 사용했다. Spring Batch로 외부 데이터를 수집하고 보관 기간이 지난 데이터를 정리했다. 주요 기능의 실행 결과와 처리 흐름은 Micrometer·Prometheus·Grafana로 확인할 수 있게 구성했다.

나는 Playlist, Notification 도메인과 SSE 연결­·전송 기능을 구현했다. 이후 Kafka 기반 알림 이벤트 처리, Redis Pub/Sub을 이용한 다중 애플리케이션 알림 전달, Playlist·Notification 삭제 Batch, 커스텀 메트릭과 Grafana 대시보드 시각화까지 담당했다.

---

## 2. 담당한 작업

| **영역**           | **담당 작업**                                                                                                                      |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Playlist           | Entity와 관계 모델, 생성·단건 조회·목록 조회·수정·논리 삭제, 구독·구독 취소, 콘텐츠 추가·삭제                                      |
| Notification       | 여러 사용자에게 알림 저장, 미읽음 목록 조회, 읽음 처리, DB에 저장된 미수신 알림 복원                                               |
| Kafka 알림         | 도메인 이벤트 발행, 트랜잭션 커밋 이후 Kafka 발행, 6종 이벤트 소비 및 이벤트별 알림 수신자·유형·내용 결정                          |
| SSE                | 사용자별 다중 연결 객체(Emitter) 관리, 주기적 연결 상태 확인, 실패 연결 제거, `lastEventId` 기반 미수신 알림 복원                  |
| Redis Pub/Sub      | Notification 실시간 요청을 Redis 채널에 발행하고 모든 App 인스턴스가 이를 수신하도록 Publisher·Subscriber 구현                     |
| Spring Batch       | 논리 삭제된 Playlist와 보관 기간이 지난 읽은 Notification을 물리 삭제하는 Batch                                                    |
| Observability      | 프로젝트의 7개 Batch Job과 9개의 Step에 공통 메트릭 Listener를 적용, Notification/Kafka·SSE·Notification Redis Pub/Sub 메트릭 구현 |
| Prometheus·Grafana | 두 App 인스턴스를 대상으로 Prometheus 메트릭 수집 설정, 7개 영역·26개 패널로 구성된 Grafana 통합 대시보드 구축                     |

Playlist와 Notification 삭제 Batch는 직접 구현했다. 다른 Batch 업무 로직까지 구현한 건 아니지만, 프로젝트에 존재하는 7개 Batch Job과 9개 Step에는 공통 Listener를 적용했다. 이를 바탕으로 실행 성공·실패 여부와 처리 건수를 같은 방식으로 수집했다.

Batch, Notification/Kafka, SSE, Notification Redis Pub/Sub에서는 실제 처리 코드에 메트릭 기록 기능을 구현했다. WebSocket·Watching Session·DM/Content Chat·Domain Redis Sync 영역은 팀원이 구현한 메트릭을 바탕으로 초기값을 등록하고 Grafana 대시보드에 시각화했다.

---

## 3. 기술적 성과

### 3.1 Playlist 생성부터 삭제까지

Playlist Entity를 시작으로 아래의 기능들을 구현했다.

- 생성·단건 조회·수정·논리 삭제
- 제목·설명 키워드와 소유자 조건 검색 및 정렬을 지원하는 커서 기반 목록 조회
- 구독·구독 취소
- 콘텐츠 추가·삭제
- 보관 기간이 지난 논리 삭제 데이터 물리 삭제 Batch

목록 조회는 QueryDSL로 구현했다. 제목·소유자·수정 시간처럼 table에 저장된 값은 `WHERE`절에서 먼저 거르고, 구독자 수처럼 조회 과정에서 계산되는 값은 `GROUP BY` 이후 `HAVING` 절에서 처리했다. 수정 시간이나 구독자 수가 같아도 조회 순서가 유지되도록 ID를 보조 정렬값이자 커서 조건으로 사용했다.

플레이리스트마다 구독 여부와 콘텐츠 정보를 따로 조회하면 목록의 개수만큼 추가 쿼리가 실행될 수 있다. 현재 페이지에 포함된 Playlist ID를 모은 뒤 구독 여부와 콘텐츠 요약을 각각 한 번에 조회해 DTO를 조립했다.

구독과 콘텐츠 추가처럼 같은 관계가 중복으로 만들어질 수 있는 기능에는 사전 조회와 DB 복합 unique 제약을 함께 적용했다. 먼저 중복 여부를 조회해 일반적인 중복 요청을 예외로 처리했다. 두 요청이 동시에 들어와 사전 조회를 모두 통과하면 DB의 unique 제약으로 중복 저장을 막고, 제약 위반을 같은 도메인 예외로 변환했다.

수정·삭제 권한 검사는 `@PreAuthorize`와 `PlaylistAuthorizationEvaluator`로 분리했다. 접근 거부 예외가 500이 아닌 403으로 응답하도록 예외 처리도 보완했다.

### 3.2 Kafka 기반 알림 이벤트 발행과 처리

플레이리스트 구독이나 팔로우 같은 핵심 기능이 알림 저장 방식에 의존하지 않도록 처리 과정을 아래처럼 나눴다.

```
도메인 트랜잭션
➡️ Spring Event
➡️ 트랜잭션 커밋 이후 비동기 Listener
➡️ Kafka
➡️ 이벤트별 수신자와 알림 내용 결정
➡️ Notification 저장
➡️ Redis Pub/Sub과 SSE를 통한 실시간 전송
```

처리한 이벤트는 플레이리스트 구독, 구독한 플레이리스트에 콘텐츠 추가, 팔로우 생성, 팔로우한 사용자의 플레이리스트 생성, 사용자 권한 변경, DM 생성까지 6가지이다. 도메인 이벤트에는 사건을 식별하고 알림을 만드는 데 필요한 데이터만 담았다. 알림을 받을 사용자와 알림의 유형·내용은 Kafka Consumer에서 결정해 기존 도메인 서비스가 알림 정책에 직접 의존하지 않도록 했다.

Kafka 발행은 `@TransactionalEventListener(phase = AFTER_COMMIT)`에서 수행했다. 도메인 트랜잭션이 롤백됐는데 알림 이벤트만 Kafka로 먼저 나가는 상황을 막기 위해서다. 커밋 이후 Kafka 발행이 실패했을 때 이벤트를 영구 보관하고 재처리하는 Outbox나 전용 DLT는 현재 구현 범위에 넣지 않았으며, 향후 개선 항목으로 남겼다.

### 3.3 Kafka 중복 이벤트로 인한 알림 중복 방지

Kafka는 같은 메시지를 다시 전달할 수 있다. 따라서 이벤트와 수신자에 대한 알림이 여러 번 생성되지 않도록 애플리케이션과 DB에서 중복을 막았다.

각 도메인 이벤트 ID를 `sourceEventId`로 저장하고, `sourceEventId + receiverId` 조합을 같은 알림인지 판단하는 기준으로 삼았다. 알림을 저장하기 전에 같은 `sourceEventId`로 Notification이 이미 저장된 수신자 ID를 조회해 저장 대상에서 제외했다. DB에도 같은 조합의 unique 제약을 설정했다. Consumer는 실제로 새로 저장된 `NotificationDto`만 실시간 전송 대상으로 넘겼다.

중복 이벤트가 들어와도 기존 수신자에게 같은 알림 데이터가 추가되거나 SSE가 다시 전송되지 않게 했다.

### 3.4 Redis Pub/Sub을 이용한 다중 App 인스턴스 실시간 알림 전달

SSE 연결 객체는 사용자가 접속한 App 인스턴스의 JVM 메모리에만 존재한다. 같은 Consumer Group에 속한 Kafka Consumer는 이벤트 하나를 여러 App 중 한 곳에서 처리한다. 알림을 저장한 App과 사용자의 SSE 연결을 가진 App이 다르면 로컬 SSE 전송만으로 사용자에게 알림을 보낼 수 없다.

그래서 Notification 저장과 실시간 전송 요청을 분리했다. Kafka Consumer가 새 `Notification`을 저장하면 `NotificationRealtimePublisher`가 Redis의 `mopl:notification:realtime` 채널에 전송 요청을 발행한다. 모든 App 인스턴스의 Subscriber가 요청을 받고, 각 App은 자신의 `SseEmitterRepository`에서 해당 사용자의 연결을 찾았을 때만 SSE를 전송한다.

```
Kafka Consumer Group에서 선택된 한 App
➡️ Notification 저장
➡️ Redis 채널에 실시간 전송 요청 발행
➡️ 모든 App의 Subscriber가 요청 수신
➡️ 각 App이 자신의 로컬 SSE 연결 확인
➡️ 연결을 가진 App에서만 실제 전송
```

Kafka Consumer Group은 알림 생성 작업을 한 App에 배분하고, Redis Pub/Sub은 실시간 전송 요청을 모든 App에 전달한다.

SSE 연결은 각 App이 따로 관리하며, Redis는 메시지를 보관하지 않는다. 접속이 끊긴 동안 발생한 알림은 DB에서 미읽음 Notification을 조회해 복원한다. `mopl:notification:realtime` 채널은 Notification 실시간 전달에만 사용한다.

### 3.5 SSE 연결 관리와 재연결 시 알림 복원

한 사용자가 여러 브라우저 탭이나 기기에서 접속할 수 있어 사용자별로 여러 SSE 연결 객체를 관리했다. 주기적으로 heartbeat를 보내 연결 상태를 확인했다. 특정 연결에서 전송 예외가 발생하면 해당 연결만 저장소에서 제거하고, 나머지 연결과 다음 이벤트 처리는 계속했다.

클라이언트가 `lastEventId` 쿼리 파라미터와 함께 다시 연결하면, 해당 시점 이후에 저장된 미읽음 Notification을 DB에서 조회해 다시 전송한다. App이 재시작되어 메모리의 연결 정보가 사라진 뒤에도 알림을 복원할 수 있다. 현재 복원에는 시간과 조회 건수 제한이 있다. Notification과 DM을 각각 조회해 전송하므로, 두 종류의 이벤트를 실제 발행 시각 순서대로 복원되지는 않는다. SSE 연결 직후 발생한 알림이 실시간 전송과 DB 복원에 모두 포함될 수 있으며. 이 구간의 중복을 별도로 처리하지는 않았다.

### 3.6 커스텀 메트릭 구현과 Grafana 대시보드 구성

로그를 하나씩 검색하지 않아도 문제가 발생한 단계를 찾을 수 있도록 실제 처리 코드에 메트릭 기록 로직을 추가했다.

- Batch
  - Job 성공·실패·중단
  - Step의 읽기·쓰기/삭제·필터·건너뛰기 건수
  - 마지막 성공 시간
- Notification/Kafka
  - Kafka 메시지 역직렬화 실패
  - 저장 시도·성공·실패
  - 실제 저장 건수
  - 중복 제외 건수
  - 실시간 전송 요청 결과
- Notification Redis Pub/Sub
  - 발행·수신·역직렬화·처리 결과와 처리 시간
- SSE
  - 현재 연결 객체(Emitter) 수
  - 연결 생성·종료·시간 초과·오류
  - Notification·DM 전송 성공·실패

사용자 ID나 이벤트 ID처럼 값의 종류가 계속 늘어나는 정보는 메트릭 태그에서 제외했다. `event`, `type`, `result`처럼 미리 정한 값만 사용해 Prometheus에 생성되는 시계열 수가 불필요하게 늘어나지 않도록 했다. 애플리케이션 시작 직후에도 Counter가 0부터 노출되도록 고정된 태그 조합을 미리 등록했다.

Prometheus는 `app`, `app-2` 두 App 인스턴스의 메트릭을 수집하도록 설정했다.

Grafana에는 데이터 소스와 대시보드가 자동 등록되도록 구성했다. 팀 전체의 Batch·실시간 연결·채팅·세션·Redis 동기화 흐름을 7개 영역·26개 패널에서 확인할 수 있다. 여러 인스턴스의 Counter는 인스턴스별 증가량을 더했다. 현재 연결 수처럼 각 인스턴스가 따로 보유한 값은 메트릭 의미에 따라 합계 또는 최댓값으로 조회했다.

!batch-row.png

!websocket-stomp-row.png

---

## 4. 문제점 및 해결 과정

### 4.1 Kafka를 처리한 App과 SSE 연결을 가진 App이 다른 문제

#### Situation

사용자의 SSE 연결은 `app-1` 메모리에 있지만, Kafka Consumer Group이 이벤트를 `app-2`에 배정할 수 있었다. `app-2`가 Notification을 저장한 뒤 자신의 메모리만 확인하면 `app-1`에 있는 사용자의 연결을 찾지 못해 실시간 알림이 누락될 수 있었다.

#### Task

Kafka 메시지는 한 App만 처리하면서, SSE는 실제 사용자 연결을 가진 App에서 전송되도록 해야 했다.

#### Action

Kafka Consumer에서 SSE 전송 책임을 분리하고, `NotificationRealtimePublisher` 인터페이스를 만들었다. 운영 환경에서 Redis Publisher가 전송 요청을 채널에 발행하고 모든 App의 Subscriber가 이를 수신한다. 각 Subscriber는 로컬 `SseEmitterRepository`를 확인해 사용자 연결이 있을 때만 전송한다. 단일 App 실행과 테스트에서는 같은 인터페이스를 구현한 로컬 전송 방식을 사용했다.

#### Result

Kafka는 알림 생성 작업을 배분하고, Redis는 모든 App에 전송 요청을 알리는 구조로 역할을 나눴다.

### 4.2 Kafka 재전달로 Notification과 SSE가 중복되는 문제

#### Situation

Kafka가 같은 이벤트를 다시 전달하면 이미 처리한 수신자에게 Notification이 또 저장되고, 같은 내용이 SSE로 다시 전송될 수 있었다.

#### Task

메시지가 여러 번 전달되더라도 같은 이벤트와 수신자에 대한 알림은 한 번만 저장하고 전송해야 했다.

#### Action

도메인 이벤트 ID를 `sourceEventId`로 저장하고 `sourceEventId + receiverId`를 중복 판단 기준으로 정했다. 같은 `sourceEventId`로 알림이 저장된 수신자 ID를 한 번에 조회해 저장 대상에서 제외하고, DB unique 제약으로 동시 요청의 중복 저장도 막았다. Consumer는 저장 요청 목록 전체가 아닌 실제로 새로 저장된 DTO만 실시간 전송 대상으로 사용했다.

#### Result

같은 Kafka 이벤트가 다시 들어와도 기존 수신자는 Notification 저장과 SSE 전송 대상에서 제외됐다.

### 4.3 삭제 중인 데이터에 offset 방식 조회를 사용한 문제

#### Situation

논리 삭제된 Playlist를 `JpaPagingItemReader`로 읽고 chunk마다 물리 삭제하면 앞 페이지의 row가 사라지면서 다음 페이지의 offset이 당겨진다. 이때 일부 삭제 대상이 다음 조회에서 빠질 수 있었다.

#### Task

삭제 대상 수와 chunk 크기에 상관없이 보관 기간이 지난 Playlist를 빠짐없이 물리 삭제해야 했다.

#### Action

처리 도중 조회 대상이 바뀌는 상황에는 offset 기반 페이지 조회가 적합하지 않다고 판단했다. Reader를 `JdbcCursorItemReader`로 바꿔 하나의 cursor로 결과를 순서대로 처리했다.

#### Result

현재 Playlist 물리 삭제 Job은 cursor 기반으로 동작하며, 여러 chunk로 나누어 삭제하는 H2 Batch 테스트도 통과했다.

### 4.4 App 재시작 후 Counter 증가량이 누락되는 문제

#### Situation

`notificationHardDeleteJob`을 실행하며 App을 재시작했을 때, Grafana의 Batch 처리 건수가 실제 작업 이력보다 작게 표시됐다. App 재시작으로 Micrometer Counter가 0으로 초기화됐지만, 당시에는 첫 작업이 발생한 뒤에야 Counter가 생성됐다. 이 때문에 Prometheus가 초기값 0을 수집하지 못했다.

예를 들어 재시작 전 마지막 값과 재시작 후 첫 수집값이 모두 5라면 Prometheus에는 `5 ➡️ 5`로 보이기 때문에 재시작 후 처리한 5건이 `increase()` 계산에서 누락될 수 있다.

#### Task

App 재시작 후 처음 처리한 작업도 누락되지 않도록 Prometheus가 Counter의 초기화 시점을 인식하게 해야 했다.

#### Action

`BatchMetricsInitializer`가 App 시작 시 모든 Batch Job·Step에서 사용하는 고정 태그 조합의 Counter를 0으로 미리 생성하도록 했다. Prometheus가 이 값을 수집한 뒤 작업이 실행되면 `이전 값 ➡️ 0 ➡️ 증가 값`의 변화를 확인해 재시작 이후의 증가량을 구분할 수 있다.

Notification·SSE·Redis Pub/Sub의 고정 태그 Counter와 Timer에도 같은 초기화 방식을 적용했다.

#### Result

App을 재시작한 직후 아직 작업을 실행하지 않은 인스턴스에서도 고정 태그 Counter가 0으로 노출되는 것을 확인했다. Prometheus가 재시작 시점의 0을 수집할 수 있어 재시작 후 첫 작업량도 `increase()` 계산에 반영할 수 있게 됐다.

---

## 5. 협업 및 피드백

### 5.1 담당 도메인의 경계를 팀 공통 구조에 맞춤

Playlist는 User·Content·Security 영역의 기능을 사용한다. 공통 기능이 준비되기 전에는 임시 사용자 ID Header와 Playlist 전용 사용자 요약 DTO로 개발했다. 이후 Spring Security에서 인증 사용자 정보를 제공하는 `MoplUserDetails`와 공통 사용자 요약 DTO가 준비되자 기존 임시 구조를 교체했다.

### 5.2 리뷰에서 발견된 조건을 이후 구현 기준으로 반영

개발 기록과 코드 변경에서 확인한 리뷰 사항을 아래와 같이 반영했다.

- 여러 SSE 연결 중 하나가 실패해도 나머지 연결 전송을 계속하도록 실패 범위를 분리
- 주기적인 연결 상태 확인 신호(heartbeat) 전송에 실패한 SSE 연결 제거
- 사용자별 여러 연결을 저장할 때 동시 요청 고려
- Kafka·SSE 부분 실패를 확인할 수 있도록 로그 추가
- 관계 데이터 중복을 서비스 검사와 DB unique 제약으로 두 단계에서 방어

### 5.3 팀원이 만든 메트릭을 하나의 대시보드로 통합

팀원이 구현한 WebSocket·Watching Session·DM/Content Chat·Domain Redis Sync 메트릭의 이름과 태그를 확인하고, 애플리케이션 시작 시 초기값이 등록되도록 보완했다. 담당 영역이 다른 메트릭을 한 화면에서 비교할 수 있도록 Grafana의 행과 패널 구조, 설명, 조회 구간도 통일했다.

### 5.4 대표 PR

| PR      | 주요 내용                                              |
| ------- | ------------------------------------------------------ |
| PR #292 | Playlist 논리 삭제와 Spring Batch 물리 삭제            |
| PR #298 | QueryDSL 기반 Playlist 목록 조회와 커서 페이지네이션   |
| PR #350 | Spring Event → Kafka → Notification → SSE 알림 흐름    |
| PR #405 | Redis Pub/Sub 기반 Notification 다중 App 전달          |
| PR #478 | Kafka 알림 중복 방지, DM 알림 연동, 실시간 통합 테스트 |
| PR #522 | 커스텀 메트릭, Prometheus 설정, Grafana 통합 대시보드  |

---

## 6. 코드 품질 및 최적화

### 6.1 데이터 정합성을 서비스와 DB에서 함께 보호

요청 DTO에서는 형식 오류를 먼저 확인하고, 서비스에서는 상황에 맞는 도메인 예외를 반환했다. 동시에 들어오는 요청의 최종 정합성은 DB unique 제약으로 보호했다. 검증 책임을 한 계층에 몰아두지 않고 각 계층에 맞게 나눴다.

### 6.2 목록 조회에서 안정적인 순서와 쿼리 수를 함께 고려

Playlist 목록은 정렬값이 같은 경우에도 순서가 흔들리지 않도록 ID를 보조 정렬이자 커서 조건으로 사용했다. 제목·소유자·수정 시간처럼 DB에 저장된 값을 사용하는 조건은 `WHERE`절에서 처리하고, 구독자 수처럼 조회 중 계산되는 집계값 조건은 `GROUP BY` 이후 `HAVING`절에서 처리했다. 현재 페이지의 구독 여부와 콘텐츠 요약은 Playlist마다 반복 조회하지 않고 ID 목록으로 묶어 조회했다.

### 6.3 사용자 요청과 실제 데이터 삭제 시점 분리

Playlist 삭제 API에서는 데이터를 바로 제거하지 않고 논리 삭제한다. 보관 기간이 지나면 Batch가 물리 삭제한다. Notification도 읽음 처리와 실제 삭제 시점을 나눠, 읽은 뒤 보관 기간이 지난 데이터만 Batch에서 삭제한다.

### 6.4 하나의 연결 실패가 전체 알림 전송을 막지 않도록 처리

SSE 전송 중 특정 연결에서 예외가 발생하면 해당 연결만 종료·제거하고 나머지 연결에는 계속 전송했다. 한 브라우저 탭이나 기기의 연결 실패가 다른 연결이나 이후 알림 전송까지 막지 않도록 처리했다.

### 6.5 처리 단계별 성공을 구분해 기록

Notification 저장, Redis 발행·수신·처리, 실제 `SseEmitter.send()` 결과를 서로 다른 지표로 기록했다. Redis 발행 성공을 사용자에게 SSE가 전달된 것으로 해석하지 않도록 메트릭의 의미와 기록 위치를 구분했다.

---

## 7. 향후 개선 사항 및 제안

### 7.1 Notification Kafka 발행 실패 복구

현재는 도메인 트랜잭션 커밋 이후 Kafka 발행이 실패하면 로그와 메트릭으로 확인할 수 있다. 그러나 실패 이벤트를 영구 저장해 자동으로 다시 처리하는 구조가 없다. 실제 실패 빈도와 운영 비용을 측정한 뒤 Transactional Outbox, producer 재시도 저장소, Notification DLT와 error handler를 비교해 도입할 필요가 있다.

### 7.2 SSE 재연결 시 전달 순서와 중복 문제 개선

현재는 사용자가 SSE에 재연결하면 놓친 DM과 Notification을 각각 조회해 다시 전송한다. 두 종류의 이벤트가 실제 발생 순서와 다르게 전달될 수 있고, 재연결 중 발생한 새로운 이벤트가 실시간 전송과 DB 복원에 모두 포함될 수 있다. 향후에는 모든 SSE 이벤트에 공통 순서를 부여하고, 사용자가 마지막으로 받은 순번 이후의 이벤트만 전송하도록 개선하고 싶다.

---

## 마무리

이번 프로젝트에서는 Playlist와 Notification의 API 구현부터 Kafka 메시지 처리, Redis Pub/Sub·SSE를 이용한 다중 App 실시간 알림, 삭제 Batch, Prometheus·Grafana까지 직접 다뤘다.

Kafka는 알림 이벤트를 비동기로 전달하고, Redis Pub/Sub은 실시간 전송 요청을 모든 App 인스턴스에 알린다. 각 App 인스턴스는 자신이 가진 SSE 연결로 실제 알림을 전송한다. 중복 메시지는 애플리케이션과 DB에서 같은 결과가 다시 생기지 않도록 막았고, 처리 단계별 메트릭으로 문제가 발생한 위치를 확인할 수 있게 했다.

---

# 팀 Notion 주소

[[SB10-4팀] Sprint Spring 백엔드 고급 팀 프로젝트](https://app.notion.com/p/Codeit-Sprint-10-4-daa65902e5ef834d9f3001309ddcf53d)

---

# GitHub Repository 주소

[https://github.com/Codeit-SB10-final-team04/sb10-mopl-team04](https://github.com/Codeit-SB10-final-team04/sb10-mopl-team04)
