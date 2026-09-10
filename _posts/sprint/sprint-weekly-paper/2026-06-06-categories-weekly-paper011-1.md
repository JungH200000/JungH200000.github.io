---
layout: single-editorial
title: '위클리 페이퍼11: 대용량 트래픽 관리 - 1주차'
excerpt: ''

categories:
  - Sprint Weekly Paper
tags:
  - [Codeit Sprint, Codeit Sprint Weekly Paper]

permalink: /categories/codeit-sprint/sprint-weekly-paper/weekly-paper011-1

toc: true
toc_sticky: true

date: 2026-06-06
last_modified_at: 2026-09-10
---

## Q1. 멀티스레드 환경에서 발생하는 대표적인 문제 중 하나인 경쟁 상태(Race Condition)에 대해 설명하고, 이를 해결하기 위한 다양한 전략을 설명해보세요.

### Q1-1. 경쟁 상태(Race Condition)란?

**경쟁 상태(Race Condition)**는 여러 스레드가 같은 공유 자원에 접근하고, 그 중 하나 이상의 스레드가 자원의 상태를 변경할 때, **스레드의 실행 순서나 타이밍에 따라 프로그램의 결과가 달라지는 문제**를 말한다.

특히 여러 스레드가 같은 데이터를 동시에 읽고 수정할 때 발생하기 쉽다.

예를 들어 아래의 코드가 있다고 가정해보자.

```java
private int count = 0;

public void increment() {
  count++;
}
```

`count++;`는 원자적 연산이 아니라 아래의 과정으로 동작한다.

```text
1. count 값을 읽는다.
2. 읽은 값에 1을 더한다.
3. 계산한 값을 count에 다시 저장한다.
```

두 스레드 A, B가 `count++`을 수행한다고 가정해보자.

```text
처음 count = 0

Thread A: count 읽음 ➡️ 0
Thread B: count 읽음 ➡️ 0

Thread A: 0 + 1 ➡️ 1
Thread B: 0 + 1 ➡️ 1

Thread A: count = 1
Thread B: count = 1
```

두 번 증가했으니 결괏값이 2가 되어야 하지만 실제 결과는 1이 된다.  
두 스레드가 같은 값을 읽은 뒤 각각 따로 수정하면서 **한 스레드의 변경 결과가 사라졌기 때문**이다.

이렇게 실행 순서에 따라 결과가 달라지는 것이 경쟁 상태의 대표적인 예시이다.

### Q1-2. 경쟁 상태를 해결하는 방법

#### `synchronized`

Java에서 가장 기본적으로 사용할 수 있는 동기화 방법이다.

```java
public synchronized void increment() {
  count++;
}
```

`synchronized`가 적용된 코드 영역은 동일한 모니터 락을 기준으로 **한 번에 하나의 스레드만 진입할 수 있다.**

- 모니터 락은 Java 객체마다 연결된 동기화용 잠금장치

따라서 한 스레드가 `count++`를 완료하기 전까지 다른 스레드는 해당 임계 영역에 들어오지 못하기 때문에 **경쟁 상태를 막을 수 있다.**

```text
Thread A
  ⬇️
lock 획득
  ⬇️
count++
  ⬇️
lock 해제
  ⬇️
Thread B 진입
```

- 장점
  - 문법이 간단하고
  - JVM에서 제공하는 기본적인 동기화 방법
- 단점
  - 여러 스레드가 하나의 락을 두고 경쟁하게 되면 기다리는 스레드가 많아질 수 있기 때문에 **임계 영역을 필요 이상으로 크게 잡으면 처리량이 낮아질 수 있다.**
  - 따라서 아래 코드처럼 필요한 부분만 동기화할 수 있다.

    ```java
    public void increment() {

      doSomethingWithoutLock();

      synchronized (this) {
        count++;
      }
    }
    ```

#### `Lock`

`java.util.concurrent.locks.Lock`을 이용할 수도 있다.

대표적인 구현체가 `ReentrantLock`이다.

```java
private final Lock lock = new ReentrantLock();

public void increment() {
  lock.lock();

  try {
    count++;
  } finally {
    lock.unlock();
  }
}
```

기본적으로 락을 획득한 스레드만 공유 자원에 접근한다는 점은 `synchronized`와 비슷하다.  
하지만 `Lock`은 조금 더 세밀한 제어가 가능하다.

예를 들어 일정 시간만 락 획득을 기다릴 수 있다. 또한 `tryLock()`, 인터럽트 가능한 락 획득, 공정성 설정, `Condition` 등을 사용할 수 있다.

그래서 **단순한 동기화라면** `synchronized`,  
락 획득 과정이나 대기 정책 등을 세밀하게 제어해야 한다면 `Lock`을 고려할 수도 있다.

