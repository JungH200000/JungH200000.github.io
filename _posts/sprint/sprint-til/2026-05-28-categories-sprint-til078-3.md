---
title: '[TIL 78-3일 차] Spring 비동기 처리하기'
excerpt: '5.Task Decorator를 활용한 비동기 작업 커스터마이징 ~ 7.실전 활용 패턴 및 모범 사례'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til078-3

toc: true
toc_sticky: true

date: 2026-05-28
last_modified_at: 2026-05-28
---

# <span style="background-color: #FFF9C4">5. `TaskDecorator`를 활용한 비동기 작업 커스터마이징</span>

## 5-01. `TaskDecorator`의 개념과 필요성

비동기 작업은 별도의 스레드에서 실행되므로, 기존 요청 스레드의 `ThreadLocal` 변수가 그대로 전달되지 않는다.

이로 인해 **보안 컨텍스트, 트랜잭션 정보, 로깅 컨텍스트(MDC)** 등이 손실되는 문제가 발생할 수 있다.

<br>

### 1) `ThreadLocal`

**각 스레드마다 독립적인 데이터를 저장할 수 있도록 도와주는 클래스**

여러 스레드가 동시에 하나의 객체를 공유하더라도, `ThreadLocal`을 사용하면 각 스레드는 **자신만의 복사본을 가지게 된다.**

- 각 스레드는 자신만의 `ThreadLocalMap`을 가지고 있으며, 이것은 다른 스레드와 **완전히 분리된 저장소**이다.
- 스레드마다 별도의 저장소를 가지므로 **동시성 문제를 방지**할 수 있다.
- 하지만 **새로운 스레드가 생성**되면 기존 스레드의 `ThreadLocal` 데이터는 **자동으로 복사되지 않는다.**

<br>

### 2) 컨텍스트 손실

`ThreadLocal`은 스레드별로 독립적인 값을 저장하기 때문에, 비동기 작업에서 새로운 스레드가 생성되면 기존의 `ThreadLocal` **데이터가 자동으로 복사(전파)되지 않는다.**

이로 인해 비동기 실행 시 **실행 컨텍스트 손실(Context Loss)** 현상이 발생한다.

<br>

### 3) 실행컨텍스트 손실 영향

#### 로그 추적 불가

요청별 `requestId`가 로그에 남지 않음

- `MDC.put("requestId", ...)` 미전달

#### 보안 컨텍스트 손실

인증 사용자 정보가 비동기 스레드에 없음

- `SecurityContextHolder`가 비어있음

#### 트랜잭션 오류

트랜잭션 경계가 비동기 호출로 깨짐

- `TransactionSynchronizationManager` 미전파

<br>

### 4) MDC

`MDC`(Mapped Diagnostic Context)는 **로그 추적을 위한** `ThreadLocal`**기반의 데이터 저장소**

Logback이나 Log4j에서 제공하며, 각 스레드가 로그에 자동으로 특정 값을 포함할 수 있도록 도와줌

하지만 **비동기** 스레드로 넘어가면 MDC가 복사되지 않기 때문에, 로그에 `requestId` 같은 특정 값이 누락된다.

이로 인해 로그 추적 및 장애 원인 분석에 큰 혼선을 초래한다.

<br>

위에서 얘기한 문제를 해결하는 방향으로 `TaskDecorator`가 있다.

<br>

## 5-02. `TaskDecorator` 인터페이스

### 1) `TaskDecorator`

Spring에서 제공하는 **함수형 인터페이스(Functional Interface)**로,

비동기 작업이 실행되기 **직전**에 스레드 컨텍스트(`ThreadLocal`)를 복사해 새로운 스레드에 전달한다.

즉, 실행할 작업(`Runnable`)을 받아, 새로운 `Runnable`로 감싸서 반환하는 인터페이스

이로 인해 `MDC`, `SecurityContext`, `TransactionContext` 등 실행 컨텍스트를 유지할 수 있다.

- 비동기 작업(`Runnable`)이 실행되기 전에 `Runnable`을 중간에 가로챔
- 실행 전후 로직 커스터마이징 가능

