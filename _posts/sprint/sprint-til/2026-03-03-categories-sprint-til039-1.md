---
title: '[TIL 39-1일 차] Spring Data JPA 도입하기 ~ Spring Transaction의 이해'
excerpt: 'Spring Data JPA 도입하기-페이징과 정렬 ~ Spring Transaction의 이해'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til039-1/

toc: true
toc_sticky: true

date: 2026-03-03
last_modified_at: 2026-03-03
---

# Spring Data JPA 도입하기

## <span style="background-color: #FFF9C4">1. 페이징과 정렬</span>

### 1-01. 필요성

대용량 데이터를 한 번에 조회하면 성능에 큰 영향을 준다.

Spring Data JPA의 페이징과 정렬 기능을 사용하면 효율적인 데이터 조회가 가능하다

- Request
  - `Pageable`: 페이징 정보를 캡슐화하는 인터페이스
  - `Sort`: 정렬 정보를 캡슐화하는 인터페이스
- Response
  - `Page`: 전체 페이지 정보를 포함한 결과
  - `Slice`: 부분 페이지, hasNext()로 다음 여부 확인

<br>

### 1-02. `Pageable` 인터페이스

페이징을 위한 정보를 담는 인터페이스이며, 페이지 번호, 페이지 크기, 정렬 정보를 포함

- `PageRequest.of()`로 인스턴스 생성
- `Pageable pageable = PageRequest.of(0, 10, Sort.by("username").descending());`
  - 첫 번째 파라미터 : 조회할 페이지 번호 (0부터 시작)
  - 두 번째 파라미터 : 한 페이지에 보여줄 데이터 개수
  - 세 번째 파라미터 : 정렬 기준과 방향을 지정하는 Sort 객체

<br>

### 1-03. `Sort` 인터페이스

정렬 조건을 명시적으로 설정하는 인터페이스로, 여러 필드 지정 가능

```java
Sort sort = Sort.by(
    Sort.Order.asc("username"),
    Sort.Order.desc("age")
);
```

<br>

### 1-04. Page vs Slice

- 상황
  - Page : ‘전체 데이터 개수’나 ‘총 페이지’가 필요할 때

    ```java
    Page<Member> page = memberRepository.findAll(pageable);

    // 페이지 내부 데이터
    List<Member> content = page.getContent();  // 실제 데이터 목록
    int totalPages = page.getTotalPages();     // 총 페이지 수
    long totalElements = page.getTotalElements(); // 전체 데이터 수
    boolean hasNext = page.hasNext();          // 다음 페이지 여부
    ```

  - Slice : ‘다음 페이지 여부’만 확인하면 될 때

    ```java
    Slice<Member> slice = memberRepository.findByAgeGreaterThan(20, pageable);

    // Slice 내부 데이터
    List<Member> content = slice.getContent(); // 실제 데이터 목록
    boolean hasNext = slice.hasNext();         // 다음 페이지 존재 여부
    ```

    - 빠른 이유 : count 쿼리를 아예 실행하지 않고, 다음 페이지 존재 여부 확인을 위해 내부적으로 limit + 1 조회

---

## <span style="background-color: #FFF9C4">2. JPA 활용 시 주의 사항</span>

### 2-01. N+1 문제

ORM(JPA, Hibernate) 환경에서 **1 번의 쿼리로 N 개의 데이터를 조회한 후, 각 데이터와 연관된 데이터를 추가 조회하면서 총 N+1번의 쿼리가 발생하는 문제**

- **발생 이유** : 지연 로딩(LAZY) 전략으로 연관 관계가 설정된 엔티티를 조회할 때, **각각 개별적으로 추가 조회**가 발생하기 때문
- 문제점 : 성능 저하, 복잡도 증가, 예측 어려움
- 해결 방법 : **Fetch Join**, **EntityGraph** 등

#### 1) Fetch Joiin

JPQL에서 JOIN FETCH 구문을 사용하면, **연관된 엔티티를 한 번에 조회**하는 방법

- `SELECT m FROM Member m JOIN FETCH m.orders`
- 한 번의 쿼리로 연관 객체까지 즉시 로드 가능하지만, 페이징이 불가능하다.

<br>

#### 2) EntityGraph

JPA에서 제공하는 `@EntityGraph`를 이용하여 **쿼리를 작성하지 않고 fetch 전략을 재정의**할 수 있는 방법

- `@EntityGraph(attributePaths = {"orders"})`
- 페이징과 코드 재사용이 가능하지만, 복잡할 수 있다.

<br>

### 2-02. JPA 로딩 전략

JPA에서 연관 관계를 가지는 엔티티를 조회할 때, 해당 연관 엔티티를 **언제(시점) 조회할 것인지 결정하는 전략**

