---
title: '[TIL 47일 차] Spring 안정성 높이기'
excerpt: '3.효과적인 예외 처리 구현 ~ 8.Spring Actuator 이해와 활용'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til047

toc: true
toc_sticky: true

date: 2026-03-23
last_modified_at: 2026-03-23
---

# Spring 안정성 높이기

## <span style="background-color: #FFF9C4">3. 효과적인 예외 처리 구현</span>

### 3-01. 통합 예외 처리 전략

#### 1) 전역 예외 처리

**전역 예외 처리**는 시스템 전체에서 발생할 수 있는 예외를 **일관된 방식**으로 처리할 수 있도록 도와주는 전략

#### 2) `@ExceptionHandler` 활용

특정 Controller 내에서만 처리하고자 할 때 `@ExceptionHandler`를 사용합니다.

#### 3) `@RestControllerAdvice` 활용

전역 예외 처리 전용

- 전역 예외 처리기 설계
- ErrorResponse DTO 설계
  - 클라이언트에게 응답할 통일된 오류 메시지 DTO
- ErrorCode enum 설계
  - 상태코드, 메시지, 구분코드를 포함한 enum
- (선택) CustomException 클래스 설계

<br>

### 3-02. 비즈니스 예외 처리

**비즈니스 예외**는 시스템 오류(예: `NullPointerException`)와는 달리, 도메인 규칙이나 비즈니스 규칙 위반 상황을 의미

예를 들어 "이미 탈퇴한 회원입니다", "재고가 부족합니다"와 같은 상황은 시스템적인 문제가 아닌 비즈니스 로직 상의 예외

#### 1) 커스텀 예외 클래스 설계

- 기본 제공되는 예외 클래스(`RuntimeException` 등)를 그대로 사용하면 아래의 문제 발생
  - 어떤 예외인지 메시지로만 구분
  - 예외 의도 파악이 힘들어 디버깅/로그 분석이 어려움
  - 예외별로 다른 처리 적용이 어려움
  - 일관된 에러 응답 제공이 어려움
- 커스텀 예외 사용시 이점
  - 예외의 **의도를 명확하게 표현**
  - 예외마다 별도의 **에러 코드와 메시지를 부여**
  - 전역 예외 처리기(`@RestControllerAdvice`)에서 **일관된 응답 형태로 처리** 가능

#### 2) 예외 발생 시점과 위치 선정

예외는 시스템의 **정상 흐름을 제어하기 위한 도구**라서 언제 어디서 발생시키는지가 시스템 구조에 큰 영향을 미친다.

- Spring Framework에서의 예외 발생 위치
  - Controller : 검증 실패 `BadRequestException` 발생
  - Service : 도메인 상태 확인 후 예외 발생 (ex. `MemberNotFoundException`)
  - Domain (Entity, VO) : 상태 불변성 위반 시 예외 발생 (ex. `AlreadyWithdrawnException`)
  - Repository : IOException, SQLException → `DataAccessException` 전환

#### 3) 예외 전환 전략

예외 전환(Exception Translation)은 시스템 예외나 외부 기술의 예외를 애플리케이션에 적합한 예외로 변환하는 전략

Spring과 같은 프레임워크는 이러한 전환을 기본적으로 지원하지만, 직접 설계한 코드에서도 이를 명시적으로 수행해야 합니다.

- 주의 사항
  - 원본 예외 포함 (`cause`) 필수
  - 추상화 레이어를 지킴
  - 예외 메시지 구조화

---

## <span style="background-color: #FFF9C4">4. 로깅 필요성과 기본 설정</span>

### 4-01. 로깅(Logging)의 필요성

**로그(log)**는 애플리케이션이 실행되는 동안 발생하는 다양한 정보를 기록해서 저장하는 행위를 말하며, 예외 발생 시 이유를 확인하고 보안 검사 등을 위해 기록할 때 사용됨

- 필요한 이유
  - 애플리케이션 동작 상황 파악
  - 문제 상황 분석과 해결
  - 비즈니스 이벤트 추적 및 기록
  - 보안 검사(audit)

<br>

### 4-02. Logback 기본 설정

#### 1) 로깅 프레임워크: SLF4J와 Logback

