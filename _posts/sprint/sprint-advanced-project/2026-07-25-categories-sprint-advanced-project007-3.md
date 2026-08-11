---
layout: single-editorial
title: '[Sprint 백엔드 고급 프로젝트 5주차] 모두의 플리 5주차 회고(3) - Grafana 대시보드'
excerpt: ''

categories:
  - Sprint 백엔드 고급 프로젝트
tags:
  - [Codeit Sprint, Codeit Sprint 백엔드 고급 프로젝트]

permalink: /categories/codeit-sprint/sprint-advanced-project/sprint-advanced-project07-3

toc: true
toc_sticky: true

date: 2026-07-25
last_modified_at: 2026-07-25
---

# 모두의 플리 5주차 회고(3) - Grafana 대시보드

커스텀 메트릭을 Prometheus에서 확인한 뒤 Grafana 대시보드를 만들었다. 처음 사용해보는 도구라서 AI의 도움을 받아 구성했다.

데이터 소스 연결을 마친 뒤 Batch, Notification/SSE, Redis Pub/Sub 순서로 범위를 넓혔다. 이후 팀원이 구현한 WebSocket/STOMP, Watching Session, DM/Content Chat, Domain Redis Sync 메트릭도 계측 코드를 살펴본 후 대시보드에 추가했다.

최종적으로 아래의 9개 관측 영역을 7개 Row와 26개 Panel로 정리했다.

```text
Batch · Notification/SSE · Redis Pub/Sub ·
WebSocket/STOMP · Watching Session ·
DM/Content Chat · Domain Redis Sync
```

패널 형식은 데이터의 성격에 맞게 선택했다. 현재 연결 수처럼 지금 상태가 중요한 Gauge는 stat과 Sparkline으로 표시했다. 성공·실패나 작업별 건수는 가로 Bar Gauge를 사용해 비교하기 쉽게 만들었다. 처리 시간은 순산값보다 변화 추세를 보는 편이 적합하기에 Time Series로 구성했다.

색상에도 일정 규칙을 적용했다. 성공은 초록색, 실패와 인증 거부는 빨간색, 재시도는 노란색, DLQ 발행은 주황색으로 표현했다. 정상적인 WebSocket 연결 해제는 장애와 구분하기 위해 회색으로 사용했다.

구현할 때 다중 서버 메트릭의 집계 방식에 고민이 있었다. SSE와 WebSocket 연결 수는 각 App 인스턴스가 자신의 연결만 알고 있기 때문에 `sum()`으로 합산했다. Watching Session Gauge는 상황이 달랐다. 모든 App이 Redis에 저장된 같은 전역 값을 읽기 때문에 `sum()`을 사용하면 서버 수만큼 중복된다. 그래서 이 값에 `max()`를 적용했다.

Redis Pub/Sub에서는 메시지 하나 발행하는데 `app`과 `app-2`의 수신 값이 모두 증가했다. 처음에는 중복 처리라고 생각했지만 Pub/Sub은 구독 중인 모든 인스턴스에 메시지를 전달하므로 정상적인 브로드캐스트였다. 수신 패널에서는 전체 값을 합산하지 않고 `instance`를 유지해 서버별 전달 상태를 비교했다.

STOMP 구독 횟수가 한 번에 2씩 증가한 현상도 코드를 보고 이해할 수 있었다. 콘텐츠 상세 화면에 들어가면 Watching과 Content Chat Destination을 각각 구독한다. 사용자 동작은 한 번이지만 실제 구독은 두 번 발생하고 있었다.

Timer 평균은 인스턴스별 평균을 다시 평균 내지 않았다. 서버마다 처리량이 다른데 같은 비중으로 계산하면 결과가 왜곡되기 때문이다. 전체 처리 시간의 합을 전체 처리 건수로 나누는 쿼리를 사용했다.

```text
sum(rate(metric_seconds_sum[$__rate_interval]))
/
sum(rate(metric_seconds_count[$__rate_interval]))
```

마지막으로 Grafana UI에서 만든 대시보드를 JSON으로 Export하고 Provisioning에 연결했다. 컨테이너를 다시 실행해도 같은 대시보드가 자동으로 로딩되도록 구성했다. Prometheus에는 Volume을 연결해 수집 데이터가 유지되게 했다. 구축을 마친 뒤에 메트릭 정의와 대시보드 해석 방법을 문서화했고, Counter 누락 문제를 발표용 트러블슈팅 자료로 정리했다.

---

# 팀 Notion 주소

[[SB10-4팀] Sprint Spring 백엔드 고급 팀 프로젝트](https://app.notion.com/p/Codeit-Sprint-10-4-daa65902e5ef834d9f3001309ddcf53d)

---

# GitHub Repository 주소

[https://github.com/Codeit-SB10-final-team04/sb10-mopl-team04](https://github.com/Codeit-SB10-final-team04/sb10-mopl-team04)