```java
@FunctionalInterface // 람다식으로 구현 가능함을 의미
public interface TaskDecorator {

    // 전달 받은 `Runnable`을 감싸서 새로운 실행 로직 정의
    Runnable decorate(Runnable runnable);
}
```

<br>

### 2) `TaskDecorator`를 이용 `ThreadLocal` 컨텍스트 전파

```java
public class ContextCopyingTaskDecorator implements TaskDecorator {

    @Override
    public Runnable decorate(Runnable runnable) {
        // 현재 스레드의 로그 컨텍스트(로그 ThreadLocal 데이터)를 캡처
        Map<String, String> contextMap = MDC.getCopyOfContextMap();

        return () -> {
            try {
                if (contextMap != null) {
                    MDC.setContextMap(contextMap); // 복사한 MDC 설정
                }
                runnable.run(); // 실제 비동기 작업 실행
            } finally {
                MDC.clear(); // 이전 데이터가 남지 않도록 작업 후 정리 (메모리 누수 방지)
            }
        };
    }
}
```

<br>

### 3) `TaskDecorator` 장점

- **유연성**: 모든 비동기 실행 전후에 커스텀 로직 추가 가능
- **재사용성**: 여러 `Executor`에서 동일한 decorator 사용 가능
- **일관성**: 공통된 `ThreadLocal`, 로깅, 보안, 트랜잭션 관리 기능
- **안정성**: 실행 후 정리(clean-up)를 통한 메모리 누수 방지

---

# <span style="background-color: #FFF9C4">6. `WebClient`를 활용한 비동기 HTTP 통신</span>

## 6-01. `WebClient`

`WebClient`는 **Spring WebFlux**에서 제공하는 비동기-논블로킹 HTTP 클라이언트이다.

기존 `RestTemplate`의 단점을 보완해, **Reactive Streams** 기반의 비동기 처리 모델을 제공한다.

- `RestTemplate`은 요청이 완료될 때까지 현재 스레드를 블로킹
  - 대량 트래픽 상황에서 비효율적
- `WebClient`는 요청을 전송한 뒤, 응답을 기다리는 동안 현재 스레드를 블로킹하지 않고, **이벤트 루프(Event Loop)**를 통해 비동기적으로 후속 처리를 수행
  - 더 적은 Resource로 동시에 많은 요청 처리 가능

 <br>

### 1) `WebClient` 내부 동작 구조

내부적으로 **Reactor Netty**를 사용해 요청을 처리한다. 이 구조는 현재 스레드를 고정하지 않고, I/O 이벤트가 발생할 때만 Callback을 실행한다.

이로 인해, `WebClient`는 **수천 개의 동시 요청도 소수의 스레드로 처리**할 수 있다.

<br>

### 2) Reactive Streams

`WebClient`는 Reactive Streams API (`Publisher`, `Subscriber`, `Subscription`)를 기반으로 동작

#### 구성요소

- `Publisher`
  - 데이터를 발행하는 쪽
  - 예시: `WebClient`가 반환하는 `Mono` 또는 `Flux`
- `Subscriber`
  - 데이터를 구독하고 처리하는 쪽
  - 예시: 응답 처리자(`subscribe()`를 호출한 코드 또는 WebFlux 내부 처리자)
- `Subscription`
  - `Publisher` ↔️ `Subscriber` 간의 데이터 흐름을 제어하는 연결 객체
  - `request(n)`을 통해 처리 가능한 데이터 개수를 `Publisher`에게 요청 가능
  - 예시: `request(n)`, `cancel()`
- `Backpressure`
  - `Publisher`가 데이터를 일방적으로 밀어 넣지 않고, `Subscriber`가 `request(n)`으로 요청한 만큼 데이터를 발행하도록 조절하는 흐름 제어 방식

<br>

### 3) `WebClient`의 비동기 실행 workflow

