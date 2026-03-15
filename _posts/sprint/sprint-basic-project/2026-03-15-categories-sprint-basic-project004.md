---
title: '[Sprint 백엔드 초급 프로젝트 4일차] 지수 데이터 조회 로직 구현'
excerpt: ''

categories:
  - Sprint 백엔드 초급 프로젝트
tags:
  - [Codeit Sprint, Codeit Sprint 백엔드 초급 프로젝트]

permalink: /categories/codeit-sprint/sprint-basic-project/sprint-basic-project004

toc: true
toc_sticky: true

date: 2026-03-15
last_modified_at: 2026-03-15
---

# 지수 데이터 조회 로직 구현

이번에는 지수 데이터 조회 로직을 구현할 차례다. 지수 데이터는 **지수**와 **날짜** 조건으로 조회할 수 있고, 소스 타입을 제외한 **모든 속성**으로 정렬 및 페이지네이션을 구현할 수 있다.

쿼리 파라미터로 받는 정렬 필드(sortField)는 String 타입이라서 JPQL에서 `:sortField`는 Column 이름으로 동작하지 않고, 그냥 문자열로 동작하게 되는 문제가 발생했다. 고민도 해보고, AI에게도 물어본 결과 sortField의 타입에 따라 다른 Repository 메서드를 만들어야 된다는 것을 알게 되었다.

이에 맞춰 `Service`에서 String 타입으로 오는 `sortField`의 타입에 맞게 parse하여 `cursor`의 타입과 함께 지수 데이터 조회 분기 로직을 만들었다.

`Repository`에서는 각 타입에 맞는 `@Query`를 가진 로직을 구현했다. Criterial APi나 Specification, QueryDSL을 활용해 쿼리 고도화가 가능하지만, 잘 알지 못해서 자주 사용하던 `@Query`문으로 구현했다.

전부 완성된 후, Postman에서 테스트 해봤는데, 다른 데이터 타입에서는 제대로 동작하지만 `LocalDate` 타입인 `baseDate`가 `:basDate`나 `:cursor` 형식으로 불러와질 때 PostgreSQL이 해당 JPQL을 SQL로 인식하지 못하는 문제가 발생했다. 좀 더 정확한 오류는 아래와 같다.

- **문제:** `LocalDate` 타입일 때 PostgreSQL이 JPQL을 SQL로 인식하지 못하는 문제

  ```bash
  org.postgresql.util.PSQLException: 오류: $3 매개 변수의 자료형을 알수가 없습니다.
  ```

  - Hibernate가 `(:startDate IS NULL OR i.baseDate >= :startDate)`인 JPQL을 SQL로 바꾸면 `(? is null or base_date >= ?)` 되는데, PostgreSQL에서는 `?`가 `date`인지 `uuid`인지 타입 확정을 하지 못한다. 그래서 `PSQLException: 오류: $3 매개 변수의 자료형을 알수가 없습니다.` 이런 오류가 발생한다.
  - 그런데 `(:indexInfoId IS NULL OR i.indexInfo.id = :indexInfoId)` 이 부분에서는 오류가 발생하지 않는데, 그 이유는 Hibernate도 보통 UUID는 비교적 명확하게 바인딩하기 때문이다.

위 문제를 해결 후, 프론트엔드에서도 테스트 해봤는데, `CursorPageResponse`가 `CursorPageResponseIndexDataDto`로 래핑되어 있어서 데이터를 불러오는 중에 오류가 발생했다. 그래서 `CursorPageResponse`를 `CursorPageResponseIndexDataDto`로 래핑하지 않고, `CursorPageResponseIndexDataDto`를 바로 출력하는 방식으로 `Service` 로직을 변경했다.

- **참고**
  - `toString()`은 일반적인 문자열 변환 메서드인데, `BigDecimal.toString()`을 하면 **지수 표기법(1E+7 등)**이 나올 수 있다.
  - `toPlainString()`은 `BigDecimal` 전용 메서드로, **지수 표기법** 없이 숫자를 그대로 풀어서 보여준다.
