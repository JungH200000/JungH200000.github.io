---
layout: single-editorial
title: '[TIL 78-1일 차] Spring 비동기 처리하기'
excerpt: '1.Spring 비동기 처리 개요 및 @Async 소개 ~ 2.TaskExecutor와 ThreadPoolTaskExecutor'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til078-1

toc: true
toc_sticky: true

date: 2026-05-28
last_modified_at: 2026-05-28
---

# <span style="background-color: #FFF9C4">1. Spring 비동기 처리 개요 및 `@Async` 소개</span>

## 1-01. Spring 비동기 처리 필요성

### 1) 대용량 트래픽 환경에서의 성능 개선

만약 하나의 요청이 DB 조회, 외부 API 호출 등으로 3초 걸린다면, 해당 스레드는 3초 동안 아무 일도 하지 않고 **대기**하게 된다.

이런 **스레드 낭비**는 대용량 트래픽 환경에서 **심각한 성능 저하**로 이어진다.

#### 해결책

- **비동기(Asynchronous)**
  - 요청을 백그라운드 스레드에 위임하고, 메인 스레드는 즉시 다음 요청을 처리

➡️ 스레드의 대시 시간이 줄어들고, 서버는 훨씬 많은 요청을 동시 처리 가능

### 2) 사용자 경험(UX) 향상을 위한 응답 시간 최적화

비동기 처리는 “응답”과 “처리”를 분리한 **“빠른 응답 + 백그라운드 처리”**로 UX와 성능을 개선

## 1-02. Spring에서 비동기 처리 방식

Spring은 `@Async` 애너테이션을 기반으로 한 **고수준 비동기 처리 메커니즘**을 제공

- 개발자는 스레드를 직접 생성하거나 `ExecutorService`를 직접 다루지 않고, 메서드에 `@Async`를 붙이는 **선언적(Declarative) 방식**으로 구현 가능
- Java의 `CompletableFuture`과 달리, Spring은 **스레드 관리, 예외 처리, 트랜잭션 분리**를 자동으로 지원하기 때문에 비동기 로직을 더 쉽게 구현 가능

### 1) Spring 비동기 처리 아키텍처

Spring에서 `@Async`를 사용하면, 내부적으로 해당 Bean을 직접 호출하지 않고 **프록시(Proxy) 객체를 통해 메서드를 호출**

프록시는 `@Async`가 붙은 메서드의 호출을 가로채고, 해당 작업을 별도의 스레드에서 실행하도록 `TaskExecutor`에 위임

즉, 개발자는 일반 메서드처럼 호출하지만, 실제로는 Spring 프록시가 중간에서 비동기 실행을 처리

### 2) 구성 요소

#### `@Async`

메서드를 비동기로 실행하도록 표시

#### `@EnableAsync`

Spring 컨테이너에 비동기 기능을 등록하여 비동기 기능 활성화 (프록시 생성)

- 내부적으로 `AsyncAnnotationBeanPostProcessor`를 등록하여, `@Async`가 붙은 메서드를 **프록시로 감싸고 비동기 스레드 풀에 위임**할 수 있게 만듬
- 명시적으로 추가해야 함

#### `TaskExecutor`

비동기 스레드를 관리하는 실행기

#### `ThreadPoolTaskExecutor`

실무에서 가장 많이 사용하는 스레드 풀 구현체

Spring은 기본적으로 `SimpleAsyncTaskExecutor` 구현체를 사용하지만, **현재 실무에서**는 대부분 `ThreadPoolTaskExecutor`**를 커스터마이징**하여 사용

#### `AsyncUncaughtExceptionHandler`

비동기 메서드의 예외 처리 담당

## 1-03 `@Async` 애너테이션 활용

- 일반적으로 **Service 계층의 메서드**나 이벤트 Listener 객체에 적용
- 클래스 레벨에도 적용 가능하지만 실무에서는 **특정 메서드 단위**로 지정하는 경우가 많음
  - 왜냐하면 클래스 전체에 비동기를 적용하면 예상치 못한 병렬 실행이 발생할 수 있음

