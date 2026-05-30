---
title: '[TIL 77-4일 차] Java 비동기 처리하기'
excerpt: '6.CompletableFuture 기초 ~ 7.CompletableFuture 활용과 실전 패턴'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til077-4

toc: true
toc_sticky: true

date: 2026-05-27
last_modified_at: 2026-05-27
---

# <span style="background-color: #FFF9C4">6. `CompletableFuture` 기초</span>

## 6-01. `CompletableFuture`의 등장 배경

기존 `Future`에는 아래의 문제가 존재

- **블로킹 문제**
  - `get()` 호출 시 스레드가 결과를 기다리며 멈춤
- **Callback 부재**
  - 완료 후 자동 실행 기능이 없음
- **연쇄 작업(Chaining) 불가**
  - 여러 비동기 작업을 연결하기 어려움

즉, `Future`은 “비동기처럼 보이지만 실질적으로 동기”에 가까운 구조

이 문제 해결을 위해 `CompletableFuture` 등장

<br>

### 1) `CompletableFuture`

**비동기 작업을 조합하고 연결할 수 있는 실행 파이프라인**

`CompletionStage` 인터페이스를 함께 구현함으로써 **비동기 단계(Async Stage)를 연결할 수 있는 구조**를 제공

#### 함수형 프로그래밍 스타일 지원

기존 `Future`는 비동기라고 해도 `get()`을 호출해야만 결과를 얻을 수가 있어서 **동기적 흐름**을 강제

하지만 `CompletableFuture`는 **람다 표현식과 메서드 체이닝**을 결합하여, 비동기 코드를 데이터 스트림처럼 자연스럽게 표현할 수 있음

- `get()`을 호출하지 않아도 됨

<br>

### 2) `CompletionStage`

여러 비동기 작업을 **단계(Stage)**로 표현하고, 이것들을 연결(Compose)할 수 있도록 설계된 인터페이스

- “**작업이 끝나면 다음 작업을 실행하라**”는 개념을 코드 수준에서 지원

```java
CompletionStage<String> stage = CompletionFuture.supplyAsync(() -> "1단계")
        .thenApply(result -> result + " ➡️ 2단계")
        .thenApply(result -> result + " ➡️ 3단계");

stage.thenAccept(System.out::println);
```

- 출력 결과: `1단계 ➡️ 2단계 ➡️ 3단계`
- 모든 작업은 비동기로 이어짐

#### `CompletionStage`의 핵심 메서드

- `thenApply()`
  - 이전 결과를 변환하여 반환
- `thenAccept()`
  - 결과를 받아 처리하고 반환 없음
- `thenRun()`
  - 결과와 관계없이 후속 동작 수행
- `thenCombine()`, `thenCompose()`
  - 여러 작업 결합 및 순차 연결

<br>

## 6-02. `CompletableFuture` 생성 방식

기존 `Future`보다 유연한 방식으로 비동기 작업 생성 가능

### 1) `runAsync()`

`Runnable` 인터페이스를 인자로 받아 **결과값 없이 비동기 작업 수행**

<br>

### 2) `supplyAsync()`

`Supplier<T>` 인터페이스를 인자로 받아 **결과값을 반환하는 비동기 작업**을 실행

- 내부적으로 `Callable`과 유사한 구조로 동작

<br>

### 3) `completedFuture()`

테스트나 단위 실행 시, 이미 결과가 정해진 `CompletableFuture`를 생성하고 싶을 때 사용

- 테스트 코드나 즉시 반환이 필요한 경우 유용

<br>

### 4) `ForkJoinPool.commonPool()`

Java가 **기본적으로 제공하는 공용 스레드 풀**

`CompletableFuture`의 `runAsync()`나 `supplyAsync()`를 실행할 때 별도의 `Executor`를 지정하지 않으면, 자동으로 **이 공용 풀**에서 스레드가 할당되어 작업을 수행

- **Fork/Join 프레임워크** 기반으로 설계됨
  - Fork(분기) : 큰 작업을 작은 단위로 분할
  - Join(결합) : 분할된 작업들의 결과를 다시 합침

<br>

### 5) 커스텀 `Executor` 지정하기

기본적으로 `CompletableFuture`는 `ForkJoinPool.commonPool()`을 사용하지만, 대규모 I/O 작업이나 병렬 처리를 할 때는 **별도의 스레드 풀(Executor)**을 지정하는 것이 좋다.

```java
ExecutorService executor = Executors.newFixedThreadPool(2);

CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
    System.out.println("작업 실행 스레드: " + Thread.currentThread().getName());
}, executor);
```

<br>

