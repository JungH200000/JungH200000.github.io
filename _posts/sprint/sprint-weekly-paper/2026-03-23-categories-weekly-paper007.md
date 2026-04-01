---
title: '위클리페이퍼07: Spring Data JPA'
excerpt: ''

categories:
  - Sprint Weekly Paper
tags:
  - [Codeit Sprint, Codeit Sprint Weekly Paper]

permalink: /categories/codeit-sprint/sprint-weekly-paper/weekly-paper007/

toc: true
toc_sticky: true

date: 2026-03-23
last_modified_at: 2026-03-23
---

## Q1. JPA에서 발생하는 N+1 문제의 발생 원인과 해결 방안에 대해 설명하세요.

### Q1-1. 답변

#### N+1 문제 발생 원인

N+1 문제는 JPA에서 연관 관계인 Entity를 조회할 때 발생하는 성능 문제로, 특정 목록을 조회할 때, 목록과 연계된 정보를 조회하기 위해 N번이 더 조회되는 현상이다.

#### 해결 방안

- `JOIN FETCH`를 사용해 연관된 Entity를 하나의 쿼리로 조회
- `@EntityGraph`를 사용해 `JOIN FETCH`보다 간단하게 Entity의 특정 속성 조회
- `@BatchSize`를 사용해 설정한 크기로 나눠서 연관된 Entity를 한 번에 조회

<br>

### Q1-2. 정리

#### N+1 문제 발생 원인

N+1 문제는 JPA에서 연관 관계가 설정된 엔티티를 조회할 때 발생하는 대표적인 성능 문제입니다. 예를 들어, 게시글 목록을 조회할 때 최초 게시글 목록을 가져오는 쿼리 1번과 각 게시글의 작성자 정보를 조회하기 위한 N번의 쿼리가 추가로 발생하는 현상을 말합니다. 이러한 문제는 연관 관계의 로딩 전략으로 즉시 로딩(EAGER)을 사용하든 지연 로딩(LAZY)을 사용하든 발생할 수 있습니다.

#### 해결 방안

이 문제를 해결하기 위한 여러 방안이 있습니다. 첫째로, Fetch Join을 사용하는 방법입니다. JPQL의 JOIN FETCH 구문을 사용하면 연관된 엔티티를 함께 조회할 수 있어, 한 번의 쿼리로 필요한 모든 데이터를 가져올 수 있습니다. 둘째로, @EntityGraph를 사용하는 방법이 있습니다. 이는 엔티티의 특정 속성을 함께 조회하고자 할 때 사용하며, Fetch Join보다 더 간단한 방법을 제공합니다. 마지막으로, BatchSize 설정을 활용할 수 있습니다. @BatchSize 애너테이션이나 hibernate.default_batch_fetch_size 설정을 통해 연관된 엔티티들을 일괄적으로 조회할 수 있으며, 이는 전역 설정으로도 적용 가능합니다.

#### 실무적 권장사항

실무에서는 연관 관계 매핑 시 즉시 로딩(EAGER)보다는 지연 로딩(LAZY)을 기본으로 사용하는 것이 권장됩니다. 그리고 필요한 경우에만 Fetch Join이나 EntityGraph를 사용하여 성능을 최적화하는 것이 바람직합니다. 이는 불필요한 데이터 로딩을 방지하고, 상황에 따라 적절한 최적화 전략을 선택할 수 있게 해줍니다.

---

## Q2. 트랜잭션의 ACID 속성 중 격리성(Isolation)이 보장되지 않을 때 발생할 수 있는 문제점들을 설명하고, 이를 해결하기 위한 트랜잭션 격리 수준들을 설명하세요.

### Q2-1. 답변

#### ACID의 격리성(Isolation)

동시에 실행되는 여러 트랜잭션이 서로 영향을 미치지 않고 독립적으로 동작하도록 보장하는 특성

#### 격리성이 보장되지 않을 때

- 커밋되지 않은 다른 트랜잭션의 변경사항을 반영하는 Dirty Read 발생
- 한 트랜잭션에서 동일한 데이터를 두 번 조회할 때 값이 다른 Non-Repeatable 발생
- 동일 쿼리 실행 시 기존에 없던 데이터가 나타나는 Phantom Read 발생

#### 해당 문제를 해결하기 위한 트랜잭션 격리 수준

- `READ_UNCOMMITTED` : 커밋되지 않은 데이터를 읽을 수 있음
- `READ_COMMITTED` : Dirty Read만 방지 가능
- `REPEATABLE_READ` : Dirty Read와 Non-Repeatable 방지 가능
- `SERIALIZABLE` : Drity Read, Non-Repeatable, Phantom Read 방지 가능, 단 성능이 많이 안 좋음

<br>

### Q2-2. 정리

#### 격리성 미보장 시 발생 문제

트랜잭션의 격리성이 제대로 보장되지 않을 경우, 세 가지 주요 문제가 발생할 수 있습니다. 첫째로, Dirty Read는 한 트랜잭션이 아직 커밋되지 않은 다른 트랜잭션의 변경사항을 읽게 되는 현상을 말합니다. 둘째로, Non-Repeatable Read는 하나의 트랜잭션 내에서 동일한 데이터를 두 번 조회했을 때 그 값이 다르게 나타나는 현상입니다. 마지막으로, Phantom Read는 한 트랜잭션 내에서 동일한 쿼리를 실행했을 때 이전에 없던 레코드가 나타나거나 존재하던 레코드가 사라지는 현상을 의미합니다.

#### 트랜잭션 격리 수준

데이터베이스는 이러한 문제들을 해결하기 위해 네 가지 격리 수준을 제공합니다. READ UNCOMMITTED는 가장 낮은 격리 수준으로, 커밋되지 않은 데이터도 읽을 수 있어 앞서 언급한 모든 문제가 발생할 수 있습니다. READ COMMITTED는 한 단계 높은 격리 수준으로, Dirty Read는 방지할 수 있으나 Non-Repeatable Read와 Phantom Read는 여전히 발생할 수 있습니다. REPEATABLE READ는 더 높은 격리 수준으로, Dirty Read와 Non-Repeatable Read는 방지할 수 있으나 Phantom Read는 발생할 수 있습니다. 마지막으로 SERIALIZABLE은 가장 높은 격리 수준으로, 모든 문제를 방지할 수 있지만 그만큼 성능 저하가 발생합니다.

#### 실무적 고려사항

실무에서는 대부분의 DBMS가 READ COMMITTED를 기본 격리 수준으로 채택하고 있습니다. 이는 Dirty Read를 방지하면서도 적절한 성능을 제공하기 때문입니다. 격리 수준을 선택할 때는 데이터의 일관성과 동시성 처리 성능 사이의 균형을 고려해야 합니다. 높은 격리 수준을 선택하면 데이터 일관성은 향상되지만 동시성 처리 성능이 저하될 수 있으므로, 비즈니스 요구사항과 시스템 특성을 고려하여 적절한 격리 수준을 선택해야 합니다.