### 1) 반환 타입

#### `void`

- 가장 단순한 형태로, 결과를 반환하지 않고 비동기로 실행
- 예시 : 알림, 로그, 통계 전송 등

#### `Future<?>` 또는 `ListenableFuture<?>`

- 비동기 결과를 나중에 조회
- 호출 측에서 `get()` 메서드를 통해 결과를 동기적으로 가져올 수 있음
- 예시 : 오래 걸리는 계산, 외부 API 요청 등

#### `CompletableFuture<?>`

- 비동기 완료 후 후속 작업(`thenApply` 등) 수행 가능
- 비동기 결과를 체이닝 방식으로 다룰 수 있어 실무에서 가장 많이 사용됨
- 예시 : 체이닝, 비동기 결합 처리

⚠️ **주의할 점**

- **Self-Invocation 문제**
  - 같은 클래스 내부에서 `@Async`가 명시된 메서드 호출 시 비동기 처리 되지 않음
  - 비동기로 동작시키려면 **별도의 Bean에서 호출하거나, 프록시를 통해 호출 필요**

## 1-04. `@Async` 활용 시 제약 사항

Spring의 `@Async`는 **프록시 기반 AOP 구조**로 동작하기 때문에, 몇 가지 제약사항이 존재

### 1) 프록시 기반 동작

Spring의 `@Async`는 **AOP(Aspect-Oriented Programming)** 기술을 활용하여 **프록시 객체**를 통해 동작

- 비동기 메서드가 호출될 때 **프록시 객체(Proxy)**가 메서드 실행을 가로채 스레드 풀에 비동기 작업 위임
- 즉, `@Asycn`는 **프록시를 통해 호출되어야만** 비동기 실행이 이루어짐
- 프록시를 거치지 않을 경우 일반 메서드 호출처럼 **동기적으로 실행됨**

### 2) Self-Invocation(자기 호출) 문제

Spring의 `@Async`는 **같은 클래스 내부에서 메서드를 호출할 경우 프록시가 미적용되기 때문에 비동기로 동작하지 않는** 현상

#### 해결 방법 1: 프록시 Bean을 통해 호출

프록시 객체를 직접 가져워 호출해야 `@Async` 동작

#### 해결 방법 2: `@Async` 메서드를 별도 Bean으로 분리

실무에서는 **비동기 전용 Bean을 분리**하는 방법이 가장 권장

- `@Async`의 프록시 호출이 보장되어 안전하게 비동기 동작 수행 가능

### 3) 접근 제한자 제약

Spring의 프록시가 public 메서드 호출만 가로채기 때문에 `@Async`는 **public 메서드**에만 적용됨

### 4) 트랜잭션 전파 이슈

`@Transactional`과 `@Async`는 서로 다른 **스레드 컨텍스트**에서 동작

따라서 `@Async`로 실행된 메서드는 **기존 트랜잭션을 상속 받지 않음**

- `@Async`는 별도의 스레드에서 실행되므로, **트랜잭션 경계 밖에서 실행됨**
- DB 트랜잭션이 끝나지 않은 상태에서 비동기 작업을 의존하면, **데이터 일관성 문제 발생** 가능

#### 해결 방법

- 비동기 호출을 트랜잭션 외부로 이동
  - 트랜잭션이 완전히 **커밋된 이후 시점**에 비동기 메서드 호출
- `@TransactionalEventListener` 활용
  - Spring에서 제공하는 이벤트 Listener로, 트랜잭션 종료 시점 감지할 수 있음
  - **트랜잭션 커밋 후 비동기 작업 실행** 가능
  - 트랜잭션 롤백 시 이벤트 자체가 실행되지 않게 설정 가능
- 트랜잭션 컨텍스트 명시적 전달

---