- **SLF4J** (Simple Logging Facade for Java)
  - 다양한 로깅 프레임워크(log4j, Logback 등)에 대한 **추상화 계층**
  - 애플리케이션은 SLF4J API를 사용하여 로깅을 작성하고, 실제 로그 출력은 구현체(Logback 등)가 담당
- **Logback**
  - SLF4J의 대표적인 구현체
  - 특징
    - 빠른 처리 속도와 낮은 메모리 사용
    - 설정 파일 자동 감지 및 재로딩 지원
    - 시간 기반 또는 용량 기반의 로그 파일 롤링 기능
    - 조건부 필터링 및 다양한 출력 패턴 제공
- Spring Boot에서 로깅 설정
  - 기본적으로 `spring-boot-starter-logging`에 의해 **Logback**을 사용
  - `application.yml`에서 루트 로거 레벨이나 특정 패키지의 로그 레벨, 로그 파일 경로 및 이름, 콘솔 로그 출력 양식을 설정할 수 있다.
  - 세부적인 설정이 필요한 경우 `logback-spring.xml` 파일을 사용

#### 2) Logback 기본 설정

- 로그 레벨 정책
  - TRACE < DEBUG < INFO < WARN < ERROR
- 로그 출력 패턴
  - `%d`, `%thread`, `%-5level`, `%msg`, `%n` 등

#### 3) 파일 출력과 관리 정책

운영 환경에서는 로그 파일로 저장하고 적절히 관리하는 것이 필수적

Logback은 시간 기반, 용량 기반 등의 **롤링 정책(Rolling Policy)**을 제공

#### 4) 롤링 정책(Rolling Policy)

**로그 파일이 너무 커지거나 오래 저장되지 않도록 자동으로 분할(archive)하고, 오래된 로그를 삭제하거나 압축하는 관리 전략**

- 필요성
  - 한 파일에 계속 쌓이면 수 GB~수십 GB까지 커질 수 있음
  - 이로 인해 디스크 용량을 고갈시키거나, 로그 열람 속도가 느려짐
  - 운영 환경에서는 오래된 로그를 일정 기간만 보관하고 자동 삭제하는 것이 일반적
- 유형
  - 시간 기반 롤링
  - 크기 기반 롤링
  - 시간 + 크기 기반 롤링

<br>

### 4-03. 환경별 로깅 전략

#### 1) 개발/운영 환경 설정 분리

개발자는 디버깅을 위해 상세한 로그가 필요하지만, 운영 환경에서는 시스템 성능과 보안, 디스크 사용량을 고려해 최소한의 로그만 남기는 것이 바람직

이를 위해 Spring Boot에서는 `@Profile`이나 `spring.profiles.active`에 따라 환경을 구분하고, Logback 설정 파일에서 `<springProfile>`을 사용하여 환경별 설정을 나눌 수 있다.

#### 2) 로그 파일 관리

운영 환경에서 로그 파일을 그대로 두면 빠르게 디스크 공간을 소모할 수 있다. 따라서 아래와 같은 정책을 함께 적용하는 것이 중요

- `maxHistory` : 로그를 보관할 일 수 설정
- `totalSizeCap` : 로그 전체 크기 제한, 초과 시 오래된 로그부터 삭제
- `fileNamePattern` : 로그 파일 이름에 날짜 포함시켜 일별 분할 설정
- `cleanHistoryOnStart` : 애플리케이션 시작 시 오래된 로그 즉시 삭제
- 압축 설정 : 보통 `.gz` 형태로 자동 압축되어 저장

#### 3) 로그 레벨 조정

Spring Boot Actuator의 `loggers` 엔드포인트를 사용하면 실행 중(런타임)에도 유연하게 조정 가능

---

## <span style="background-color: #FFF9C4">5. 효과적인 로깅 구현</span>

### 5-01. 로그 레벨별 활용 전략

**로그(Log)**란 애플리케이션 실행 중 발생하는 다양한 이벤트를 기록하는 텍스트 기반의 기록 정보로, 문제 추적, 성능 분석, 보안 대응 등 다양한 목적에 사용

#### 1) 로그 레벨

- **TRACE**
  - 가장 상세한 디버깅 정보 제공
  - 메서드 진입/종료, 변수 값 변화, 루프 반복 등의 세밀한 흐름 추적용
  - 보통 개발 환경에서만 사용
- **DEBUG**
  - 개발 및 디버깅에 유용한 정보 제공
  - 메서드 호출 정보, 중요 변수 값, SQL 쿼리 등을 확인할 때 사용
