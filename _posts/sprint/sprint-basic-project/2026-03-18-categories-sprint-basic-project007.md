---
layout: single-editorial
title: '[Sprint 백엔드 초급 프로젝트 7일차] 전체 테스트 및 결과물 작업 진행'
excerpt: ''

categories:
  - Sprint 백엔드 초급 프로젝트
tags:
  - [Codeit Sprint, Codeit Sprint 백엔드 초급 프로젝트]

permalink: /categories/codeit-sprint/sprint-basic-project/sprint-basic-project007

toc: true
toc_sticky: true

date: 2026-03-18
last_modified_at: 2026-03-18
---

# QueryDSL 기반 지수 데이터 조회 작업과 전체 테스트 및 결과물 작업 진행

오전에는 어제부터 작업하던 지수 정보 조회, 지수 데이터 조회, 지수 차트 조회에 QueryDSL을 적용하고, 개별적으로 테스트 한 후, 배포한 다음에 팀 전체 테스트를 진행하기로 결정했다. 이 테스트에서 통과하면 바로 결과물 작업으로 넘어갈 예정이었다.

회의 시간에 결과물 작업에 대한 역할도 미리 나눴다. 나는 notion과 `README.md` 같은 문서화 작업을 맡았고, 각자의 역할을 먼저 마무리한 뒤 시간이 남으면 개인 개발 리포트를 작성하거나 PPT 제작을 돕기로 했다.

QueryDSL 적용을 위해 먼저 QueryDSL 의존성 설정을 진행했다.

```gradle
// build.gradle
dependencies {
// ...
    implementation "com.querydsl:querydsl-jpa:5.1.0:jakarta"
    annotationProcessor "com.querydsl:querydsl-apt:5.1.0:jakarta"
    annotationProcessor "jakarta.annotation:jakarta.annotation-api"
    annotationProcessor "jakarta.persistence:jakarta.persistence-api"
// ...
}

```

그 다음 `JPAQueryFactory`를 Bean으로 등록하기 위해 설정 클래스를 구현했다.

```java
@Configuration
// `private final JPAQueryFactory queryFactory` 문제 해결을 위한 bean 등록
public class QueryDslConfig {

    @PersistenceContext
    private EntityManager entityManager;

    @Bean
    public JPAQueryFactory jpaQueryFactory() {
        return new JPAQueryFactory(entityManager);
    }
}

```

이후 QueryDSL 기반 지수 데이터 조회용 Repository 인터페이스인 `IndexDataRepositoryQueryDsl`와 그 구현체인 `IndexDataRepositoryQueryDslImpl`를 구현했고,
기존에 존재했던 지수 데이터 조회용 Service와 Repository 로직을 리팩터링했다.

구현체를 구현할 때는 중복된 로직이 일부 있더라도, 정렬 필드 타입인 `BaseDate`, `BigDecimal`, `Long`에 따라 다른 메서드를 나눠 구현했다. 이렇게 중복된 메서드를 구현한 이유는 QueryDSL 기반 조회 로직을 가독성 있고 명시적으로 표현하여 디버깅이나 커서 비교 로직 등을 한 눈에 볼 수 있게 하기 위해서이다. 또한, 정렬 타입에 따라 분기하여 타입 안정성을 고려했다.

성능은 Postman으로 아래 요청을 보내며 확인했다.

`http://localhost:8080/api/index-data?indexInfoId=ec2194e8-8538-4309-9211-44e1f0d0ffa0&sortDirection=desc&size=10`

- 애플리케이션 실행 후 첫 실행 : 364ms
- 그 이후 실행은 10~13ms에서 점차 9ms 수렴
- 다음 페이지네이션은 10~12ms에서 점차 9ms로 수렴

