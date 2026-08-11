---
layout: single-editorial
title: '[Sprint 백엔드 초급 프로젝트] Findex 개인 개발 리포트'
excerpt: ''

categories:
  - Sprint 백엔드 초급 프로젝트
tags:
  - [Codeit Sprint, Codeit Sprint 백엔드 초급 프로젝트]

permalink: /categories/codeit-sprint/sprint-basic-project/sprint-basic-project010

toc: true
toc_sticky: true

date: 2026-03-20
last_modified_at: 2026-03-20
---

# Findex 개인 개발 리포트

## 1. 프로젝트 개요

외부 금융 Open API와 연동하여 사용자에게 금융 지수 데이터를 제공하고, 지수 정보와 그 정보에 해당하는 지수 데이터 연동 자동화를 통해 최신 데이터를 불러와 지수별 성과 분석과 이동 평균선 차트로 데이터를 분석할 수 있는 대시보드 서비스

---

## 2. 담당한 작업

- **역할**
  - **지수 데이터 관리 기능 전반을 담당**
    - `IndexData` Entity, DTO, Mapper, Controller, Service를 구현해 지수 데이터 등록, 조회, 수정, 삭제 API 구현
    - 등록 시 `지수 정보 ID`와 `기준 날짜` 조합의 중복을 방지하고, 수정 시 변경된 값만 반영되도록 로직 구현
  - **지수 데이터 검증 로직 구현**
    - `고가`, `저가`, `시가`, `종가`의 관계를 검증하여 잘못된 데이터 입력 방지
    - 존재하지 않는 데이터 조회, 잘못된 요청 값, 변경 사항이 없는 수정 요청 등에 대한 적절한 예외가 발생하도록 구현
  - **지수 데이터 목록 조회 성능 및 구조 개선**
    - QueryDSL 기반으로 `지수 정보 ID`, `날짜 범위` , 정렬 조건을 반영한 목록 조회 로직 구현
    - 커서 기반 페이지네이션을 적용하고, `LocalDate`, `BigDecimal`, `Long` 타입별로 커서 비교 로직을 분리해 가독성을 높임
  - **공통 API 처리 기반 구성**
    - `/exception`, `/config`, `/pagination` 패키지를 직접 구현하여 전역 예외 처리, QueryDSL 설정, 커서 페이지네이션 응답 구조를 공통화
    - 이를 통해, API 전체적으로 일관된 오류 응답과 조회 구조를 사용할 수 있도록 함
- **기여**
  - **PR 리뷰**에서 조회 로직 및 Entity 매핑 관련 문제 발견
    - 지수 목록/연동 작업 목록 조회 로직에서 `JOIN` 누락, 중복 로직 적용 문제 등 데이터 조회와 관련된 문제 발견
    - `fetch join` 누락으로 인한 N+1 문제 가능성 발견
    - Enum 매핑, UUID 생성 전략 등 Entity 설정 검토
  - 프론트엔드 **테스트**에서
    - 수정 API 호환성 문제를 확인하고 대응
    - 자동 연동 목록 오류 및 지수 성과 랭킹 조회 오류를 발견하고 팀원과 공유

---

## 3. 기술적 성과

### 3-1. 기술 스택

- **백엔드**
  :spring_icon: **Spring Boot**, :spring_icon: **Spring Data JPA**
- **데이터베이스**
  **:postgresql: PostgreSQL**
- **라이브러리**
  **:querydsl: QueryDSL**
  **:mapstruct: MapStruct**
  **:springdoc-openapi: springdoc-openapi**
- **배포**
  **:railway-io: Railway.io**
- **협업**
  **:github_icon: GitHub**
  **:discord: Discord**

<br>

### 3-2. 기술적 성과

- Spring Boot, Spring Data JPA, PostgreSQL기반 지수 데이터 수동 등록/수정/삭제 및 목록 조회 API 구현
- 지수 데이터 목록 조회 기능에는 조건 필터링, 정렬, 커서 페이지네이션을 적용하여 대량의 데이터도 조회할 수 있게 구현
- 복잡해진 쿼리 로직을 QueryDSL 기반으로 리팩터링하여 조건 처리와 커서 비교 로직의 가독성과 유지 보수성을 높임
- springdoc-openapi로 API 명세와 구현을 일치 시킴.

---

## 4. 문제점 및 해결 과정

### 4-1. PostgreSQL에서 `LocalDate` 조건과 커서 기반 페이지네이션 처리 중 발생한 타입 추론 오류 해결

지수 데이터 목록 조회 기능을 구현할 때 **날짜 범위 필터**와 **커서 기반 페이지네이션**을 포함해야 했다.