- **INFO**
  - 애플리케이션의 일반적인 동작 상태 기록
  - 서비스 시작/종료, 주요 비즈니스 처리 성공 등을 운영 환경에서도 출력
- **WARN**
  - 예외는 아니지만 주의가 필요한 상태
  - 사용 중단 API, 성능 저하, 잘못된 요청 등 잠재적 문제 발생 시 활용
- **ERROR**
  - 예외 상황
  - 기능 실패, 외부 시스템 오류 등 치명적 장애 발생 시 반드시 로그를 남겨야 할 때 사

#### 2) 로그 메시지 작성 원칙

- 충분한 컨텍스트 정보 포함
  - 누가, 무엇을 어떤 상태에서 수행했는지를 함께 기록 ➡️ 문제 발생 시 원인 파악이 빨라짐
- 일관된 형식 유지
  - 작성자마다 형식이 달라질 경우 분석이 매우 어렵고 비효율적 ➡️ 형식을 사전에 미리 정의해두고 일관되게 유지하면 검색, 필터링, 모니터링이 쉬워짐
- 검색 가능한 키워드 사용
  - 정형화된 키워드 또는 태그를 삽입하여 특정 작업 단위, 기능, 에러 유형을 빠르게 검색 가능 ➡️ 태그 유무가 디버깅 속도를 좌우함.
- 파라미터화된 메시지 사용
  - SLF4J 같은 로깅 프레임워크는 문자열 연결(`+`) 대신 `{}` 형태의 파라미터 바인딩 방식을 지원
  - 성능과 가독성에서 더 우수
  - `logger.debug("사용자 ID: {}, 이름: {}", userId, userName);`
- 민감한 정보 제외
  - 로그는 운영환경에 노출되는 경우가 많고, 보안 위협에 직접적으로 노출될 수 있다.
  - 비밀번호, 인증 토큰, 주민등록번호, 카드번호 등 민감한 정보는 절대 로그에 기록 금지

#### 3) 예외 상황 로깅 전략

- 주의점
  - 반드시 예외 객체(`e`)를 로그의 마지막 파라미터로 포함해야 스택 트레이스가 출력됨
- 예외 수준에 맞는 로그 레벨 선택
  - 예외 상황을 무조건 ERROR로 처리하는 것은 과도한 알림을 발생시키거나 경고의 의미를 약화 시킬 수 있음
- 예외 컨텍스트 정보 포함
  - 예외가 발생한 시점의 주요 상태 정보(컨텍스트)를 함께 넣으면 문제 해결 속도가 향상

<br>

### 5-02. 로그 분석 활용

#### 1) 주요 로깅 포인트

- 애플리케이션 시작과 종료
  - 애플리케이션 수명 주기(Lifecycle) 중 시작과 종료 시점을 로그로 남겨두면 장애 상황이나 비정상 종료 시 디버깅에 큰 도움을 줌
  - 시작 시점 로깅은 `SpringApplication.run(***.class, args);` 전 후로 로깅
  - 종료 시점 로깅은 `@PreDestory`를 이용한 종료 훅
- 요청 처리 시작과 종료
  - HTTP 애플리케이션에서는 요청 단위로 로깅하는 것이 중요
- 중요 비즈니스 로직
  - 도메인 핵심 로직(주문 처리, 회원가입, 결제 등)에서는 적절한 시점마다 로깅을 추가
- 외부 시스템 연동
  - 외부 리소스에 대한 성능 병목 파악을 위해 로그는 반드시 필요

#### 2) 로그 검색과 분석

로그는 기록만하는게 아니라, 문제 발생 시 원인을 빠르게 찾기 위해 사용됨

```bash
# ===== 기본적인 로그 검색 방법 =====
# 키워드 기반 검색
$ grep "ERROR" app.log
$ grep "[USER_CREATE]" app.log

# 시간 범위 지정 (로그가 타임스탬프 포함 시)
$ awk '/2024-12-01 10:00/,/2024-12-01 11:00/' app.log

# 특정 사용자 ID 로그 찾기
$ grep "userId=123" app.log

# ===== 정규 표현식을 활용한 고급 검색 =====
# 예: userId가 숫자인 로그만 추출
$ grep -E "userId=[0-9]+" app.log

# 예: 특정 모듈에서 발생한 WARN 이상 로그 찾기
$ grep -E "\\[(USER|ORDER)_.*\\]" app.log | grep -E "WARN|ERROR"
```

