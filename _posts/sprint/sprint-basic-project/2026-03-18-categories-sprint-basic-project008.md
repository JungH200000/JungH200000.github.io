---
title: '[Sprint 백엔드 초급 프로젝트 7일차] Troubleshooting'
excerpt: ''

categories:
  - Sprint 백엔드 초급 프로젝트
tags:
  - [Codeit Sprint, Codeit Sprint 백엔드 초급 프로젝트]

permalink: /categories/codeit-sprint/sprint-basic-project/sprint-basic-project008

toc: true
toc_sticky: true

date: 2026-03-18
last_modified_at: 2026-03-18
---

# Troubleshooting

개인 개발 리포트를 작성하면서 이때까지 발생한 오류 중 몇가지를 Troubleshooting으로 정리해봤다.

## 문제점 및 해결 과정

### PostgreSQL에서 `LocalDate` 조건과 커서 기반 페이지네이션 처리 중 발생한 타입 추론 오류 해결

지수 데이터 목록 조회 기능을 구현할 때 **날짜 범위 필터**와 **커서 기반 페이지네이션**을 포함해야 했다.

초기 구현에서 JPQL에 `AND (:startDate IS NULL OR i.baseDate >= :startDate)` 형태로 조건을 처리했는데, PosgreSQL 환경에서 `LocalDate` 타입 파라미터를 포함한 쿼리를 실행할 때 “`SQLState: 42P18` , 오류: $\*" 매개 변수의 자료형을 알 수 없습니다.”라는 오류가 발생했다.

[4-1problem1.png]

처음에는 `startDate`, `endDate`가 포함된 조회한 요소 전체 수 조회에서 문제가 발생했고, 수정한 뒤에는 두 번째 페이지 조회에서 cursor 조건 때문에 동일한 유형의 오류가 다시 발생했다.

- **문제 코드**

  ```java
  public interface IndexDataRepository extends JpaRepository<IndexData, UUID> {
      boolean existsByIndexInfoIdAndBaseDate(UUID indexInfoId, LocalDate baseDate);

      @Query("SELECT COUNT(i) FROM IndexData AS i " +
              "WHERE (:indexInfoId IS NULL OR i.indexInfo.id = :indexInfoId) " +
              "   AND (:startDate IS NULL OR i.baseDate >= :startDate) " +
              "   AND (:endDate IS NULL OR i.baseDate <= :endDate)")
      Long countElements(@Param("indexInfoId") UUID indexInfoId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

      // 정렬 기준이 LocalDate일 때
      @Query("SELECT i FROM IndexData AS i " +
              "WHERE (:indexInfoId IS NULL OR i.indexInfo.id = :indexInfoId) " +
              "   AND (:startDate IS NULL OR i.baseDate >= :startDate) " +
              "   AND (:endDate IS NULL OR i.baseDate <= :endDate) " +
              "   AND (:cursor IS NULL OR i.baseDate < :cursor OR (i.baseDate = :cursor AND i.id < :idAfter))")
      Slice<IndexData> findAllByBaseDateCursorDesc(
              @Param("indexInfoId") UUID indexInfoId,
              @Param("startDate") LocalDate startDate,
              @Param("endDate") LocalDate endDate,
              @Param("idAfter") UUID idAfter,
              @Param("cursor") LocalDate normalizedCursor,
              Pageable pageable
      );
      // ...
  }
  ```

실행 로그와 바인딩된 파라미터를 확인했을 때, 분명 파라미터가 제대로 들어가는데 조회가 실패하는 원인을 파악하기 어려웠다. 그래서 다른 타입일 때의 정렬 로직을 실행해봤고, 해당 로직은 정상 동작했다. 이로 인해 한 가지 추론을 할 수 있었는데, 바로 타입과 관련된 문제였다. 분명 LocalDate 때문에 발생하는 문제라고 생각했다. 좀 더 정확한 파악을 위해 AI 도구의 도움을 받아 원인을 분석했고, PostgreSQL이 LocalDate 파라미터와 IS NULL 조건이 포함된 JPQL을 실행할 때 매개변수 타입을 추론하지 못한다는 점을 알게 되었다.

이것을 해결하기 위해 날짜 범위 조건은 `COALESCE`를 사용하는 로직으로 변경했고, `baseDate` 정렬의 경우 `cursor`가 없는 첫 페이지 조회와 `cursor`가 있는 다음 페이지 조회를 Repository에 분리하여 구현했다.

