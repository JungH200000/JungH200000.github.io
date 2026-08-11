---
layout: single-editorial
title: '[Sprint 백엔드 중급 프로젝트 6일차] QueryDSL로 뉴스 기사 목록 조회 Repository 구현'
excerpt: ''

categories:
  - Sprint 백엔드 중급 프로젝트
tags:
  - [Codeit Sprint, Codeit Sprint 백엔드 중급 프로젝트]

permalink: /categories/codeit-sprint/sprint-intermediate-project/sprint-intermediate-project006

toc: true
toc_sticky: true

date: 2026-04-20
last_modified_at: 2026-04-20
---

# QueryDSL로 뉴스 기사 목록 조회 Repository 구현

뉴스 기사 목록 조회를 구현하면서 커서 페이지네이션과 집계 column, 요청자 조회 여부, 정렬 기준 분기까지 함께 처리했다.

<br>

## 왜 JPQL이 아니라 QueryDSL을 사용했나?

뉴스 기사 목록 조회의 조건은 단순하지 않다.

- 검색어(keyword)로 제목(title) 또는 요약(summary) 부분 일치 검색
- 관심사, 출처, 날짜 범위 필터링
- 정렬 기준 분기
  - 날짜: `publishDate`
  - 댓글 수: `commentCount`
  - 조회 수: `viewCount`
- 커서 페이지네이션

이런 조건이 한 번에 들어가게 되면 JPQL로 작성했을 때 쿼리가 너무 길어지고, 오타나 잘못된 필드 참조 시 컴파일 단계에서 잡기 어렵다고 판단해 QueryDSL을 사용했다.

<br>

## 뉴스 기사 목록 조회에서 집계하는 값들

목록 하나를 조회할 때 아래의 값들을 집계한다.

- 댓글 수(`commentCount`)
- 조회 수(`viewCount`)
- 요청자 조회 여부(`viewedByMe`)

그래서 `comments` table이나 `article_histories` table을 참조해야 했다. 이 지점에서 헷갈렸던 부분이 바로 같은 조회 이력 테이블(`article_histories`)를 두 번 조인하냐는 것이었다.

<br>

### 같은 조회 이력 테이블에 별칭을 두 개 준 이유

뉴스 기사 목록 조회 쿼리는 조회 이력 table을 두 번 참조했다.

- 전체 조회 수를 집계하기 위한 용도 (`articleViewAll`)
- 현재 요청자 조회 여부를 집계하기 위한 용도 (`articleViewMe`)

같은 table을 두 번 쓴 이유는 서로 다른 역할을 맡았기 때문이다.

`viewCount`는 기사에 대한 전체 조회 기록을 모두 포함해야 한다. 반면에 `viewedByMe`는 요청가 ID가 들어간 단일 사용자 기준 조회 여부이다. 이 둘을 같은 별칭(alias) 하나로 처리하면 의미가 섞여 버린다.

예를 들어 `articleViewMe`에 `user.id = requestUserId` 조건을 걸어두면, 그 별칭을 이용해 전체 조회 수를 세는 순간 전체 조회 수가 아니라 현재 사용자의 조회 기록 수만 세게 된다. 반대로 아무 조건 없이 전체 조회 이력만 조인하면, `viewedByMe`를 확인할 때 현재 사용자 기준으로 좁힐 수 없게 된다.

그래서 같은 entity를 두번 참조하되, 역할을 분리해 각각 별칭을 주는 방식이 필요했다.

<br>

## `ArticleDto`를 projection

처음에는 Mapper를 통해 entity를 DTO로 변환하려고 했다.

하지만 이번 목록 조회에서는 entity를 그대로 가져온 뒤 변환하는 방식보다, 쿼리 결과를 바로 DTO로 projection 하는 방식이 더 적합했다. 왜냐하면 이번 응답은 `Article` entity 하나로 완성되는게 아니라 `commentCount`, `viewCount`, `viewedByMe` 등이 들어간다. 이 집계 값들은 Mapper가 단순 변환하는게 아니라, 쿼리에서 집계하여 꺼내야 한다.

그래서 이번 목록 조회에서는 QueryDSL projection으로 ArticleDto를 바로 구성하는 편이 더 편할 것이라고 판단했다.

<br>

## 정렬 기준에 따라 커서 조건을 다르게 둔 이유

