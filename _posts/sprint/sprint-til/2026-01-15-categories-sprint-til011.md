---
title: '[TIL 11일차] Sprint Mission2.1 - 디스코드: 도메인 모델링 및 서비스 설계'
excerpt: ''

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til011/

toc: true
toc_sticky: true

date: 2026-01-15
last_modified_at: 2026-01-15
---

# 오늘의 성취

## 1. 개발 진행 현황

- 피드백 받은 부분 수정 진행 : [Sprint2-1 Feedback](https://www.notion.so/jungh20000/Sprint2-1-Feedback-2e9f59816c02804295a9f76a9f0d3c62)
- 전반적으로 메소드의 파라미터에 객체가 아닌 id를 가지도록 리팩토링
- 전반적으로 메소드명 의미가 명확하게 수정
- `UserService`와 ChannelService`, `MessagaeService` 의존 관계 재설정
- `JCFUserService`
  - email, password, userName, nickName, birthday 수정 메소드를 `updateUserInfo()` 메소드로 통합
  - email과 password로 해당 유저를 찾는 로그인 기능은 CRUD에 필요하지 않음. 추후 db 추가 시 다른 클래스에서 이뤄질 예정
- `JCFChannelService`
  - 의존 관계 `UserService` 추가
  - user ID 검증 메소드 `validateAndGetUserByUserId` 추가

<br>

## 2. 고민

### `Map<K, V>`의 `remove(K)` 메소드

- K에 해당하는 V를 삭제하는 메소드로, K에 해당하는 V가 존재하면 V를 삭제하고 삭제된 V를 반환값으로 가지고, K가 존재하지 않는다면 null을 반환한다.

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint2](https://github.com/JungH200000/10-sprint-mission/tree/sprint2)
