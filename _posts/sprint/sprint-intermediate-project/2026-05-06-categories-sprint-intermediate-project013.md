---
layout: single-editorial
title: '[Sprint 백엔드 중급 프로젝트] Monew 개인 개발 리포트'
excerpt: ''

categories:
  - Sprint 백엔드 중급 프로젝트
tags:
  - [Codeit Sprint, Codeit Sprint 백엔드 중급 프로젝트]

permalink: /categories/codeit-sprint/sprint-intermediate-project/sprint-intermediate-project013

toc: true
toc_sticky: true

date: 2026-05-06
last_modified_at: 2026-05-06
---

# Monew 개인 개발 리포트

## 1. 프로젝트 개요

이번 프로젝트에서 Monew 서비스를 개발했다. Monew는 여러 뉴스 출처를 통합해 사용자에게 관심사 기반 뉴스를 제공하고, 댓글과 좋아요를 통해 소통할 수 있는 뉴스 플랫폼이다. 사용자는 관심사를 구독할 수 있고, 구독한 관심사와 관련된 뉴스 기사가 등록되면 알림을 받을 수 있다.

프로젝트의 주요 기능은 사용자 관리, 관심사 관리, 뉴스 기사 관리, 댓글 관리, 활동 내역 관리, 알림 관리이다.

이 중 뉴스 기사 도메인에서 뉴스 기사 목록 조회, 커서 페이지네이션, 조회 이력, 논리/물리 삭제, S3 기반 백업 및 복구 기능이 핵심 요구사항이다. 뉴스 기사 백업은 데이터 유실에 대비하기 위한 기능이며, 날짜 단위로 S3에 백업하고 DB와 비교해 누락된 기사를 복구하는 방식이다.

팀 프로젝트는 GitHub, Notion, Discord로 소통하며 진행했다. 프로젝트 초기에 협업 방식, 회의 방식, R&R, 문서화 방식, branch 전략, PR 규칙 등을 먼저 정리했고, 평일 오전 10시마다 정기 회의를 진행해 어제 작업한 내용과 오늘 작업한 내용을 공유했다.

---

## 2. 담당한 작업

이번 프로젝트에서 나는 **팀장 역할**과 뉴스 기사 조회, 삭제, 뷰 등록, 백업/복구 기능, CI/CD, AWS 운영 환경 관리를 담당했다.

### 2.1 팀장 및 협업 초기 정리

Discord, Notion, GitHub를 협업 도구로 정했고, 프로젝트 간 회의록 작성 방식, 코드/commit/PR 컨벤션, 정기 회의 시간을 정했다. 이후 주어진 가이드를 바탕으로 요구사항 정의서를 작성했고, 작성한 요구사항 정의서를 바탕으로 역할 분담(R&R)을 나누고, ERD, SQL, GitHub Todo Issue 카드를 작성했다.

또한 패키지 구조는 도메인 중심으로 구성하는 것을 제안했다. 해당 프로젝트는 사용자, 뉴스 기사, 관심사, 댓글 알림처럼 도메인이 명확했기 때문에 각각의 도메인 아래에 Controller, Service, Repository, Dto, Entity 등의 계층을 두는 것이 독립적인 구현과 유지보수에 도움이 된다고 판단했다.

### 2.2 뉴스 기사 조회 API

#### 1) 뉴스 기사 단건 조회 API