# <span style="background-color: #FFF9C4">2. `TaskExecutor`와 `ThreadPoolTaskExecutor`</span>

## 2-01. `TaskExecutor`

Spring은 비동기 작업을 `@Async`로 실행하는 것 외에도, 내부적으로 `TaskExecutor`를 통해 **스레드 관리**와 **실행 제어**를 수행

`TaskExecutor`는 Spring 비동기 인프라의 핵심이며, **작업을 실행할 스레드를 관리하는 추상화 계층**으로,

`@EnableAsync` 활성화 되었을 때, `@Async`가 표시된 메서드 호출을 프록시(Proxy)가 가로채고, 해당 작업을 별도의 스레드에서 실행하도록 `TaskExecutor`에 위임

`TaskExecutor`는 “어떻게 실행할지”를 구현체를 통해 결정하고, **구현체**에서 스레드 풀, Queue 크기, 거부 정책 등 **실제 전략**이 적용됨

### 1) `TaskExecutor` 인터페이스의 역할

Java의 `Executor` 인터페이스를 확장하여, 스레드 실행을 좀 더 유연하고 관리하기 쉽게 만들어줌

- `Runnable` 객체를 전달 받아 별도의 스레드에서 실행하는 단순한 구조
- Spring은 이 인터페이스를 통해 다양한 **스레드 풀 관리 정책**을 쉽게 교체할 수 있게 해줌
- Java의 `ExecutorService`와 달리 Spring 환경에 최적화
  - Spring 컨테이너에서 Bean으로 관리 가능
  - `@Async`나 `@Scheduled` 등과 쉽게 연동 가능

### 2) `TaskExecutor` 사용 이유

#### 프레임워크 표준화

스케줄러, 이벤트(`@EventListener`), `@Async` 등 여러 모듈이 **같은 실행 추상화**(`TaskExecutor`)를 사용

#### Bean 기반 구성

YAML/Java Config로 **환경별 다른 실행 전략**(개발/운영)을 쉽게 교체

#### 운영 가시성

스레드 이름 프리픽스, 메트릭 노출, 거부(포화) 정책 등 **운영 친화 옵션**과 결합이 쉬움

#### 일관된 예외 처리 관점

- `@Async`와 함께 사용 시 **비동기 예외 처리**(예: `AsyncUncaughtExceptionHandler`) 진입접이 명확해짐

### 3) `TaskExecutor` 구현체 종류

#### `SimpleAsyncTaskExecutor`

가장 단순한 구현체

- **매번 새로운 스레드를 생성**하므로, **스레드 재사용이 없음**
- Queue 관리도 하지 않음
- 대량 트래픽 상황에서 비효율적이므로 실무에서는 거의 사용하지 않음

#### `ThreadPoolTaskExecutor`

Spring에서 가장 일반적으로 사용하는 구현체

- 내부적으로 Java의 `ThreadPoolExecutor`를 감싸서, **스레드 풀 재사용**과 **Queue 관리** 등의 기능 제공

## 2-02. `ThreadPoolTaskExecutor` 구성

`ThreadPoolTaskExecutor`는 **비동기 실행을 위한 스레드 풀 기반 실행기**

- 내부적으로 **Java의** `ThreadPoolExecutor`를 감싸고 있고,
- Spring 환경에 맞게 **설정·관리·모니터링 기능**을 제공
  - 스레드 풀 크기, Queue 용량, 스레드 이름 규칙 등을 자유롭게 제어할 수 있다.

### 1) 기본 개념

`ThreadPoolTaskExecutor`는 **스레드 재사용**과 **작업 Queue 관리**를 통해 성능을 최적화

#### 스레드 풀(Thread Pool)

여러 스레드를 미리 생성해두고 재사용하는 구조

#### 작업 Queue

대기 중인 비동기 작업을 보관하는 공간

#### 스레드 관리 정책

코어 스레드 유지, 최대 스레드 제한, Queue 용량 조절 등

### 2) 주요 설정 항목

