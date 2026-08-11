---
layout: single-editorial
title: '[TIL 18일 차] Spring Beans의 이해와 활용'
excerpt: 'Bean 개념과 IoC 컨테이너 ~ Bean 스코프와 라이프사이클'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til018/

toc: true
toc_sticky: true

date: 2026-01-26
last_modified_at: 2026-01-26
---

# 오늘의 학습

## <span style="background-color: #FFF9C4">1. Bean 개념과 IoC 컨테이너</span>

### 1-01. Bean과 Bean 메타데이터(Configuration Metadata)

**Bean**은 Spring 프레임워크에서 **Bean**은 **Spring IoC 컨테이너에 의해 관리되는 객체**를 의미

**메타데이터(Configuration Metadata)**는 Spring 컨테이너에게 **“어떤 객체를, 어떻게 Bean으로 관리할지”** 알려주는 설계 정보로, Spring이 객체를 Bean으로 관리할 때 필요한 정보

- 종류
  - Bean 이름/클래스 정보, 의존성 정보, Scope 정보, 초기화/소멸 메서드, 생성 시점 등

<br>

### 1-02. Spring IoC 컨테이너에서 Bean 생명주기

Bean 생성 → 의존성 주입 → 초기화(`@PostConstruct`) → 사용(비즈니스 로직) → 소멸(`@PreDestory`)

<br>

### 1-03. ApplicationContext와 BeanFactory

#### 1) BeanFactory

Spring 컨테이너의 **최상위 인터페이스**로, **Bean의 생성 및 조회에 필요한 최소 기능**만 제공한다. 즉, Spring 컨테이너의 핵심은 결국 BeanFactory에서 출발한다고 할 수 있다.

<br>

#### 2) ApplicationContext

`BeanFactory`를 상속한 일종의 **확장 컨테이너 인터페이스**로, 아주 쉽게 말하면, Spring 컨테이너의 구현체

실제 스프링 애플리케이션에서는 대부분 이 인터페이스를 사용한다. 왜냐하면 `BeanFactory`가 할 수 있는 역할을 모두 소화해내면서 다른 부가 기능들도 처리할 수 있기 때문

---

## <span style="background-color: #FFF9C4">2. Java 기반 Bean 설정</span>

### 2-01. ⭐Java 기반 Bean 설정

Spring 3.0 이후 도입된 방식으로, XML 설정을 대체하여 **타입 안정성**과 **IDE 지원**을 개선하고, `@Configuration` 클래스와 `@Bean` 메서드를 중심으로 **보다 선언적인 방식으로 Bean을 구성**할 수 있게 해줌

<br>

#### 1) `@Configuration` 과 `@Bean`

- `@Configuration`
  - 해당 클래스를 **구성 클래스(Configuration Metadata)**로 선언
  - 해당 클래스 내부에는 **하나 이상의 `@Bean` 메서드를 정의**하며, 이 메서드들은 모두 Spring IoC 컨테이너에 의해 관리됨
- `@Bean`
  - `@Bean`은 메서드 단위에 선언하여 해당 메서드가 반환하는 객체를 Spring Bean으로 등록
  - **반환 타입은 일반 POJO 클래스**

<br>

### 2-02. ⭐컴포넌트 스캔(`@ComponentScan`)

**특정 패키지 이하의 클래스들을 자동으로 탐색**하여 IoC 컨테이너에 Bean으로 등록할 수 있게 하는 애너테이션으로, 명시적인 `@Bean` 어애너테이션노테이션 정의 없이도 주요 애너테이션(`@Component`, `@Service`, `@Repository`, `@Controller`)을 통해 **자동 Bean 등록을 지원**하는 방식

- **동작 원리**
  - Spring이 지정한 패키지부터 하위 패키지까지 탐색하면서, Bean 등록 대상이 되는 클래스를 자동으로 찾고 등록
    - `@SpringBootApplication`은 내부에 `@ComponentScan`을 포함하고 있어서, 해당 애너테이션을 설정한 클래스의 하위 모든 패키지를 스캔함

<br>

### 2-03. `@SpringBootApplication`의 동작 방식

Spring Boot 애플리케이션의 **진입점**에 붙는 핵심 애너테이션으로, 실제로는 아래 세 가지 애너테이션을 조합한 **메타 애너테이션**이다

- `@SpringBootConfiguration` : 설정 클래스임을 명시. 내부적으로 `@Configuration` 포함
- `@EnableAutoConfiguration` : 클래스패스, 설정 파일, 조건 등을 기반으로 Bean 자동 등록 수행
- `@ComponentScan` : 현재 패키지를 기준으로 하위 클래스에서 `@Component`, `@Service` 등 자동 탐색

---

## <span style="background-color: #FFF9C4">3. 의존관계 주입의 이해</span>

### 3-01. 의존성 주입 방법

