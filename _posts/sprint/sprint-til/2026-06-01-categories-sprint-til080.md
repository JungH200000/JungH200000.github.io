---
layout: single-editorial
title: '[TIL 80일 차] Spring Cache'
excerpt: '3.Spring Cache 추상화'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til080

toc: true
toc_sticky: true

date: 2026-06-01
last_modified_at: 2026-06-01
---

# <span style="background-color: #FFF9C4">3. Spring Cache 추상화</span>

## 3-01. Spring Cache 추상화의 필요성

### 1) Spring Cache 추상화

**여러 종류의 캐시 구현체를 일관된 방식으로 사용할 수 있게 해주는 통합 계층**

개발자는 캐시의 내부 동작(저장 방식, 네트워크 구조 등)을 몰라도, **하나의 통합 인터페이스(API)**를 통해 다양한 캐시를 다룰 수 있다.

즉, Caffeine ➡️ EhCache ➡️ Redis로 교체하더라도 **비즈니스 코드 수정 없이 설정만 변경**하면 된다.

#### Spring Cache 추상화 목적

- **구현체 독립성**
  - Cache API를 표준화하여 Caffeine, Redis, Guava 등 구현체를 쉽게 교체 가능
- **일관된 캐시 접근 방식**
  - 동일한 애너테이션(`@Cacheable`, `@CacheEvict` 등)으로 다양한 캐시 제어
- **선언적 캐시 관리**
  - 비즈니스 로직에 캐시 로직을 직접 작성하지 않아도 애너테이션으로 제어 가능
- **코드 유지 보수성 향상**
  - 비즈니스 로직과 캐시 로직을 분리하여 코드 가독성과 관리성 향상

#### Spring Cache 추상화 적용의 장점

- **코드 단순화**
  - 캐시 로직을 직접 작성 X
- **유지 보수성 향상**
  - 캐시 교체 시 코드 수정 없이 설정만 변경 가능
- **테스트 용이성**
  - 캐시와 비즈니스 로직 분리로 단위 테스트 용이
- **유연한 확장성**
  - 다양한 캐시 구현체(Caffeine, Redis 등) 통합 가

<br>

### 2) 선언적 캐시 관리

Spring은 캐시 로직을 **AOP 기반으로 자동 적용**한다

개발자는 복잡한 캐시 제어 로직을 작성하지 않고, 애너테이션을 붙이는 걸로 캐시 적용 가능

#### `@Cacheable`

메서드 실행 결과를 캐시에 저장하고, 캐시 존재 시 결과 재사용

- **실행 시점**: 실행 전

#### `@CacheEvict`

특정 캐시 데이터를 삭제

- 주로 업데이트 후 사용
- **실행 시점**: 실행 후

#### `@CachePut`

메서드 실행 결과를 항상 캐시에 저장

- 강제 갱신 시 사용
- **실행 시점**: 실행 후

#### `@Caching`

여러 캐시 애너테이션을 결합하여 사용

#### `@CacheConfig`

클래스 단위에서 **공통 캐시 이름, 키 생성 정책 등을 지정**

<br>

## 3-02. Spring Cache 핵심 컴포넌트

`CacheManager`, `Cache`, `CacheResolver`는 **Spring Cache 추상화의 핵심 구조를 구성**

### 1) `CacheManager`

**캐시 저장소(Cache)를 생성, 조회, 관리하는** 컴포넌트

Spring에서 `@Cacheable`, `@CachePut`, `@CacheEvict` 같은 애너테이션을 사용할 때, 개발자가 직접 캐시 객체를 생성하지 않아도 `CacheManager`가 캐시 이름에 해당하는 `Cache`를 찾아 사용

#### `CacheManager` 역할

- 캐시 등록 및 조회
- 캐시 구현체 선택
- 캐시 일관성 유지

#### `CacheManager` 구현체 종류

Spring은 다양한 캐시 구현체를 지원하기 때문에, 개발 환경에 따라 적절한 `CacheManager`를 선택할 수 있다.

- `ConcurrentMapCacheManager`
  - 가장 단순한 메모리 기반 로컬 캐시 구현체
  - 내부적으로 `ConcurrentHashMap`을 기반으로 동작하며, 별도의 캐시 라이브러리 없이 사용 가능
  - **장점**
    - 설정이 간단
    - `ConcurrentHashMap` 기반으로 기본적인 동시성 처리가 가능해 스레드 안정성 보장
  - **단점**
    - **TTL**이나 **캐시 크기 제한** 기능이 없음
  - 운영 환경에서 사용하기에 기능이 단순하기 때문에 `Caffeine`이나 `EhCache` 같은 고급 캐시를 사용하는 것이 좋다.