- 뉴스 기사 정보 + 댓글 수 + 조회 수 + 요청자 본인의 조회 여부까지 함께 반환
- 관련 PR: [[feat] 뉴스 기사 단건 조회 로직 구현](https://github.com/SB10-Part03-Team05/sb10-monew-team05/pull/77)

#### 2) 뉴스 기사 목록 조회 API

- QueryDSL 기반 구현
- 제목과 요약 부분 일치 검색이 가능하고, 관심사, 출처, 발행일 범위 조건으로 필터링
- 발행일, 댓글 수, 조회 수로 ASC/DESC 정렬
- **구현하면서 주의한 점**
  - 단건 조회처럼 댓글 수, 조회 수, 조회 여부를 개별 쿼리로 계산하면 N+1 같은 반복 조회가 발생할 가능성이 있다고 생각
  - 그래서 QueryDSL에서 Left Join을 사용해 댓글 수, 조회 수, 요청자 조회 여부를 집계하고, `ArticleDto`로 바로 projection하는 방식을 사용
    ```java
    // ...
    return queryFactory.select(Projections.constructor(
            ArticleDto.class,
            article.id,
            article.source,
            article.sourceUrl,
            article.title,
            article.publishDate,
            article.summary,
            comment.id.countDistinct(), // 댓글 수 집계
            articleViewAll.id.countDistinct(), // 조회 수 집계
            articleViewMe.id.countDistinct().gt(0L) // 조회 여부(1이상이면 true)
        ))
        .from(article)
        .leftJoin(articleInterest).on(
            articleInterest.article.eq(article)
        )
        .leftJoin(comment).on(
            comment.article.eq(article),
            comment.deletedAt.isNull() // 논리 삭제된 것은 제외
        )
        .leftJoin(articleViewAll).on(
            articleViewAll.article.eq(article)
        )
        .leftJoin(articleViewMe).on(
            articleViewMe.article.eq(article),
            articleViewMe.user.id.eq(requestUserId) // 조회 여부
        )
        .where(
            commonWhere(request, article, articleInterest)
        )
        .groupBy(article.id);
    ```
- 관련 PR: [[feat] 뉴스 기사 목록 조회 로직 구현](https://github.com/SB10-Part03-Team05/sb10-monew-team05/pull/99)

### 2.3 뉴스 기사 삭제 API

뉴스 기사 삭제는 기본적으로 논리 삭제를 적용했다. `deleted_at`을 기준으로 삭제 여부를 판단하고, 일반적인 목록 조회에서 논리 삭제된 기사는 제외되도록 구현했다. 또한, 물리 삭제 API도 별도로 구현하여 물리 삭제 시 관련된 정보를 모두 삭제하도록 설정했다.

구현 과정에서 `Article` entity에 `@SQLDelete`, `@SQLRestriction`을 사용하면 일반적인 `JpaRepository.delete()`가 실제 삭제가 아닌 논리 삭제로 동작한다는 점을 고려해, 물리 삭제가 필요한 경우 native query 기반 삭제 메서드를 별도로 구현하는 방식으로 처리했다.

- 관련 PR: [[feat] 뉴스 기사 논리/물리 삭제 구현](https://github.com/SB10-Part03-Team05/sb10-monew-team05/pull/116)

### 2.4 뉴스 기사 뷰 등록 API

사용자가 특정 뉴스 기사를 조회했을 때 조회 이력을 저장하는 기능으로, 동일한 사용자가 같은 뉴스 기사를 여러 번 조회해도 조회 수는 1번만 반영되어야 한다. 이를 위해 `user_id`와 `article_id`를 복합 `UNIQUE` 제약을 활용했다.

기존 조회 이력이 있는 경우 실패로 처리하기보다 기존 조회 이력을 반환하는 방식으로 구현했다. 또한 동시 요청으로 인해 중복 저장이 발생할 수 있는 상황을 고려하여 `saveAndFlush`를 이용해 `UNIQUE` 제약 위반 예외를 즉시 발생시키고 처리할 수 있도록 구현했다.

- 관련 PR: [[feat] 뉴스 기사 뷰 등록 로직 구현](https://github.com/SB10-Part03-Team05/sb10-monew-team05/pull/106)

### 2.5 뉴스 기사 백업 기능

Spring Batch 기반으로 뉴스 기사 백업 기능을 구현했다. 매일 02:02 KST에 전날 발행된 뉴스 기사 데이터를 자동으로 백업하도록 스케줄러를 구현했다. 스케줄러는 한국 시간 기준으로 하루 전 날짜를 계산한 뒤 BatchRunner에게 전달한다.

```java
private static final ZoneId KST = ZoneId.of("Asia/Seoul");

@Scheduled(cron = "0 2 2 * * *", zone = "Asia/Seoul")
public void backupYesterdayArticles() {
  LocalDate backupDate = LocalDate.now(KST).minusDays(1);
  articleBackupBatchRunner.run(backupDate);
}
```

백업 흐름은 아래와 같다.

```
Scheduler
→ BatchRunner
→ Spring Batch Job
→ Step
→ Tasklet
→ ArticleBackupService
→ S3ArticleBackupStorage
```

백업 데이터는 entity 그대로 JSON으로 직렬화하지 않고, 백업 전용 DTO로 변환했다. entity를 그대로 직렬화한다면

- entity 구조가 변경되면 백업 파일의 구조도 같이 변경되고,
- 연관 관계가 존재할 때 순환 참조 문제가 발생할 수 있기 때문이다.

백업 파일은 AWS S3에 아래의 경로에 저장된다.

```
backups/articles/{yyyy-MM-dd}/articles.json
```

S3 업로드는 네트워크나 AWS 일시 장애가 존재할 수 있기 때문에 재시도 가능한 예외에 대해 retry와 backoff 전략을 적용했다.

- 관련 PR: [[feat] 뉴스 기사 백업/복구 로직 구현](https://github.com/SB10-Part03-Team05/sb10-monew-team05/pull/169)

### 2.6 뉴스 기사 복구 기능

날짜 범위를 기준으로 S3에 백업 파일을 조회한 뒤, 백업 데이터와 현재 DB의 데이터를 비교하여 DB에 없는 뉴스 기사만 복구하는 방식으로 구현했다. 그리고 `ON CONFLICT DO NOTHING` 을 적용한 `INSERT`문을 사용해 중복 `INSERT`가 발생해도 예외 없이 무시되도록 처리했다.

처음에는 뉴스 기사 자체만 복구하는 로직을 생각했지만, 블로그 글을 정리하던 중 중요한 문제를 발견했다. 뉴스 기사만 복구한다면 `article_interests` 매핑 정보가 복구되지 않아, 복구된 기사가 관심사로 필터링된 뉴스 기사 목록 조회에서 누락될 수 있다. 이를 해결하기 위해 백업 DTO에 `interestIds`를 추가하고, 복구 시 존재하는 관심사 ID만 선별해 `article_interests` 매핑까지 함께 복구하도록 개선했다.

```java
private void restoreArticleInterests(ArticleBackupDto dto) {
  List<UUID> interestIds = dto.interestIds();

  if (interestIds == null || interestIds.isEmpty()) {
    return;
  }

  List<UUID> existingInterestIds = interestRepository.findExistingInterestIds(interestIds);
  existingInterestIds.forEach(id ->
      articleInterestRepository.insertArticleInterestIfNotExists(dto.id(), id)
  );
}
```

- 관련 PR: [[feat] 뉴스 기사 백업/복구 로직 구현](https://github.com/SB10-Part03-Team05/sb10-monew-team05/pull/169)

### 2.7 CI/CD 파이프라인 구축

CI/CD 파이프라인은 GitHub Actions 기반으로 동작한다.

CI 파이프라인은 PR 생성 및 `dev` branch push 시 Gradle 테스트를 실행하고, JaCoCo 리포트를 생성한 뒤 Codecov에 업로드하도록 자동화했다. 이를 통해 팀원들이 PR 단계에서 테스트 결과와 커버리지 상태를 확인할 수 있도록 했다.

CD 파이프라인은 `dev` branch에 merge된 이후 실행되도록 구현했다. Spring Boot JAR build, Docker 이미지 생성, Public ECR push, ECS Task Definition 이미지 태그 교체, ECS Service 업데이트까지 자동화했다.

배포 과정에서 ECS on EC2 환경에서 기존 task와 새로운 task가 동시에 떠야 하는 구조가 리소스 문제가 있을 수 있다고 판단되어서 service desired count를 0으로 내린 뒤 새 task definition을 반영하고, 다시 desired count를 1로 올리는 방식을 적용했다. 마지막에는 `aws ecs wait services-stable`을 추가하여 task가 정상 실행 상태에 도달했는지 확인하도록 설정했다.

- 관련 PR: [[ci] GitHub Actions 기반 Codecov CI 파이프라인 구축](https://github.com/SB10-Part03-Team05/sb10-monew-team05/pull/122)
- 관련 PR: [[cd] AWS ECS 자동 배포 CD 파이프라인 구축](https://github.com/SB10-Part03-Team05/sb10-monew-team05/pull/141)

### 2.8 AWS 및 운영 환경 관리

AWS 운영 환경에서 RDS PostgreSQL, ECS on EC2, Public ECR, S3를 연동했다. S3에는 환경 변수 파일, 뉴스 기사 백업 파일, 로그 파일을 적재했다.

RDS 연결 오류가 발생했을 때 처음에는 애플리케이션 설정 문제를 의심했지만, 로그 추적 결과 PostgreSQL 연결 실패가 원인이었다. 이후 RDS 보안 그룹 인바운드 규칙에 ECS cluster 보안 그룹을 Source로 추가하여 문제를 해결했다.

또한 ECS task가 정상 실행되었지만 service에 접속되지 않는 문제가 있었다. 원인은 컨테이너 포트와 애플리케이션 `server.port` 설정 불일치였다. S3 환경 변수 파일에 `PORT=80`을 추가하여 컨테이너 포트와 애플리케이션 실행 포트를 맞췄다.

---

## 3. 기술적 성과

### 3.1 QueryDSL 기반 목록 조회 구현

뉴스 기사 목록 조회에서 QueryDSL을 활용해 검색어, 관심사, 출처, 발행일 범위와 같은 필터 조건을 조합하고, 정렬 기준에 따라 필요한 조인과 집계 조건을 다르게 구성했다.

`publishDate`는 뉴스 기사 table의 일반 column이므로 `where` 절에서 커서 조건을 처리할 수 있지만, `commentCount`와 `veiwCount`는 집계값이므로 `group by` 이후 계산되는 값이고, 이에 따라 `having` 절에서 커서 조건을 처리했다.

또한 전체 조회 수와 요청자 조회 여부를 구분하기 위해 `article_view_histories` table을 두 번 조인했다. 전체 조회 수 집계용 alias와 현재 요청자의 조회 여부 확인용 alias를 분리함으로써, 조회 수와 `viewedByMe` 값의 의미가 섞이지 않도록 했다.

### 3.2 커서 페이지네이션 구현

뉴스 기사 목록 조회에서 커서 페이지네이션으로 구현했다. 구현한 무한 스크롤에서 프론트엔드가 `after`를 재전송하지 않는 문제가 발생해, `nextCursor` 하나에 정렬값, `createdAt`, `articleId`를 함께 담는 복합 커서 방식을 사용했다.

예를 들어 `publishDate` 정렬에서 아래와 같은 형식의 `cursor`를 사용했다.

```
publishDate|createdAt|articleId
```

`commentCount`와 `viewCount` 정렬에서는 아래와 같은 형식을 사용했다.

```
count|createdAt|articleId
```

이 방식을 사용함으로써 프론트엔드에서 `cursor` 하나만 보내더라도 백엔드에서 안정적으로 다음 페이지 조건을 확인할 수 있게 해주었다. 더불어 같은 정렬값이 여러 개일 경우에도 `createdAt`과 `articleId`를 함께 비교하기 때문에 뉴스 기사 누락 가능성도 줄일 수 있다.

```java
// nextCursor(다음 페이지 커서) 조합 (복합 커서)
private String findNextCursor(
  ArticleDto lastArticleDto,
  ArticleOrderBy orderBy,
  Instant createdAt
) {
  UUID lastArticleId = lastArticleDto.id();

  return switch (orderBy) {
    // "publishDate|createdAt|articleId"
    case publishDate -> String.join(
        "|",
        lastArticleDto.publishDate().toString(),
        createdAt.toString(),
        lastArticleId.toString()
    );
    // "commentCount|createdAt|articleId"
    case commentCount -> String.join(
        "|",
        String.valueOf(lastArticleDto.commentCount()),
        createdAt.toString(),
        lastArticleId.toString()
    );
    // "viewCount|createdAt|articleId"
    case viewCount -> String.join(
        "|",
        String.valueOf(lastArticleDto.viewCount()),
        createdAt.toString(),
        lastArticleId.toString()
    );
  };
}
```

### 3.3 뉴스 기사 데이터 유실 대비 백업/복구 기능 구현

Spring Batch와 AWS S3를 활용해 뉴스 기사 백업/복구 기능을 구현했다. 기존처럼 뉴스 기사 정보만 백업/복구하는 것이 아니라 뉴스 기사와 연결된 관심사 ID까지 함께 백업/복구하도록 개선했다.

복구 시에는 현재 DB에 존재하지 않는 기사만 `INSERT`하고 관심사 매핑도 현재 DB에 존재하는 관심사만 복구했다.

### 3.4 CI/CD 운영 자동회

GitHub Actions를 활용해 CI와 CD를 분리해 구현했다. PR과 `dev` push에서 테스트 및 커버리지 업로드를 수행하고, `dev` branch에 merge된 이후에는 Docker 이미지 build와 AWS ECS 배포가 자동으로 진행되도록 구현했다.

이 과정에서 최소 권한 원칙을 고려해 GitHub Actions의 `GITHUB_TOKEN` 권한은 `contents: read`로 제한하고, AWS IAM 권한도 ECS 배포, ECR push, S3 접근 등 필요한 서비스 권한 중심으로 구성했다.

### 3.5 운영 환경 문제 해결

로컬에서 정상 동작하던 기능도 배포 환경에서는 메모리, 권한, 환경 변수, 포트, 보안 그룹 설정으로 실패할 수 있음을 경험했다. 특히 ECS, RDS, S3, ECR을 함께 사용하는 환경에서는 인프라 설정도 서비스 안정성에 영향을 준다는 점을 배웠다.

---

## 4. 문제점 및 해결 과정

### 4.1 뉴스 기사 목록 조회 keyword 검증 문제

#### Situation

프론트엔드에서 로그인 후 첫 뉴스 기사 목록 화면을 조회할 때 400 에러가 발생했다. 처음에는 QueryDSL 조건이나 목록 조회 쿼리 문제라고 생각했지만, 로그를 확인해보니 Controller 단계에서 `MethodArgumentNotValidException`이 발생했다.

![problem01-로그인 후 첫 페이지(뉴스 기사 목록).png](</assets/images/posts_img/intermediate-project/problem01-로그인_후_첫_페이지(뉴스_기사_목록).png>)

#### Task

`keyword`는 선택 파라미터이기 때문에 값이 비어있으면 검색 조건 없음으로 처리되어야 한다. 하지만 공백만 있는 검색어는 의미 없는 입력이므로 막아야 했다.

#### Action

기존에는 아래의 정규식을 사용하고 있었다.

```java
@Pattern(regexp = ".*\\S.*", message = "keyword는 공백으로 구성될 수 없습니다.")
private String keyword;
```

위 정규식은 공백만 막는 것뿐만 아니라 빈 문자열 `“”`도 막았다. 프론트엔드는 첫 진입 시 `keyword=""`를 보내고 있기 때문에 검증 단계에서 실패했다.

이 정규식을 아래처럼 수정했다.

```java
@Pattern(regexp = "^$|.*\\S.*", message = "keyword는 공백으로만 구성될 수 없습니다.")
private String keyword;
```

또한 Reposiotry의 QueryDSL 조건 생성에서도 `isBlack()`을 사용하여 `null`, `""`, `" "` 값의 경우 조건을 생성하지 않도록 했다.

```java
private BooleanExpression keywordContains(QArticle article, String keyword) {
  // ""일 경우를 `null` 을 가지게 하기 위해 `isBlank()` 조건 추가
  return keyword != null && !keyword.isBlank()
      ? article.title.contains(keyword).or(article.summary.contains(keyword))
      : null;
}
```

#### Result

빈 문자열은 선택 파라미터의 조건 없음으로 처리하고, 공백만 있는 문자열은 유효하지 않은 입력으로 처리할 수 있게 되었다. 이를 통해 로그인 후 첫 뉴스 기사 목록 조회가 정상 동작했다.

### 4.2 `publishDate` 타입 및 시간대 변환 문제

#### Situation

뉴스 기사 목록 조회에서 날짜 범위 파라미터를 적용할 때 바인딩 오류가 발생했다. 프론트엔드는 `2026-04-14T00:00:00`, `2026-04-20T23:59:59`처럼 시간대 정보가 없는 `date-time` 문자열을 전송하고 있었다.

처음에는 DTO에서 `Instant`로 받았다. 하지만 `Instant`는 `Z` 또는 `+09:00` 같은 오프셋 정보가 필요하기 때문에 바인딩에 실패했다. 이후 `LocalDate`로 변경했지만, 프론트엔드가 보내는 값은 `T00:00:00`이 포함된 `date-time` 형식이었기 때문에 다시 바인딩에 실패했다.

![problem02-publishDate 정렬 오류(Instant).png](</assets/images/posts_img/intermediate-project/problem02-publishDate_정렬_오류(Instant).png>)

![problem02-publishDate 정렬 오류(LocalDate).png](</assets/images/posts_img/intermediate-project/problem02-publishDate_정렬_오류(LocalDate).png>)

#### Task

제공된 API 문서와 프론트엔드 요청 형식을 어기지 않으면서 DB의 `TIMESTAMPTZ` column과 정확히 비교할 수 있는 타입이 필요했다.

#### Action

요청 DTO에는 `LocalDateTime`으로 값을 받도록 수정했다.

```java
private LocalDateTime publishDateFrom;
private LocalDateTime publishDateTo;
```

그리고 Repository에서 DB 비교 전에 `Asia/Seoul` 기준으로 `Instant`로 변환했다.

```java
ZoneId KST = ZoneId.of("Asia/Seoul");

LocalDateTime publishDateFrom = request.getPublishDateFrom();
LocalDateTime publishDateTo = request.getPublishDateTo();

Instant fromInstant = publishDateFrom != null
    ? publishDateFrom.atZone(KST).toInstant()
    : null;
Instant toInstant = publishDateTo != null
    ? publishDateTo.atZone(KST).toInstant()
    : null;
```

entity의 `publishDate`는 그대로 `Instant`로 유지했다. 뉴스 기사 발행 시각은 실제 시점을 의미하고, DB의 `TIMESTAMPTZ`와 Java의 `Instant` 조합이 자연스럽다고 생각했기 때문이다.

#### Result

![problem02-solve.png](/assets/images/posts_img/intermediate-project/problem02-solve.png)

프론트엔드가 보내는 시간대 없는 `date-time` 문자열을 정상적으로 받을 수 있게 되었고, DB 비교 시 한국 시간 기준 입력값을 절대 시점으로 변환하여 조회할 수 있게 되었다.

이 문제를 해결하면서 `LocalDateTime`과 `Instant`, `TIMESTAMPTZ`의 차이에 대해 좀 더 알게 된 것 같다.

### 4.3 뉴스 기사 목록 조회 커서 페이지네이션 불일치 문제

#### Situation

뉴스 기사 목록에서 첫 페이지는 정상적으로 조회되지만 다음 페이지 요청 시 400 Bad Request가 발생했다. 로그를 확인해보니 첫 응답에서는 `nextCursor`, `nextAfter`가 함께 프론트엔드로 보내졌지만, 다음 요청에서는 `cursor`만 전달되고 `after`는 `null`로 전달되고 있었다.

![image.png](/assets/images/posts_img/intermediate-project/image.png)

![image.png](/assets/images/posts_img/intermediate-project/48f06d23-579a-439e-a763-d0536e0c195b.png)

기존 Controller에서는 아래오 같이 `cursor`와 `after`가 함께 존재해야 한다는 검증이 있었다.

```java
if ((request.getCursor() == null) != (request.getAfter() == null)) {
  throw new InvalidParameterException("cursor", request.getCursor(), "after", request.getAfter());
}
```

위 검증 때문에 `cursor`만 전달되는 다음 페이지 요청이 실패했다.

#### Task

제공된 프론트엔드에서는 다음 페이지 요청 시 `cursor`만 재전송하고 있기 때문에 백엔드에서는 해당 요청 형식과 호환되도록 수정해야 했다. 더불어 커서 페이지네이션에서 중복 조회와 데이터 누락이 발생하지 않도록 `after`를 사용하지 않는 다음 페이지 판단 기준을 만들어야 했다.

#### Action

![problem03-solve.png](/assets/images/posts_img/intermediate-project/problem03-solve.png)

처음에는 Controller의 `cursor`와 `after` 동시 검증 조건을 완화했다. 이렇게 요청은 통과했지만 Repository의 커서 조건 생성 로직은 여전히 `cursor`와 `after`가 모두 있어야 조건이 생성되는 구조였다. 이로 인해 `after`가 `null`이면 커서 조건이 빠지면서 첫 페이지와 동일한 조건으로 뉴스 기사 목록이 반복 조회되는 문제가 발생했다.

원인은 `cursor + after` 조합을 기준으로 커서 페이지네이션을 구현했지만, 실제 프론트엔드에서는 `cursor` 하나만 전달하는 방식이었기 때문이다.

이를 해결하기 위해 다음 페이지 판단에 필요한 정보를 `cursor` 하나에 모두 담도록 구현했다. 정렬값 하나만 담으면 같은 정렬 값을 가진 데이터가 여러 개 있을 때 중복이나 누락이 발생할 수 있기 때문에 정렬값과 함께 추가 정렬 기준인 `createdAt`, `articleId`를 포함한 복합 커서를 사용했다.

```
publishDate 정렬: publishDate|createdAt|articleId
commentCount 정렬: commentCount|createdAt|articleId
viewCount 정렬: viewCount|createdAt|articleId
```

Repository에서 전달 받은 `cursor`를 파싱한 뒤, 목록 정렬 기준와 동일한 우선 순위로 다음 페이지 조건을 생성했다.

```java
// `lt` -> `<` 미만
if (direction == ArticleDirection.DESC) {
  return article.publishDate.lt(cursor.publishDate())
      .or(article.publishDate.eq(cursor.publishDate())
          .and(article.createdAt.lt(cursor.createdAt())))
      .or(article.publishDate.eq(cursor.publishDate())
          .and(article.createdAt.eq(cursor.createdAt()))
          .and(article.id.lt(cursor.id())));
}
```

#### Result

이로써 프론트엔드는 기존처럼 `cursor` 하나만 전달해도 다음 페이지를 정상적으로 조회할 수 있게 되었다. 또한 백엔드는 `cursor` 내부에서 정렬값, 생성 시각, 뉴스 기사 ID를 복원해 커서 조건을 만들 수 있게 되었고, 첫 페이지가 반복 조회되는 문제도 해결되었다.

이 문제를 통해 커서 페이지네이션에서는 목록을 정렬하는 기준과 다음 페이지를 판단하는 기준이 반드시 일치해야 한다는 점을 배웠다. 또한 같은 정렬값을 가진 데이터가 여러 개 존재할 수 있으니 데이터 누락이 없기 위해서 `createdAt`, `id` 같은 `tie-breaker`를 함께 사용하는 것이 필요하다는 점도 알게 되었다.

- `tie-breaker` : 동점이 생겼을 때 순서를 결정하기 위해 추가로 사용하는 기준

### 4.4 뉴스 기사 백업/복구 시 관심사 매핑 누락 문제

#### Situation

뉴스 기사 복구 로직을 구현한 뒤 블로그 글을 작성하던 중에 기존 구조에서는 `articles` table의 row만 복구되고, `article_interests` 매핑 정보는 복구되지 않는다는 문제를 발견했다. 이 경우 복구된 기사는 DB에 존재하지만 어떠한 관심사와도 연결되지 않기 때문에 관심사 기반 필터링 조회에서 누락될 수 있었다.

#### Task

뉴스 기사 정보뿐만 아니라 뉴스 기사와 연결된 관심사 정보까지 함께 백업하고 복구해야 했다.

#### Action

백업 DTO에 `interestIds`를 추가했다.

```java
public record ArticleBackupDto(

    @Schema(description = "기사 ID")
    UUID id,

    @Schema(description = "출처")
    ArticleSource source,

    @Schema(description = "원본 기사 URL")
    String sourceUrl,

    @Schema(description = "제목")
    String title,

    @Schema(description = "날짜")
    Instant publishDate,

    @Schema(description = "요약")
    String summary,

    @Schema(description = "생성 시간")
    Instant createdAt,

    @Schema(description = "수정 시간")
    Instant updatedAt,

    @Schema(description = "삭제 시간")
    Instant deletedAt,

    @Schema(description = "연결된 관심사 ID 목록")
    List<UUID> interestIds
) {

}
```

백업 대상 기사를 조회할 때는 `ArticleInterest`와 `Interest`를 Fetch Join으로 함께 가져오도록 수정했다. 이를 통해 Mapper에서 관심사 ID를 추출할 때 N+1 문제가 발생되지 않도록 했다.

```java
@Query(value = """
    SELECT DISTINCT a
    FROM Article AS a
    LEFT JOIN FETCH a.articleInterests ai
    LEFT JOIN FETCH ai.interest
    WHERE a.publishDate >= :from
          AND a.publishDate < :to
          AND a.deletedAt IS NULL
    """)
List<Article> findAllWithInterests(
    @Param("from") Instant from,
    @Param("to") Instant to
);
```

복구 시에는 백업 DTO의 `interestIds` 중 현재 DB에 존재하는 관심사 ID만 찾고, `article_interests`에 `INSERT` 했다. `ON CONFLICT DO NOTHING` 을 적용한 `INSERT`문을 사용해 중복 `INSERT`가 발생해도 예외 없이 무시되도록 처리했다.

```java
@Modifying
@Query(value = """
    INSERT INTO article_interests (article_id, interest_id)
    SELECT :articleId, :interestId
    WHERE EXISTS (SELECT 1 FROM interests WHERE id = :interestId)
    ON CONFLICT (article_id, interest_id) DO NOTHING
    """,
    nativeQuery = true)
int insertArticleInterestIfNotExists(
    @Param("articleId") UUID articleId,
    @Param("interestId") UUID interestId
);
```

#### Result

뉴스 기사 복구 후에도 관심사 기반 조회와 필터링이 정상적으로 동작할 수 있게 되었다. 이 과정을 통해 데이터가 서비스에서 의미를 갖기 위해서는 필요한 관계가지 함께 고려해야 함을 배웠다.

---

## 5. 협업 및 피드백

프로젝트 초반에는 팀장으로서 팀 규칙, 회의 방식, R&R을 정리하는데 참여했다. 우리 팀은 Discord, Notion, GitHub를 사용해 소통했고, 평일 오전 10시에 정기 회의를 진행하며 각자의 진행 상황을 공유했다.

좋았던 점은 초기에 계획한 일정에 맞춰 대부분의 기능들을 구현할 수 있었다는 것이다. 역할 분담이 비교적 명확하게 나눠졌고, 팀원 간 의견 충돌 없이 원활하게 소통하며 프로젝트를 진행할 수 있었다. 각자의 담당 도메인이 분리되어 있었기 때문에 병렬로 작업하기 좋았고, 문제가 생겼을 때 회의에서 공유하고 토의 후 조정할 수 있었다.

배운 점도 많았다. 직접 구현하지 않은 기능이라도 팀원들이 구현한 K6 부하 테스트, Prometheus, Grafana 기반 커스텀 메트릭 대시보드를 확인하면서 모니터링을 배울 수 있었다.

아쉬웠던 점도 있었다. 개발에 집중하다 보니 PR 알림을 조금 늦게 확인한 경우가 있었고, 코드 리뷰에 많이 참여하지 못했다. 또한 코드 리뷰 후 merge된 후에 배포 환경에서 오류가 발생하는 경우가 있었는데, 이 오류를 리뷰 단계에서 발견하지 못한 점이 아쉬웠다.

팀장 역할에도 미숙한 점이 많았다. 프로젝트 초반에 의견을 제시할 때 기준을 명확히 말하기 보다 조심스럽게 되묻는 방식이 많았었다. 프로젝트를 진행하면서 팀장 역할에서는 의견을 묻더라도 먼저 기준을 제시하고, 결정이 필요한 부분은 더 명확하게 말하는 것이 중요하다는 것을 느꼈다.

---

## 6. 코드 품질 및 최적화

### 6.1 계층별 책임 분리

뉴스 기사 목록 조회에서 Controller는 요청 파라미터를 받고 기본 검증을 수행하며, Service는 요청한 사용자와 관심사 존재 여부 같은 비즈니스 검증을 담당했다. QueryDSL 기반 쿼리 구성과 커서 페이지네이션은 Service가 담당하기에는 Service의 책임이 너무 커져서 Repository 계층이 담당했다.

### 6.2 요청 객체 기반 파라미터 관리

뉴스 기사 목록 조회는 검색어, 관심사, 출처, 날짜 범위, 정렬 기준, 정렬 방향, cursor, after, limit 등 파라미터가 많았다. 처음에는 이 파라미터들을 하나씩 `@RequestParam`으로 받는 방식으로 구현했지만, Service, Repository로 가면서 메서드 시그니처가 지나치게 길어진다.

그래서 `ArticleSearchRequest` 요청 객체로 묶고, `@ModelAttribute`를 사용해서 쿼리 파라미터를 바인딩했다. 이를 통해 Controller 메서드의 가독성을 높였고, 검증 책임도 요청 DTO에 일부 위임할 수 있었다.

### 6.3 QueryDSL projection 활용

뉴스 기사 목록 조회 응답에는 `Article` entity 필드뿐만 아니라 댓글 수, 조회 수, 요청자의 조회 여부가 함께 필요했다. entity를 조회한 뒤 Mapper로 변환하는 방식은 하나하나 해야 되기 때문에 N+1 문제와 집계값 처리에 적합하지 않다고 생각했다.

그래서 QueryDSL projection을 사용해 ArticleDto를 바로 생성했다. 이를 통해서 필요한 값만 바로 조회할 수 있었다.

### 6.4 중복 제거와 공통 쿼리 분리

처음에는 `publishDate`, `commentCount`, `viewCount` 정렬별 메서드에 `projection`, `join`, `where`, `groupBy` 코드가 중복되어 있었다. 그래서 공통 요소를 `baseQuery(...)`로 분리하고, 정렬 기준에 따라 달라지는 `where`, `having`, `orderBy`만 별도로 붙이도록 리팩터링했다.

이로 인해 공통 필터나 projection 변경 시 여러 메서드를 동시에 수정해야 하는 번거로움을 줄일 수 있었다.

---

## 7. 향후 개선 사항 및 제안

### 7.1 배치 작업을 별도 ECS Task로 분리

이번 프로젝트에서는 뉴스 기사 배치 작업과 스케줄링을 애플리케이션 내부에서 진행했었다. 시간이 더 있었다면 배치 작업을 별도의 ECS Task로 분리해보고 싶다.

### 7.2 운영 환경 모니터링 강화

팀원들이 구현한 Prometheus, Grafana 기반 커스텀 메트릭 대시보드를 확인하면서 모니터링을 배울 수 있었다. 향후에는 개인적으로 백업/복구 배치에서의 성공/실패 횟수, 처리 시간, 복구 건수, S3 업로드 실패 횟수 등 좀 더 세밀한 지표를 체계적으로 붙여보고 싶다.

### 7.3 문서화 유지

오늘 개발 내용을 블로그 글로 정리하면서 뉴스 기사 복구 시 `article_interests` 매핑이 누락되는 문제를 발견하기도 했다.

문서화를 진행하면서 미처 생각 못했던 부분을 발견할 수 있기 때문에 앞으로도 오늘 개발 내용을 정리하는 습관을 유지하고 싶다.

---

# 팀 Notion 주소

[[SB10-5팀] Sprint Spring 백엔드 중급 팀 프로젝트](https://www.notion.so/jungh20000/SB10-Monew-Team05-342f59816c0280948b6ac9c8f80492eb?source=copy_link)

---

# 개인 개발 리포트

[개인 개발 리포트](https://www.notion.so/jungh20000/358f59816c0280f2852ded930830c166?source=copy_link)

---

# GitHub Repository 주소

[https://github.com/SB10-Part03-Team05/sb10-monew-team05](https://github.com/SB10-Part03-Team05/sb10-monew-team05)
