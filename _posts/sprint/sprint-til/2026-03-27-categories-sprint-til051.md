---
layout: single-editorial
title: '[TIL 51일 차] Sprint Mission7 - 예외 처리 고도화, Bean Validation 설정, Actuator 설정'
excerpt: '2-3. 예외 처리 고도화 ~ 2-5. Actuator'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til051

toc: true
toc_sticky: true

date: 2026-03-27
last_modified_at: 2026-03-27
---

# 오늘의 성취

## 1. 개발 진행 상황

- 예외 처리 고도화
  - 예외 코드명과 메시지를 관리하는 `ErrorCode` Enum 정의
    - `throw ...` 코드를 바탕으로 작성
    - User, UserStatus, Channel, Message, ReadStatus, BinaryContent에 해당하는 Service의 validation 로직을 바탕으로 작성
  - 모든 커스텀 예외가 상속 받는 애플리케이션 전역 공통 예외 기반 클래스 `DiscodeitException` 정의
    - 예외 발생 시간(`timestamp`), 예외 코드와 메시지 정보(`ErrorCode`), 예외 발생 상황에 대한 추가정보(`details`) 구현
  - 도메인별 메인 예외 클래스 정의
    - 실제 활용되는 클래스가 아닌 계층 구조를 명확히 하기 위한 클래스이므로 추상(`abstract`) 클래스로 정의
    - 생성자도 하위 클래스에서만 사용될 수 있게 접근 제어자를 `protected`로 정의
  - 도메인별 메인 예외 클래스를 상속하는 구체적인 예외 클래스 정의
    - 앞에서 작성했던 `ErrorCode` Enum 파일의 예외 코드를 바탕으로 작성하기
  - ErrorResponse 리팩터링 후 `GlobalExceptionHandler` 리팩터링
- Bean Validation 처리 ➡️ 이미 수행했음
- Actuator 설정
  - Spring Boot Actuator 의존성 추가
  - 기본 Actuator 엔드포인트 설정
    - health, info, metrics, loggers
  - Actuator Info에 애플리케이션 정보 추가
