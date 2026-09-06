---
layout: single-editorial
title: '위클리페이퍼07: Spring Data JPA'
excerpt: ''

categories:
  - Sprint Weekly Paper
tags:
  - [Codeit Sprint, Codeit Sprint Weekly Paper]

permalink: /categories/codeit-sprint/sprint-weekly-paper/weekly-paper007

toc: true
toc_sticky: true

date: 2026-03-23
last_modified_at: 2026-09-05
---

## Q1. JPA에서 발생하는 N+1 문제의 발생 원인과 해결 방안에 대해 설명하세요.

### Q1-1. N+1 문제

N+1 문제는 JPA 연관 관계가 설정된 Entity를 조회할 때, 처음 실행한 1번의 쿼리로 조회된 N 개의 Entity 각각에 대해 연관된 데이터를 조회하는 쿼리가 추가로 N 번 발생하는 문제입니다.

예를 들어 게시글 10개를 조회하고, 각 게시글의 작성자 정보를 조회하는 경우가 있습니다. 먼저 게시글 10개를 가져오는 조회 쿼리가 1회 실행되고, 각 게시글의 작성자를 조회하기 위한 쿼리가 추가로 10번 실행될 수 있습니다.

즉, 필요한 쿼리는

- 게시글 목록 조회: **1번**
- 각 게시글의 작성자 조회 : **N번**

으로 총 **1 + N**번이 됩니다.

### Q1-2. N+1 문제의 발생 원인

N+1 문제는 연관 관계가 설정된 Entity를 조회한 후, 연관된 Entity가 처음 조회 쿼리에서 함께 조회되지 않아서 각 Entity마다 별도의 조회 쿼리가 실행되면서 발생합니다.

특히 지연 로딩(LAZY)을 사용하는 경우 처음에는 연관된 Entity를 바로 조회하지 않고, 연관된 Entity의 데이터에 접근하는 시점에 쿼리를 실행합니다. 따라서 조회한 N개의 Entity를 순회하면서 각각의 연관된 Entity의 데이터에 접근하면 N번의 추가 쿼리가 발생할 수 있습니다.

참고로, N+1 문제는 지연 로딩(LAZY)뿐만 아니라 즉시 로딩(EAGER)을 사용하는 경우에도 발생할 수 있습니다. 즉시 로딩(EAGER)은 연관된 데이터를 로딩하는 시점에 대한 설정이라서 **무조건 JOIN 쿼리 한 번으로 조회하는 것이 아니기** 때문입니다.

```java
@Entity
class Post {
  @ManyToOne(fetch = FetchType.LAZY)
  private Author autor;
}
```

- 연관 관계가 설정된 Entity = `Post`
- 연관된 Entity = `Author`

### Q1-3. 해결 방안

#### Fetch Join

JPQL의 `JOIN FETCH`를 사용하면 조회할 Entity와 연관된 Entity를 하나의 쿼리로 함께 조회할 수 있습니다.

```java
@Query("SELECT p FROM Post p JOIN FETCH p.author")
List<Post> findAllWithAuthor();
```

- 게시글을 조회할 때 작성자 정보까지 함께 가져오기 때문에 게시글마다 작성자 정보를 다시 조회하는 추가 쿼리가 발생하지 않습니다.

#### `@EntityGraph`

`@EntityGraph`를 사용하면 특정 조회에서 함께 가져올 연관 관계를 지정할 수 있습니다.  
Fetch Join처럼 연관된 Entity를 함께 조회할 수 있지만, JPQL에서 `JOIN FETCH`를 작성하지 않고 선언적으로 지정할 수 있습니다.

```java
@EntityGraph(attributePaths = "author")
List<Post> findAll();
```

#### `@BatchSize`

`@BatchSize`를 사용하면 연관된 Entity를 하나씩 조회하지 않고 설정한 크기만큼 묶어서 조회할 수 있습니다.  
즉, N개의 연관 데이터를 N번 조회하는 대신 여러 개를 한 번에 조회해서 쿼리의 수를 줄일 수 있습니다.

### Q1-4. 실무에서의 사용

연관 관계는 지연 로딩(LAZY)을 기본으로 사용하고, 연관된 데이터가 필요한 조회에서는 **Fetch Join**이나 **`@EntityGraph`** 등을 사용하는 방법이 효과적입니다.  
이를 통해서 불필요한 연관된 데이터를 계속 조회하는 것을 피하고, N+1 문제를 방지할 수 있습니다.

---

## Q2. 트랜잭션의 ACID 속성 중 격리성(Isolation)이 보장되지 않을 때 발생할 수 있는 문제점들을 설명하고, 이를 해결하기 위한 트랜잭션 격리 수준들을 설명하세요.

