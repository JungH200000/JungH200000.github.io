---
title: '[TIL 46일 차] Spring 안정성 높이기'
excerpt: '1.애플리케이션 안정성 개요 ~ 2.예외 처리의 이해'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til046

toc: true
toc_sticky: true

date: 2026-03-20
last_modified_at: 2026-03-20
---

# Spring 안정성 높이기

## <span style="background-color: #FFF9C4">1. 애플리케이션 안정성 개요</span>

### 1-01. 웹 서비스에서 발생하는 다양한 문제 상황

- 잘못된 입력값 유입
  - 원인 : 필수값 누락, 잘못된 형식, 범위 초과 등
  - 예방 방법 : **Bean Validation** (`@NotBlank`, `@Email`, `@Min(...)` 등)
- 예상치 못한 예외 발생
  - 원인 : 개발자가 파악 못한 상황에 의한 예외
    - `NullPointerException`, `IllegalArgumentException`, `IndexOutOfBoundsException`, `NoSuchElementException` 등
  - 예방 방법 : 전역 예외 처리 (`@ControllerAdvice`와 `@ExceptionHandler`)
- 시스템 리소스 부족
  - 원인 : 커넥션 반납 누락, 무한 루프 / 무한 재귀 호출, 대용량 데이터 캐시 누적, 비효율적인 알고리즘
  - 예방 방법 : `try-with-resources`, GC 튜닝 및 모니터링, 스레드 수 제한, 캐시 적정 유지
- 외부 시스템 연동 실패
  - 원인 : 상대방 장애나 네트워크 이슈로 인한 실패 (외부 API 타임아웃, 4xx나 5xx 에러, 인증 실패, 네트워크 단절 등)
  - 대응 방법 : 예외 처리, 재시도 로직, Circuit Breaker 적용(Resilience4j), Fallback 대체 로직 제

<br>

### 1-02. 실무에 필요한 안정성 확보 전략

- **예외 처리**
  - 애플리케이션 동작 중 발생하는 비정상 상황에서 시스템을 안정적으로 유지하는 방법
  - **필요한 이유** : 일관된 응답, 명확한 메시지, 빠른 디버깅
  - **주요 예외 처리 전략** : `@ControllerAdvice`, 사용자 정의 예외(Custom Exception), 적절한 HTTP 상태 코드 반환, 로깅 연계 (Logger)
- **로깅(Logging) 전략**
  - 애플리케이션 동작을 기록하여 웹 애플리케이션에는 예상치 못한 오류나 장애가 발생했을 때, 원인을 빠르게 파악하기 위한 전략
- **입력값 검증 전략**
  - 입력값 검증은 외부 데이터를 신뢰할 수 있는지 확인하는 과정
  - 검증하지 않으면 데이터 무결성 훼손, 예기치 않은 예외, 보안 위협, 잘못된 비즈니스 로직 수행 발생 가능
  - **검증 방법** : `@Valid`, `@Validated` 활용
- **모니터링 전략**
  - 문제가 생기면 빠르게 알기 위해 서비스의 상태를 미리 지속적으로 확인하는 방법
  - **주요 지표** : 응답 시간, 오류율, 처리량, 리소스 사용량
  - **도구** : Prometheus, Grafana, Spring Boot Actuator, Micrometer

---

## <span style="background-color: #FFF9C4">2. 예외 처리의 이해</span>

### 2-01. 예외 처리

**예외(Exception)**란 프로그램 실행 중 발생할 수 있는 비정상적인 상황으로, **예외 처리**는 이러한 예외 상황에 적절히 대응하여 시스템의 정상 동작을 유지하고, 사용자에게 적절한 피드백을 제공하는 프로그래밍 기법

예외처리는 `ControllerAdvice`, `ExceptionHandler`, `Custom Exception` 등을 활용하여 `controller` 계층에서 일괄적으로 관리하는 것이 일반적

- 예외 발생 시 문제점 : 서비스 중단, 사용자 경험 저하, 장애 추적 어려움, 보안 문제
- 예외 처리 기대 효과 : 안정적인 서비스 운영, 명확한 피드백, 장애 추적 용이, 보안 강화

<br>

### 2-02. Spring의 예외 처리 아키텍처

#### 1) 예외 추상화

Spring은 다양한 기술과 라이브러리를 통합한 만큼 각각 고유한 예외 체계를 가지고 있고, 예외 처리 방식도 다르다. 예를 들어, JDBC는 `SQLException`, JPA는 `PersistenceException`을 던지며, 별도로 처리해야 한다.

이러한 문제를 해결하기 위해서 Spring은 **예외 추상화(Exception Abstration)** 계층을 제공하여 예외를 **일관된 방식으로 처리**할 수 있다.

```markdown
Exception
└── RuntimeException
└── DataAccessException (Spring의 추상 예외(공통 예외 계층))
├── DuplicateKeyException
├── DataIntegrityViolationException
├── EmptyResultDataAccessException
└── ... (다양한 세부 예외)
```

- 예외 변환 흐름도
  ```java
  SQLException / PersistenceException / HibernateException
         ↓ (Spring 내부 변환)
  DataAccessException (Spring의 공통 예외)
         ↓
  개발자 정의 예외 처리 (CustomException 등)
  ```

#### 2) 예외 변환 메커니즘

- 필요성 : Spring 애플리케이션의 각 계층(Controller, Service, Repository)은 **관심사가 분리**되어야 하며, 하위 계층의 기술 세부사항(JDBC, JPA, IO 등)이 상위 계층에 전파되지 않도록 설계하는 것이 중요
- 문제 상황 : 기술 종속, 책임 분리 위반, 예외 처리 중복, 유지보수 어려움
- 해결책 : 하위 계층에서 발생한 **저수준 예외를 커스텀 예외나 Spring 추상화 예외로 변환**하여 상위 계층은 **기술에 독립적인 예외 처리**만 하면 됨됨

<br>

### 2-03. 예외 계층 구조 설계

#### 1) 예외 계층 구조

애플리케이션 내에서 발생할 수 있는 다양한 오류 상황을 **의미 단위로 구분하여 설계한 예외 클래스의 구조**

- 기본 예외 계층 구조 설계
  ```markdown
  src/
  └── exception/
  ├── BaseException.java # 모든 예외의 부모 클래스
  ├── ErrorCode.java # 에러 코드와 메시지 정의 (enum)
  ├── ValidationException.java # 입력값 검증 실패
  └── ResourceNotFoundException.java # 리소스를 찾을 수 없음
  ```

#### 2) 도메인별 예외 분리 전략

모든 예외를 하나의 파일에 작성하면 관리가 어렵고 협업 시 충돌 가능성이 커지기 때문에, 도메인 단위로 예외를 분리하는 것이 좋다.

- 추후 마이크로서비스 분리 시에도 재활용이 수월하다.

#### 3) 에러 코드 필요성

사용자, 개발자, 로그 분석 시스템이 **에러 상황을 빠르고 정확하게 식별**하기 위해서 **코드화된 에러 식별자(에러 코드)**를 사용

```java
public enum ErrorCode {
    USR_001("USR_001", "해당 사용자를 찾을 수 없습니다."),
    AUT_002("AUT_002", "인증에 실패하였습니다.")
    ...
}
```

---
