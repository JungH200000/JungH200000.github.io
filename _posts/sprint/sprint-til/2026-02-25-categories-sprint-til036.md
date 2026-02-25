---
title: '[TIL 36일 차] SQL 이해하기 ~ 데이터베이스 설계'
excerpt: 'SQL 이해하기 ~ 데이터베이스 설계-데이터베이스 설계의 필요성과 절차'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til036/

toc: true
toc_sticky: true

date: 2026-02-25
last_modified_at: 2026-02-25
---

# SQL 이해하기

## <span style="background-color: #FFF9C4">1. SQL과 DBMS 기초</span>

### 1-01. 데이터베이스 (Database)

특정 목적에 따라 관련된 데이터를 구조화하여 저장한 집합체이며, 이 데이터를 빠르게 접근하고 조작할 수 있게 해주는 체계

- 특징
  - 데이터를 **행(Row)** 단위로 저장
  - 열(Column)은 데이터의 **속성(Attribute)** 정의
  - 테이블 간의 관계는 키(Key)를 통해 연결됨
- **DB를 사용하는 이유**
  - 테이블 스키마만 변경하면 전체 시스템에 반영할 수 있어 유지보수에 효율적
  - 대량의 데이터를 안정적으로 처리하거나 검색할 수 있음
  - API와 연동하여 여러 시스템과 통합하고, 팀원 간 공통된 규약으로 데이터를 공유할 수 있어 협업에 사용되기 좋음

#### **1) 파일 시스템 기반 저장 방식**의 문제점

- 데이터 중복, 데이터 무결성, 검색 성능 저하, 동시성 처리 불가, 백업 및 복구 어려움이 존재
- 이러한 문제를 극복하기 위해 **데이터베이스 관리 시스템(DBMS)** 등장

<br>

#### **2) DBMS**

- 데이터를 체계적으로 관리하고, **효율적이고 안전하게 처리**할 수 있게 도와주는 소프트웨어
- **기능**
  - 데이터 **저장(C), 검색(R), 수정(U), 삭제(D)** 지원, **트랜잭션 처리**, **동시성 제어**, **데이터 무결성** 및 **보안** 강화, **백업 및 복구** 기능 내장

<br>

#### **3) RDB (관계형 데이터베이스, Relational Database)**

- 데이터를 **테이블(Table)** 형식으로 저장하고, 이 테이블들 간에 **관계(Relation)**를 설정하여 데이터를 효율적으로 관리하는 구조
- **테이블(Table)**, **행(Row, Record)**, **열(Column, Field)**, **키(Key)**로 구성됨
- **특징**
  - 정형화된 구조 : 모든 데이터는 행(Row)과 열(Column) 형태로 저장됨
  - 무결성 : 엔티티 무결성(Entity Integrity)와 참조 무결성(Referential Integrity)를 가짐
  - 관계(Relation) 기반 설계 : 관계를 설정하여 **중복 최소화 및 데이터 분리**에 유리
  - 정규화 (Normalization) : 데이터를 중복 없이 분해하고, 재사용 가능하도록 설계하는 과정으로, 데이터 일관성과 관리 효율성을 높일 수 있음
  - RDB는 대부분 SQL로 제어 가능

<br>

### 1-02. SQL (Structured Query Language)

관계형 데이터베이스 관리 시스템(RDBMS)에서 데이터를 정의하고(DDL), 조작하며(DML), 제어할 수(DCL/TCL) 있도록 설계된 **선언형(Declarative) 언어**

#### **1) 목적과 역할**

- 데이터를 **정형화된 구조**(테이블)로 관리
- 사용자가 무엇을 하고 싶은 지를 선언적으로 표현
  - 절차는 DBMS가 처리
- 프로그래밍 언어와 결합되어 다양한 애플리케이션에서 데이터 접근 가능

<br>

#### **2) SQL의 특징**

- **표준화된 언어(표준 SQL 또는 ANSI query)**: ANSI/ISO 표준에 따라 일관된 문법과 기능 제공
  - 다만, 함수, 데이터 타입, 자동 증가 키 같은 일부 기능은 DBMS별로 문법 차이가 존재함
- **SQL 명령어**
  1. **DDL (Data Definition Language)**
     - 데이터 구조(스키마)를 정의하거나 변경할 때 사용하는 명령
     - `CREATE`, `ALTER`, `DROP`, `TRUNCATE`
  2. **DML (Data Manipulation Language)**
     - 테이블에 저장된 **데이터 자체를 조회하거나 변경**하는 데 사용하는 명령어
  3. **DCL (Data Control Language)**
     - 사용자 권한 제어에 사용하는 명령
     - `GRANT`, `REVOKE`
  4. **TCL (Transaction Control Language)**
     - 트랜잭션 단위 제어에 사용하는 명령어
     - `COMMIT`, `ROLLBACK`, `SAVEPOINT`

<br>

#### **3) 범용성**