```
요청 생성
➡️ `WebClient.build()`
➡️ Reactor Netty 연결 생성
➡️ 요청 데이터 전송
➡️ Event Loop에 등록
➡️ 응답 수신 시 Callback 실행
➡️ `Subscriber`에게 데이터 전달
```

<br>

## 6-02. WebClient 설정 및 구성

### 1) `WebClient.Builder`

`WebClient`는 직접 인스턴스를 생성할 수 있지만, 실무에서는 **Builder를 이용해 구성 후 Bean으로 등록**

```java
@Configuration
public class WebClientConfig {

    @Bean
    public WebClient webClient(WebClient.Builder builder) {
        return builder
                .baseUrl("<https://api.example.com>")   // 기본 요청 URL 설정
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }
}
```

<br>

### 2) `WebClient.Builder` 구성요소

#### `baseUrl()`

모든 요청의 공통 URL prefix를 지정

#### `defaultHeader()`

모든 요청에 자동으로 포함할 기본 헤더를 지정

활용 예시: `Authorization` 헤더를 공통적으로 적용

#### `defaultCookie()`

모든 요청에 자동으로 포함할 기본 쿠키를 지정

#### `filter()`

요청 또는 응답을 가로채어 **로깅, 인증 예외 처리** 등 **공통 관심사 처리**(AOP와 유사)

`ExchangeFilterFunction` 인터페이스를 이용해 구현

```java
WebClient client = WebClient.builder()
        .filter((request, next) -> {
            System.out.println("요청 URI: " + request.url());
            return next.exchange(request)
                    .doOnNext(response -> System.out.println("응답 상태: " + response.statusCode()));
        })
        .build();
```

#### `exchangeStrategies()`

`WebClient`가 내부적으로 사용하는 **데이터 인코딩/디코딩 전략, 메시지 변환기(MessageCodec), 메모리 버퍼 관리 정책**을 제어하는 고급 설정

`WebClient`는 내부적으로 데이터를 **인코딩(요청 변환) ➡️ 전송 ➡️ 디코딩(응답 역직렬화)** 과정 수행하는데, `exchangeStrategies()`가 이 과정에서 사용할 **코덱(codec) 구성 전략**을 담당

- 코덱(codec) : 데이터를 변환해주는 인코더/디코더 묶음 (`COder + DECoder = CODEC`)

<br>

### 3) `WebClient` 동작 원리

`WebClient.Builder`는 **Builder Pattern** 기반으로 동작하며, 필요한 설정을 메서드 체이닝으로 쌓아올린 후 `build()` 호출 시 최종 객체 생성

- 이 방식은 **불변성(immutability)**을 유지하면서, 다양한 설정 조합을 안전하게 구성할 수 있게 해줌

<br>

## 6-03. 응답 처리 및 변환

### 1) 응답 반환 타입

#### `Mono<T>`

단일 응답 (1개 객체)

- 상세 조회, 인증 응답 등의 상황에 사용

#### `Flux<T>`

다중 응답(컬렉션(리스트, 스트림 등))

- 목록 조회, 스트리밍 데이터 등의 상황에 사용

<br>

### 2) 응답 처리 방식

#### `retrieve()`

- **반환 타입**: `ResponseSpec`
- **목적**: 일반적인 응답 본문 처리
- **내부 처리**: 상태 코드 `4xx` / `5xx` 시 예외 발생
- **사용 예시**: `bodyToMono()` / `bodyToFlux()`와 함께 사용

#### `exchangeToMono()`

- **반환 타입**: `Mono<ClientResponse>`
- **목적**: 상태 코드/헤더를 세밀하게 다뤄야 할 때
  - `ClientResponse` 객체를 직접 다루기 때문에 상태 코드, 헤더, 바디를 세밀하게 제어 가능
- **내부 처리**: 예외 발생 X - 직접 처리 필요
- **사용 예시**: 로깅, 조건부 응답, 헤더 기반 처리

<br>

### 3) `bodyToMono()`를 이용한 응답 변환

`bodyToMono(Class<T>)`는 내부적으로 **HttpMessageReader**를 통해 JSON/XML 등을 **역직렬화**