초기 구현에서 JPQL에 `AND (:startDate IS NULL OR i.baseDate >= :startDate)` 형태로 조건을 처리했는데, PostgreSQL 환경에서 `LocalDate` 타입 파라미터를 포함한 쿼리를 실행할 때 “`SQLState: 42P18` , 오류: $\* 매개 변수의 자료형을 알 수 없습니다.”라는 오류가 발생했다.

![image.png](/assets/images/posts_img/basic-project/image.png)

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

실행 로그와 바인딩된 파라미터를 확인했을 때, 분명 파라미터가 제대로 들어가는데 조회가 실패하는 원인을 파악하기 어려웠다. 그래서 다른 타입일 때의 정렬 로직을 실행해봤고, 해당 로직은 정상 동작했다. 이로 인해 한 가지 추론을 할 수 있었는데, 바로 **타입과 관련된 문제**였다. 분명 `LocalDate` 때문에 발생하는 문제라고 생각했다. 좀 더 정확한 파악을 위해 AI 도구의 도움을 받아 원인을 분석했고, PostgreSQL이 `LocalDate` 파라미터와 `IS NULL` 조건이 포함된 JPQL을 실행할 때 매개변수 타입을 추론하지 못한다는 점을 알게 되었다.

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

![solve2.png](/assets/images/posts_img/basic-project/solve2.png)

![solve1.png](/assets/images/posts_img/basic-project/solve1.png)

이 과정을 통해 `null`이 될 수 있는 파라미터를 포함한 JPQL은 데이터베이스별 동작 차이를 고려하여 로직을 구현해야 한다는 것을 깨달았고, QueryDSL을 이용해 동적 쿼리를 대처하는 것이 더 안전할 것 같다고 생각했다.

<br>

### 4-2. 프론트엔드 연동 테스트 중 수정 API 요청 DTO 불일치 문제 대응

프론트엔드와 수정 API를 연동하는 과정에서 요청이 실패하는 문제가 발생했다.

![solve1.png](/assets/images/posts_img/basic-project/image%201.png)

원인을 확인해보니, 프론트엔드에서 백엔드 Request DTO에 정의되지 않은 필드를 함께 전송하고 있었고, 백엔드에서는 Jackson의 `fail-on-unknown-properties` 옵션으로 정의되지 않은 필드가 들어오는 것을 막고 있어서, 역직렬화 오류가 발생하고 있는 거였다.

프로젝트 진행을 고려해봤을 때 연동 안정성을 확보하는 것이 중요하다는 생각이 들어서 정의되지 않은 요청 필드의 전송을 무시하도록 `fail-on-unknown-properties`옵션을 비활성화했다.

이로 인해, 수정 API가 정상 동작할 수 있었다.

다만, 이 방식은 `fail-on-unknown-properties` 옵션이 비활성화 되어 있기 때문에, 정의되지 않은 요청 필드가 들어갈 수 있다는 문제점이 있다. 추후, API 명세와 프론트엔드 구현 사이의 개선이 필요하다고 생각된다.

---

## 5. 협업과 피드백

프로젝트 초반에 API 문서와 요구사항을 기준으로 역할을 분담하고, 커밋 컨벤션, PR 규칙, Todo 규칙 등을 팀원들과 함께 논의했다. 특히, 지수 데이터 구현 범위가 넓어 두 명이서 나눠 구현했다.

개발 과정에서 PR 리뷰와 테스트를 통해 피드백을 주고 받았다. 나는 조회 관련 PR에서 `JOIN` 누락, `fetch join` 미적용, `LocalDate` 조건 처리 문제 등을 발견해 팀원들에게 전달했고, 프론트엔드 테스트 과정에서 수정 API 호환성 문제와 지수 연동 목록 조회 문제, 지수 성과 랭킹 조회 문제를 발견해 팀원들에게 공유했다.

PR 리뷰를 하는 과정에서 내가 작성한 지수 데이터 목록 조회 로직의 구조가 다른 도메인의 조회 로직에서도 비슷한 형태로 확장되고 적용될 수 있음을 보면서 구조적으로 잘 설계하는 것이 중요하다는 것을 느꼈다.

이번 프로젝트에서 이전에 진행해봤던 프로젝트와는 달리 협업은 처음부터 서로의 규칙을 정하고, GitHub Issues와 PR을 활용해 지속적으로 코드를 점검하는 과정을 배웠다. 또한, 이렇게 PR 리뷰를 해도 막상 테스트에 들어가면 추가적인 오류가 발견되는 경우가 많다는 것을 경험하면서, 조금 더 꼼꼼하게 봐야겠다는 다짐을 했다.