그리고 `finally`에서 `unlock()`을 호출하는 이유는 임계 영역에서 예외가 발생하더라도 **락은 반드시 해제되어야 하기 때문이다.** 락이 해제되지 않는다면 다른 스레드들이 계속 기다리게 되는 문제가 발생한다.

#### Atomic 클래스

단순한 값 증가처럼 하나의 변수에 대한 원자적 연산이 필요하다면 `AtomicInteger`, `AtomicLong` 같은 Atomic 클래스를 사용할 수 있다.

- 원자적 연산이란 하나의 연산 단위로 처리되어서 중간 상태가 다른 스레드에 노출되지 않는 연산을 말한다.

```java
private final AtomicInteger count = new AtomicInteger();

public void increment() {
  count.incrementAndGet();
}
```

Atomic 클래스는 CAS(Compare-And-Swap) 계열의 원자적 연산을 활용해 값을 안전하게 변경한다.

CAS는 기본적으로 아래처럼 동작한다.

```text
현재값이 내가 예상했던 값인가?

YES ➡️ 새로운 값으로 변경
NO ➡️ 다른 스레드가 변경했으므로 다시 시도
```

예를 들어 현재 값이 10이라고 예상하고 11로 바꾸려고 했는데 다른 스레드가 먼저 11로 변경했다면 값을 바로 덮어쓰지 않고 다시 확인한다.

따라서 일반적인 락처럼 스레드가 하나의 락을 잡고 다른 스레드가 락 반환을 기다리는 방식과 다르다.

즉, **하나의 값에 대한 짧고 원자적인 연산**에 좋은 선택이다.

다만 여러 변수를 하나의 논리적인 작업으로 함께 수정해야 하는 복잡한 임계 영역이라면 Atomic 클래스 하나만으로 문제를 해결하기 어렵다.

또한 경쟁이 매우 심하면 CAS가 계속 실패하면서 재시도가 많아질 수 있다.

#### Concurrent 컬렉션

여러 스레드가 컬렉션을 공유한다면 직접 동기화하기 보다 Java에서 제공하는 동시성 컬렉션을 사용할 수도 있다.

대표적으로 아래의 컬렉션이 있다.

```java
ConcurrentHashMap
CopyOnWriteArrayList
ConcurrentLinkedQueue
```

위 컬렉션을 사용하면 일반 `HashMap`을 여러 스레드에서 동시에 수정하는 대신 아래처럼 사용할 수 있다.

```java
private final ConcurrentHashMap<String, Integer> counts = new ConcurrentHashMap<>();

public void increment(String key) {
  counts.merge(key, 1, Integer::sum);
  // 해당 key가 없다면 새로운 값을 넣고, 있으면 기존 값과 새 값을 합치는 기능
}
```

다만, 여기서 중요한 점은 `ConcurrentHashMap`을 사용한다고 해서 여러 연산을 조합한 모든 코드가 자동으로 원자적이 되는 것은 아니다.

아래의 코드가 있다면

```java
if (!counts.containsKey(key)) {
  counts.put(key, value);
}
```

`containsKey()`와 `put()` 사이에 다른 스레드가 끼어들 수 있기 때문에 `putIfAbsent()`, `compute()`, `computeIfAbsent()`, `merge()`처럼 메서드 단위로 원자성을 보장하는 연산을 활용해야 한다.

#### 공유 가변 상태 자체를 줄이기

가장 근본적인 접근으로는 **경쟁할 공유 자원을 만들지 않는 것**이다.

예를 들어 객체를 생성한 뒤 값을 변경할 수 없도록 불변 객체로 만들 수 있다.

```java
public final class UserInfo {

  private final String name;
  private final int age;

  public UserInfo(String name, int age) {
    this.name = name;
    this.age = age;
  }
}
```

또는

아래처럼 여러 스레드가 Mutable 객체를 함께 수정하면서 동기화가 필요한 경우에서

```text
공유되는 Mutable 객체
  ⬇️
여러 Thread가 수정
  ⬇️
동기화 필요
```

각 스레드가 자신만의 데이터를 처리하도록 만들거나, 필요한 데이터를 복사해서 각 스레드에 따로 전달할 수 있다.

```text
Immutable 데이터
또는
Thread별 독립 데이터
  ⬇️
동시에 수정하는 공유 상태가 없음
  ⬇️
스레드간 경쟁 감소
  ⬇️
Race Condition 가능성 감소
```

---

## Q2. 비동기 환경에서 MDC나 `SecurityContext` 같은 컨텍스트 정보를 스레드 간에 전달해야 할 경우, 처리하는 방법에 대해 설명하세요.

