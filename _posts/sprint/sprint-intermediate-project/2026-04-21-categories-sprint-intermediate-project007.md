---
title: '[Sprint 백엔드 초급 프로젝트 7일차] 뉴스 기사 view와 논리/물리 삭제 구현 및 뉴스 기사 목록 조회 Troubleshooting'
excerpt: ''

categories:
  - Sprint 백엔드 중급 프로젝트
tags:
  - [Codeit Sprint, Codeit Sprint 백엔드 중급 프로젝트]

permalink: /categories/codeit-sprint/sprint-intermediate-project/sprint-intermediate-project007

toc: true
toc_sticky: true

date: 2026-04-21
last_modified_at: 2026-04-21
---

# 뉴스 기사 view와 논리/물리 삭제 구현

## 같은 사용자의 반복 조회를 어떻게 볼까?

뉴스 기사 view 등록 로직에서 가장 먼저 기준으로 잡아야 할 것은 같은 사용자가 같은 기사를 여러 번 조회하더라도 조회 수는 1회만 반영되어야 한다. 실제 schema에서도 `article_view_histories`(뉴스 기사 조회 이력) table에 사용자 ID와 뉴스 기사 ID에 유니크 제약을 둬서 이를 보장하고 있다.

처음에는 기존 조회 이력이 있는지만 확인하고, 없으면 저장하고 있으면 무시하면 된다고 봤다. 하지만 이런 방식은 API 문서에 적혀있던 응답 구조와 맞지 않았다. 조회 이력이 없어서 새롭게 등록되든지, 기존 조회 이력이 있든지 간에 항상 동일한 응답을 반환해야 했다.

그래서 기존 조회 이력을 먼저 직접 조회하고, 없을 때만 새로 저장하는 방식으로 구현했다. 이렇게 하면 이미 조회한 사용자도 같은 방식의 성공 응답을 받을 수 있고, 새로 조회한 사용자도 동일한 형태의 응답을 받을 수 있다. 결론적으로 중복 요청을 실패로 볼 것이 아니라 최종 상태가 이미 반영되어 있다면 그대로 성공으로 응답하는 멱등적인 API로 보는 쪽이 더 효율적이라고 판단했다.

## view 등록에서 `save`가 아닌 `saveAndFlush`를 사용한 이유

처음에는 `save`만 호출해도 곧바로 `insert`가 실행될 거라고 생각했다. 하지만 JPA는 변경 내용을 영속성 컨텍스트에 모아두었다가 `flush`나 `commit` 시점에 SQL을 보낼 수 있다. 이 경우 작성한 중복 예외가 `save`를 호출했을 시점이 아니라 트랜잭션 종류 시점이나 뒤의 다른 쿼리 실행 시점에 발생할 수 있다. 그러면 `try-catch` 안에서 중복 저장 충돌을 처리하려는 로직과 맞지 않는다.

반면 `saveAndFlush`를 사용하면 저장 즉시 `flush`를 수행하므로, unique 제약 조건 위반이 있다면 그 시점에 바로 예외가 발생할 수 있다.

## 논리 삭제와 물리 삭제를 구현하며 헷갈렸던 점

뉴스 기사 논리/물리 삭제를 처음에 단순하게 구현했다. 논리 삭제는 `deleted_at`만 채우면 끝이고, 물리 삭제는 말 그대로 지우면 끝이라고 생각했다.

기본은 논리 삭제이고 관련된 정보가 유지되어야 한다. 반면 물리 삭제는 관련 정보까지 모두 함께 삭제되어야 한다.

특히 entity에 `@SQLDelete`와 `@SQLRestriction`을 적용하면 `repository.delete()`가 실제로는 물리 삭제가 아니라 `deleted_at`을 업데이트하는 논리 삭제로 동작하게 된다. 그래서 삭제 로직은 아래처럼 구현했다.

- 일반 삭제는 `@SQLDelete`가 적용된 논리 삭제 사용
- DB에서 완전 제거는 별도의 물리 삭제 Repository 메서드 사용

### `@SQLRestriction`이 있을 때 물리 삭제가 바로 안되는 이유

