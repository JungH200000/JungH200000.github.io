---
title: '[TIL 19일 차] Spring Beans의 이해와 활용'
excerpt: '설정 정보 외부화 ~ Bean 순서 등록 제어'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til019-1/

toc: true
toc_sticky: true

date: 2026-01-27
last_modified_at: 2026-01-27
---

# 오늘의 학습

## <span style="background-color: #FFF9C4">1. 설정 정보 외부화의 필요성</span>

### 1-01. 설정 정보 외부화의 필요성

**데이터베이스 엑세스를 위한 정보(URL, ID, Password), 포트 번호, API 키 등** 다양한 **설정 값들**이 코드 내부에 존재하는 것은 **보안성, 유지보수성, 확장성** 측면에서 여러 문제를 초래할 수 있다.

- `.properties`, `.yaml`, `yml`, 환경변수(`.env`) 등 다양한 방법으로 외부화 가능
  - 장점
    - 애플리케이션이 실행되는 환경에 따라 유연하게 설정을 변경
    - 민감 정보 관리
    - 운영 환경에서의 설정 변경

<br>

### 1-02. `@Value`로 설정 주입

Spring에서 가장 기본적인 **속성(property) 주입 방법**으로, `application.properties`나 `application.yaml`에 정의된 설정 값을 직접 가져와 Bean 필드에 주입할 수 있다.

- 주입 방법

  ```yaml
  # application.yaml
  my:
    greeting: 'Hello, Spring!'
  ```

  ```java
  @Component
  public class GreetingService {
      @Value("${my.greeting}")
      private String greeting;

      public void printGreeting() {
          System.out.println(greeting);  // Hello, Spring!
      }
  }
  ```

<br>

### 1-03. `@ConfigurationProperties`로 설정 주입

**계층적이고 복잡한 설정 정보를 타입 안전하게 주입할 수 있는 방법**으로, 객체 형태로 주입되기 때문에 설정 값을 한 곳에서 관리할 수 있고 IDE 자동완성, 유효성 검사도 가능

- `@Value`와 달리 복잡한 구조나 타입이 있는 설정에 사용하기를 권장

```yaml
my:
  storage:
    path: /data/files
    s3:
      bucket: my-bucket
      region: ap-northeast-2
```

```java
@ConfigurationProperties(prefix = "my.storage")
public class StorageProperties {

    private String path;
    private final S3 s3 = new S3();

    public static class S3 {
        private String bucket;
        private String region;
        // Getter/Setter
    }
    // Getter/Setter
}
```

- `List`나 `Map` 타입도 바인딩 가능
- 유효성 검사 적용 가능

<br>

### 1-04. `Environment` 객체

설정 파일(`application.yaml`/`application.properties`)의 내용을 내부적으로 `org.springframework.core.env.Environment` 객체를 통해 관리한다.

이로 인해, “다양한 설정 값 조회 + 다양한 설정 소스(PropertySource) 계층적 관리”가 가능

- SpringBoot는 아래의 설정 정보를 수집하여 `PropertySource`로 관리
  - `application.yaml`
  - `application.properties`
  - 명령줄 인수 (`--server.port=8081`)
  - OS 환경 변수 (`SERVER_PORT`)
  - JVM 시스템 속성 (`-Dserver.port=8082`)

---

## <span style="background-color: #FFF9C4">2. 조건부 Bean 구성</span>

### 2-01. `@Profile` 애너테이션

**환경별로 서로 다른 Bean을 등록하거나 설정을 적용**할 수 있도록 도와주는 기능을 한다.

- `@Profile("dev")` → 현재 활성화된 프로필이 `dev`일 때에만 해당 Bean이 등록됨
- `@Profile({"dev", "test"})` → 둘 중 하나라도 활성화되어 있으면 Bean 등록

Spring Boot는 기본적으로 `application-{profile}.yaml` 형태의 설정 파일도 지원하므로, 설정값과 Bean 구성을 함께 프로필별로 분리하는 것이 가능

- **프로필 활성화**
  - 단일 프로필
    ```yaml
    spring:
      profiles:
        active: dev
    ```
  - 다중 프로필
    ```yaml
    spring:
      profiles:
        # 활성화시킬 프로필을 배열로 제공
        active:
          - dev
          - prod
    ```

<br>

### 2-02. `@Conditional` 애너테이션

**특정 조건이 충족될 때만** 특정 Bean을 등록하도록 하는 기능

다양한 Condition 클래스를 제공하며, 개발자가 **직접 조건 클래스를 만들어** 사용할 수도 있다.