거의 모든 RDBMS에서 사용되며, 백엔드 API, 통계 시스템, BI 도구 등과 연결 가능

<br>

#### **4) DBMS별 확장**

표준 SQL 위에 DBMS마다 **SQL 구현 방식(SQL Implemetation)**에 차이가 있음

- 필요에 따라 확장 문법(Stored Procedure, 함수 등)을 추가할 수 있기 때문
- ex : 날짜 함수, 자동 증가 키 등
- 그래서 SQL을 작성할 때는 공통된 표준 문법을 우선시하는 것이 중요

<br>

### 1-03. 테이블 생성

`CREATE TABLE` 문은 데이터베이스에서 새로운 테이블을 정의할 때 사용하는 SQL 명령어

```sql
CREATE TABLE 테이블명 (
    컬럼명 데이터타입 [제약조건],
    ...
);

---

CREATE TABLE members (
    member_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## <span style="background-color: #FFF9C4">2. 기본 데이터 조작</span>

### 2-01. 데이터 조회 : `SELECT`문

데이터베이스에서 정보를 "꺼내오는" 명령어

```sql
SELECT 컬럼명1, 컬럼명2
FROM 테이블명
WHERE 조건
ORDER BY 정렬기준 [ASC|DESC]
LIMIT 5 OFFSET 1;
```

- `WHERE` : 조건을 지정해 조회
- `ORDER BY` : 정렬 기준 지정
  - `ASC` : 오름차순 (default)
  - `DESC` : 내림차순
  - `WHERE`과 `ORDER BY`의 경우 인덱스 사용 여부에 따라 성능이 크게 달라짐
    - 다만, 인덱싱은 조회(R)를 제외한 생성(C)과 변경(U)의 성능을 떨어트림
- `Limit` : 가져올 개수
- `OFFSET` : 건너뛸 시작 위치(0부터 시작)
  - 문제점 :
    - OFFSET 수가 클수록 **읽고 버리는 양이 증가** → **성능 저하** 발생
    - `LIMIT 10 OFFSET 990`의 경우, **앞의 990건을 모두 스캔하고 버린 뒤**, 991~1000번째 데이터를 반환하기 때문에
  - 이때는 **Keyset 기반 페이징 방식**이 더 효율적

<br>

### 2-02. 데이터 변경

#### 1) 데이터 추가 : `INSERT`문

테이블에 새로운 행(Row)을 추가할 때 사용

- NOT NULL 제약 조건이 있는 컬럼은 반드시 값을 입력해야 함.

```sql
-- 회원(member) 테이블에 새 레코드 추가
INSERT INTO members (name, phone, email, age)
VALUES ('김철수', '010-1234-5678', 'kimcs@example.com', 25);

---

-- 여러 개의 데이터를 한 번에 삽입할 수도 있습니다
INSERT INTO products (name)
VALUES
  ('노트북'),
  ('스마트폰'),
  ('프린터');
```

<br>

#### 2) 데이터 수정 : `UPDATE`문

기존 행의 값 변경

- `SET` : 수정할 컬럼과 값을 지정
- 주의 : `WHERE` 없이 `UPDATE`를 실행하면 **모든 행이 변경**됨

```sql
-- 회원 ID가 3번인 사용자의 전화번호를 변경
UPDATE members
SET phone = '010-9999-9999'
WHERE member_id = 3;
```

<br>

#### 3) 데이터 삭제 : `DELETE`문

특정 행 삭제

- `DELETE FROM`: 삭제할 테이블을 지정.
- 주의 : `WHERE` 조건은 **꼭 지정**해야 안전

```sql
-- 이메일이 example.com 도메인인 회원 전체 삭제
DELETE FROM members
WHERE email LIKE '%@example.com';
```

---

## <span style="background-color: #FFF9C4">3. 다중 테이블 처리</span>

### 3-01. ANSI 표준 조인 (ANSI Standard Joins)

SQL에서 **테이블 간의 관계를 명시적으로 표현하는 표준 문법**

```sql
SELECT 컬럼목록
FROM 테이블1
[INNER | LEFT OUTER | RIGHT OUTER | FULL OUTER] JOIN 테이블2
ON 테이블1.기준컬럼 = 테이블2.기준컬럼;
```

- `INNER JOIN` : 두 테이블 간의 **일치하는 행만** 결과에 포함
- `OUTER JOIN`
  - `LEFT OUTER JOIN` : 왼쪽 테이블은 **모든 행 포함**, 오른쪽 테이블은 일치 시 값 없으면 NULL
  - `RIGHT OUTER JOIN` : 오른쪽 테이블은 **모든 행 포함**, 왼쪽 테이블은 일치 시 값이 없으면 NULL
  - “어느 것을 기준으로 더 많은 걸 택할 것 인지”의 문제로, 가독성/팀 규칙상 둘 중 하나로 통일하는 경우가 많다
- `FULL OUTER JOIN` : **양쪽 테이블의 모든 행 포함**, 일치하지 않으면 NULL 처리

<br>

### 3-02. 집계와 그룹화 (Aggregation & Grouping)

#### 1) 집계 함수(Aggregate Function)

여러 행으로 구성된 데이터를 하나의 결과로 요약하는 함수

- 대표적인 집계 합수
  - `COUNT()` : 행의 개수를 셈
  - `SUM()` : 숫자의 총합
  - `AVG()` : 평균값
  - `MAX()` : 최대값
  - `MIN()` : 최소값
- 집계 쿼리가 복잡해질수록 ORM만으로는 의도한 SQL을 안정적으로 만들기 어려운 경우가 있어, 필요하면 표준 SQL로 직접 작성하고 실행 계획까지 확인할 수 있어야 한다

<br>

#### 2) `GROUP BY`

**특정 컬럼을 기준으로 행을 그룹화**하여, 각 그룹에 대해 집계 함수를 적용할 수 있도록 도와주는 절

- 일반 SELECT와 달리 **모든 SELECT 컬럼이 집계 함수거나 그룹 기준 컬럼이어야 함.**

```sql
-- 나이별 회원 수, 평균 나이, 최대/최소 나이 조회
SELECT age, COUNT(*) AS total_members,
       AVG(age) AS avg_age,
       MAX(registered_at) AS latest,
       MIN(registered_at) AS earliest