### Q2-1. 비동기 환경에서 컨텍스트 정보가 사라지는 이유

Spring에서 `@Async`를 사용하면 해당 메서드는 일반적으로 **요청을 처리하던 스레드가 아니라 별도의 스레드 풀에 있는 스레드에서 실행**된다.

예를 들어 요청을 처리하는 스레드가 아래와 같다고 가정하자.

```text
HTTP 요청
 ⬇️
http-nio-8080-exec-1
  ├─ MDC: requestId=abc123
  └─ SecurityContext: userA
```

여기서 `@Async` 메서드를 호출하면 실제 작업은 다른 스레드에서 실행될 수 있다.

```text
http-nio-8080-exec-1
 ⬇️
 ⬇️ `@Async` 호출
 ⬇️
task-1
```

문제는 MDC와 `SecurityContextHolder`가 일반적으로 **현재 스레드와 연결된 컨텍스트**라는 것이다.

MDC는 내부적으로 스레드별 로깅 정보를 제공하고,  
Spring Security의 `SecurityContextHolder`도 기본적으로 `ThreadLocal`을 이용해 현재 스레드의 인증 정보를 관리한다.

그래서 아래처럼 생각해볼 수 있다.

```text
Thread A
ThreadLocal
└─ requestId = abc123

Thread B
ThreadLocal
└─ 없음
```

Thread A의 `ThreadLocal` 값이 Thread B로 자동 복사되는 것이 아니다.

그래서 원래 요청의 `requestId`가 MDC에 들어 있어도 비동기 스레드에서는 해당 값을 찾지 못할 수 있다.

`SecurityContext`도 마찬가지라서 인증된 사용자의 정보가 필요한 비동기 코드에서 아래 코드로 조회했을 때 기대하는 인증 정보가 조회되지 않을 수 있다.

```java
SecurityContextHolder.getContext().getAuthentication()
```

### Q2-2. MDC란?

MDC는 Mapped Diagnostic Context의 약자로, 요청이나 작업을 식별할 수 있는 값을 현재 스레드의 컨텍스트에 저장하고 로그에 함께 기록할 때 사용한다.

예를 들어 요청이 들어왔을 때 `requestId`를 MDC에 저장했다고 가정해보자.

```java
MDC.put("requestId", "abc123");
```

로그 패턴을 설정하면 이후의 모든 로그에 같은 값을 표시할 수 있다.

```text
[requestId=abc123] 사용자 조회 시작
[requestId=abc123] DB 조회 완료
[requestId=abc123] 응답 반환
```

특히 동시에 많은 요청이 들어오는 서버에서는 여러 요청의 로그가 섞여 나오기 때문에 `requestId`, `traceId` 같은 값을 이용해서 **같은 요청에서 발생한 로그들을 묶어 추적**하는데 유용하다.

그러나 중간에 `@Async`가 들어가면 실행 스레드가 변경되면서 이런 값들이 끊어질 수 있다.

```text
http-nio-1
[abc123] 알림 요청 시작
 ⬇️
 ⬇️ `@Async` 호출
 ⬇️
task-1
[      ] 알림 전송
```

따라서 기존 컨텍스트를 비동기 스레드로 전달하는 과정이 필요하다.

### Q2-3. `TaskDecorator`를 이용한 MDC 전달

`TaskDecorator`에서 **호출 스레드의 MDC를 복사하고, 비동기 작업을 실행하기 전에 작업 스레드에 설정한 뒤 작업이 끝나면 정리**한다.

아래처럼 동작한다고 보면 된다.

```text
요청 Thread
MDC = { requestId=abc123 }
 ⬇️
 ⬇️ 1. MDC 복사
 ⬇️
TaskDecorator
 ⬇️
 ⬇️ 2. 비동기 Thread에 설정
 ⬇️
비동기 Thread
MDC = { requestId=abc123 }
 ⬇️
 ⬇️ 3. 작업 실행
 ⬇️
 ⬇️ 4. 작업 완료 후 MDC 정리
 ⬇️
MDC.clear()
```

이걸 코드로 구현해보면 아래와 같다.

```java
public class MdcTaskDecorator implements TaskDecorator {

  @Override
  public Runnable decorate(Runnable runnable) {

    // 비동기 작업을 제출하는 시점에 현재 스레드의 MDC를 복사
    // 제출하는 시점 = 현재 스레드가 실행할 `Runnable`을 스레드 풀에 넘기는 시점
    Map<String, String> contextMap = MDC.getCopyOfContextMap();

    return () -> {
      try {
        if (contextMap != null) {
          // 복사했던 MDC 설정
          MDC.setContextMap(contextMap);
        }

        runnable.run();
      } finally {
        MDC.clear();
      }
    };
  }
}
```