이번 목록 조회에서 가장 고민했던 설계 중 하나는 정렬 기준에 따라 커서 조건을 다르게 처리한 것이다.

<br>

### 1. `publishDate` 정렬

`publishDate`는 기사 테이블의 일반 컬럼이다.

- `publishDate` `DESC`일 때는 `publishDate < cursor`
- 동일한 `publishDate`일 때는 `createdAt < after`

그래서 커서 조건도 일반 컬럼 비교로 처리할 수 있다. 즉, 커서 조건은 `where` 절에 두는 것이 자연스럽다.

2. `commentCount`, `viewCount` 정렬

반면 `commentCount`, `viewCount`는 테이블 컬럼이 아니라 집계값이다.

- `comment.id.countDistinct()`
- `articleViewAll.id.countDistinct()`

이 값들은 `groupBy` 다음에 계산된다. 따라서 커서 조건도 일반 `where` 절보다는 `having` 절에서 처리하는 것이 맞다고 판단했다.

3. 정리

- 공통 필터는 `where`
- 집계 기반 커서 조건은 `having` 으로

나누어 구성했다.

<br>

## 중복을 줄이기 위해 base query를 분리

처음 구현했을 때는 `publishDate`, `commentCount`, `viewCount` 정렬용 메서드 각각에 `projection`, `join`, 공통 `where`가 거의 똑같이 들어 있었다.

이 상태로도 동작은 했지만, 유지보수성이 좋지 않았다. 예를 들어 공통 필터에 조건 하나를 추가하면 세 메서드를 모두 수정해야 하고, `projection` 필드가 바뀌어도 세 군데를 같이 손봐야 했다.

그래서 리팩토링하면서 아래 공통 요소를 `baseQuery()`로 분리했다.

- `projection`
- `from`
- `join`
- 공통 `where`
- `groupBy`

그 뒤 정렬 기준에 따라 달라지는 부분만 각각 붙였다.

- `publishDate` → `where` 커서 + 날짜 정렬
- `commentCount` / `viewCount` → `having` 커서 + `count` 정렬

<br>

## `contextLoads` 오류

구현과 테스트를 진행하면서, 처음에는 단순히 `contextLoads`가 실패한 것으로 보여서 JUnit 문제인 것 같았다. 하지만 `contextLoads` 메서드 자체의 문제가 아니라, 테스트용 Spring 컨텍스트를 띄우는 도중 Bean 생성이 실패한 상황이었다.

아래의 오류 흐름 보면

`MonewApplicationTests` 실행
➡️ `@SpringBootTest` 때문에 전체 스프링 컨텍스트 로딩
➡️ `adminArticleController` Bean 생성 시도
➡️ `articleScrapeService` 필요
➡️ `xmlClient` 필요
➡️ `xmlClient`의 `@Value` 프로퍼티 주입 실패
➡️ 컨텍스트 로딩 실패

즉, 컨텍스트 초기화 과정에서 필요한 설정값이 없었다는 점이다.

```shell
Could not resolve placeholder 'NAVER_CLIENT_ID' in value "${NAVER_CLIENT_ID}" <-- "${monew.naver.client-id:}"

```

`xmlClient`가 주입받는 설정값 중 `monew.naver.client-id`가 내부적으로 `${NAVER_CLIENT_ID}`를 참조하고 있는데, 테스트 프로필 환경에서 해당 환경변수나 프로퍼티를 찾지 못했다는 뜻이다.

이 문제를 보면서 다시 느낀 건, `@SpringBootTest`는 생각보다 많은 Bean을 한 번에 올리기 때문에 현재 테스트가 직접 사용하지 않는 외부 연동 Bean의 설정값까지 컨텍스트 성공 여부에 영향을 줄 수 있다는 점이었다. 더불어 어떤 Bean이 어떤 설정값 때문에 실패했는지까지 오류 코드를 보며 흐름을 따라가 보는 습관이 중요한 것 같다.

---

# 팀 Notion 주소

[[SB10-5팀] Sprint Spring 백엔드 중급 팀 프로젝트](https://www.notion.so/jungh20000/SB10-Monew-Team05-342f59816c0280948b6ac9c8f80492eb?source=copy_link)

---

# GitHub Repository 주소

[https://github.com/SB10-Part03-Team05/sb10-monew-team05](https://github.com/SB10-Part03-Team05/sb10-monew-team05)