---

## <span style="background-color: #FFF9C4">6. Bean Validation 이해와 기본</span>

### 6-01. 데이터 검증의 필요성

사용자 입력이나 외부 시스템으로부터 받은 데이터는 항상 애플리케이션의 기대치에 맞지 않을 가능성이 있고, 이를 검증하지 않으면 예상치 못한 오류나 보안 취약점이 발생 가능

- 필요한 경우
  - 잘못된 데이터 유입으로 인한 시스템 오류
  - 일관되지 않은 검증 로직 분산 문제 (동일한 검증 반복 등)
  - 비즈니스 규칙 위반 방지
  - 사용자에게 명확한 피드백 제공

<br>

### 6-02. Bean Validation

#### 1) Bean Validation 개요

자바 객체의 속성 값이 특정 제약 조건을 만족하는지를 선언적으로 검증할 수 있게 해주는 자바 표준(JSR-380)

- 즉, 자바 Bean 객체의 유효성 검증을 위한 일관된 방법을 제공
- 주로 애너테이션을 통해 제약 조건을 정의
- 대표적인 구현체로는 **Hibernate Validator**
- **Spring에서의 Bean Validation**
  - Controller 메서드 파라미터 자동 검증
  - `Valid`, `@Validated` 애너테이션을 통한 선언적 방식 지원
  - 검증 실패 시 예외 처리 메커니즘 제공
  - 사용자 정의 Validation 등록 및 확장 가능
- Spring Boot 애플리케이션에서 사용하기 위해서는 아래 의존서잉 필요
  - `implementation 'org.springframework.boot:spring-boot-starter-validation'`
  - Spring Boot 2.3.0 이전 버전에서는 `spring-boot-starter-web` 안에 validation 의존성이 포함

#### 2) 주요 검증 애노테이션

- 문자열 검증 애너테이션 : `@NotNull`, `@NotEmpty`, `@NotBlank`, `@Size`, `@Length`, `@Emali`, `@Pattern`
- 숫자 검증 애너테이션 : `@Min`, `@Max`, `@Range`, `@Positive`, `@PositiveOrZero`, `@Negative`, `@NegativeOrZero`, `@Digits`, `@DecimalMin`, `@DecimalMax`
- 날짜 및 시간 검증 애너테이션 : `@Past`, `@Future`, `@PastOrPresent`, `@FutureOrPresent`
- 컬렉션 요소 검증 : `@Size`, `@Valid`(중첩 객체의 필드도 검증)

<br>

### 6-03. 검증 수행 위치

검증은 Controller에서 요청 값을 확인은 물론, 도메인 객체의 유효성, 비즈니스 규칙의 정합성 등을 종합적으로 판단하는 과정

- Java Bean Validation에서는 `@Valid`, `@Validated`를 통해 다양한 위치에서 검증 수행

#### 1) Controller 요청 검증

Spring MVC에서는 Controller 메서드의 파라미터에 `@Valid` 또는 `@Validated`를 적용하여 요청 데이터를 자동 검증 가능

검증 실패 시 `BindingResult`를 통해 오류 정보를 확인하고 적절한 응답 반환 가

#### 2) Service 계층 검증

Controller보다 더 복잡한 비즈니스 규칙을 검증하거나, 도메인 객체 간의 관계 검증 등을 수행

- Controller와 분리되어 테스트에 용이
- 도메인 중심의 책임 분리가 가능

---

## <span style="background-color: #FFF9C4">7. Bean Validation 심화</span>

### 7-01. Custom Validator 구현

실무에서는 내장 애너테이션만으로는 충분하지 않은 경우가 발생한다. 이 경우 Custom Validator를 구현하여 원하는 로직을 직접 추가할 수 있다.

- 절차
  1. Custom Annotation 정의 (`@interface`)
  2. ConstraintValidator 인터페이스를 구현하여 검증 로직 구현
  3. DTO 클래스의 필드에 Custom Annotation 적용