- **수정 코드**
  - `COALESCE(:startDate, i.baseDate)` :
    - `:startDate` 값이 있으면 `:startDate` 사용,
    - `null`이면 `i.baseDate` 사용 ➡️ 자기 자신과 비교 ➡️ 항상 `true` ➡️ 전체 데이터 조회

  ```java
  public interface IndexDataRepository extends JpaRepository<IndexData, UUID> {
      @Query("SELECT COUNT(i) FROM IndexData AS i " +
              "WHERE (:indexInfoId IS NULL OR i.indexInfo.id = :indexInfoId) " +
              "   AND i.baseDate >= COALESCE(:startDate, i.baseDate) " +
              "   AND i.baseDate <= COALESCE(:endDate, i.baseDate)")
      Long countElements(@Param("indexInfoId") UUID indexInfoId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

      // 정렬 기준이 LocalDate일 때
      // cursor == null (첫 페이지)
      @Query("SELECT i FROM IndexData AS i " +
              "WHERE (:indexInfoId IS NULL OR i.indexInfo.id = :indexInfoId) " +
              "   AND i.baseDate >= COALESCE(:startDate, i.baseDate) " +
              "   AND i.baseDate <= COALESCE(:endDate, i.baseDate)")
      Slice<IndexData> findAllByBaseDateFirstPage(
              @Param("indexInfoId") UUID indexInfoId,
              @Param("startDate") LocalDate startDate,
              @Param("endDate") LocalDate endDate,
              Pageable pageable
      );

      // cursor != null (다음 페이지)
      @Query("SELECT i FROM IndexData AS i " +
              "WHERE (:indexInfoId IS NULL OR i.indexInfo.id = :indexInfoId) " +
              "   AND i.baseDate >= COALESCE(:startDate, i.baseDate) " +
              "   AND i.baseDate <= COALESCE(:endDate, i.baseDate)" +
              "   AND (i.baseDate < :cursor OR (i.baseDate = :cursor AND i.id < :idAfter))")
      Slice<IndexData> findAllByBaseDateNextPageDesc(
              @Param("indexInfoId") UUID indexInfoId,
              @Param("startDate") LocalDate startDate,
              @Param("endDate") LocalDate endDate,
              @Param("idAfter") UUID idAfter,
              @Param("cursor") LocalDate normalizedCursor,
              Pageable pageable
      );
      // ...
  }
  ```

그 결과 날짜 범위가 포함된 조회와 `baseDate` 기준 커서 페이지네이션이 모두 정상 동작하게 되었다.

[4-1solve2.png]

[4-1solve1.png]

이 과정을 통해 `null`이 될 수 있는 파라미터를 포함한 JPQL은 데이터베이스별 동작 차이를 고려하여 로직을 구현해야 한다는 것을 깨달았고, QueryDSL을 이용해 동적 쿼리를 대처하는 것이 더 안전할 것 같다고 생각했다.

### 프론트엔드 연동 테스트 중 수정 API 요청 DTO 불일치 문제 대응

프론트엔드와 수정 API를 연동하는 과정에서 요청이 실패하는 문제가 발생했다.

[4-2problem1.png]

원인을 확인해보니, 프론트엔드에서 백엔드 Request DTO에 정의되지 않은 필드를 함께 전송하고 있었고, 백엔드에서는 Jackson의 `fail-on-unknown-properties` 옵션으로 정의되지 않은 필드가 들어오는 것을 막고 있어서, 역직렬화 오류가 발생하고 있는 거였다.

프로젝트 진행을 고려해봤을 때 연동 안정성을 확보하는 것이 중요하다는 생각이 들어서 정의되지 않은 요청 필드의 전송을 무시하도록 `fail-on-unknown-properties`옵션을 비활성화했다.

이로 인해, 수정 API가 정상 동작할 수 있었다.

다만, 이 방식은 `fail-on-unknown-properties` 옵션이 비활성화 되어 있기 때문에, 정의되지 않은 요청 필드가 들어갈 수 있다는 문제점이 있다. 추후, API 명세와 프론트엔드 구현 사이의 개선이 필요하다고 생각된다.

---

# GitHub Repository 주소

[https://github.com/sb10-team3/sb10-Findex-team3](https://github.com/sb10-team3/sb10-Findex-team3)
