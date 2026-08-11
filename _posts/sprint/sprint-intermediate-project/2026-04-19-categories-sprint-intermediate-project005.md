---
layout: single-editorial
title: '[Sprint 백엔드 중급 프로젝트 5일차] 뉴스 기사 목록 조회 Controller와 Service 구현'
excerpt: ''

categories:
  - Sprint 백엔드 중급 프로젝트
tags:
  - [Codeit Sprint, Codeit Sprint 백엔드 중급 프로젝트]

permalink: /categories/codeit-sprint/sprint-intermediate-project/sprint-intermediate-project005

toc: true
toc_sticky: true

date: 2026-04-19
last_modified_at: 2026-04-19
---

# 뉴스 기사 목록 조회 Controller와 Service 구현

오늘은 뉴스 기사 목록 조회 Controller와 Service 로직을 구현했다.

처음에는 조회 조건을 받아서 Service와 Repository로 그대로 넘기면 된다고 생각했는데, 실제로 구현을 시작하니까 목록 조회는 단건 조회보다 고려할 부분들이 많았다. 검색어, 관심사, 출처, 날짜 범위, 정렬 기준, 정렬 방향, 커서, 보조 커서, limit, 요청자 헤더까지 한 번에 읽으니 입력과 각 계층별 책임을 어떻게 나눌 것인지 정리해야 했다.

<br>

## 목록 조회에 단건 조회 로직 재활용??

이전에 구현했던 뉴스 기사 단건 조회는 기사 한 건을 기준으로 댓글 수, 조회 수, 요청자 조회 여부를 각각 계산해서 응답 DTO로 만드는 방식이었다. 이 방식은 기사 한 건만 조회할 때는 아무런 문제가 되지 않는다. 몇 번 쿼리가 나가더라도 병목으로 이어질 가능성이 적기 때문이다.

그런데 목록 조회로 한 번에 많은 양을 조회할 때 각 기사마다 댓글 수, 조회 수, 요청자 조회 여부를 따로 계산한다면 기사 목록을 가져오는 쿼리 외에도 댓글 수, 조회 수, 요청자 조회 여부 각각 조회 양만큼 쿼리가 계속 늘어날 것이다. 이렇게 되면 데이터 양이 많아질 수록 응답이 느려지고, 데이터베이스가 반복 조회를 하게 될 것이다.

<br>

## 조회 조건을 하나씩 넘기는 대신 요청 객체로 묶기

처음에는 Controller에서 받은 쿼리 파라미터들을 Service 메서드에 하나씩 전달하고, Service에서도 다시 Repository로 쿼리 파라미터들을 하나씩 전달하는 방식을 작성했다. 그런데 목록 조회에서 필요한 조건이 많다보니 메서드 시그니처가 너무 길어지게 되었다.

그래서 `ArticleSearchRequest`로 조회 조건을 묶어 하나의 요청 객체로 정리하고, Controller에서 이 객체를 받아 Service로 전달하는 방식으로 변경했다.

<br>

## `@ModelAttribute`를 사용해 쿼리 파라미터 입력 정리

Controller에서는 기사 목록 조회 요청을 `@ModelAttribute`와 `@ParameterObject`로 받아오게 구현했다. `@RequestParam`을 하나씩 나열하는 방식도 동작은 하지만, 이번처럼 조건이 많아질수록 메서드 시그니처가 엄청 길어진다. 반면, 요청 객체로 묶으면 Controller는 요청을 받고, 필요한 검증을 수행한 뒤 Service에 넘기는 역할에 좀 더 집중할 수 있다.

<br>

## Service에서 검증과 위임

Service에서는 뉴스 기사 목록 조회 로직을 모두 처리하여 Repository로 전달하기 보다는 요청자 존재를 검증하고, 관심사 ID가 존재할 경우 관심사 존재까지 검증한 다음, 뉴스 기사 목록 조회는 Repository에서 구현하도록 위임했다.

이렇게 하면 Service는 누가 요청했고 요청 조건이 유효한지 검증하는 로직을 담당하고, Repository가 쿼리 구성과 커서 페이지네이션을 맡는 형태로 구현된다. 만약 Service에서 쿼리 구성까지 담당하면 역할이 너무 커질 것이기 때문에 이렇게 나누는 것이 좋다고 판단했다.

<br>

## 커서 페이지네이션 응답 형태 정리

이번 뉴스 기사 목록 조회는 `content`, `nextCursor`, `nextAfter`, `size`, `totalElements`, `hasNext`를 `CursorPageResponseArticleDto` 커서 페이지네이션 형태로 구현했다.

<br>

## 정렬 기준에 따라 쿼리 구조 나누기

뉴스 기사 목록 조회를 구현하면서 오래 고민한 부분 중 하나가 정렬 기준이다. 뉴스 기사 목록은 `publishDate`, `viewCount`, `commentCount`로 정렬할 수 있는데, 데이터 출처가 모두 다르다. `publishDate`는 뉴스 기사 table의 column을 그대로 사용하면 되지만 `viewCount`는 조회 이력 table(`article_view_histories`)의 집계가, `commentCount`는 댓글 table(`comment`)의 집계가 필요하다.

그래서 Repository에서는 자료형 기준으로 나누기보다는 정렬 기준마다 쿼리 구조가 다르다는 것을 기준으로 나누는 것이 더 자연스럽다고 판단했다.

<br>

## QueryDSL을 사용하기 위한 설정 추가

뉴스 기사 목록 조회는 정렬 기준에 따라 쿼리 구조가 달라지므로 QueryDSL 기반 커스텀 Repository를 사용하는 방법으로 정했다. 이를 위해 `JPAQueryFactory`를 Spring Bean으로 등록하는 설정도 함께 구현했다. `JPAQueryFactory`는 직접 Bean으로 등록해주지 않으면 커스텀 구현체에서 주입 받을 수 없기 때문이다.

---

# 팀 Notion 주소

[[SB10-5팀] Sprint Spring 백엔드 중급 팀 프로젝트](https://www.notion.so/jungh20000/SB10-Monew-Team05-342f59816c0280948b6ac9c8f80492eb?source=copy_link)

---

# GitHub Repository 주소

[https://github.com/SB10-Part03-Team05/sb10-monew-team05](https://github.com/SB10-Part03-Team05/sb10-monew-team05)