<br>

### 4) 에러 핸들링

#### 상태 코드 기반 예외 처리

`retrieve()`는 `4xx` / `5xx` 응답 시 자동으로 예외를 발생시킴

이것을 커스터마이징하려면 `.onStatus()` 사용

#### 예외 흐름 제어 (`onErrorResume`, `onErrorMap`)

- `onErrorResume()`
  - 에러 발생 시 **대체 데이터**를 반환할 때 사용
- `onErrorMap()`
  - 발생한 예외를 다른 예외로 변환할 때 사용

<br>

## 6-04. `WebClient`의 고급 기능

### 1) 고급 기능의 필요성

비동기 HTTP 통신은 빠르고 효율적이지만 아래의 문제 발생 가능

- 네트워크 지연
  - 서버가 응답하지 않거나 매우 느린 경우
- 서버 장애
  - 일시적으로 `5xx` 오류 발생
- 일시적 연결 오류
  - DNS 문제나 연결 끊김 등 일시적 실패
- 요청 과부하
  - 여러 요청이 동시에 발생해 Resource 고갈

<br>

### 2) 타임아웃(Timeout) 설정

**특정 시간 안에 응답이 없을 경우 요청을 강제로 종료하는 메커니즘**

타임아웃을 설정하지 않으면, 서버가 응답하지 않아도 요청이 계속 대기 상태로 남아 시스템 Resource를 낭비할 수 있다.

- `.timeout(Duration.ofSeconds(3))` ➡️ 3초 이내 응답 없으면 TimeoutException 발생

<br>

### 3) 재시도(Retry) 전략

**일시적인 실패 시 동일 요청을 일정 횟수만큼 자동으로 재전송**하는 기능

연결 끊김, 503 등 일시적 네트워크 오류에 유용하지만, 무한 반복 시 **서버 과부하**를 유발할 수 있으니 주의해야 한다.

```java
.retryWhen(
    Retry.fixedDelay(3, Duration.ofSeconds(2)) // 최대 3회, 2초 간격 재시도
         // 각 재시도 시점에 로깅 또는 메트릭 전송
         .doBeforeRetry(signal -> System.out.println("재시도 중..."))
)
```

<br>

### 4) 서킷 브레이커(Circuit Breaker)

**지속적인 실패를 감지하면 일시적으로 요청을 차단**하여 시스템의 연쇄 장애를 방지하는 패턴

특정 기준 이상의 오류가 발생하면 **자동으로 요청을 차단(Open)**

일정 시간이 지난 후 **Half-Open** 상태로 전환되어 일부 요청만 시도

- Spring `WebClient`와 함께 `resilience4j`를 사용하면 쉽게 서킷 브레이커 적용 가능

```java
// 기본 설정으로 `CircuitBreaker` 인스턴스 생성
private final CircuitBreaker circuitBreaker = CircuitBreakerRegistry.ofDefaults()
        .circuitBreaker("exampleBreaker");
```

```java
// Mone/Flux 스트림에 브레이커 적용
.transform(CircuitBreakerOperator.of(circuitBreaker))
```

---

# <span style="background-color: #FFF9C4">7. 실전 활용 패턴 및 모범 사례</span>

## 7-01. 비동기 처리 적용 타이밍

### 1) 비동기 처리의 필요성

비동기 처리는 **응답 속도를 단축하거나 병렬로 여러 작업을 동시에 수행하기 위해 사용**되며,

**CPU와 I/O Resource를 효율적으로 사용**할 수 있다.

#### 비동기 처리에 적합한 사례

- **I/O 중심 작업**
  - 네트워크나 디스크 I/O에 많은 시간이 소요되는 경우
- **병렬 처리 가능한 작업**
  - 서로 독립적인 연산을 동시에 실행할 수 있는 경우
- **사용자 응답 우선 상황**
  - 비즈니스 로직 수행보다 빠른 응답이 중요한 경우
- **백그라운드 후처리 작업**
  - 응답 완료 후 별도로 처리해야 하는 경우