- 즉시 로딩 (EAGER) : 엔티티를 조회할 때 **연관된 엔티티를 즉시 함께 조회**
  - SQL JOIN이 자동 수행됨
  - **“즉시 로딩”이지 “항상 JOIN”**은 아님
  - 예상치 못한 쿼리 수행으로 성능 저하가 유발될 수 있고, N+1 문제 발생 가능성이 높다
- 지연 로딩 (LAZY) : 연관된 엔티티는 **실제 사용하는 시점**에 쿼리를 내렸을 때 조회
  - 초기에는 Proxy 객체로 채워짐
  - 필요할 때만 조회하기에 성능에 유리함
  - LazyInitializationException 주의

<br>

### 2-03. 영속성 전이(Cascade)

부모 엔티티의 영속 상태 변경(`PERSIST`, `REMOVE` 등)이 자식 엔티티에 전이되도록 도와주는 기능

- 즉, **부모를 저장하거나 삭제하면 자식까지 함께 저장되거나 삭제되도록 하는 기능**
- **필요성**
  - 일일이 자식 엔티티까지 저장하거나 삭제하는 번거로움을 줄일 수 있음
  - 트랜잭션 단위의 일관성을 유지할 수 있음
- **주의점**
  - 대량 삭제, 대량 `INSERT`가 발생 가능
- 종류 : `PERSIST`, `MERGE`, `REMOVE`, `REFRESH`, `DETACH`

<br>

### 2-04. 고아 객체 제거(`orphanRemoval`)

컬렉션에서 엔티티가 제거되면 자동으로 **DB에서 삭제**해주는 기능

- 부모가 자식을 더 이상 참조하지 않으면 **DB에서 자동 삭제**
- 주의점
  - 영속성 관계 안에서 적용
  - 엔티티 상태가 명확히 유지되어야 함

---

# Spring Transaction의 이해

## <span style="background-color: #FFF9C4">1. 트랜잭션 기본 개념</span>

### 1-01. 트랜잭션 (Transaction)

데이터베이스 상태를 변화시키는 **작업의 논리적 단위**

- 핵심
  - **데이터 무결성 보장과 예외 상황 대비**
  - 복구 가능성을 항상 고려
  - ACID 보장을 위한 기능이 데이터베이스에 존재해야 함.
- **ACID (트랜잭션의 4가지 속성)**
  - **원자성(Atomicity)** : 트랜잭션 내 모든 작업은 **하나의 단위로 완전히 수행**되거나, 전부 수행되지 않아야 한다. 즉, 모두 성공하거나 모두 실패해야 함 (All or Nothing)
  - **일관성(Consistency)** : 트랜잭션 전후 **데이터 무결성 제약 조건을 반드시 만족**해야 한다.
  - **고립성(Isolation, 격리성)** : 동시에 수행되는 **트랜잭션이 서로 영향을 받지 않도록 분리**되어야 한다.
  - **지속성(Durability)** : 트랜잭션이 성공적으로 완료되면, 그 **결과는 DB에 영구적으로 반영**
- 트랜잭션 상태 흐름
  - 정상 흐름(**Commit**)
    1. Begin : 트랜잭션 시작
    2. 모든 작업 성공
    3. **Commit** ➡️ 데이터 영구 반영
  - 실패 흐름(**Rollback**)
    1. Begin : 트랜잭션 시작
    2. 중간에 예외 발생 (`RuntimeException` 등)
    3. **Rollback** ➡️ 이전 상태로 복원

---

## <span style="background-color: #FFF9C4">2. Spring의 트랜잭션 처리 방식</span>

### 2-01. 선언적 트랜잭션 (`@Transactional`)

AOP(Aspect-Oriented Programmin) 기반으로 트랜잭션을 관리하는 방식으로, `@Transactional` 애너테이션을 가장 많이 사용한다.

- 클래스 레벨 : 모든 `public` 메서드에 적용
- 메서드 레벨 : 해당 메서드에만 적용
- 예외 발생 시 자동으로 **Rollback**을 하고, 성공 시 자동으로 **Commit**을 한다.
- **AOP 기반 프록시 객체**를 통해 관리됨
- 장단점
  - 장점 : 비즈니스 로직과 분리, 유지모수 용이
  - 단점 : 복잡한 흐름 제어 어려움, 내부 메서드 호출과 `private` 메서드에 적용 불가

<br>

### 2-02. 프로그래밍 방식 트랜잭션 (`TransactionTemplate` / `PlatformTransactionManager`)

#### 1) `TransactionTemplate` (템플릿 방식)

람다, 콜백 기반으로 트랜잭션 범위를 명확히 지정하는 트랜잭션 관리 방식

