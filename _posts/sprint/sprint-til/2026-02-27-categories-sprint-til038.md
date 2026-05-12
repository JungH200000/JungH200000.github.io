---
title: '[TIL 38일 차] Spring Data JPA 도입하기'
excerpt: 'Spring Data JPA 도입하기-ORM과 JPA의 이해 ~ Entity 연관관계 매핑'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til037/

toc: true
toc_sticky: true

date: 2026-02-27
last_modified_at: 2026-02-27
---

# Spring Data JPA 도입하기

## <span style="background-color: #FFF9C4">1. ORM과 JPA의 이해</span>

### 1-01. JPA 주요 구성요소

- **Entity** : DB 테이블과 매핑되는 자바 클래스로, `@Entity` 애너테이션으로 명시한다.
  ```java
  @Entity
  @Table(name = "members")
  public class Member {
      @Id // Primary Key 지정
      @GeneratedValue(strategy = GenerationType.IDENTITY) // PK 자동 생성 전략
      private Long id;
      private String name;
  }
  ```
- EntityManager : JPA의 핵심 인터페이스로, Entity의 생명주기를 관리하고 CRUD, JPQL 실행 등을 담당
  - 주요 기능
    - `persist()` : 신규 엔티티 저장(INSERT), 단 db에 저장이 아닌 영속성 컨텍스트에 저장
    - `find()` : PK로 조회(SELECT)
    - `remove()` : 엔티티 삭제(DELETE)
    - `merge()` : Detached 상태 엔티티 병합(UPDATE)
- 영속성 컨텍스트(Persistence Context)
  - Persistence ➡️ 금방 사라지지 않고 오래 지속되게 하는 것이 목적
  - 애플리케이션 내에서 테이블과 매핑되는 엔티티 객체 정보를 오래 지속되도록 저장하는 공간
- JPQL(Java Persistence Query Language)
  - SQL과 유사하지만 DB 테이블이 아닌 Entity를 대상으로 조회하는 JPA의 표준 쿼리 언어 ➡️ 객체(Entity) 중심 언어
  - 테이블과 컬림이 아닌 Entity와 그 속성(필드)를 기준으로 질의한다.

---

## <span style="background-color: #FFF9C4">2. Spring Data JPA 시작하기</span>

### 2-01. Spring Data JPA란?

**Spring Framework**에서 제공하는 데이터 접근 기술로, JPA를 기반으로 **반복적인 CRUD 코드의 생략**과 **표준화된 인터페이스**를 통해 **생산성과 유지보수성을 극대화**하는 기술

- Spring 생태계 내에서의 역할 : Repository 패턴을 통한 데이터 접근 표준화
  - **Repository 인터페이스만 정의하면 구현 없이도 CRUD, 페이징, 정렬, 쿼리 작성까지 자동 제공**
- 주요 기능
  - JpaRepository 상속, Query Method, `@Query`, Native Query, 페이징/정렬, Projection

<br>

### 2-02. Spring Data JPA의 기본 구조

- Repository 인터페이스 계층 구조

  ```java
  Repository (Marker Interface) // 마커 인터페이
      └─ CrudRepository<T, ID>  // CRUD (생성, 조회, 수정, 삭제)
          ├─ save(), findById(), deleteById() ...
          └─ PagingAndSortingRepository<T, ID> // CRUD + 페이징/정렬 (CrudRepository 확장)
              └─ JpaRepository<T, ID> // CRUD + 페이징 + JPA 확장 기능(Batch, Flush 등)
  ```

  - 위 인터페이스는 `CrudRepository` → `PagingAndSortingRepository` → `JpaRepository` 로 이어지는 상속 구조를 가짐

- 동작 원리
  1. `JpaRepository` 상속해서 Repository 인터페이스 작성
  2. `@SpringBootAplication` 내부의 `@EnableJpaRepositories`가 Repository 인터페이스를 자동으로 Spring Bean으로 등록
  3. `JpaRepositoryFactory`는 인터페이스를 보고 `SimpleJpaRepository`로 연결
  4. `SimpleJpaRepository`가 Repository의 내부 구현체로 사용됨
     - `EntityManager`를 사용해 DB 접근 로직 수행
  5. 프록시 패턴으로 런타임에 Spring이 구현체를 만들어 주입
     - 프록시 내부에서는 `SimpleJpaRepository`를 위임하여 실행

---

## <span style="background-color: #FFF9C4">3. Entity 설계 기초</span>

### 3-01. 엔티티(Entity)와 테이블(Table) 간의 매핑

