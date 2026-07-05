---
title: '[Sprint 백엔드 고급 프로젝트 1주차] 모두의 플리 1주차 회고'
excerpt: ''

categories:
  - Sprint 백엔드 고급 프로젝트
tags:
  - [Codeit Sprint, Codeit Sprint 백엔드 고급 프로젝트]

permalink: /categories/codeit-sprint/sprint-advanced-project/sprint-advanced-project03

toc: true
toc_sticky: true

date: 2026-06-28
last_modified_at: 2026-06-28
---

# 모두의 플리 1주차 회고

2026년 6월 23일부터 6월 28일까지, 고급 프로젝트 **모두의 플리**의 첫 주 개발을 진행했다.  
모두의 플리는 영화, 드라마, 스포츠 콘텐츠를 큐레이션하고 공유하는 플랫폼이다. 사용자는 자신만의 플레이리스트를 만들고, 다른 사용자의 플레이리스트를 구독하며, 콘텐츠 경험을 소셜 기능과 함께 확장할 수 있다.

내가 맡은 영역은 **플레이리스트와 알림 도메인**이었다.  
1주차에는 주로 플레이리스트의 생성, 단건 조회, 수정, 삭제, 목록 조회 기능을 구현했다.

## 플레이리스트 생성

가장 먼저 구현한 기능은 플레이리스트 생성이었다. API 응답에는 제목과 설명, `owner`, `subscriberCount`, `subscribedByMe`, `contents`까지 포함되어야 했다.

생성 직후라면 구독자 수는 0, 구독 여부는 false, 콘텐츠 목록은 빈 배열로 내려줄 수 있다. 하지만 단건 조회나 목록 조회까지 생각하면 단순히 하드코딩할 수 있는 값이 아니었다. 특히 여러 플레이리스트의 구독자 수, 현재 사용자의 구독 여부, 콘텐츠 요약, 태그 정보를 한 번에 조립해야 하는 목록 조회에서는 N+1 문제까지 고려해야 했다.

또 인증 기능이 아직 완전히 붙기 전이라 임시로 `X-MOPL-USER-ID` 헤더를 사용했다. 다만 이 방식은 어디까지나 임시 수단이고, 최종적으로는 Spring Security의 인증 객체에서 사용자 식별자를 꺼내야 한다는 점을 `// TODO`로 정리했다.

## 단건 조회와 수정

단건 조회를 구현할 때 가장 헷갈렸던 부분은 `owner`와 `currentUser`의 구분이었다.  
`owner`는 플레이리스트를 만든 사용자이고, `subscribedByMe`는 현재 요청한 사용자가 해당 플레이리스트를 구독했는지를 의미한다. 둘 다 사용자와 관련된 값이지만, 응답 필드의 주체가 다르다.

수정 기능에서는 검증의 위치를 많이 고민했다. 생성 요청에서는 제목과 설명이 필수라 `@NotBlank`가 자연스럽지만, 수정 요청은 PATCH에 가까워 제목만 바꾸거나 설명만 바꿀 수 있어야 했다. 그래서 DTO에서는 길이 같은 단순 형식 검증을 맡기고, "값이 들어왔는데 공백인 경우", "기존 값과 동일해서 변경사항이 없는 경우" 같은 검증은 서비스에서 처리하는 방식으로 정리했다.

## 삭제 기능과 Spring Batch 문제

API 관점에서는 `DELETE /api/playlists/{playlistId}`였지만, 실제 구현은 바로 데이터를 지우는 방식이 아니라 `deletedAt`을 기록하는 논리 삭제로 정리했다. 이후 일정 기간이 지난 데이터는 Spring Batch로 물리 삭제하는 구조를 만들었다.

처음에는 `JpaPagingItemReader`로 삭제 대상 `Playlist` `id`를 읽었다. 그런데 테스트 중 삭제 대상이 여러 개일 때 일부 데이터가 남는 문제가 발생했다.

원인은 offset 기반 paging이었다. Reader가 page 단위로 데이터를 읽고 Writer가 앞선 데이터를 삭제하면, 남은 row의 위치가 앞으로 당겨진다. 그 상태에서 다음 page를 조회하면 일부 row를 건너뛰게 된다.

결국 offset 기반 Reader 대신 `JdbcCursorItemReader`로 바꿨다. cursor 방식은 결과를 순차적으로 읽기 때문에 삭제 도중 row 위치가 바뀌어도 대상이 누락되지 않았다.

Batch 테스트에서는 H2와 PostgreSQL의 차이도 만났다. 운영 DB에서는 PostgreSQL enum 타입을 사용하지만, 테스트 DB인 H2는 Hibernate의 `NAMED_ENUM` 매핑을 그대로 처리하지 못했다. 이 테스트의 목적은 User enum 매핑 검증이 아니라 playlist 물리 삭제 검증이었기 때문에, 테스트 전용 H2 schema와 `JdbcTemplate` 직접 insert 방식으로 관심사를 분리했다.

## 목록 조회

1주차 후반에는 `GET /api/playlists` 목록 조회를 구현했다. 요구사항은 키워드, 소유자, 구독자 조건으로 필터링하고, `updatedAt` 또는 `subscribeCount` 기준으로 정렬하며, `cursor`와 `idAfter`를 이용해 커서 페이지네이션을 지원하는 것이었다.

가장 많이 고민한 부분은 구독자 수 집계였다. 특정 사용자가 구독한 플레이리스트만 조회하는 조건과 전체 구독자 수 계산을 같은 join으로 처리하면 집계 결과가 왜곡될 수 있었다. 그래서 구독자 수 계산용 join과 `subscriberIdEqual` 필터용 `exists` 조건을 분리했다.

```java
NumberExpression<Long> subscriberCount = playlistSubscription.id.count();

...
.leftJoin(playlistSubscription).on(
    playlistSubscription.playlist.id.eq(playlist.id)
)
...
.groupBy(...)
```

```java
private BooleanExpression subscriberIdEq(UUID subscriberId) {
    if (subscriberId == null) {
        return null;
    }

    QPlaylistSubscription ps = new QPlaylistSubscription("subscriberFilter");

    return JPAExpressions
        .selectOne()
        .from(ps)
        .where(
            ps.playlist.id.eq(playlist.id),
            ps.subscriber.id.eq(subscriberId)
        )
        .exists();
}
```

커서 조건도 정렬 기준에 따라 달랐다. `updatedAt`은 일반 컬럼이라 `where`에서 비교할 수 있지만, `subscribeCount`는 `count()`로 계산되는 집계값이라 `having`에서 처리해야 했다.

---

# 팀 Notion 주소

[[SB10-4팀] Sprint Spring 백엔드 고급 팀 프로젝트](https://app.notion.com/p/Codeit-Sprint-10-4-daa65902e5ef834d9f3001309ddcf53d)

---

# GitHub Repository 주소

[https://github.com/Codeit-SB10-final-team04/sb10-mopl-team04](https://github.com/Codeit-SB10-final-team04/sb10-mopl-team04)