- `CaffeineCacheManager`
  - `Caffeine` 기반의 고성능 로컬 캐시를 Spring Cache 추상화와 연결해주는 구현체
  - `Caffeine`은 Guava Cache를 대체하기 위해 만들어진 Java 8 기반 In-Memory 캐시 라이브러리로, 로컬 캐시가 필요할 때 많이 사용됨
  - **주요 기능**
    - TTL, 캐시 크기 제한, 통계, 고성능 Eviction 정책 등
- `EhCacheCacheManager`
  - `EhCache` 기반 로컬 캐시를 Spring Cache 추상화와 연결해주는 구현체
  - `EhCache`는 Java 진영에서 오래 사용되어 온 캐시 라이브러리
  - 메모리 캐시뿐만 아니라 디스크 저장, 만료 정책, 크기 제한 등 다양한 설정을 지원
  - 캐시 용량이 크거나 저장 계층을 세밀하게 제어해야 하는 경우 적합
  - XML 또는 Java Config 기반으로 캐시 설정을 관리할 수 있음
- `RedisCacheManager`
  - Redis를 캐시 저장소로 사용하는 분산 캐시 구현체
  - 서버 간 캐시 공유 및 확장성 우수

### 2) `Cache`

`Cache` 인터페이스는 **캐시 데이터의 CRUD**를 담당하는 컴포넌트

실제 캐시 데이터를 저장하거나 읽어오는 작업은 `Cache` 객체 내부에서 이뤄짐

#### Cache 메서드

- `get(Object key)`
  - 캐시에서 값 조회
- `put(Object key, Object value)`
  - 캐시에 새로운 값 저장
- `evict(Object key)`
  - 특정 키의 캐시 삭제
- `clear()`
  - 모든 캐시 데이터 삭제

### 3) `CacheResolver`

복수의 캐시가 존재하는 환경에서, **어떤 캐시를 사용할지 동적으로 결정**하는 컴포넌트

기본적으로 Spring은 `SimpleCacheResolver`를 사용하며, `CacheManager`가 제공하는 캐시를 그대로 사용

그러나 특정 조건에 따라 **캐시 선택 로직을 커스터마이징**해야 하는 경우 직접 구현 가능

- 특정 조건: 사용자 유형, API 경로, 데이터 크기 등

<br>

## 3-03. Spring Cache 동작 원리

Spring Cache는 내부적으로 **AOP (Aspect-Oriented Programming)**를 이용해 캐시 로직을 자동으로 처리

개발자가 직접 캐시를 조작하지 않아도 **Spring이 메서드 호출 전후에 캐시 로직을 프록시로 감싸서 실행**

따라서 `@Cacheable`, `@CacheEvict` 등은 실제로 AOP 기반으로 작동

<br>

### 1) 프록시 기반 AOP 동작

#### **프록시(Proxy)**

**대상 객체를 감싸서 추가 로직을 삽입하는 대리 객체**

Spring은 이 프록시를 이용해 메서드 실행 전후에 캐시 로직을 자동 주입

#### 동작 과정

1. 사용자가 캐시가 적용된(`@Cacheable` 등) 메서드 호출
2. Spring AOP 프록시가 가로챔
3. 프록시가 캐시 조회(`CacheManager` ➡️ `Cache`) 수행
4. 캐시에 존재하면 **DB 접근 없이 반환**
5. 캐시에 없으면 메서드를 실행하고 결과를 **캐시에 저장**

<br>

### 2) 캐시 키 생성 메커니즘

Spring Cache는 각 캐시 데이터를 구분하기 위해 **고유한 키(Key)**를 생성

#### 기본 키 생성 규칙

Spring은 기본적으로 `SimpleKeyGenerator`를 사용

| 상황                | 생성되는 키               |
| ------------------- | ------------------------- |
| 인자가 1개일 때     | 인자 값 자체              |
| 인자가 여러 개일 때 | 모든 인자를 조합하여 해시 |
| 인자가 없을 때      | `SimpleKey.EMPTY`         |

#### 커스텀 키 생성기

복잡한 조건에서 캐시 키를 직접 정의하고 싶다면, `KeyGenerator`를 구현할 수 있다.

---