```java
package org.example.codeitjpaexample.entity;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "members") // (옵션) name 속성으로 table 이름 변경 가능
@Getter
@Setter
public class Member {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long memberId;
}
```

`@Entity` 애너테이션을 이용해 엔티티 클래스와 테이블을 매핑 ➡️ 엔티티는 JPA 관리 대상 엔티티가 됨

- `@Entity`와 `@Id` 애너테이션은 필수

- 기본 키(Primary Key) 매핑 방법
  - 기본 키 직접 할당 (`@Id`만 사용)
  - 기본키 자동 생성 (`@Id`와 `@GeneratedValue` 사용)
    - IDENTITY : 기본키 생성을 데이터베이스에 위임
    - SEQUENCE : 데이터베이스에서 제공하는 시퀀스를 사용해서 기본키를 생성
    - TABLE : 별도의 키 생성 테이블을 사용
- 필드(멤버 변수)와 열 간의 매핑

  ```java
  @Column(nullable = false, updatable = true, unique = false)
  private String email;

  @Transient
  private String age;

  @Enumerated(EnumType.STRING)
  private OrderStatus orderStatus = OrderStatus.ORDER_REQUEST;
  ```

  - `@Column` : 필드와 열을 매핑해 주는 애너테이션
    - `nullable` : 열에 `null` 값 허용 여부
    - `updatable` : 열 데이터 수정 가능 여부
    - `unique` : unique 제약 조건 여부
  - `@Transient` : 해당 테이블 열과 매핑하지 않겠다는 애너테이션(저장 X)
  - `@Enumerated` : enum 타입과 매핑할 때 사용하는 애너테이션
    - `EnumType.ORDINAL` : enum의 순서를 나타내는 숫자를 테이블에 저장
    - `EnumType.STRING` : enum의 이름을 테이블에 저장

---

## <span style="background-color: #FFF9C4">4. Entity 연관관계 매핑</span>

### 4-01. 연관관계 매핑

<img src="https://github.com/JungH200000/JungH200000.github.io/blob/categories-ver2/assets/images/posts_img/til/til38_diagram.png?raw=true" width=700px>

[그림 3-44] 커피 주문 샘플 애플리케이션의 도메인 엔티티 클래스 다이어그램

- **단방향 연관 관계** : 한쪽 엔티티만 다른 엔티티를 참조하는 관계
  - `@ManyToOne`, `@OneToOne`, `@OneToMany` 애너테이션 사용
- **일대다의 관계** : **일(1)에 해당하는 클래스가 다(N)에 해당하는 객체를 참조할 수 있는 관계**
  - `@OneToMany` 애너테이션 사용
  - 단방향으로도 가능하지만, 매핑/쿼리 측면에서 불리한 경우가 있어 보통 **양방향의 반대편(mappedBy)** 로 두는 편이 많다.
- **다대일의 관계** : **다(N)에 해당하는 클래스가 일(1)에 해당하는 객체를 참조할 수 있는 관계**
  - `@ManyToOne`, `@JoinColumn` 애너테이션 사용
  - DB에서 외래키(FK)는 보통 N쪽 테이블에 있으므로 자연스러운 모델
- **양방향 연관 관계** : 양쪽 엔티티가 서로를 참조하는 관계
  - 일반적으로 `@ManyToOne`**(주인) 단방향(다대일)을 먼저 만들고**, 필요한 경우에만 반대편에 `@OneToMany(mappedBy=...)`(일대다)를 추가해서 양방향으로 확장한다.

<br>

### 4-02. 연관관계의 주인이란?

양방향 연관관계에서는 어느 쪽에서 외래키(FK)를 관리하는지 반드시 명시해야 한다.

이 외래키를 관리하는 쪽을 **연관관계의 주인**이라 부른다.

- **주인을 구분해야 하는 이유**

객체에서는 서로 양방향 참조가 가능하지만, DB에서는 외래키를 가진 쪽이 관계를 실제로 관리한다.

따라서 JPA는 **외래키가 어디 있는지**를 명확히 알아야 한다.

```java
@Entity
public class Member {
    @Id @GeneratedValue
    private Long id;

    @OneToMany(mappedBy = "member") // Order의 member가 FK를 가진 주인
    private List<Order> orders = new ArrayList<>();
}
```

```java
@Entity
public class Order {
    @Id @GeneratedValue
    private Long id;

    @ManyToOne
    @JoinColumn(name = "member_id") // 외래키 관리
    private Member member;
}
```
