---
layout: single-editorial
title: '[Sprint 백엔드 중급 프로젝트 3일차] Merge 기준을 정하고, 구현으로'
excerpt: ''

categories:
  - Sprint 백엔드 중급 프로젝트
tags:
  - [Codeit Sprint, Codeit Sprint 백엔드 중급 프로젝트]

permalink: /categories/codeit-sprint/sprint-intermediate-project/sprint-intermediate-project003

toc: true
toc_sticky: true

date: 2026-04-16
last_modified_at: 2026-04-16
---

# Merge 기준을 정하고, 구현으로

오늘은 프로젝트 초반에 정리해둔 규칙과 구조를 바탕으로 실제 기능 구현을 이어갔다.

오전 회의에서는 어제 작업 내용과 오늘 할 일을 공유했고, PR 머지 방식과 에러 코드 클래스 작성 방식도 함께 정리했다.

<br>

## 오늘 회의에서 정한 것

먼저 PR 병합 방식은 Merge를 사용하기로 했다. Squash and Merge 대신 Merge를 선택한 이유는, 지금 단계에서는 개별 커밋과 병합 기록을 그대로 남기는 편이 흐름을 추적하기에 더 낫다고 봤기 때문이다.

에러 코드 클래스 작성 방식도 이야기했다. 현재는 `ErrorCode`가 상태 코드까지 가지지 않고, 메시지만 갖도록 두고 있다. 대신 상태 코드는 `GlobalExceptionHandler`에서 처리하는 방식으로 가기로 했다. 다만 이 방식은 예외가 많아질수록 핸들러의 `switch-case`가 길어질 수 있어서, 이후 필요하면 리팩토링하기로 정리했다.

<br>

## 오늘 완료한 작업

뉴스 기사 단건 조회를 마무리했다. 오후 5시 14분 기준으로 완료했고, `Mapper`, `Service`, `Repository`, 응답 `DTO` 구현까지 끝냈다. 출처 목록 조회는 이어서 진행 중이다.

단건 조회는 요청자가 실제로 존재하는 사용자여야 하고, 조회 대상 기사도 논리 삭제되지 않은 데이터여야 한다.

서비스 로직에서는 먼저 사용자를 검증하고, 그 다음 같은 방식으로 기사를 조회한다. 둘 중 하나라도 없으면 각각 커스텀 예외인 `UserNotFoundException`, `ArticleNotFoundException`을 던지도록 구현했다.

다음으로 기사 본문 데이터만 그대로 반환하지 않고, 댓글 수, 조회 수, 요청자가 이미 조회한 기사인지 여부까지 함께 계산해서 DTO로 넘기도록 구성했다. 댓글 수는 댓글 저장소에서 계산하고, 조회 수와 조회 여부도 조회 이력 저장소에서 가져온 뒤, 마지막에 `Mapper`를 통해 응답 DTO로 변환했다.

<br>

## 진행 중인 작업

단건 조회를 마친 뒤에는 뉴스 기사 출처 목록 조회를 진행하고 있다. 현재는 `Controller` 로직을 구현한 상태이다.

---

# 팀 Notion 주소

[[SB10-5팀] Sprint Spring 백엔드 중급 팀 프로젝트](https://www.notion.so/jungh20000/SB10-Monew-Team05-342f59816c0280948b6ac9c8f80492eb?source=copy_link)

---

# GitHub Repository 주소

[https://github.com/SB10-Part03-Team05/sb10-monew-team05](https://github.com/SB10-Part03-Team05/sb10-monew-team05)