### Q2-1. 격리성(Isolation)

격리성은 여러 트랜잭션이 동시에 실행되어도 서로에게 영향을 미치지 않고 독립적으로 실행되어야 한다는 ACID 속성입니다.  
격리성이 보장되지 않는다면 다른 트랜잭션의 작업에 영향을 받게 되어 조회 결과가 달라지는 문제가 발생할 수 있습니다.

### Q2-2. 격리성이 보장되지 않을 때 발생할 수 있는 문제

#### Dirty Read

다른 트랜잭션에서 **아직 커밋하지 않은 데이터를 읽는 현상**입니다.

예를 들어 트랜잭션 A가 사용자의 잔액을 변경했지만 아직 커밋하지 않은 상황에서 트랜잭션 B가 변경된 잔액을 조회하는 경우,  
이후 트랜잭션 A가 롤백하게 되면 트랜잭션 B는 데이터베이스에 반영되지 않은 값을 읽은 것이 됩니다.

#### Non-Repeatable Read

하나의 트랜잭션에서 **같은 데이터를 두 번 조회했을 때 값이 달라지는 현상**입니다.

예를 들어 트랜잭션 A가 특정 사용자의 잔액을 조회한 후, 트랜잭션 B가 해당 잔액을 수정하고 커밋했을 경우,  
이후 트랜잭션 A가 같은 사용자의 잔액을 다시 조회하게 되면 처음 조회한 값과 다른 값이 조회될 수 있습니다.

#### Phantom Read

하나의 트랜잭션에서 **같은 조건의 조회 쿼리를 두 번 실행했을 때, 조회되는 행의 개수가 달라지는 현상**입니다.

예를 들어 트랜잭션 A가 특정 조건에 해당하는 회원 목록을 조회한 뒤, 트랜잭션 B가 새로운 회원 데이터를 추가하고 커밋했을 경우,  
이후 트랜잭션 A가 같은 조건으로 다시 조회하면 처음에는 없었던 새로운 회원 데이터가 조회될 수 있습니다.

### Q2-3. 해당 문제를 해결하기 위한 트랜잭션 격리 수준

#### `READ_UNCOMMITTED`

가장 낮은 격리 수준으로, 다른 트랜잭션에서 **아직 커밋되지 않은 데이터**를 읽을 수 있습니다.

그래서 아래의 문제가 모두 발생할 수 있습니다.

- Dirty Read
- Non-Repeatable Read
- Phantom Read

#### `READ_COMMITTED`

다른 트랜잭션에서 **커밋된 데이터만 읽을 수 있는 격리 수준**입니다. 그래서 **Dirty Read**를 방지할 수 있습니다.

하지만 다른 트랜잭션이 데이터를 수정하거나 추가한 뒤 커밋하면 같은 트랜잭션 안에서도 조회 결과가 달라질 수 있기 때문에 아래의 문제가 발생할 수 있습니다.

- Non-Repeatable Read
- Phantom Read

#### `REPEATABLE_READ`

하나의 트랜잭션에서 같은 데이터를 반복해서 조회해도 동일한 값을 읽을 수 있도록 보장하는 격리 수준입니다.

그래서 다음 문제를 방지할 수 있습니다.

- Dirty Read
- Non-Repeatable Read

하지만 Phantom Read는 발생할 수 있습니다.

#### `SERIALIZABLE`

가장 높은 격리 수준으로, 여러 트랜잭션을 동시에 실행해도 순차적으로 실행된 것처럼 처리해서 가장 높은 격리성을 제공합니다.

그래서 아래 문제를 모두 방지할 수 있습니다.

- Dirty Read
- Non-Repeatable Read
- Phantom Read

### Q2-4. 격리 수준 비교

| 격리 수준          | Dirty Read | Non-Repeatable Read | Phantom Read |
| ------------------ | ---------- | ------------------- | ------------ |
| `READ_UNCOMMITTED` | 발생 가능  | 발생 가능           | 발생 가능    |
| `READ_COMMITTED`   | 방지       | 발생 가능           | 발생 가능    |
| `REPEATABLE_READ`  | 방지       | 방지                | 발생 가능    |
| `SERIALIZABLE`     | 방지       | 방지                | 방지         |

### Q2-5. 실무에서 고려사항

격리 수준이 높으면 데이터 일관성을 더 강하게 보장할 수 있지만, 동시에 처리할 수 있는 트랜잭션의 수가 줄어들어 성능이 떨어질 수 있습니다. 그래서 데이터 일관성과 성능 사이의 균형을 고려해 적절한 격리 수준을 선택해야 합니다.