구현하면서 헷갈리거나 오류가 발생했던 부분을 따로 정리해봤다. [바로가기](#querydsl을-적용하면서-헷갈렸던-점-정리)

남은 기능과 QueryDSL 적용을 마친 뒤 전체 테스트를 진행했다. 이 과정에서 자동 연동 지수 목록에서 특정 지수의 자동 연동을 활성화하면 목록에서 해당 지수가 사라지는 문제를 발견했고, 관련 내용을 팀원에게 전달했다.

전체 테스트는 큰 문제 없이 잘 끝났고, 이제 결과물 제작을 할 시간이다. 나는 개인 개발 리포트를 작성한 후, 미리 나눈 역할에 따라 notion, `README.md` 같은 문서화 작업을 맡아 진행했다.

## QueryDSL을 적용하면서 헷갈렸던 점 정리

Spring Data JPA를 사용하다가 QueryDSL 기반 조회를 구현하면 `Pageable`, `Sort`, `Slice`가 이전과 조금 다르게 사용된다는 것이 느껴진다. 이 부분이 헷갈려서 정리하기 위해 아래 글을 작성해봤다.

### 1. QueryDSL에서는 `Pageable`의 정렬이 자동 적용되지 않는다

처음에는 아래처럼 Pageable에 정렬 정보를 넣으면 QueryDSL에서도 그대로 반영될 거라고 생각했다.

```java
Pageable pageable = PageRequest.of(
    0,
    size,
    Sort.by(normalizedDirection, normalizedSortField).and(Sort.by(normalizedDirection, "id"))
);
```

하지만 커스텀 QueryDSL 구현에서는 `Sort` 정보가 자동으로 쿼리에 반영되지 않는다.

그 이유는 QueryDSL에서 직접 작성한 쿼리는 Spring Data가 대신 완성해주는 쿼리가 아니라, 개발자가 직접 `where`, `orderBy`, `limit`, `offset`을 구성하는 쿼리이기 때문이다.

실제 코드에서는 `pageable.getPageSize()`만 사용하기 때문에 `Sort.by(normalizedDirection, normalizedSortField).and(Sort.by(normalizedDirection, "id"))`같은 코드 없이 아래처럼 작성하면 된다.

```java
Pageable pageable = PageRequest.of(0, size);
```

이렇게 작성하면 `Pageable`은 페이지 크기만 전달하고, 실제 정렬은 QueryDSL의 `orderBy(...)`가 책임진다.

### 2. Spring Data 쿼리 메서드와 QueryDSL 커스텀 구현은 다르게 동작한다.

Spring Data JPA에서는 아래 코드터럼 Repository 메서드를 선언하고, 파라미터로 `Pageable`을 넣으면 `Pageable`이 자동 적용된다.

```java
Slice<IndexData> findByIndexInfoId(UUID indexInfoId, Pageable pageable);
```

내부적으로 Spring Data가 `Pageable`의 `size`, `offset`, `sort`를 읽고, 쿼리에 반영한다. 그리고 `Slice` 형태로 반환한다.

하지만 커스텀 QueryDSL에서는 다르다. Spring Data가 직접 만들어주는 쿼리가 아닌, **개발자가 직접 코드로 만드는 쿼리**이다. 그래서 `Pageable`를 메서드에 파라미터로 받더라도, Spring Data가 정렬이나 페이징을 자동으로 해주지 않는다.

### 3. 왜 `Slice`를 바로 만들지 않고, `List`를 만든 후 구현하는가?

커스텀 QueryDSL을 구현하다보면 중간에 `List`를 거치는데, 왜 `Slice`로 바로 만들지 않는지 의문점이 들었다.

이유는 두 가지이다.

- 첫 번째, 커스텀 QueryDSL에서 사용한 `fetch()` 메서드는 `Slice`가 아닌 `List<T>`를 반환한다.
- 두 번째, `Slice`의 기본 구현체는 `SliceImpl`인데, 이 객체를 생성할 때 `List`가 필요하다.
  - 예시 구현 순서
    1. `fetch()`로 `List` 조회
    2. `size + 1`개를 조회해 다음 페이지 존재 여부 확인
    3. `SliceImpl`로 감싸서 반환

### 4. 기존 `JpaRepository`에서는 왜 `Slice`가 반환 가능했을까?

```java
Slice<IndexData> findAllBy...(..., Pageable pageable);
```

`JpaRepository`에는 위와 같은 형태의 코드가 잘 동작했다. 그래서 앞에서 말했듯이 QueryDSL 기반 Repository 구현체를 구현할 때도 `Slice`를 바로 사용하면 될 것이라고 생각했다.

하지만 `JpaRepository` 자체가 `Slice`를 반환하는 것이 아니라, Spring Data Repository에서 쿼리 메서드를 사용할 때 `Slice`를 자동 지원해준다는 것이다. 그러나 커스텀 QueryDSL의 경우는 Spring Data가 자동으로 대신 처리해주지 않고, 개발자가 **직접** 쿼리 코드를 작성하고, `Slice`를 만들어야 한다.

---

# 팀 Notion 주소

[[SB10-3팀] Sprint Spring 백엔드 초급 팀 프로젝트](https://www.notion.so/jungh20000/SB10-3-Sprint-Spring-321f59816c02803aafbdf8a3354cfcdf?source=copy_link)

---

# GitHub Repository 주소

[https://github.com/sb10-team3/sb10-Findex-team3](https://github.com/sb10-team3/sb10-Findex-team3)