FROM members
GROUP BY age;
```

- `Having` 절과 함께 사용 가능
  - `WHERE`는 집계 이전 조건, `HAVING`은 집계 이후 조건 필터링
  ```sql
  -- 주문이 2건 이상인 회원 목록
  SELECT member_id, COUNT(*) AS order_count
  FROM orders
  GROUP BY member_id
  HAVING COUNT(*) >= 2;
  ```

---

# 데이터베이스 설계

## <span style="background-color: #FFF9C4">4. 데이터베이스 설계의 필요성과 절차</span>

### 4-01. 데이터베이스 설계의 중요성

단순히 테이블을 만드는 작업이 아니라, **비즈니스 로직의 핵심을 반영하고 시스템의 일관성과 성능을 보장하는 근간**

제대로 설계되지 않은 DB는 개발 후반에 **데이터 오류, 중복, 불일치, 성능 저하** 등 수많은 문제를 유발

- 올바른 DB 설계는
  - 데이터 중복과 불일치 방지
  - 데이터 정합성과 일관성 보장
  - 효율적인 데이터 접근과 관리

<br>

### 4-02. 데이터베이스 설계 프로세스 개요

데이터베이스는 단순한 테이블의 집합이 아니라, **현실 세계의 정보를 체계적이고 일관성 있게 표현**한 구조이기 때문에, DB를 만들기 전에는 반드시 설계 과정을 거쳐야 하며, 아래의 4단계 프로세스를 따르는 것이 일반적이다.

#### 1) 요구사항 분석 (Requirements Analysis)

- **목표**
  - 시스템에서 어떤 데이터를 다루어야 하는지 파악
- **주요 산출물**
  - 엔티티 목록, 속성 목록, 관계 도출
  - **요구사항 정의서**
    - 시스템에서 사용자 또는 이해관계자의 요구를 분석하여 문서화한 결과물

<br>

#### 2) 개념적 모델링 (Conceptual Modeling)

- **목표**
  - 사용자 관점에서 전체 데이터 구조를 시각적으로 표현
  - ERD(Entity-Relationship Diagram)를 통해 엔티티, 속성, 관계 정의
  - 개념적 모델링과 논리적 모델링을 함께 수행하는 경우가 있다.
- **표현 도구**
  - **ERD 툴**: [dbdiagram.io](http://dbdiagram.io/), https://www.erdcloud.com/, Draw.io 등
- **주요 산출물**
  - 정의서
  - **ERD**
    - 현실 세계의 객체(엔티티)와 그들 간의 관계를 시각적으로 표현한 다이어그램

<br>

#### 3) 논리적 모델링 (Logical Modeling)

- **목표**
  - DBMS에 독립적으로 정규화된 관계형 구조 도출
  - PK, FK, 제약조건 등을 명확히 설정
- **주요 산출물**
  - **스키마 정의서**, 정규화 표, 제약조건 목록
  - **논리 데이터 모델(Logical Data Model)**
    - ERD를 기반으로 실제 RDB에 적합하도록 테이블 구조를 논리적으로 정제한 모델

<br>

#### 4) 물리적 모델링 (Physical Modeling)

- **목표**
  - 특정 DBMS(PostgreSQL 등)에 맞춰 실제 스키마 구현
  - 장애 대응 플랜 등에 대응할 수 있는 인덱스, 파티셔닝, 스토리지 용량 등 성능 요소 반영
- **주요 산출물**
  - **물리 데이터 모델과 DDL**
    - 논리 모델을 기반으로 실제 DBMS에 배포 가능한 구조로 변환
    - DDL을 통해 테이블, 인덱스, 제약조건 등을 생성