- **피드백 진행**: [26.03.27 - Spring Mission7 Feedback](https://www.notion.so/jungh20000/26-03-27-Spring-Mission7-Feedback-330f59816c0280e59e96d10c169a6346?source=copy_link)

## 2. 문제

### `Map.of(key, value)`는 `null`을 허용하지 않는다.

커스텀 예외를 설계하면서, 예외가 발생한 상황에 대한 부가 정보를 `details` 필드에 담도록 구현했다. 처음에는 `Map.of(key, value)`를 사용했다.

- 최상위 클래스

  ```java
  @Getter
  public class DiscodeitException extends RuntimeException {
      private final Instant timestamp;
      private final ErrorCode errorCode;

      // 예외 발생 상황에 대한 추가 정보 저장 필드
      // 조회 시도한 사용자ID, 업데이트 시도한 Private 채널의 ID
      private final Map<String, Object> details;

      protected DiscodeitException(ErrorCode errorCode, Map<String, Object> details) {
          super(errorCode.getMessage()); // `ErrorCode` 예외 메시지를 표준 예외 메시지로 등록
          this.timestamp = Instant.now();
          this.errorCode = errorCode;
          this.details = details;
      }

      protected DiscodeitException(ErrorCode errorCode, Map<String, Object> details, Throwable cause) {
          // 도메인에 맞는 커스텀 예외로 바꾸되 원래 예외는 잃지 않기 위해 `cause` 추가
          super(errorCode.getMessage(), cause);
          this.timestamp = Instant.now();
          this.errorCode = errorCode;
          this.details = details;
      }
  }

  ```

- `InvalidInputException`에 단일 `key-value`를 `Map.of()`로 만들었다.

  ```java
  public class InvalidInputException extends CommonException {

      public InvalidInputException(String key, Object value) {
          super(ErrorCode.INVALID_INPUT, Map.of(key, value));
      }

      public InvalidInputException(String key, Object value, Throwable cause) {
          super(ErrorCode.INVALID_INPUT, Map.of(key, value), cause); // 예외 발생
      }
  }

  ```

- 문제는 아래의 코드에서 발생했다.

  ```java
  if (request.newLastActiveAt() == null) {
      throw new InvalidInputException("newLastActiveAt", null); // `null` 값 사용 불가
  }

  ```

- `"newLastActiveAt"` `key`와 `null` `value`를 `Map.of(key, value)`에 담고 싶었지만, 여기서 예외가 발생했다.

#### 원인

- `Map.of(key, value)`는 `null` `key`와 `null` `value`를 허용하지 않는다.
- 그래서 `Map.of("newLastActiveAt", null)` 내부에서 먼저 예외가 발생한다.

#### 해결

- 최상위 클래스에 단일 `key-value`를 받어 `details`를 직접 만드는 생성자를 추가했다.따로 생성

```java
@Getter
public class DiscodeitException extends RuntimeException {
    private final Instant timestamp;
    private final ErrorCode errorCode;

    // 예외 발생 상황에 대한 추가 정보 저장 필드
    // 조회 시도한 사용자ID, 업데이트 시도한 Private 채널의 ID
    private final Map<String, Object> details;

    protected DiscodeitException(ErrorCode errorCode, Map<String, Object> details) {
        super(errorCode.getMessage()); // `ErrorCode` 예외 메시지를 표준 예외 메시지로 등록
        this.timestamp = Instant.now();
        this.errorCode = errorCode;
        this.details = details;
    }

    protected DiscodeitException(ErrorCode errorCode, String key, Object value) {
        super(errorCode.getMessage()); // `ErrorCode` 예외 메시지를 표준 예외 메시지로 등록
        this.timestamp = Instant.now();
        this.errorCode = errorCode;

        this.details = new HashMap<>();
        details.put(key, value);
    }

    protected DiscodeitException(ErrorCode errorCode, Map<String, Object> details, Throwable cause) {
        // 도메인에 맞는 커스텀 예외로 바꾸되 원래 예외는 잃지 않기 위해 `cause` 추가
        super(errorCode.getMessage(), cause);
        this.timestamp = Instant.now();
        this.errorCode = errorCode;
        this.details = details;
    }

    protected DiscodeitException(ErrorCode errorCode, String key, Object value, Throwable cause) {
        // 도메인에 맞는 커스텀 예외로 바꾸되 원래 예외는 잃지 않기 위해 `cause` 추가
        super(errorCode.getMessage(), cause);
        this.timestamp = Instant.now();
        this.errorCode = errorCode;

        this.details = new HashMap<>();
        details.put(key, value);
    }
}
```

```java
public class UserNotFoundException extends UserException {

    public UserNotFoundException(String key, Object value) {
        super(ErrorCode.USER_NOT_FOUND, key, value);
    }
}
```

<br>

## 3. 고민

### ErrorCode에 500 계열 서버 에러도 넣어줘야 할까??

- "서버 오류가 발생했다"는 의미를 가진 `INTERNAL_SERVER_ERROR`를 하나 구현하는 것을 추천
- 전역 예외 처리에서 커스텀 예외로 처리하지 못한 예외들에 처리하는 용도로 사용할 수 있기 때문
- ➡️ 더불어 일관된 에러 응답 처리 형식을 유지할 수 있음

---

# 프로젝트 요구 사항

## 2. 기본 요구사항

`//...`

### 2-3. 예외 처리 고도화

- [x] 커스텀 예외를 설계하고 구현하세요.
  - 패키지명: `com.sprint.mission.discodeit.exception[.{도메인}]`
  - [x] `ErrorCode` Enum 클래스를 통해 예외 코드명과 메시지를 정의하세요.
    - 아래는 예시입니다. 필요하다고 판단되는 다양한 코드를 정의하세요.
    - 예시

      <img src="https://bakey-api.codeit.kr/api/files/resource?root=static&seqId=13906&version=1&directory=/6ag3lzl9i-image.png&name=6ag3lzl9i-image.png" width=300px>

  - [x] 모든 예외의 기본이 되는 `DiscodeitException` 클래스를 정의하세요.
    - 클래스 다이어그램

      <img src="https://bakey-api.codeit.kr/api/files/resource?root=static&seqId=13906&version=1&directory=/j5vtp941a-image.png&name=j5vtp941a-image.png" width = 300px>

    - `details`는 예외 발생 상황에 대한 추가정보를 저장하기 위한 속성입니다.
      - 예시
        - 조회 시도한 사용자의 ID 정보
        - 업데이트 시도한 PRIVATE 채널의 ID 정보

  - [x] `DiscodeitException`을 상속하는 주요 도메인 별 메인 예외 클래스를 정의하세요.
    - `UserException`, `ChannelException` 등
    - 실제로 활용되는 클래스라기보다는 예외 클래스의 계층 구조를 명확하게 하기 위한 클래스 입니다.
  - [x] 도메인 메인 예외 클래스를 상속하는 구체적인 예외 클래스를 정의하세요.
    - `UserNotFoundException`, `UserAlreadyExistException` 등 필요한 예외를 정의하세요.
    - 예시

      <img src="https://bakey-api.codeit.kr/api/files/resource?root=static&seqId=13906&version=1&directory=/a6f585icy-image.png&name=a6f585icy-image.png" width=700px>

- [x] 기존에 구현했던 예외를 커스텀 예외로 대체하세요.
  - `NoSuchElementException`
  - `IllegalArgumentException`
  - …
- [x] `ErrorResponse`를 통해 일관된 예외 응답을 정의하세요.
  - 클래스 다이어그램

    <img src="https://bakey-api.codeit.kr/api/files/resource?root=static&seqId=13906&version=1&directory=/3gqeampkw-image.png&name=3gqeampkw-image.png" width=300px>

  - `int status`: HTTP 상태코드
  - `String exceptionType`: 발생한 예외의 클래스 이름

- [x] 앞서 정의한 `ErrorResponse`와 `@RestControllerAdvice`를 활용해 예외를 처리하는 예외 핸들러를 구현하세요.
  - 모든 핸들러는 일관된 응답(`ErrorResponse`)을 가져야 합니다.

<br>

### 2-4. 유효성 검사

- [x] Spring Validation 의존성을 추가하세요.
- [x] 주요 Request DTO에 제약 조건 관련 애너테이션을 추구하세요.
  - `@NotNull`, `@NotBlank`, `@Size`, `@Email` 등
- [x] 컨트롤러에 `@Valid` 를 사용해 요청 데이터를 검증하세요.
- [x] 검증 실패 시 발생하는 `MethodArgumentNotValidException`을 전역 예외 핸들러에서 처리하세요.
- [x] 유효성 검증 실패 시 상세한 오류 메시지를 포함한 응답을 반환하세요.

### 2-5. Actuator

- [x] Spring Boot Actuator 의존성을 추가하세요.
- [x] 기본 Actuator 엔트포인트를 설정하세요.
  - health, info, metrics, loggers
- [x] Actuator info를 위한 애플리케이션 정보를 추가하세요.
  - 애플리케이션 이름: `Discodeit`
  - 애플리케이션 버전: `1.7.0`
  - 자바 버전: `17`
  - 스프링 부트 버전: `3.4.0`
  - 주요 설정 정보
    - 데이터소스: url, 드라이버 클래스 이름
    - jpa: ddl-auto
    - storage 설정: type, path
    - multipart 설정: max-file-size, max-request-size
- [x] Spring Boot 서버를 실행 후 각종 정보를 확인해보세요.
  - `/actuator/info`
  - `/actuator/metrics`
  - `/actuator/health`
  - `/actuator/loggers`

`//...`

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint7](https://github.com/JungH200000/10-sprint-mission/tree/sprint7)
