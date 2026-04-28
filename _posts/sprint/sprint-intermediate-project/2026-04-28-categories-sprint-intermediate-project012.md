---
title: '[Sprint 백엔드 초급 프로젝트 12일차] 뉴스 기사 복구 시 관심사 연결 정보까지 복원하도록 개선하기'
excerpt: ''

categories:
  - Sprint 백엔드 중급 프로젝트
tags:
  - [Codeit Sprint, Codeit Sprint 백엔드 중급 프로젝트]

permalink: /categories/codeit-sprint/sprint-intermediate-project/sprint-intermediate-project012

toc: true
toc_sticky: true

date: 2026-04-28
last_modified_at: 2026-04-28
---

# 뉴스 기사 복구 시 관심사 연결 정보까지 복원하도록 개선하기

뉴스 기사 수집 배치 중 데이터 유실이 발생할 수 있기 때문에, S3에 저장된 뉴스 기사 데이터를 필요할 때 DB로 복구하는 기능을 구현했다.

기능 구현을 정리한 블로그 글을 작성하던 중 중요한 문제를 발견했다. 바로 "뉴스 기사만 복구하면, 해당 뉴스 기사와 연결된 관심사 정보는 복구되지 않는다."는 것이다. 즉, `articles` row는 복구되더라도 `article_interests` 매핑 테이블이 복구되지 않기 때문에 복구된 뉴스 기사는 어떤 관심사와도 연결되지 않는 문제가 있었다.

이 문제를 해결하여 복구 후에도 기존과 동일하게 관심사 기반 조회나 필터링이 동작하려면 뉴스 기사 백업 데이터에 연결된 관심사 ID 목록도 함께 저장되어야 했다.

<br>
 
## 문제 발견: 뉴스 기사만 복구하면 관심사 연결이 없다.

기존의 복구 흐름은 아래와 같았다.

1. S3에서 `articles.json`을 읽음
2. 백업된 뉴스 기사 ID와 DB에 존재하는 뉴스 기사 ID를 비교
3. DB에 없는 뉴스 기사만 `articles` table에 `insert`
4. 복구된 뉴스 기사 ID 목록을 반환

문제는 `article_interests`이다.

예를 들어 백업할 때 A 기사가 경제, IT 관심사와 연결되어 있다고 가정했을 때

```
articles
- A

article_interests
- A / 경제
- A / IT
```

기존 로직대로 백업/복구를 한다면

```
articles
- A

article_interests
- 없음
```

이렇게 되면 A 기사는 DB에 존재하지만 어떠한 관심사와도 연결되어 있지 않다. 즉, 관심사 기반 뉴스 기사 조회에서 누락될 수 있다. 그래서 백업/복구 범위는 `articles`뿐만 아니라 뉴스 기사와 연결된 관심사 ID를 같이 백업하고, `article_interests` 매핑 정보까지 함께 복구해야 한다.

<br>
 
## 해결 1. 백업 DTO에 `interestIds` 추가

백업 DTO에 연결된 관심사 ID 목록을 추가했다.

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

이제 S3에 저장되는 `articles.json`에는 뉴스 기사 정보뿐만 아니라 해당 뉴스 기사와 연결된 관심사 ID 목록도 함께 저장된다.

아래는 예시 형식이다.

```json
[
  {
    "id": "11111111-1111-1111-1111-111111111111",
    "source": "NAVER",
    "sourceUrl": "https://news.example.com/1",
    "title": "뉴스 제목",
    "publishDate": "2026-04-27T01:00:00Z",
    "summary": "뉴스 요약",
    "createdAt": "2026-04-27T01:05:00Z",
    "updatedAt": "2026-04-27T01:05:00Z",
    "deletedAt": null,
    "interestIds": ["aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"]
  }
]
```

이렇게 구현해야 누락된 뉴스 기사 복구 시에 `article_interests` 매핑 데이터를 다시 만들 수 있다.

<br>
 
## 해결 2. Mapper에서 `interestIds` 추출

`Article` entity에서 `ArticleBackupDto`로 변환할 때, `interestIds`는 일반 필드가 아니므로 `Article`에서 `interest.id`로 접근해야 한다.

그래서 `ArticleBackupMapper`에

`default`를 사용해 인터페이스 안에서 구현부가 있는 메서드를 작성한 후, 직접 변환 로직을 추가했다.

```java
@Mapper(componentModel = "spring")
public interface ArticleBackupMapper {

  @Mapping(target = "interestIds", expression = "java(toInterestIds(article))")
  ArticleBackupDto toDto(Article article);

  default List<UUID> toInterestIds(Article article) {
    if (article.getArticleInterests() == null) {
      return List.of();
    }

    return article.getArticleInterests().stream()
        .map(articleInterest -> articleInterest.getInterest())
        .filter(interest -> interest != null && interest.getId() != null)
        .map(interest -> interest.getId())
        .toList();
  }
}
```

<br>
 
## 해결 3. Fetch Join으로 관심사 정보까지 함께 조회

Mapper에서 `article.getArticleInterests()`를 순회하려면 백업 대상 기사를 조회할 때 연결된 관심사 정보도 함께 가져오는 것이 좋다.

기존에는 Spring Data JPA 메서드를 사용했었다.

