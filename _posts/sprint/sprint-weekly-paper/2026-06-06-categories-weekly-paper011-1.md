---
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
last_modified_at: 2026-06-06
---

## Q1. 멀티스레드 환경에서 발생하는 대표적인 문제 중 하나인 경쟁 상태(Race Condition)에 대해 설명하고, 이를 해결하기 위한 다양한 전략을 설명해보세요.

### Q1-1. 답변

#### 경쟁 상태(Race Condition)

멀티스레드 환경에서 여러 스레드가 공유 자원에 동시에 접근해 작업을 수행할 때 여러 문제가 발생할 수 있다.

이 중 CPU 스케줄링 타이밍에 따라 스레드들의 실행 순서가 바뀌면서 프로그램의 최종 결과가 비결정적(Non-Deterministic)으로 변하는 현상을 **경쟁 상태(Race Condition)**이라고 한다.

**경쟁 상태**는 주로 읽기(Read)와 쓰기(Write) 과정이 분리되어 있는 비원자적(Non-Atomic) 연산 중에, 한 스레드가 처리를 완료하기 전 다른 스레드가 개입하면서 데이터 일관성이 깨지기 때문에 발생한다.

이러한 **경쟁 상태**를 방지하고 스레드 안정성(Thread-Safety)을 확보하기 위한 **전략**으로는 아래와 같다.

- **동기화(Synchronization) 기법 적용**
  - 여러 스레드가 하나의 공유 자원에 동시에 접근하지 못하도록 **임계 구역(Critical SEction)**을 설정해야 한다.
  - Java에서는 `synchronized` 키워드를 사용해 객체 고유의 **모니터 락(Monitor Lock)**을 점유하게 하여 동시 접근을 차단할 수 있다.
  - 다만, 락이 걸린 구간이 길어지면 전체 성능에 저하가 있을 수 있기 때문에 필요한 부분만 보호하는 **블록 동기화**를 진행하는 것이 권장된다.
- **스레드 안전(Thread-Safe)한 컬렉션 활용**
  - 일반적인 `HashMap`이나 `ArrayList`는 멀티스레드 환경에서 데이터가 꼬이는 현상이 발생할 수 있다.
  - 그래서 멀티스레드에 최적화된 컬렉션을 사용해야 한다.
    - `ConcurrentHashMap`은 Map 전체가 아닌 내부 데이터를 여러 구역(Segment)으로 나누어 **부분 락(Segment Lock)**을 걸기 때문에 성능 저하를 최소화하면서 안정성 보장
    - `BlockingQueue`는 스레드 간 데이터 교환(Producer-Consumer 구조)이 필요할 때 사용
- **원자적(Atomic) 변수 사용**
  - 단순 전역 변수 카운팅과 같은 작업에서는 원자성이 보장되지 않아 문제가 발생할 수 있으므로, `AtomicInteger`와 같은 원자적(Atomic) 클래스를 사용해 동시성 문제를 해결하는 것이 좋다.

---

## Q2. 비동기 환경에서 MDC(Logback Mapped Diagnostic Context)나 SecurityContext 같은 컨텍스트 정보를 스레드 간에 전달해야 할 경우, 처리하는 방법에 대해 설명하세요.

### Q2-1. 답변

#### 비동기 환경에서 컨텍스트(MDC, SecurityContext) 전달 방법

Spring에서 `@Async` 등을 활용한 비동기 작업은 별도의 스레드 풀(Thread Pool)에서 실행된다.

이때 문제가 발생할 수 있다. **MDC(Logback 로깅 컨텍스트)**나 Spring Security의 **SecurityContext**, 그리고 트랜잭션 정보 등은 각 스레드마다 독립적인 저장소를 가지는 **ThreadLocal 기반으로 관리**된다.

비동기 실행을 위해 새로운 스레드가 생성되거나 스레드 풀에서 할당될 때, 기존 메인 스레드의 `ThreadLocal` 데이터는 자동으로 복사되지 않으므로 로그 추적이 단절되거나 인증 정보가 유실되는 **실행 컨텍스트 손실(Context Loss)**이 일어난다.

스레드 간 컨텍스트를 전달하기 위해 Spring에서 제공하는 `TaskDecorator`를 활용해야 한다.

`TaskDecorator`는 비동기 작업(`Runnable`)이 실행되기 직전에 **기존 스레드 환경을 감싸(Wrapping) 새로운 스레드에 복사해주는 함수형 인터페이스**이다.

- **구체적인 처리 방법**
  - **MDC(로깅 컨텍스트) 전달**
    - `TaskDecorator`의 `decorate()` 메서드 내에서 메인 스레드의 `MDC.getCopyOfContextMap()`을 호출해 현재 로그 컨텍스트를 복제한다.
    - 그 후 래핑된 비동기 `Runnable` 내부에서 `MDC.setContextMap()`을 사용해 새로운 스레드에 값을 주입한다.
    - 스레드는 스레드 풀에 반환되어 재사용되기 때문에 작업이 끝나면 `finally` 블록에서 반드시 `MDC.clear()`를 호출해 이전 데이터가 남지 않도록 정리해야 한다.
  - **SecurityContext(인증 정보) 전달**
    - MDC와 동일한 원리로, 비동기 실행 전 메인 스레드에서 `SecurityContextHolder.getContext()`로 인증 객체로 가져온다.
    - 비동기 스레드 내에서 `SecurityContextHolder.setContext()`를 통해 할당하고, 작업 종료 후 `SecurityContextHolder.clearContext()`로 안전하게 초기화한다.
  - **다중 데코레이터 적용**(`CompositeTaskDecorator`)
    - Spring의 `ThreadPoolTaskExecutor`에는 단 하나의 `TaskDecorator`만 설정할 수 있다.
    - 만약 로깅(`MDC`), 보안(`SecurityContext`), 트랜잭션 등 여러 컨텍스트를 동시에 전파해야 한다면, 여러 데코레이터를 순차적으로 결합해 실행하는 `CompositeTAskDecorator`를 직접 구현해 등록해야 한다.

---