## 6-03. 작업 체이닝(Chaining) 메서드

`CompletableFuture`은 **처리 로직을 체인 형태로 연결(Chining)**할 수 있다.

<br>

### 1) `thenApply()`

이전 작업의 **결과를 입력으로 받아 새로운 결과를 생성**

- 반환값을 새롭게 만들어 전달할 때 사용
- 예: API 응답 데이터 가공이나 문자열 처리 단계에 적합

<br>

### 2) `thenAccept()`

이전 작업의 결과를 **단순히 소비(consume)**하며, 새로운 결과를 반환하지 않음

- 반환값 없기(`Void`) 때문에, 이후에 `thenApply()` 사용 불가
- 결과를 DB에 저장하거나 콘솔에 출력하는 등 후처리에 적합

<br>

### 3) `thenRun()`

이전 작업의 결과를 전혀 사용하지 않고, **새로운 독립 작업을 실행**

- 이전 결과가 필요없는 후속 작업에 사용
  - 예: 작업 완료 로그 작성, Resource 정리 등

<br>

## 6-04. 후속 작업 처리 메서드

### 1) `get()`

작업이 끝날 때까지 기다린 뒤 결과 반환

- 블로킹
- 예외 처리 : Checked Exception (`InterruptedException`, `ExecutionException`)

<br>

### 2) `join()`

`get()`과 비슷하지만 예외 처리가 더 간단

- 블로킹
- 예외 처리 : Unchecked Exception (`CompletionException`)

<br>

### 3) `getNow(defaultValue)`

작업이 완료되었으면 결과를 반환하고, 아직 완료되지 않았으면 기본값을 반환

- 비블로킹
- 예외 처리 ❌

---

# <span style="background-color: #FFF9C4">7. `CompletableFuture` 활용과 실전 패턴</span>

## 7-01. 비동기 작업 조합

`CompletableFuture`는 단일 작업만 처리하는 것이 아니라, 여러 비동기 작업을 **연결하거나 결합**할 수 있다.

이 때 사용하는 메서드를 아래 정리했다.

### 1) `thenCompose()`

**이전 비동기 결과를 받아 다음 비동기 작업으로 연결**할 때 사용

- 비동기 ➡️ 비동기 ➡️ 비동기 ➡️ …
- 내부적으로 `Future`의 중첩 구조를 평탄화(flatten)한다.

```java
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
    System.out.println("1단계: 사용자 ID 가져오기");
    return "user123";
}).thenCompose(userId -> CompletableFuture.supplyAsync(() -> {
    System.out.println("2단계: 사용자 정보 조회");
    return "정보(" + userId + ")";
})).thenCompose(userInfo -> CompletableFuture.supplyAsync(() -> {
    System.out.println("3단계: 알림 발송");
    return "알림 완료 → " + userInfo;
}));
```

#### 반대로 `thenApply`로 연결한다면?

`thenCompose()`는 내부 `Future`를 평탄화해 결과를 바로 전달하지만 `thenApply()`는 `Future`로 감싸기 때문에 `Future<Future<T>>` 구조가 된다.

<br>

### 2) `thenCombine()`

**두 개의 독립적인 비동기 작업**(`Future`)**을 병렬로 실행**하고, **두 결과를 결합하여 새로운 결과를 생성**

```java
CompletableFuture<Integer> priceFuture = CompletableFuture.supplyAsync(() -> {
    System.out.println("가격 조회 중...");
    return 3000;
});

CompletableFuture<Integer> discountFuture = CompletableFuture.supplyAsync(() -> {
    System.out.println("할인율 계산 중...");
    return 500;
});

CompletableFuture<Integer> totalFuture = priceFuture.thenCombine(discountFuture, (price, discount) -> {
    return price - discount;
});
```

<br>

### 3) `allOf()`

여러 비동기 작업을 동시에 실행하고, **실행한 모든 작업이 완료될 때까지 기다리는 메서드**

- 모든 작업이 끝난 시점을 감지할 때 사용
  - **모든 작업이 끝났다**는 **신호만 알려줌**
- 반환값이 없음
  - 반환형 : `CompletableFuture<Void>`

```java
CompletableFuture<Void> all = CompletableFuture.allOf(
        CompletableFuture.runAsync(() -> System.out.println("1번 작업 완료")),
        CompletableFuture.runAsync(() -> System.out.println("2번 작업 완료")),
        CompletableFuture.runAsync(() -> System.out.println("3번 작업 완료"))
);
```

<br>

### 4) `anyOf()`

**여러 비동기 작업 중 가장 먼저 완료된 결과**를 반환