```java
List<Article> findAllByPublishDateGreaterThanEqualAndPublishDateLessThanAndDeletedAtIsNull(
    Instant from,
    Instant to
);
```

하지만 이 메서드는 조건에 맞는 `Article`만 조회한다. `articleInterests`나 `interests`까지 함께 가져오는 쿼리가 아니다. 더불어 `Article` entity에서 `articleInterests`를 `@OneToMany`로 설정했기 때문에 지연 로딩이 발생하므로 Mapper에서 `article.getArticleInterests()`를 호출할 때 각 뉴스 기사마다 추가 쿼리가 발생할 수 있다. 즉, 백업 과정에서 N+1 문제가 발생할 수 있다.

그래서 백업 전용 조회 메서드를 만들고 Fetch Join을 사용했다.

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

위 코드에서 `Article`과 `ArticleInterest`가 1:N 관계이기 때문에 하나의 뉴스 기사가 여러 개의 관심사와 연결되어 있으면 같은 Article이 여러 번 조회될 수 있다. 그래서 `DISTINCT`를 붙였다.

<br>
 
### 백업 로직 수정

백업 로직은 기존의 Spring Data JPA 메서드 대신 `findAllWithInterests()`를 사용하도록 수정했다.

```java
public void backup(LocalDate backupDate) {
  validateBackupDate(backupDate);

  Instant from = backupDate.atStartOfDay(KST).toInstant();
  Instant to = backupDate.plusDays(1).atStartOfDay(KST).toInstant();

  List<ArticleBackupDto> backupData = articleRepository
      .findAllWithInterests(from, to)
      .stream()
      .map(articleBackupMapper::toDto)
      .toList();

  String key = createBackupKey(backupDate);

  s3ArticleBackupFileStorage.upload(key, backupData);
}
```

이제 백업 파일에 뉴스 기사 정보와 연결된 관심사 ID 목록까지 함께 저장된다.

<br>

## 해결 4. 복구 시 `article_interests`에도 함께 `insert`

복구 로직 수정도 필요했다.

기존에는 DB에 없는 뉴스 기사만 `articles` table에 `insert`했다. 이제는 뉴스 기사 `insert` 후 백업 DTO에 있는 `interestIds`를 이용해 `article_interests` 매핑도 복구해야 한다.

```java
articlesToBeRestored.forEach(dto -> {
  articleRepository.insertRestoredArticle(
      dto.id(),
      dto.source().toString(),
      dto.sourceUrl(),
      dto.title(),
      dto.publishDate(),
      dto.summary(),
      dto.createdAt(),
      dto.updatedAt()
  );

  restoreArticleInterests(dto);
});
```

뉴스 기사 복구 후 `restoreArticleInterests(dto)`를 호출한다.

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

백업된 관심사 ID를 그대로 사용하지 않고 현재 DB에 존재하는 실제 관심세 ID만 골라서 매핑을 복구한다. 이렇게 하는 이유는 복구 당시 해당 관심사가 삭제되었을 수 있기 때문이다.

<br>

### 존재하는 관심사 ID만 조회

Spring Data JPA에서 제공하는 `findAllById()` 메서드가 아닌, ID만 따로 반환하는 로직을 구현했다.

```java
@Query(value = "SELECT i.id FROM Interest AS i WHERE i.id IN (:interestIds) ")
List<UUID> findExistingInterestIds(@Param("interestIds") List<UUID> interestIds);
```

<br>

### `article_interests` `insert` 쿼리

1. `interestId`가 `interest` table에 실제로 존재할 때
2. 같은 `article_id`와 `interest_id` 매핑이 존재하지 않을 때

`insert`가 발생한다.

```java
@Modifying
@Query(value = """
    INSERT INTO article_interests (article_id, interest_id)
    SELECT :articleId, :interestId
    WHERE EXISTS (SELECT 1 FROM interests WHERE id = :interestId)
          AND NOT EXISTS (
                SELECT 1 FROM article_interests
                WHERE article_id = :articleId
                  AND interest_id = :interestId
          )
    """,
    nativeQuery = true)
int insertArticleInterestIfNotExists(
    @Param("articleId") UUID articleId,
    @Param("interestId") UUID interestId
);
```

<br>

## S3 백업/복구 흐름 유지

이렇게 변경했지만 S3 백업/복구 로직의 흐름은 유지되었다.

복구 요청이 들어오면 `from`과 `to`를 KST 기준 날짜로 변환 후, 하루씩 순회한다.

```java
while (!fromDate.isAfter(toDate)) {
  LocalDate restoreDate = fromDate;

  List<ArticleBackupDto> backupArticleList = s3ArticleBackupFileStorage
      .readArticles(restoreDate);

  restoreArticleList.add(restoreArticle(restoreDate, backupArticleList));

  fromDate = fromDate.plusDays(1);
}
```

---

# 팀 Notion 주소

[[SB10-5팀] Sprint Spring 백엔드 중급 팀 프로젝트](https://www.notion.so/jungh20000/SB10-Monew-Team05-342f59816c0280948b6ac9c8f80492eb?source=copy_link)

---

# GitHub Repository 주소

[https://github.com/SB10-Part03-Team05/sb10-monew-team05](https://github.com/SB10-Part03-Team05/sb10-monew-team05)