```java
ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
executor.setCorePoolSize(3);        // 기본 유지 스레드 수
executor.setMaxPoolSize(10);        // 최대 스레드 수
executor.setQueueCapacity(20);      // Queue 대기열 용량
executor.setKeepAliveSeconds(60);   // 유휴 스레드 유지 시간(초)
executor.setAllowCoreThreadTimeOut(true); // 코어 스레드도 종료 허용 여부
executor.setThreadNamePrefix("async-");   // 스레드 이름 접두어
executor.initialize();              // 초기화
```

- **스레드 수와 Queue 용량 등의 조합**이 `ThreadPoolTaskExecutor`의 동작 방식을 결정

## 2-03. `TaskExecutor` Bean 생성 및 활용

`TaskExecutor`의 기본 구현체인 `SimpleAsyncTaskExecutor`는 매번 새로운 스레드를 생성하므로, 다수의 비동기 작업이 동시에 수행될 경우 메모리 및 CPU 자원을 과도하게 사용한다.

그래서, 실무에서는 `ThreadPoolTaskExecutor`를 커스터마이징해 **스레드 재사용, Resource 제어, 성능 최적화**를 달성한다.

- `Executor` 설정은 환경에 따라 다르기 때문에, 실제 트래픽을 기준으로 성능 측정 후 조정해야 한다.
- `ThreadPoolTaskExecutor`는 스레드 풀을 재사용하기 위해 요청마다 새로 생성하지 않고, 싱글톤 Bean으로 등록하여 Spring 컨테이너에서 관리하도록 해야 한다.
  - 요청마다 새로 생성하면 스레드 풀이 재사용되지 않아 성능상 이점을 얻을 수 없다.

### 1) 커스텀 `TaskExecutor` Bean 생성

```java
@Configuration
public class AsyncConfig {

    @Bean(name = "customTaskExecutor")
    public TaskExecutor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();

        // ✅ 기본 스레드 개수 (항상 유지)
        executor.setCorePoolSize(4);

        // ✅ 동시에 실행 가능한 최대 스레드 개수
        executor.setMaxPoolSize(8);

        // ✅ 대기 Queue 용량 (대기 중인 작업 수 제한)
        executor.setQueueCapacity(50);

        // ✅ 유휴 스레드 유지 시간 (초)
        executor.setKeepAliveSeconds(30);

        // ✅ 스레드 이름 접두사 설정 → 디버깅 및 로깅 시 유용
        executor.setThreadNamePrefix("CustomExecutor-");

        // ✅ 작업 거부 정책 설정 (Queue가 가득 찼을 때)
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());

        executor.initialize(); // 내부 ThreadPoolExecutor 초기화
        return executor;
    }
}
```

### 2) `@Async`에 커스텀 `TaskExecutor` 지정

`@Async` 애너테이션이 적용된 메서드에 특정 `TaskExecutor`를 지정하지 않으면 기본 `Executor`인 `SimpleAsyncTaskExecutor`가 사용되므로, 커스텀 Bean 이름을 반드시 명시해야 한다.

```java
@Service
public class NotificationService {

    @Async("customTaskExecutor")
    public void sendNotification(String message) {
        System.out.println(Thread.currentThread().getName() + " → 알림 전송: " + message);
    }
}
```

### 3) 여러 `TaskExecutor` 활용 전략

#### 작업 성격별 `Executor` 분리

실무에서 CPU 연산 작업과 I/O 중심 작업을 같은 스레드 풀에서 처리하면 병목이 발생할 수 있으므로, **여러** `TaskExecutor`**를 정의해 자원을 분리**하는 것이 좋다.

```java
@Configuration
public class MultiExecutorConfig {

    @Bean(name = "cpuExecutor")
    public TaskExecutor cpuExecutor() {
        ...
    }

    @Bean(name = "ioExecutor")
    public TaskExecutor ioExecutor() {
        ...
    }
}
```

---