IoC(Inversion of Control) 원칙에 따라 **의존성 주입(Dependency Injection, DI)**을 제공하여, **결합도를 낮추고 유연한 설계**를 가능

- **생성자 주입 방식**
  - 장점
    - 객체 간 의존성 보장
    - 객체 불변성 보장
    - 코드 가독성
    - 테스트 용이성
- **setter 주입 방식**
- **필드 주입 방식**
  - 문제점
    - 테스트 어려움
    - 불투명한 의존성
    - DI 프레임워크에 강하게 의존

<br>

### 3-02. 동일 타입 bean 처리

동일한 타입의 Bean이 **여러 개 등록된 경우**, 주입 대상이 모호해지는 문제가 발생할 수 있다.

- 해결 방법
  - 기본값 지정 : `@Primary`
  - 명시적 선택 : `@Qualifier`
  - 빈 이름을 통한 식별 : `@Resource`, `@Inject`

<br>

### 3-03. 다양한 의존관계

#### 1) 선택적 의존관계 처리

어떤 Bean이 **존재할 수도 있고, 존재하지 않을 수도 있는 상황**에서는 선택적 주입이 필요

- `@Autowired(required = false)`
- `Optional<T>`**을 활용한 주입 (Java 8버전 이상)**
- `@Nullable`**을 활용한 주입**

<br>

#### 2) 컬렉션 / 배열 의존관계

동일한 타입의 Bean이 **여러 개 존재할 경우**, Spring은 이를 `List`, `Map`, 배열 등으로 자동 주입해줄 수 있다.

<br>

#### 3) 순환 참조(circular dependency) 방지

두 개 이상의 Bean이 서로를 주입하려고 할 경우 발생

- 해결 방법
  - 설계 개선
  - setter 주입 사용
  - Spring Boot 2.6+에서는 순환 참조 기본 금지

---

## <span style="background-color: #FFF9C4">4. Bean 스코프와 라이프사이클</span>

### 4-01. Bean 스코프

Spring Bean이 생성될 때 생성되는 인스턴스의 범위를 말함.

| Bean Scope | Description                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Singleton  | 하나의 인스턴스만을 생성하고, 모든 빈이 해당 인스턴스를 공유하여 사용한다.                                                           |
| Prototype  | 매번 새로운 인스턴스를 생성한다.                                                                                                     |
| Request    | HTTP 요청을 처리할 때마다 새로운 인스턴스를 생성하고, 요청 처리가 끝나면 인스턴스를 폐기한다. 웹 애플리케이션 컨텍스트에만 해당된다. |
| Session    | HTTP 세션 당 하나의 인스턴스를 생성하고, 세션이 종료되면 인스턴스를 폐기한다. 웹 애플리케이션 컨텍스트에만 해당된다.                 |

<br>

### 4-02. 스코프 프록시(`proxyMode`)

웹 스코프(`request`, `session`등)을 사용하는 Bean은 싱글통 Bean에 직접 주입하면, 주입 시점에 웹 스코프 객체가 존재하기 않기 때문에 동작 오류가 발생할 수 있다.

이 문제를 해결하기 위해서 Spring에서는 **스코프 프록시(scope proxy)** 기능을 제공한다.

- **프록시(Proxy)**
  - Java에서 **프록시(Proxy)** 는 본래 객체의 대리자 역할을 수행하는 객체
  - 원래 객체를 감싸서, **기능을 확장하거나 호출 흐름을 제어**할 수 있도록 돕는다.
  - 지연 초기화나 트랜잭션 관리, 로깅, 보안 등 AOP에 적용
- **프록시 종류**

| 옵션                           | 설명                     | 특징                                                 |
| ------------------------------ | ------------------------ | ---------------------------------------------------- |
| `ScopedProxyMode.TARGET_CLASS` | CGLIB 기반 클래스 프록시 | 대상 클래스 자체를 상속하여 프록시를 생성            |
| `ScopedProxyMode.INTERFACES`   | JDK 동적 프록시          | 대상 객체가 구현한 인터페이스를 기반으로 프록시 생성 |

<br>

### 4-03. Life-cycle 콜백 메커니즘

Spring Bean 생성 이후 초기화 작업이나 소멸 직전 정리 작업을 자동으로 제어할 수 있도록 도와주는 메커니즘

- `@Bean(initMethod = "init", destroyMethod = "cleanup")`
  - `initMethod`: Bean 생성 직후 호출할 메서드
  - `destroyMethod`: 컨테이너 종료 시 호출할 메서드
  - 주의: `destroyMethod`는 싱글톤 스코프에서만 동작함.
- `@PostConstruct` 와 `@PreDestroy`
  - `@PostConstruct`: Bean 생성 후 호출됨 (의존성 주입 완료 시점)
  - `@PreDestroy`: ApplicationContext가 종료되기 전 호출됨
  - 가장 널리 사용되는 방식이며, Java 기반 Config 방식 및 Spring Boot와 잘 호환됨.