조회 시점에 `@SQLRestriction("deleted_at IS NULL")`가 자동으로 걸리기 때문에 이미 논리 삭제된 데이터는 일반 조회에는 보이지 않는다. 문제는 이 상태에서 삭제 대상 entity를 일반 조회로 가져오려고 하면 이미 필터링되어 보이지 않는다는 점이다.

물리 삭제를 하려면 보이지 않는 데이터를 어떻게 다룰 것인지 고민해야 했다. 이 부분은 JPQL DELETE도 `@SQLRestriction` 영향으로 논리 삭제된 데이터를 못 지우므로 `native SQL`을 이용한 별도 Repository 메서드를 두는 방식이 더 명확하다고 판단했다.

---

# 뉴스 기사 목록 조회 Troubleshooting

## `keyword` 입력 검증 Troubleshooting

"공백만 막고 싶었는데, 빈 문자열까지 막고 있었다."

뉴스 기사 목록 조회를 구현하면서 처음 부딪힌 문제 중 하나는, 로그인 직후 첫 뉴스 기사 목록 화면이 정상적으로 출력되지 않는 현상이었다. 확인해보니 원인이 `keyword` 입력 검증에 있었다. 로그를 보면 첫 요청에서 `keyword`가 빈 문자열(`""`)로 들어왔고, `ArticleSearchRequest.keyword`에 있던 `@Pattern(regexp = ".*\\S.*")` 검증이 해당 값을 실패 처리하고 있었다. 처음 의도는 "공백만 있는 검색어 막기"였는데 실제로는 "비어 있는 값도 허용 하지 않는 것"이었다.

문제가 명확해진 점은 프론트엔드와 연결해 테스트를 진행할 때 Repository가 아닌 Controller에서 예외가 발생했다는 점이었다. QueryDSL에서는 `keyword`가 없으면 생략하게 구현했지만 테스트할 때는 DTO 검증에서 `MethodArgumentNotValidException` 예외가 발생해 조회 로직에 들어오지 못했다.

그래서 해결은 두 단계로 정리했다.

먼저, `keyword`에 사용했던 DTO 정규식

- `@Pattern(regexp = ".*\\S.*", message = "keyword는 공백으로 구성될 수 없습니다.")`를
- `@Pattern(regexp = "^$|.*\\S.*", message = "keyword는 공백으로만 구성될 수 없습니다.")`로 바꾸는 방향으로 정리했다.

```java
// `ArticleSearchRequest.class`
@Parameter(description = "검색어(제목, 요약)")
@Pattern(regexp = ".*\\S.*", message = "keyword는 공백으로 구성될 수 없습니다.")
private String keyword;
```

이 정규식은 빈 문자열은 허용하지만 공백만으로 이루어진 문자열(`" "`, `"  "`)은 막는다.

추가적으로 Repository의 QueryDSL에서 `isBlank()`를 사용해 `keyword`에 `""` 같은 의미가 없는 값들은 검색 조건을 생상하지 않도록 보완했다.

```java
// `ArticleQueryRepositoryImpl.class`
private BooleanExpression keywordContains(QArticle article, String keyword) {
  // ""일 경우를 `null` 을 가지게 하기 위해 `isBlank()` 추가
  return keyword != null && !keyword.isBlank()
      ? article.title.contains(keyword).or(article.summary.contains(keyword))
      : null;
}
```

### 느낀점

이 Troubleshooting을 진행하며 느낀점은 파라미터의 의미에 맞게 검증 범위를 설정하는 것이 맞다고 생각했다. `keyword`는 필수가 아닌 선택 파라미터이기 때문에 비어있는 값(`""`)은 오류가 아니라 "검색 조건 없음"으로 보는게 맞았다. 반면 공백만 있는 `keyword`는 검색 의도가 없는 입력 값이므로 DTO 검증 단계에서 걸러주는 편이 좋다고 적절했다.

## `publishDate` 정렬 오류 Troubleshooting

"날짜 필터는 로컬 시간처럼 보이지만, DB는 절대 시점으로 이루어진다."

