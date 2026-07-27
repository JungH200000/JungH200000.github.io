---
title: '[Sprint 백엔드 고급 프로젝트 5주차] 모두의 플리 5주차 회고(2) - Troubleshooting'
excerpt: ''

categories:
  - Sprint 백엔드 고급 프로젝트
tags:
  - [Codeit Sprint, Codeit Sprint 백엔드 고급 프로젝트]

permalink: /categories/codeit-sprint/sprint-advanced-project/sprint-advanced-project07-2

toc: true
toc_sticky: true

date: 2026-07-25
last_modified_at: 2026-07-25
---

# 모두의 플리 5주차 회고(2) - Troubleshooting

## App 재시작 시 처리 건수 사라지는 문제

Batch 커스텀 메트릭을 구현한 뒤 Grafana에서 알림 물리 삭제 건수를 확인하다가 이상한 현상을 발견했다. App을 재시작하기 전과 후에 각각 5건씩 삭제했으니 누적 증가량은 10이어야 했다. 그런데 Grafana에는 5나 8처럼 더 작은 값이 표시됐다.

처음에는 Grafana 쿼리나 다중 서버 합산 방식을 의심했다. Prometheus 원본 데이터와 `resets()` 결과를 보니 원인은 메트릭이 생성되는 시점에 있었다.

Micrometer Counter는 DB에 저장되지 않고 애플리케이션 메모리에 존재한다. App을 재시작하면 값도 0으로 초기화된다.  
Prometheus의 `increase()`는 값이 감소한 시점을 Counter 초기화로 판단하고, 재시작 전후의 증가량을 이어서 계산한다.

당시에 Counter는 애플리케이션이 시작될 때 만들어지는 것이 아니라 실제 작업이 발생했을 때 처음 생성되고 있었다.

```text
실제 변화: 수집 5건 ➡️ 재시작 ➡️ 0 ➡️ 수집 5건
```

재시작 후 첫 Batch가 5건을 처리한 다음에야 Counter가 생성되면 Prometheus는 중간의 0을 보지 못한다. 기존 값과 새 값이 모두 5이므로 재시작도 감지할 수 없다. 이 때문에 재시작 후 처음 처리한 5건이 증가량 계산에서 빠졌다.

해결을 위해 애플리케이션이 시작될 때 사용할 메트릭과 고정 태그 조합을 미리 등록했다. `BatchMetricsInitializer`에서 모든 Batch Job과 Step 조합을 0으로 생성했고, Notification, SSE, Redis Pub/Sub 메트릭에도 같은 방식을 적용했다. Timer의 `_count`도 처리 횟수를 누적하므로 함께 초기화했다.

수정 후 Prometheus 데이터를 지우지 않고 앱만 재시작했다. 수집 주기가 5초였기 때문에 5~10초 기다려 0이 수집된 것을 확인한 후 Batch를 실행했다. 이번에는 `5 ➡️ 0 ➡️ 5`가 모두 기록됐고, 재시작 전후의 처리량도 올바르게 계산됐다.

---

# 팀 Notion 주소

[[SB10-4팀] Sprint Spring 백엔드 고급 팀 프로젝트](https://app.notion.com/p/Codeit-Sprint-10-4-daa65902e5ef834d9f3001309ddcf53d)

---

# GitHub Repository 주소

[https://github.com/Codeit-SB10-final-team04/sb10-mopl-team04](https://github.com/Codeit-SB10-final-team04/sb10-mopl-team04)