- **예시** : `custom.feature-x` 값이 `true`일 때만 특정 Bean을 등록하도록 설정

  ```yaml
  custom:
    feature-x: true
  ```

  ```java
  public class FeatureXEnabledCondition implements Condition {
      @Override
      public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {

          String enabled = context.getEnvironment().getProperty("custom.feature-x");

          return "true".equalsIgnoreCase(enabled);
      }
  }
  ```

- **자주 사용되는 Condition 클래스**
  - `@ConditionalOnProperty` : 특정 프로퍼티가 존재하거나, 특정 값일 때 Bean을 등록
  - `@ConditionalOnMissingBean` : 지정한 타입의 Bean이 **존재하지 않을 경우**에만 Bean을 등록
  - `@ConditionalOnBean` : 특정 타입의 Bean이 **이미 등록되어 있을 경우**에만 동작
  - `@ConditionalOnClass` / `@ConditionalOnMissingClass` : 특정 클래스가 **classpath에 존재하거나 존재하지 않을 경우** 조건 처리
  - `@ConditionalOnExpression` : SpEL 표현식 기반으로 조건 처리

---

## <span style="background-color: #FFF9C4">3. Bean 순서 등록 제어</span>

### 3-01. Bean 초기화 순서

Spring 컨테이너가 애플리케이션 실행 시점에 **어떤 Bean을 먼저 생성하고, 어떤 순서로 의존성을 주입하고, 어떤 순서로 초기화하는지를 말함.**

다만, Spring은 대부분의 경우, **DI(Dependency Injection)에 기반한 순서 결정 로직** 때문에 명시적인 순서를 지정하지 않아도 문제 없이 동작

- **기본 원칙: 의존 관계에 따른 자동 순서**
  - Spring은 내부적으로 **의존 관계 그래프(DI Graph)**를 분석하여 Bean의 초기화 순서를 자동으로 결정
  - **생성자 주입** : 주입 대상이 먼저 초기화됨
  - `@PostConstruct` : 모든 의존성 주입이 끝난 후 호출됨
  - **Bean 간 의존 관계** : 주입 구조에 따라 자동 정렬됨 → 대부분 명시적 순서 지정이 필요 없음
- **순서 강제의 필요성**
  - 직접적인 의존 관계가 없는 Bean 간 순서 지정
  - 외부 시스템 연결을 선행해야 하는 경우
  - 초기화 로직의 선후 관계가 중요한 경우
- **잘못된 순서로 인한 문제**
  - `BeanNotFoundException` **:** 필요한 Bean이 아직 초기화되지 않은 상태에서 주입을 시도할 때
  - `NullPointerException` **:** 주입 대상 객체가 null인 상태로 메서드를 호출할 때
  - **초기화 실패 및 장애** : 외부 연결/설정이 완료되기 전에 Bean이 초기화되어 장애를 유발할 때
  - **불안정한 테스트 결과** : 초기화 순서가 일정하지 않아 테스트마다 결과가 달라질 때

<br>

### 3-02. 명시적 순서 제어

- `@DependsOn`
  - **해당 Bean이 초기화되기 전에 반드시 먼저 초기화되어야 하는 Bean 이름을 지정**하는 애너테이션
  - 의존성이 명확할 경우 사용
  - **주의사항**
    - **의존성 주입이 아닌 순서 제어**만 한다.
    - 너무 많은 Bean 사이에 사용하면 전체 Bean 초기화 순서를 복잡하게 만들 수 있으므로, 가능한 **최소한으로 사용하는 것**이 좋다.
- `@Order`
  - **Spring 컨테이너에서 관리되는 Bean들이 순서대로 처리되어야 할 때, 실행 순서를 지정**하는 애너테이션
  - **동일 타입의 여러 Bean이 있을 때**나 **인터페이스 기반 초기화/실행 처리** 시 우선순위를 설정할 때 자주 사용
  - **주의사항**
    - **낮은 숫자가 먼저 실행**됨
    - Bean 간의 **명시적 의존 관계**를 설정하지 않음
- `Ordered` 인터페이스
  - **Spring Framework가 Bean 또는 콜백 인터페이스를 순서대로 처리할 수 있도록 제공하는 우선순위 인터페이스**
  - `getOrder()` 메서드를 오버라이드하면, 해당 객체의 실행 우선순위를 직접 지정할 수 있다.

    ```java
    public interface Ordered {
        int getOrder();
    }
    ```

    ```java
    @Component
    public class FirstProcessor implements BeanPostProcessor, Ordered {

        @Override
        public int getOrder() {
            return 1; // 낮은 숫자가 먼저 처리됨
        }
    }
    ```