#### 비동기 처리에 부적합한 사례

- **트랜잭션이 필요한 작업**
  - 비동기 스레드는 별도의 트랜잭션 컨텍스트를 가짐
  - 예시: DB 저장 후 후속 로직 실행이 필요한 경우
- **순서가 중요한 로직**
  - 비동기 처리는 순서가 보장되지 않음
- **공유 자원 접근이 잦은 작업**
  - 동기화 비용이 커져 오히려 성능 저하 발생
- **결과가 즉시 필요한 작업**
  - 비동기 결과를 기다리면 결국 동기와 동일한 효과

<br>

### 2) 비동기 전후 성능 개선 측정

#### 측정 기준(metric)

- **응답 시간(Response Time)**
  - 요청에서 응답까지의 시간
  - 측정 방법
    - `System.currentTimeMillis()` 또는 APM 도구
- **처리량(Throughput)**
  - 초당 처리 가능한 요청 수
  - 측정 방법
    - JMeter, K6 등 부하 테스트 tool
- **CPU 사용률**
  - 스레드가 얼마나 바쁘게 일하는가
  - 측정 방법
    - VisualVM, Grafana
- **스레드 수**
  - `TaskExecutor`의 동시 스레드 수
  - 측정 방법
    - `ThreadPoolTaskExecutor` 모니터링

<br>

## 7-02. 실전 비동기 패턴

### 1) Fire-and-forget 패턴

“보내고 잊는다”는 의미로, **결과를 기다리지 않는 비동기 처리 방식**

즉, 호출자는 요청을 보낸 뒤 응답을 기다리지 않고, 즉시 다음 작업을 수행

이 패턴은 응답 속도가 중요한 **사용자 경험 중심의 서비스(UI 응답, 로그 기록, 알림 등)**에 적합

- **반드시 트랜잭션 커밋 이후에** 실행해야 한다.
- **장점**
  - 응답 지연이 거의 없음
- **단점**
  - 결과 확인 불가
  - 예외 추적 어려움

<br>

### 2) 비동기 결과 결합**(Result Combination)** 패턴

여러 비동기 작업을 동시에 수행한 뒤, **모든 결과가 완료되면 하나의 결과로 합치는 방식**

이 패턴은 API 응답을 여러 외부 서비스에서 가져와 **통합 데이터를 구성할 때** 유용

- `Mono.zip()`이나 `CompletableFuture.allOf()`로 연산
- 각 비동기 결과의 **타임아웃과 예외 처리 로직** 반드시 포함
- **처리 순서**
  - 병렬 실행 ➡️ 결과 대기 ➡️ 결합 후 반환
- **장점**
  - 처리 시간 단축
  - 병렬 데이터 수집
- **단점**
  - 부분 실패 시 전체 실패로 간주 가능

<br>

### 3) 배치 처리 패턴 (Batch Processing)

**배치 처리**는 다수의 비동기 작업을 일정 단위로 묶어 한 번에 실행하는 방식

**대규모 데이터나 반복성 작업**에 적합하며, 시스템 Resource를 효율적으로 활용할 수 있다.

- **병렬 처리 개수(Thread 수)**를 시스템 자원(CPU, 메모리)에 맞게 조정
- **장점**
  - Resource 효율적
- **단점**
  - 배치 크기 조정 필요

<br>

## 7-03. 비동기 처리 모니터링

비동기 처리는 시스템의 처리 속도를 높이고, 사용자 경험을 개선하기 위한 필수적인 기술이다. 그러나 **비동기적으로 실행되는 작업은 눈에 보이지 않기 때문에**, 문제가 생기더라도 바로 인지하기 어렵다.

### 1) 비동기 처리 모니터링의 필요성

- **가시성 부족**
  - 비동기 작업은 별도의 스레드나 Queue에서 처리되기 때문에, 로그나 트레이싱이 없으면 상태를 알 수 없다.
- **자원 고갈**
  - 스레드 풀 크기 초과나 Queue 적체로 인해 새로운 작업이 지연되거나 실패할 수 있다.