- PR
  - 자잘한 오타
    - [https://github.com/sb10-team3/sb10-Findex-team3/pull/121#discussion_r2944402085](https://github.com/sb10-team3/sb10-Findex-team3/pull/121#discussion_r2944402085)
  - 조회 관련 로직 PR에서 데이터 조회 시 ID를 이용해 다른 테이블을 `JOIN` 하지 않아 원하는 값이 출력이 되지 않는 문제
    - [https://github.com/sb10-team3/sb10-Findex-team3/pull/111#discussion_r2943834395](https://github.com/sb10-team3/sb10-Findex-team3/pull/111#discussion_r2943834395)
  - 다른 테이블의 필드를 가져오는데 `fetch join`을 사용하지 않아 발생한 N+1 문제
    - [https://github.com/sb10-team3/sb10-Findex-team3/pull/73#discussion_r2937752279](https://github.com/sb10-team3/sb10-Findex-team3/pull/73#discussion_r2937752279)
    - [https://github.com/sb10-team3/sb10-Findex-team3/pull/68#discussion_r2937716463](https://github.com/sb10-team3/sb10-Findex-team3/pull/68#discussion_r2937716463)
  - PostgreSQL이 `LocalDate` 조건이 들어있는 JPQL에서 `IS NULL` 처리와 관련된 문제
    - [https://github.com/sb10-team3/sb10-Findex-team3/pull/111#discussion_r2943679665](https://github.com/sb10-team3/sb10-Findex-team3/pull/111#discussion_r2943679665)
  - Spring Data가 대신 처리해주는 로직이 중복 적용됨
    - [https://github.com/sb10-team3/sb10-Findex-team3/pull/89#discussion_r2938608455](https://github.com/sb10-team3/sb10-Findex-team3/pull/89#discussion_r2938608455)
  - Enum에 `@Enumerated(EnumType.STRING)` 미 추가
    - [https://github.com/sb10-team3/sb10-Findex-team3/pull/13#discussion_r2922702846](https://github.com/sb10-team3/sb10-Findex-team3/pull/13#discussion_r2922702846)
  - `@GeneratedValue` UUID로 설정
    - [https://github.com/sb10-team3/sb10-Findex-team3/pull/13#discussion_r2922694866](https://github.com/sb10-team3/sb10-Findex-team3/pull/13#discussion_r2922694866)
- 테스트
  - 문제는 지수 성과 랭킹 전체 조회 기능이었다. 전체 조회에서는 1순위만 출력되고, 지수로 단건 조회 시에는 아예 출력되지 않는 문제
  - 자동 연동 지수 목록에서 특정 지수의 자동 연동을 활성화하면 목록에서 해당 지수가 사라지는 문제를 발견했고, 관련 내용을 팀원에게 전달

---

## 6. 코드 품질 및 최적화

지수 데이터 목록 조회 로직을 QueryDSL 기반으로 리팩터링하면서, 가독성을 높이는 방향으로 구현했다. 정렬 기준 필드 타입이 `LocalDate`, `BigDecimal`, `Long`으로 달랐기 때문에, 하나의 메서드로 통합해서 구현하기 보다 타입별로 다른 메서드로 분리해서 구현했다. 이로 인해 중복된 로직이 존재하더라도, 하나의 메서드로 묶어서 표현하는 것보다 조건 분기와 커서 비교 로직을 명확하게 드러내는 것이 가독성과 디버깅에 유리하다고 판단했다. 더불어 정렬 타입에 따라 메서드를 분리함으로써 타입 안정성도 확보할 수 있었다.

---

## 7. 향후 개선 사항 및 제안

- PostgreSQL을 사용하기 전, 파라미터가 `IS NULL`일 때 발생할 수 있는 타입 추론 문제를 미리 점검하는 것이 좋을 것 같다.
- PR 리뷰에서 발견할 수 있었던 문제를 테스트 과정에서 발견한 부분이 많기 때문에 좀 더 꼼꼼하게 PR 리뷰를 할 생각이다.

---

# 팀 Notion 주소

[[SB10-3팀] Sprint Spring 백엔드 초급 팀 프로젝트](https://www.notion.so/jungh20000/SB10-3-Sprint-Spring-321f59816c02803aafbdf8a3354cfcdf?source=copy_link)

---

# 개인 개발 리포트

[개인 개발 리포트](https://www.notion.so/jungh20000/327f59816c0280efac65e42af87100cb?source=copy_link)

---

# GitHub Repository 주소

[https://github.com/sb10-team3/sb10-Findex-team3](https://github.com/sb10-team3/sb10-Findex-team3)