- Custome Annotation 정의 예시

  ```java
  // javax.validation 패키지의 Constraint 어노테이션과 Payload 인터페이스를 사용
  import javax.validation.Constraint;
  import javax.validation.Payload;

  import java.lang.annotation.*;

  /**
   * 공백 문자열이 아닌 값을 검증하기 위한 커스텀 애너테이션
   * - 문자열이 null이 아니고, 공백(" ")만으로 이루어지지 않았는지 확인
   * - NotSpaceValidator.class에서 실제 검증 로직 구현
   */
  @Target(ElementType.FIELD) // 해당 애너테이션은 필드에만 적용할 수 있음
  @Retention(RetentionPolicy.RUNTIME) // 런타임까지 애너테이션 정보가 유지되어야 함 (검증 시 필수)
  @Constraint(validatedBy = {NotSpaceValidator.class}) // 검증 로직을 수행할 Validator 클래스를 지정
  public @interface NotSpace {

      /**
       * 유효성 검사 실패 시 기본적으로 반환할 메시지
       * - 필요 시 @NotSpace(message="...") 형태로 덮어쓰기 가능
       */
      String message() default "공백이 아니어야 합니다";

      /**
       * groups 속성
       * - Bean Validation 그룹을 지정할 때 사용
       * - 기본적으로는 잘 사용되지 않지만 확장성을 위해 정의
       */
      Class<?>[] groups() default {};

      /**
       * payload 속성
       * - 메타 정보를 담을 수 있는 확장 포인트
       * - 대부분의 경우 사용되지 않지만, 프레임워크 연동 시 유용함
       */
      Class<? extends Payload>[] payload() default {};
  }
  ```

  - `@Constraint` : 어떤 Validator 클래스와 매핑되는지 명시
  - `validatedBy` : 해당 애너테이션이 사용될 때 실행될 Validator 클래스를 지정
  - `message` : 검증 실패 시 반환할 기본 메시지를 지정

- ConstraintValidator 구현

  ```java
  import org.springframework.util.StringUtils;
  import javax.validation.ConstraintValidator;
  import javax.validation.ConstraintValidatorContext;

  public class NotSpaceValidator implements ConstraintValidator<NotSpace, String> {

      @Override
      public boolean isValid(String value, ConstraintValidatorContext context) {
          // null은 허용, 공백만 있는 경우 false 반환
          return value == null || StringUtils.hasText(value);
      }
  }

  ```

  - `ConstraintValidator<A, T>` 인터페이스를 구현
    - `A` : 커스텀 애너테이션 타입 (`@NotSpace`)
    - `T` : 검증 대상 필드 타입 (`String`)
  - `StringUtils.hasText()`는 null 또는 공백 문자열이 아닌 경우 true를 반환

- DTO 적용

  ```java
  public class MemberPatchDto {
      @NotSpace(message = "회원 이름은 공백이 아니어야 합니다")
      private String name;
  }

  ```

- 정규 표현식 vs Custom Validator
  | 항목 | 정규 표현식 기반 검증 | Custom Validator 기반 검증 |
  | ---- | ----------------------------- | ----------------------------- |
  | 장점 | 간결하고 재사용 가능 | 복잡한 로직 가능, 가독성 우수 |
  | 단점 | 성능 저하 우려, 복잡한 정규식 | 구현 필요, 다소 장황함 |
  | 예시 | `@Pattern` 사용 | `@NotSpace`, Enum 검사 등 |

<br>

### 7-02. 복합 객체 검증

복합 객체란 하나의 객체 안에 다른 객체를 필드로 가지거나, 컬렉션 형태(`List`, `Set`, `Map` 등)로 객체들을 포함하고 있는 구조를 말한다.

유효성 검증이 필요한 경우, 중첩 구조까지 함께 검증해야 하는 경우가 많다.

예를 들어, 하나의 A 객체 안에 여러 개의 B 객체가 포함되어 있을 때, 하위 객체까지 재귀적으로 유효성 검증이 전파되어야 한다.

- `@Valid` 애너테이션을 중첩 객체 필드에 명시하면 해당 중첩 객체 필드에 대한 검증까지 수행된다.
- `@Valid` 애너테이션은 재귀적으로 검증이 전파되므로, 중첩 구조가 깊을수록 성능에 영향을 줄 수 있으니 꼭 필요한 경우에만 적용하는 것이 좋다.
- 만약 그룹 검증 등 추가 기능이 필요하면 `@Validated`를 사용해야 한다.

---

## <span style="background-color: #FFF9C4">8. Spring Actuator</span>