- 여러 서버 중 가장 빠른 응답을 사용하는 경우에 사

```java
CompletableFuture<Object> any = CompletableFuture.anyOf(
        CompletableFuture.supplyAsync(() -> {
            sleep(1000);
            return "작업 1 완료";
        }),
        CompletableFuture.supplyAsync(() -> {
            sleep(500);
            return "작업 2 완료";
        }),
        CompletableFuture.supplyAsync(() -> {
            sleep(800);
            return "작업 3 완료";
        })
);
```

<br>

## 7-02. 비동기 예외 처리

비동기 프로그램에서는 **스레드 내부에서 예외가 발생해도 실시간으로 외부에 전달되지 않음**

`CompletableFuture`는 내부 스레드에서 발생한 모든 예외를 `CompletionException`으로 래핑해 메인 스레드로 전달하기 때문에 단순한 `try-catch` 문으로 예외를 포착할 수 없다.

<br>

### 1) `exceptionally()`

예외가 발생했을 때만 호출되는 **복구 Callback**

- 정상적으로 완료되면 무시되고, 오류 건은 따로 처리

```java
  CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
      System.out.println("데이터 조회 중...");
      if (true) throw new RuntimeException("DB 연결 실패");
      return "정상 데이터";
  }).exceptionally(ex -> {
      System.out.println("예외 처리: " + ex.getMessage());
      return "기본값 반환";
  });
```

- 사용되는 경우
  - 외부 API 호출 실패 시 캐시 데이터로 대체
  - 장애 허용(fallback) 패턴 구현에 활용
  - 네트워크 장애 시 사용자 경험 유지를 위한 예외 복구 로직

<br>

### 2) `handle()`

**성공과 실패를 모두 처리할 수 있는 Callback**

- 매개변수
  - 첫 번째: 정상 결과값 (예외 시 `null`)
  - 두 번째: 예외 객체 (정상 시 `null`)

```java
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
    System.out.println("사용자 데이터 처리 중...");
    if (true) throw new IllegalStateException("데이터 오류");
    return "성공";
}).handle((result, ex) -> {
    if (ex != null) {
        System.out.println("예외 처리: " + ex.getMessage());
        return "복구된 결과";
    }
    System.out.println("정상 처리: " + result);
    return result;
});
```

- `exceptionally()`**보다 더 일반적인 경우에 사용됨**
  - 성공/실패를 구분해 로깅할 때
  - REST API 응답 상태 코드 변환 시
  - 예외 발생 후에도 동일 타입의 결과를 유지할 때

<br>

### 3) `whenComplete()`

결과를 **변경하지 않고**, 후처리(로깅, Resource 정리 등)에 사용됨

결과는 그대로 다음 단계로 전달

```java
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
    System.out.println("파일 업로드 중...");
    if (true) throw new RuntimeException("네트워크 오류");
    return "업로드 성공";
}).whenComplete((result, ex) -> {
    if (ex != null) System.out.println("로그 기록: 오류 → " + ex.getMessage());
    else System.out.println("로그 기록: 결과 → " + result);
}).exceptionally(ex -> "업로드 실패 (기본값)");
```

<br>

## 7-03. 타임아웃 처리

비동기 프로그램에서는 **외부 서비스 지연, 네트워크 문제, 무한 대기 상태**와 같은 상황이 빈번하게 발생함

이 때 타임아웃을 설정하지 않으면, 프로그램은 결과를 무한히 기다리게 되어 시스템 전체 응답성이 저하됨

<br>

### 1) 타임아웃 설정 목적

- 외부 의존성(API, DB 등)의 지연으로부터 시스템 보호
- 사용자 응답 대기 시간 제한
- 장애 허용(fail-fast) 전략 구현
- 복구 로직(fallback) 트리거 역할 수행

<br>

### 2) `orTimeout()`

`orTimeout(long timeout, TimeUnit unit)`는 **결과를 대체하지 않고, 지정한 시간이 지나도 `Future`가 완료되지 않으면 예외를 발시킴**

- 예외는 `java.util.concurrent.TimeoutException` 형태로 발생하며, 내부적으로 `completeExceptionally()`가 호출됨
- `exceptionally()`나 `handle()`과 조합해 예외 복구 가능

<br>

### 3) `completeOnTimeout()`

`completeOnTimeout(T value, long timeout, TimeUnit unit)` 메서드는 지정한 시간이 지나도 완료되지 않으면 **예외 대신 기본값을 반환**

- `기본값`으로 `Future`를 정상 완료시킴
- 안정성이 요구되는 서비스(Fallback 처리)에 적합

---
