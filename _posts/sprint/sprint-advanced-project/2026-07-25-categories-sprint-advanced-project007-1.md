---
layout: single-editorial
title: '[Sprint 백엔드 고급 프로젝트 5주차] 모두의 플리 5주차 회고(1) - 커스텀 메트릭'
excerpt: ''

categories:
  - Sprint 백엔드 고급 프로젝트
tags:
  - [Codeit Sprint, Codeit Sprint 백엔드 고급 프로젝트]

permalink: /categories/codeit-sprint/sprint-advanced-project/sprint-advanced-project07-1

toc: true
toc_sticky: true

date: 2026-07-25
last_modified_at: 2026-07-25
---

# 모두의 플리 5주차 회고(1) - 커스텀 메트릭

프로젝트 5주차는 주요 기능 개발을 마무리하고 서비스의 상태를 관찰할 커스텀 메트릭과 대시보드 시각화를 진행했다. 나는 이때까지 구현하거나 살펴본 Batch, Notification, SSE, Redis Pub/Sub 영역의 커스텀 메트릭을 맡았다.

처음에는 성공과 실패 횟수를 Counter로 기록하면 충분할 거라고 생각했다. 막상 시작해보니 코드를 작성하기 전에 정할 것들이 꽤 많았다. 무엇을 한 건으로 셀 것인지, Counter와 Timer 중 무엇이 더 맞는지, 어떤 값을 태그로 구분할지부터 정해야 했다.  
예를 들어 아래의 두 시계열은 같은 메트릭에 속하지만 서로 다른 Batch와 실행 결과를 나타낸다.

```text
mopl_batch_run_total{batch_job="tmdbDailyCollectJob", result="success"}
mopl_batch_run_total{batch_job="sportsDataCollectJob", result="failure"}
```

Batch 이름에는 `job` 대신 `batch_job`이라는 태그를 사용했다. Prometheus가 수집 대상을 구분할 때 이미 `job` 라벨을 사용하기 때문에 Batch 이름에도 같은 표현을 사용한다면 의미가 섞일 수 있었다. 사용자 ID, 이벤트 ID, 실행 날짜처럼 값이 계속 늘어나는 정보도 태그에서 제외했다. 정보를 자세히 남기려다가 시계열이 지나치게 많아지는 높은 카디널리티 문제가 생길 수 있기 때문이다.

Batch에는 공통 Job·Step Listener를 연결했다. Job 종료 시 `success`, `failure`, `stopped`를 기록하고, Step 종료 시에는 `read`, `write`, `delete`, `fillter`, `skip` 건수를 남겼다. 마지막 성공 시간은 TimeGauge로 관리했다. Spring Batch가 이미 제공하는 실행 시간은 따로 만들지 않았다.

Notification에서는 Kafka 역직렬화 실패, 실제 알림 저장 수, 중복으로 제외된 수신자 수, 저장 실패, 실시간 발행 결과를 나눠 기록했다. 이때 "중복 제외 1건"을 이벤트 수로 볼지, 저장에서 제외된 수신자 수로 볼지도 정해야 했다. 최종적으로는 중복으로 제외된 수신자 수를 기록하기로 했다.

SSE에서는 현재 연결 수를 Gauge로 표현했다. 연결, 완료, 타임아웃, 오류는 생명주기 Counter로 나누고 실제 이벤트 전송 결과는 별도의 Counter에 기록했다. Notificaton 저장이 성공하더라도 SSE 전송은 실패할 수 있어서 두 단계를 함께 집계하면 장애가 발생한 위치를 찾기 어려웠다.

---

# 팀 Notion 주소

[[SB10-4팀] Sprint Spring 백엔드 고급 팀 프로젝트](https://app.notion.com/p/Codeit-Sprint-10-4-daa65902e5ef834d9f3001309ddcf53d)

---

# GitHub Repository 주소

[https://github.com/Codeit-SB10-final-team04/sb10-mopl-team04](https://github.com/Codeit-SB10-final-team04/sb10-mopl-team04)
