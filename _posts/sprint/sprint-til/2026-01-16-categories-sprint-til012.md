---
layout: single-editorial
title: '[TIL 12일차] Sprint Mission2.1 - 디스코드: 도메인 모델링 및 서비스 설계'
excerpt: ''

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til012/

toc: true
toc_sticky: true

date: 2026-01-16
last_modified_at: 2026-01-16
---

# 오늘의 성취

## 1. 개발 진행 현황

- 피드백 받은 부분 수정 진행 : [Sprint2-1 Feedback](https://www.notion.so/jungh20000/Sprint2-1-Feedback-2e9f59816c02804295a9f76a9f0d3c62)
- 전반적으로 메서드의 파라미터에 객체가 아닌 id를 가지도록 리팩토링
- 전반적으로 메서드명 의미가 명확하게 수정
- `UserService`와 ChannelService`, `MessageService` 의존 관계 재설정
- `JCFMessageService`
  - 의존 관계 `UserService`, `ChannelService` 추가
- entity 내부 필드를 UUID에서 객체 자체를 저장하게 수정

<br>

## 2. 고민

### 식별자(id)가 아닌 객체를 저장

- 우리가 사용하는 프로그래밍 언어가 자바이기에, 객체로 모든걸(상태와 행위) 바라봐야 한다.
- 만약 TV의 리모콘을 우리가 하나의 클래스로 만들어보면

  ```java
  class Remote {
      UUID tvId;
  }
  ```

- 실제로 이렇게 만들면 리모콘은 "어떤 TV인지만" 알게 됨
- 사용하려면 저 리모콘을 통해 TV를 선별하고 결국 TV에 가서 뭔갈 직접 해야해요

  ```java
  TV tv = tvService.find(remote.tvId);
  tv.increaseVolume();
  ```

- 즉, id만 사용하면 매번 조회 코드를 추가로 거쳐야 하는데, 객체를 사용하면 바로바로 접근이 가능하다.

### `removeIf`

- 람다식이나 Predicate로 조건을 정해 모든 일치 요소를 안전하게 제거

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint2](https://github.com/JungH200000/10-sprint-mission/tree/sprint2)