#### Tip. 왜 반드시 `MDC.clear()`를 해야 하는가?

Spring 비동기 작업에서는 보통 매 작업마다 새로운 Thread 객체를 생성하지 않고 **스레드 풀의 스레드를 재사용**한다.

요청 A가 작업을 끝낸 뒤 MDC를 제거하지 않으면 기존 스레드 풀의 스레드에는 이전 요청에 대한 정보가 남아 있을 가능성이 있다. 그러면 요청 B를 처리하면서 잘못된 로그 컨텍스트가 사용될 수 있다.

그러므로 **작업의 성공 여부와 관계없이 컨텍스트를 정리**하는 것이 중요하다.

`finally`를 사용하는 이유도 작업 중 예외가 발생해도 반드시 정리될 수 있게 하기 위해서이다.

### Q2-4. 작성한 `TaskDecorator`를 `ThreadPoolTaskExecutor`에 등록

작성한 `TaskDecorator`를 `ThreadPoolTaskExecutor`에 등록한다.

```java
@Bean
public ThreadPoolTaskExecutor asyncExecutor() {

  ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();

  executor.setCorePoolSize(5);
  executor.setMaxPoolSize(10);
  executor.setQueueCapacity(100);

  executor.setTaskDecorator(new MdcTaskDecorator());

  executor.initialize();

  return executor;
}
```

위 코드처럼 구현하면 해당 Executor를 이용해 실행되는 작업에는 `TaskDecorator`가 적용된다.

만약 여러 Executor를 사용하는 환경이라면 `@Async("asyncExecutor")`처럼 비동기 작업이 `TaskDecorator`를 등록한 Executor를 사용하도록 지정해야 한다.

```text
요청 Thread
 ⬇️
 ⬇️ MDC 복사
 ⬇️
ThreadPoolTaskExecutor
 ⬇️
 ⬇️
 ⬇️
TaskDecorator
 ⬇️
 ⬇️ MDC 설정
 ⬇️
@Async 작업
 ⬇️
 ⬇️
 ⬇️
MDC 정리
```

### Q2-5. `SecurityContext`를 비동기 스레드에 전달하는 방법

`SecurityContext`도 같은 문제가 발생한다.

사용자가 로그인한 상태에서 요청을 처리한다고 가정해 보자.

```text
요청 Thread
SecurityContext
└─ Authentication
   └─ userA
```

그런데 비동기 스레드가 실행된다면 기본적으로 다른 스레드이기 때문에 현재 요청 스레드의 인증 정보가 그대로 존재할 수 없다.

이 문제 또한 MDC와 동일한 방식으로 **`TaskDecorator`를 이용해 `SecurityContext`를 확보하고 비동기 스레드에 설정**하면 된다.

```java
SecurityContext context = SecurityContextHolder.getContext();

return () -> {
  try {
    SecurityContextHolder.setContext(context);

    runnable.run();
  } finally {
    SecurityContextHolder.clearContext();
  }
}
```

즉, 아래 같은 구조다.

```text
요청 Thread
SecurityContext = { Authentication }
 ⬇️
 ⬇️ 1. SecurityContext 확보
 ⬇️
TaskDecorator
 ⬇️
 ⬇️ 2. 비동기 Thread에 설정
 ⬇️
비동기 Thread
SecurityContext = { Authentication }
 ⬇️
 ⬇️ 3. 작업 실행
 ⬇️
 ⬇️ 4. 작업 완료 후 SecurityContext 정리
 ⬇️
SecurityContextHolder.clearContext();
```

여기서도 작업이 끝난 후 컨텍스트를 정리해야 하는 이유는 MDC와 동일하다. 스레드 풀은 스레드를 재사용하기 때문이다.

#### `TaskDecorator` 외에 Spring Security에서는 전용 기능도 제공한다.

Spring Security에서는 SecurityContext 전달을 위해서 직접 `TaskDecorator`를 구현하는 것 외에 `DelegatingSecurityContextRunnable`, `DelegatingSecurityContextExecutor`, `DelegatingSecurityContextAsyncTaskExecutor` 같은 전용 기능도 있다.

예를 들어 비동기 Executor를 감쌀 수 있다.

```java
@Bean
public AsyncTaskExecutor taskExecutor() {

  ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();

  executor.setCorePoolSize(5);
  executor.initialize();

  return new DelegatingSecurityContextAsyncTaskExecutor(executor);
}
```

동작 흐름은 아래와 같다.

```text
SecurityContext 확보
 ⬇️
비동기 Thread에 설정
 ⬇️
Runnable 실행
 ⬇️
SecurityContext 정리
```