- **장애 전파**
  - 비동기 처리 실패가 다른 서비스에 영향을 미칠 수 있다.
- **추적 어려움**
  - 작업 실행 흐름이 분리되어 있어 로그만으로 원인 분석이 어려움

<br>

### 2) Spring Actuator를 이용한 비동기 모니터링

Spring Actuator는 **애플리케이션의 내부 상태를 외부에서 손쉽게 확인할 수 있도록 해주는 모니터링 도구**

비동기 작업이 늘어날수록 시스템 상태를 관찰하고, 병목이나 과부하를 예방하기 위해 Actuator 활용은 필수적이다.

Actuator를 이용해 스레드 풀, Queue 상태, 비동기 작업의 진행 상황 등을 노출할 수 있다.

#### 주요 기능

- `/actuator/health`
  - 애플리케이션의 헬스 상태 확인
- `/actuator/metrics`
  - 시스템 Resource 지표 제공
    - 시스템 Resource: CPU, 메모리, 스레드 등
- `/actuator/metrics/executor`
  - 스레드 풀 관련 메트릭 정보 제공
- `/actuator/loggers`
  - 로그 수준 동적 변경
- `/actuator/custom`
  - 커스텀 엔드포인트 정의 가능

#### (1) 스레드 풀 상태 모니터링

비동기 작업은 대부분 `ThreadPoolTaskExecutor`를 사용

Spring Actuator는 자동으로 이 스레드 풀 상태를 **Micrometer 기반 metric**으로 수집

#### (2) 작업 Queue 적체 감지 및 경고 설정

작업 Queue는 작업이 실행되기 전에 대기하는 공간으로, 대기 작업이 일정 수준을 넘으면 **시스템 부하 또는 병목 현상**이 발생할 수 있다.

```java
@Component
@RequiredArgsConstructor
public class ThreadPoolHealthChecker {

    private final MeterRegistry meterRegistry;

    @Scheduled(fixedRate = 3000)
    public void checkThreadPoolHealth() {

        Double activeCount = meterRegistry.find("custom.executor.active.count")
                .gauge().value();

        Double queueSize = meterRegistry.find("custom.executor.queue.size")
                .gauge().value();

        Double poolSize = meterRegistry.find("custom.executor.pool.size")
                .gauge().value();

        System.out.printf("[Monitor] Active: %.0f, Queue: %.0f, Pool: %.0f%n",
                activeCount, queueSize, poolSize);

        if (queueSize > 15) {
            System.err.printf(
                    "⚠️ 경고: 큐가 포화 상태입니다! 대기 작업 수 = %.0f%n",
                    queueSize
            );

            // 외부 알림 시스템(Slack, Email, SMS 등)과 연계
        }
    }
}
```

<br>

## 7-04. 서비스 간 비동기 통신 전략

현대 애플리케이션은 단일 시스템이 아닌, **여러 서비스가 협력하는 분산 환경(Microservices Architecture)**으로 구성되는 경우가 많다.

<br>

### 1) 이벤트 기반 아키텍처

이벤트 기반 아키텍처(EDA; Event-Driven Architecture)는 **하나의 서비스가 이벤트를 발행(Publish)**하고, 이것을 **다른 서비스가 구독(Subscribe)**하여 반응하는 구조

서비스 간 직접적인 호출이 아닌 **이벤트를 매개로 한 간접적인 연결 방식**을 사용

<br>

### 2) 메시지 Queue

메시지 Queue는 **생산자(Producer)**와 **소비자(Consumer)** 간의 통신을 중재하는 버퍼 역할을 수행

```
Producer     ➡️      Message Queue      ➡️     Consumer
         메시지 전송                 메시지 소비
```

- 생산자(Producer)는 메시지를 Queue에 넣고 바로 다음 작업을 수행
- 소비자(Consumer)는 메시지를 가져와 필요한 처리를 수행

이 구조는 서비스 간 결합도를 낮추고, 시스템 확장성(Scalability)를 극대화

---