### 8-01. 모니터링이 필요한 이유

애플리케이션을 개발하는 것만큼 운영 중인 애플리케이션의 상태를 확인하고 관리하는 것이 중요하다. 특히 실무 환경에서는 서비스의 안정성을 보장하기 위해 애플리케이션을 지속적으로 모니터링해야 한다.

#### 1) 실시간 상태 모니터링

운영 중인 애플리케이션은 언제든지 예상치 못한 문제가 발생할 수 있기 때문에 문제를 조기에 발견하고 대응하기 위해 실시간으로 애플리케이션 상태를 모니터링할 필요가 있다.

- 목적
  - 시스템 다운타임 최소화
  - 사용자 경험 향상
  - 운영 효율성 증가
  - 장애 대응 시간 단축

#### 2) 잠재적 문제 조기 발견

모니터링 시스템을 통해 장애로 이어지기 전의 이상 징후를 미리 감지할 수 있다.

#### 3) 주요 지표 수집과 분석

다양한 지표들을 수집하고 분석하는 것은 시스템 운영 상태를 파악하는데 필수적

- 지표 항목
  - 시스템 자원 (CPU, Memory, Disk 등)
  - 접근 및 성능 (응답 시간, 처리량, 오류율 등)
  - 데이터베이스 (쿼리 실행 시간, 커넥션 풀 상태 등)
  - 외부 시스템 (API 호출 성공률, 응답 시간 등)

#### 4) 정상 동작 여부 확인(Health Check)

서비스가 정상적으로 동작하고 있는지 주기적으로 확인하는 것은 안정성 확보에 매우 중요

다만, 직접 Health Check API를 구현할 수 있지만, 구현과 유지보수의 부담이 크기 때문에 보통 Spring Boot Actuator를 활용한다.

<br>

### 8-02. Spring Boot Actuator

Spring Boot Actuator는 Spring 모듈 중 하나로, 애플리케이션을 프로덕션 환경에 모니터링하고 관리할 수 있는 다양한 기능을 제공한다.

상태 점검, 메트릭 수집, HTTP 추적 등의 기능을 통해 시스템의 운영 상태를 실시간으로 파악할 수 있다.

#### 1) 의존성 설정

```groovy
// build.gradle
implementation 'org.springframework.boot:spring-boot-starter-actuator'
```

#### 2) Actuator 엔드포인트

- `http://localhost:8080/actuator`
  - `/health` 엔드포인트는 시스템의 헬스 상태를 보여주며, `UP`은 정상, `DOWN`은 비정상 상태를 나타낸다.
  - `/metrics` 엔드포인트는 JVM, HTTP, 시스템 리소스 등의 다양한 성능 지표(metric)를 조회할 수 있다.
  - `/loggers` 엔드포인트는 실행 중인 애플리케이션의 로그 레벨을 동적으로 조회 및 변경할 수 있다.
  - `/info` 엔드포인트는 애플리케이션 관련 메타데이터를 외부에 제공하는 용도로 사용된다.
- 기타 엔드포인트 목록은 [공식 문서](https://docs.spring.io/spring-boot/reference/actuator/endpoints.html#actuator.endpoints) 참고

#### 3) 사용자 정의 `HealthIndicator`

- `HealthIndicator` 인터페이스 구현
  - Spring Boot Actuator는 기본적으로 여러 헬스 체크 지표(CPU, DB, 디스크, 애플리케이션 등)를 제공한다. 하지만 실무에서는 외부 시스템이나 자체 서비스의 상태를 판단하기 위해 사용자 정의 `HealthIndicator`를 직접 구현해야 하는 경우가 많다.
  - 이를 위해 `HealthIndicator` 또는 `AbstractHealthIndicator` 인터페이스를 구현하면 된다.
- `application.yml`에서 DB 헬스 쿼리 커스터마이징
  - Spring Boot는 데이터베이스의 헬스 체크를 자동으로 구성하지만, 특정 쿼리나 커넥션 타임아웃 등 정밀한 제어가 필요한 경우 설정 파일을 통해 조정할 수 있다.

#### 4) Health Group 설정

Spring Boot Actuator 2.2 이상에서는 Health Indicator를 그룹(Group)으로 구성할 수 있다.

이로 인해, 운영 목적에 따라 헬스 응답을 분리하여 더 유연하게 시스템 상태를 점검할 수 있다.
