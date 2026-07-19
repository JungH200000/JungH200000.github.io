---
title: '[Sprint 백엔드 고급 프로젝트 4주차] 모두의 플리 4주차 회고'
excerpt: ''

categories:
  - Sprint 백엔드 고급 프로젝트
tags:
  - [Codeit Sprint, Codeit Sprint 백엔드 고급 프로젝트]

permalink: /categories/codeit-sprint/sprint-advanced-project/sprint-advanced-project06

toc: true
toc_sticky: true

date: 2026-07-19
last_modified_at: 2026-07-19
---

# 모두의 플리 4주차 회고

## 같은 이벤트가 여러 번 전달될 때

기존의 알림은 도메인 이멘트를 Kafka로 전달하고, Consumer가 이벤트를 처리해 알림을 저장한 뒤 SSE로 실시간 전송하는 구조였다.

기능은 정상적으로 동작했지만, Kafka 메시지가 다시 전달되는 상황을 생각해봤을 때 문제가 있다. 동일한 이벤트가 재처리될 경우 같은 알림이 DB에 여러 번 저장되고, 사용자 화면에도 동일한 SSE 알림이 반복해서 나타날 수 있다.

Kafka에서는 메시지가 반드시 한 번만 전달된다고 가정할 수 없다. 일시적인 장애나 Consumer 처리 실패로 같은 메시지가 다시 전달될 수 있기 때문이다. 그래서 메시지 중복 자체를 막기 보다 같은 메시지를 여러 번 받아도 최종 결과가 한 번만 만들어지도록 설계해야 한다.

아래처럼 멱등성 기준을 정의했다.

```text
sourceEventId + receiverId
```

하나의 이벤트가 여러 사용자에게 알림을 만들 수 있기 때문에 `eventId` 하나만으로 중복을 판단할 수 없다. 같은 이벤트라도 수신자가 다르면 각각 알림을 받아야 하고, 같은 이벤트와 같은 수신자 조합만 한 번 처리되어야 한다.

## 애플리케이션과 DB가 함께 중복을 막도록

먼저 `Notification`에 Kafka 이벤트 ID를 저장하는 `sourceEventId`를 추가했다. 데이터베이스에서는 `source_event_id`와 `receiver_id` 조합에 복합 unique 제약 조건을 적용했다.

애플리케이션에서는 알림을 저장하기 전에 이미 해당 이벤트를 처리한 수신자를 조회했고, 아직 처리하지 않은 사용자만 저장 대상으로 만들었다. 모든 수신자가 이미 처리된 상태라면 빈 목록을 반환하도록 했다.

Kafka Consumer는 Service가 반환한 새 알림만 SSE로 전송한다. 즉, 중복 이벤트가 들어왔을 때 알림 저장과 실시간 재전송은 생략된다.

```text
Kafka 이벤트 수신
➡️ 이미 처리한 수신자 조회
➡️ 새로운 수신자의 알림만 저장
➡️ 새로 저장된 알림만 SSE 전송
```

하지만 애플리케이션 사전 조회로 동시성 문제를 해결할 수 없다. 두 Consumer가 거의 동시에 같은 이벤트를 처리하면 둘 다 기존 알림이 없다고 판단할 수 있다.

이때 DB의 복합 unique 제약 조건을 사용한다.

## 예외를 잡지 않는 이유

처음에 중복 저장으로 발생하는 `DataIntegrityViolationException`을 Service에서 잡고 무시하는 방법도 생각했다.

하지만 이 예외는 unique 제약 조건 위반에만 발생하지 않는다. `Not Null`, 외래 키, 데이터 길이, 타입 문제 같은 데이터 오류에서도 발생할 수 있다.

그래서 모든 `DataIntegrityViolationException`를 중복 이벤트로 간주하게 되면 실제 장애까지 정상 처리된 것처럼 숨길 위험이 있다. 현재 Kafka Consumer에는 실패 이벤트를 재시도하기 때문에 Service에서 예외를 무조건 삼키지 않도록 했다.

---

# 팀 Notion 주소

[[SB10-4팀] Sprint Spring 백엔드 고급 팀 프로젝트](https://app.notion.com/p/Codeit-Sprint-10-4-daa65902e5ef834d9f3001309ddcf53d)

---

# GitHub Repository 주소

[https://github.com/Codeit-SB10-final-team04/sb10-mopl-team04](https://github.com/Codeit-SB10-final-team04/sb10-mopl-team04)