- **Rollback** : `status.setRollbackOnly()`로 수동 지정 가능
- 복잡한 흐름이나 조건부 Rollback 시 유용

<br>

#### 2) `PlatformTransactionManager` (명령형 수동 방식)

가장 저수준의 트랜잭션 관리 API로, Begin·Commit·Rollback을 개발자가 직접 호출

- **Rollback** : `rollback(status)`로 명시 호출
- 복잡한 흐름, 중첩 트랜잭션, 다른 트랜잭션 속성 사용 시 필요

<br>

### 2-03. 트랜잭션 매니저 (`PlatformTransactionManager`)

Spring에서 트랜잭션을 일관된 방식으로 관리하기 위한 추상화된 인터페이스로, 데이터베이스나 JPA 등 다양한 환경에서 트랜잭션을 동일한 코드로 관리할 수 있게 도와준다.

- 역할
  - 트랜잭션을 시작하고 상태 관리
  - Commit
  - Rollback
- `@Transactional(transactionManager = "구현체")`
  - 구현체 : `DataSourceTransactionManager`, `JpaTransactionManager`, `HibernateTransactionManager`, `JtaTransactionManager`

---

## <span style="background-color: #FFF9C4">3. 트랜잭션 전파와 격리 수준</span>

### 3-01. 트랜잭션 전파

현재 트랜잭션이 진행 중일 때, 하위 메서드가 새로운 트랜잭션을 사용할 지, 기존 트랜잭션에 참여할 지를 결정하는 설정

- Spring에서 `@Transactional`의 `propagation` 속성을 통해 설정
  - default : `@Transactional(propagation = Propagation.REQUIRED)`
- 중요성
  - 비즈니스 로직의 일관성 유지
  - 예외 발생 시 Rollback 범위 제어
  - 성능 최적화
  - 동시성 제어
- 속성 옵션 : `REQUIRED`, `REQUIRES_NEW`, `SUPPORTS`, `MANDATORY`, `NEVER`, `NOT_SUPPORTED`, `NESTED`

- 독립적인 트랜잭션의 문제점
  - 하나의 프로세스에서 예외가 발생해도 다른 프로세스는 Commit되어 데이터 불일치가 발생할 수 있다.
- 여러 작업이 하나의 트랜잭션으로 관리되는 경우
  - 트랜잭션이 하나로 묶여있기 때문에 특정 작업을 처리하는 도중 예외가 발생해도 모두 하나의 트랜잭션 경계 내에 있으므로 전부 rollback 된다.

<br>

### 3-02. 트랜잭션 격리 수준

여러 트랜잭션이 동시에 실행될 때 데이터베이스의 일관성과 동시성을 제어하는 중요한 설정

- 격리 수준에 따라 한 트랜잭션이 다른 트랜잭션에서 변경한 데이터를 어느 정도까지 볼 수 있는지가 결정된다.
- 격리 수준은 동시성 제어의 핵심 ➡️ 데이터 무결성과 성능 사이의 균형을 맞출 수 있음
- `@Transactional` 애너테이션의 `isolation` 속성을 통해 트랜잭션 격리 수준 설정 가능
  - default : `@Transactional(isolation = Isolation.READ_COMMITTED)`
  - 격리 수준
    - `READ_UNCOMMITTED`, `READ_COMMITTED`, `REPEATABLE_READ`, `SERIALIZABLE`
- 격리 수준에 따른 문제 발생

  | 격리 수준        | Dirty Read | Non-repeatable Read | Phantom Read | 성능 |
  | ---------------- | ---------- | ------------------- | ------------ | ---- |
  | READ UNCOMMITTED | 발생       | 발생                | 발생         | 높음 |
  | READ COMMITTED   | 방지       | 발생                | 발생         | 중상 |
  | REPEATABLE READ  | 방지       | 방지                | 발생         | 중하 |
  | SERIALIZABLE     | 방지       | 방지                | 방지         | 낮음 |

---

## <span style="background-color: #FFF9C4">4. 트랜잭션 예외 처리와 Rollback</span>

### 4-01. 트랜잭션 Rollback 규칙

Spring은 AOP 기반 트랜잭션(선언적 트랜잭션)에서 **`RuntimeException` 또는 `Error`가 발생하면 자동으로 Rollback**한다.

- `Check Exception`은 예상 가능한 예외라 가정하여 `rollbackFor`가 없으면 Commit한다.
  - `Check Exception` : 컴파일 시 강제 처리 O
- `UnCheck Exception`에서 `noRollbackFor` 지정 시 Rollback 방지
  - `UnCheck Exception` : JVM이 강제 처리 X