처음에는 `publishDate` 관련 문제가 타입 오류처럼 보였다. 프론트엔드에서 `publishDateFrom`, `publishDateTo`를 `2026-04-14T00:00:00`, `2026-04-20T23:59:59` 같은 형태로 보내고 있었는데, `ArticleSearchRequest` 요청 DTO에서는 `Instant`로 받고 있었다. 해당 문자열은 `Instant`가 요구하는 `Z`나 `+09:00` 같은 시간대 정보를 포함하지 않고 있는 시간대 없는 로컬 날짜-시간 문자열이라 Spring 바인딩에 실패했다. 즉, 다른 타입이 왔다는 것 보다는 문자열 포맷이 `Instant`와 맞지 않았다.

처음에는 날짜 범위 필터라는 점만 보고 `LocalDate`로 바꾸는 것도 고려했었는데, 프론트엔드에서는 `T00:00:00`, `T23:59:59`가 붙은 값을 보내고 있었다. 이 상태에서 `LocalDate`로 변경하게 되면 순수하게 날짜 형식(`yyyy-mm-dd`)만 기대하게 되므로 문제 해결에서 더 멀어지게 된다.

그래서 최종적으로 수정한 `ArticleSearchRequest` 요청 DTO의 `publishDateFrom`, `publishDateTo`의 타입을 `LocalDateTime`으로 받는 방향으로 결정했다. 프론트가 보내는 `2026-04-14T00:00:00` 형식도 그대로 받을 수 있고, OpenAPI 문서의 `date-time` 표현과도 어긋나지 않는다. 대신 `Article` entity의 `publishDate`는 그대로 `Instant`로 유지했다. 기사 자체의 발생 시각은 단순한 날짜가 아니라 실제 시점이기 때문에, DB의 `TIMESTAMPTZ`와 Java의 `Instant` 조합이 더 자연스럽기 때문이다.

최종적으로 수정된 구조는

- 사용자 입력은 `LocalDateTime`으로 받고

```java
// `ArticleSearchRequest.class`
@Parameter(description = "날짜 시작(범위)")
private LocalDateTime publishDateFrom;

@Parameter(description = "날짜 끝(범위)")
private LocalDateTime publishDateTo;
```

- 실제 DB 비교 전에 `Asia/Seoul` 기준으로 `Instant`로 변환하는 방식이 됐다.

```java
// `ArticleQueryRepositoryImpl.class`
ZoneId zoneId = ZoneId.of("Asia/Seoul");

LocalDateTime publishDateFrom = request.getPublishDateFrom();
LocalDateTime publishDateTo = request.getPublishDateTo();

Instant fromInstant = publishDateFrom != null
    ? publishDateFrom.atZone(zoneId).toInstant()
    : null;
Instant toInstant = publishDateTo != null
    ? publishDateTo.atZone(zoneId).toInstant()
    : null;
```

### 가장 헷갈렸던 부분

한국 시간 기준으로 날짜를 잡을 때 SQL 로그에는 UTC 기준으로 하루 전 시각처럼 보이는 현상이 있다. 예를 들어 `2026-04-14T00:00:00`을 `Asia/Seoul` 기준으로 해석해서 `Instant`로 바꾸면 로그에는 `2026-04-13T15:00:00Z`처럼 찍힐 수 있다. 처음 봤을 때는 날짜가 밀린 것처럼 보여서 잘못 변환된 줄 알았지만, 실제로는 "같은 순간을 다른 시간대 표현으로 본 것"일 뿐이다. 한국 시간 4월 14일 00시는 UTC로 보면 전날 15시이기 때문이다.

이것보다 중요한 것은 사용자가 선택한 로컬 시간 범위를 백엔드가 절대 시점으로 정확히 변환했는지에 대한 여부이다. 변환만 정확하면 DB의 `TIMESTAMPTZ`와 비교해도 조회 결과는 어긋나지 않는다.

---

# 팀 Notion 주소

[[SB10-5팀] Sprint Spring 백엔드 중급 팀 프로젝트](https://www.notion.so/jungh20000/SB10-Monew-Team05-342f59816c0280948b6ac9c8f80492eb?source=copy_link)

---

# GitHub Repository 주소

[https://github.com/SB10-Part03-Team05/sb10-monew-team05](https://github.com/SB10-Part03-Team05/sb10-monew-team05)
