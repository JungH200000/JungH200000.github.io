---
title: '[TIL 15일차] Spring 오버뷰'
excerpt: 'Spring Framework의 탄생 배경 ~ Spring의 핵심 개념'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til015-2/

toc: true
toc_sticky: false

date: 2026-01-21
last_modified_at: 2026-01-21
---

# 오늘의 학습

## <span style="background-color: #FFF9C4">1. Spring Framework의 탄생 배경</span>

### 1-01. 과거 Java EE 개발의 어려움

#### 1) EJB(Enterprise JavaBeans)

예전 Java EE 환경에서 사용되던 기술로, 기업용 서버 애플리케이션 개발을 위한 핵심 컴포넌트(Java 기반 분산 컴포넌트 모델)

핵심 철학이자 목적은 “복잡한 시스템 기능은 컨테이너가 맡고, 개발자는 비즈니스 로직에 집중하라”이다. 이 핵심 철학을 Sping도 계승한다.

아래의 복잡한 기능들을 개발자가 직접 처리하지 않도록 컨테이너가 대신 해준다.

- 트랜잭션 관리 (예: 계좌 이체 시 둘 다 성공해야 함)
- 보안 처리 (예: 권한 없는 사용자는 접근 불가 같은 인증 및 제한 권한을 코드 외부에서 처리 등)
- 원격 호출 (분산 시스템에서 다른 서버와 통신)

이런 복잡한 기능들을 Java 하나로 단순화하려는 시도가 EJB였다.

- EJB의 한계

  | 항목                  | 설명                                                                    |
  | --------------------- | ----------------------------------------------------------------------- |
  | 🧩 복잡한 구조        | 단순한 로직에도 여러 파일(Home, Remote, Bean 클래스 등)을 만들어야 했음 |
  | 🧾 과도한 설정        | XML 기반 설정이 많고 복잡하여 실수와 유지보수 비용이 높았음             |
  | 🔁 느린 배포          | 설정 하나 바꿔도 EAR 전체를 다시 배포해야 했음                          |
  | 🚫 테스트 어려움      | POJO가 아니라 컨테이너에서만 실행 가능하여 단위 테스트가 어려움         |
  | 🔒 기술 종속성        | 특정 WAS(WebLogic, WebSphere 등)에 강하게 결합되어 이식성이 떨어졌음    |
  | ⚠️ 객체지향 원칙 위반 | 컨테이너 주도 개발, 직접 의존 객체 생성 등으로 OOP 설계 원칙 훼손       |

  (※참고: WAS는 서블릿 컨테이너를 포함함)

- POJO : 특정 프레임워크나 컨테이너에 의존하지 않는 순수한 자바 객체를 의미
  - 모든 JavaBeans는 POJO이다.
  - 하지만 모든 POJO가 JavaBeans는 아니다

<br>

### 1-02. Spring Framework의 탄생

Java EE(EJB를 포함한 기존 엔터프라이즈 자바 생태계)는 단순한 기능조차 컨테이너, 인터페이스, 설정 파일 등 다양한 요소를 요구했기 때문에 지나치게 복잡하고 무거운 구조였고, 그로 인해 점차 실무에서 외면받고 있었음

“보다 단순하고 유연한 대안은 없는가?”라는 인식이 점차 많이 생기게 되었고, 이런 상황에서 Spring Framework가 등장했다.

**Spring Framework**는 **복잡하고 경직된 JavaEE의 대안으로 등장한 경량, 유연성, 테스트 가능성 중심의 프레임워크**

- **POJO** 중심의 개발 철학과 **IoC/AOP**라는 강력한 구조적 지원을 바탕으로 함

<br>

### 1-03. Spring이 제시한 새로운 방향

Spring은 Java EE와는 다른 **철학적 접근**을 기반으로 개발되었다.

<img src="https://github.com/JungH200000/JungH200000.github.io/blob/categories-ver2/assets/images/posts_img/til/pojo_triangle.png?raw=true" width=400px>

[그림] Spring 삼각형 - POJO 설명

- **POJO 기반 개발** : EJB와 달리, 컨테이너에 종속되지 않는 순수한 자바 객체 사용
- **IoC(Inversion of Control)** : 객체의 생성과 의존성 주입을 개발자가 아닌 컨테이너가 담당
- **AOP(Aspect-Oriented Programming)** : 공통 관심사를 비즈니스 로직과 분리
- **경량 컨테이너**: 전체 WAS 없이도 단독 실행 가능한 구조

Spring은 이러한 특징을 통해 복잡성을 제거하면서 기능성을 유지하는 절묘한 균형을 제공

특히, 단위 테스트가 용이하고, 개발 속도가 빠르며, 기존 기술과의 통합이 유연하다는 장점 때문에 많은 지지를 받음

- 단위 테스트 불가능 문제를 POJO 설계 기반으로 해결
- 설정이 너무 복잡한 문제를 XML 기반 설정을 최소화하고 점차 자바 기반 설정으로 진화 및 지향
- 트랜잭션 관리의 단순화를 AOP를 통한 선언적 트랜잭션 관리 제공

---

## <span style="background-color: #FFF9C4">2. Spring의 핵심 철학</span>

### 2-01. POJO(Plain Old Java Object) 기반 개발

**POJO**는 Martin Fowler가 EJB의 복잡성을 비판하면서 제안한 개념으로, 특정 기술이나 프레임워크에 종속되지 않는 순수한 자바 객체를 말한다.

<img src="https://github.com/JungH200000/JungH200000.github.io/blob/categories-ver2/assets/images/posts_img/til/pojo_triangle.png?raw=true" width=400px>

[그림] Spring 삼각형 - POJO 설명

- 특징
  - 자바 표준 외의 특별한 인터페이스나 상속이 필요 없다.
  - 애너테이션이나 설정 파일 없이도 동작한다.
  - getter/setter, 기본 생성자 정도만 가진다. (= Java Bean)

기존 **EJB** 컴포넌트를 사용하기 위해서는 특정한 인터페이스를 구현하거나, 컨테이너에 배포되어야만 했다.

**Spring**은 이런 구조적 한계를 극복하기 위해, **컨테이너 종속성 제거**와 **기능과 구현이 분리**, **단위 테스트에 용이성** 같은 이유로 POJO 개발을 지향했다.

- POJO 기반 개발이 주는 장점
  - 기술 독립성 확보
  - 코드 순수성 유지
  - 테스트 용이성

> 즉, Spring의 철학 중 하나인 **“기능은 많되, 개입은 적게(Non-Invasive)”**를 실현하는 핵심 도구가 바로 **POJO 기반 개발**이며, 이는 개발자가 **기술로부터 자유로워지고**, 비즈니스 로직에 집중할 수 있도록 만든다.

<br>

### 2-02. 객체지향 설계 원칙 준수

Spring Framework는 **소프트웨어 설계의 본질적 원칙을 실현하는 개발 철학**을 지향하는데, 그 중에서도 핵심은 **객체지향 설계 원칙(Design Principles of OOP)**을 중심으로 하는 구조적 설계

EJB처럼 무겁고 제약이 많은 구조 대신, **유연하고 모듈화 가능한 설계**를 지원하기 위해 다음과 같은 원칙들이 Spring 내부 설계에 적용된다.

- DRY(Don’t Repeat Yourself)
  - **“중복을 피하라”**는 원칙으로, 설계상 매우 중요한 철학
  - 같은 로직이나 데이터 구조가 여러 곳에서 반복되면 유지보수가 어려워지고, 버그 발생 확률이 증가
  - Spring에서는 아래의 DRY 원칙을 실현한다.
    - 공통 기능 추출 ➡️ AOP(관점 지향 프로그래밍)
    - 설정의 재사용 ➡️ 프로파일, 빈 구성 클래스 등으로 추상화
    - XML/애너테이션 설정 간소화 ➡️ 중복 제거
- SRP(Single Responsibility Principle; 단일 책임 원칙)
  - “하나의 클래스는 하나의 책임만을 가져야 한다”는 원칙으로, 여기서 “책임”이란 변화의 이유(Reason to Change)를 말한다.
  - Spring에서는 계층현 아키텍처 구조(**Controller** ↔️ **Service** ↔️ **Repository**)를 통해 비즈니스 로직을 적절히 분리하고, 각 계층에 단일 책임을 부여하는 구조를 제공한다.
    - Controller가 Service에 의존하고, Service가 Repository에 의존한다. 지켜지지 않거나 반대가 되면 계층적 아키텍처 구조가 무너진다.
    - 각 계층 간 의존성 주입(DI)를 통해 역할 분리를 명확하게 유지할 수 있다.
    - **Controller** : HTTP 요청/응답 처리만 담당
    - **Service** : 비즈니스 로직 집중
    - **Repository** : 데이터 접근(DAO) 책임 전담
- 관심사의 분리(Separation of Concerns; SoC)
  - 시스템을 구성하는 각 모듈이 **서로 다른 관심사(concern)**를 책임지도록 나누는 설계 원칙으로, 각 모듈은 **자신이 처리해야 할 핵심 기능에만 집중하고, 나머지 부분은 다른 구성요소에게 위임한다.**
  - SoC 원칙으로 인해 Spring 기반 애플리케이션은 **모듈화 수준이 높고, 테스트와 유지보수가 용이한 구조**를 가지게 된다.

<br>

### 2-03. 테스트 주도 개발(TDD) 지원

**테스트 주도 개발(Test-Driven Development, TDD)**은 테스트 코드를 먼저 작성하고, 이를 만족시키는 실제 구현 코드를 작성하는 개발 방법론

1. **요구사항 이해**
2. **테스트 작성** : 테스트 코드 먼저 작성
3. **기능 구현** : 테스트 통과를 위한 최소한의 코드 작성
4. **리팩토링**(코드 정리)
5. 1단계부터 **반복**

- 장점
  - 요구사항에 대한 명확한 이해와 정의 ➡️ 기획 단계에서 좀 더 꼼꼼해진다.
  - 안정적인 리팩토링이 가능
  - 회귀 오류 최소화
  - 높은 테스트 커버리지 확보
- Spring은 POJO 기반 설계, 의존성 주입(DI), 컨테이너 독립성, 테스트 유틸리티 제공 등 다양한 요소가 맞물려 있기 때문 구조적으로 TDD를 실현하기에 매우 적합한 프레임워크
  - 처음부터 ‘테스트 가능한 코드(testable code)’를 중심에 두고 설계되었다.
    - **POJO 기반 클래스** → 별도의 컨테이너 없이도 테스트 가능
    - **DI를 통한 구성** → 객체 간 결합도 감소 → 단위 테스트 용이
    - **설정과 환경 분리** → 테스트 대상 코드의 독립성 확보
    - **모듈화된 아키텍처** → 책임과 기능 분리 → 테스트 대상을 명확히 구분 가능

---

## <span style="background-color: #FFF9C4">⭐⭐⭐3. Spring의 핵심 개념</span>

### 3-01. IoC (Inversion of Control)

**Inversion of Control(IoC; 제어의 역전)**은 객체의 생성, 초기화, 실행 흐름 등 일반적인 프로그래밍에서 프로그램의 제어 흐름을 개발자가 직접 제어하는 것이 아니라, 외부 시스템(컨테이너)이 대신 제어하는 아키텍처 관점에서의 개념으로, 주로 프레임워크에서 많이 등장

- 기존의 경우
  - 기존의 일반적인 Java 프로그램(또는 라이브러리)은 **개발자가 필요한 객체를 직접 생성하고, 관리하며, 호출**한다. 이러한 방식은 명확하지만, 객체 간의 **결합도(coupling)**가 높아지고, 변경에 취약한 구조가 된다.
- IoC의 경우
  - **객체의 제어권을 컨테이너에게 위임**한다.
  - 즉, 객체를 생성하고 관리하며 의존 객체를 연결하는 역할은 **프레임워크(Spring)가 수행**한다.
  - 개발자는 **역할(인터페이스)**을 정의하고 **구성 정보(어노테이션 or 설정)**를 제공하면, Spring이 전체 제어 흐름을 대신 처리

<br>

#### 1) IoC 컨테이너

**IoC를 구현한 구체적인 프레임워크**를 말하며, 객체의 생성, 초기화, 의존성 처리 등을 자동으로 수행할 수 있다. 대표적으로, Spring Framework의 `ApplicationContext`가 있다.

그 외 `BeanFactory`도 IoC 컨테이너로 동작한다.(`ApplicationContext`는 `BeanFactory`를 상속함.)

<br>

#### 2) Spring IoC 컨테이너

Spring에서 다양한 IoC 컨테이너 구현을 제공하지만, 가장 많이 쓰이는 것은 `ApplicationContext`이다.

- 주 역할은 **빈(bean) 객체들을 생성, 관리, 설정, 소멸**까지 전 **생명주기**를 책임지는 것

### 3-02. Bean

Spring IoC 컨테이너에 의해 **관리되는 객체**를 의미한다. 이는 일반적인 Java 객체(POJO)지만, **Spring이 생성·초기화·의존성 주입·소멸 등을 책임진다는 점에서 특별한 관리 대상**이 된다.

즉, ‘Spring에게 등록된 객체’를 Bean이라고 생각하면 된다.

- Spring에서 Bean은 별다른 설정을 하지 않으면 기본적으로 **Singleton(싱글 인스턴스)**범위로 관리된다. 즉, 등록된 Bean은 IoC 컨테이너 내에서 유일한 단일 인스턴스로 관리된다.
- 예시
  - `@Controller`, `@Service`, `@Repository`가 붙은 클래스 인스턴스
  - `Bean` 메서드가 생성하는(`return`) 객체
  - XML 설정에서 `<bean>`으로 등록된 객체(특정한 경우가 아니면 사용하지 않음)
- Bean 등록 방법

  | 등록 방식                | 설명                                            | 사용 예                  |
  | ------------------------ | ----------------------------------------------- | ------------------------ |
  | **XML Config 방식**      | `<bean>` 태그 사용                              | 레거시 환경              |
  | ⭐ **Java Config 방식**  | `@Configuration + @Bean` 조합                   | Spring Boot 등 최신 방식 |
  | ⭐Annotation Config 방식 | `@Component`, `@Service`, `@Repository` 등 사용 | 자동 감지 기반           |

- POJO와 Bean의 관계

Bean은 기본적으로 POJO일 수 있지만, **Spring이 해당 POJO를 관리하게 되는 순간, 그것을 Bean**이라고 부른다.

즉, **모든 Bean은 POJO이지만, 모든 POJO가 Bean은 아니다.**

<br>

### 3-03. DI (Dependency Injection)

#### 1) 의존성(Dependency)

어떤 객체가 **다른 객체를 사용할 때 발생하는 관계**

객체를 **직접 생성하는 구조는 강한 결합(Tight Coupling)**을 유발할 수 있는데, 이 경우 구현체 변경이나 테스트를 위해 대체 객체(Mock)를 사용하기 어렵다.

- 의존성 주입의 필요성
  Spring은 **IoC 컨테이너를 통해 외부에서 객체를 생성하고 주입(DI)**함으로써 이 문제를 해결한다.
  - 결합도를 낮춰줌
  - 유연성과 확장성을 확보
  - 테스트 용이성을 상승

<br>

#### 2) 의존성 주입(DI)

생성자를 통해서 어떤 클래스의 객체를 전달받는 것을 ‘**의존성 주입**’이라고 합니다.

- 생성자의 파라미터로 객체를 전달하는 것을 **외부에서 객체를 주입한다**라고 표현
- 객체지향 프로그래밍에서 의존성이라고 하면 대부분 객체 간의 의존성을 의미
- 클래스끼리는 사용하고자 하는 클래스의 **객체를 생성해서 참조하게 되면 의존 관계가 성립**하게 된다.

- 필요성
  - **애플리케이션 코드 내부에서 직접적으로 new 키워드를 사용할 경우 객체지향 설계의 관점에서 중요한 문제가 발생**
  - `new` 키워드를 사용해서 객체를 생성하게 되면 참조할 클래스가 바뀌게 될 경우, 이 클래스를 사용하는 모든 클래스들을 수정할 수밖에 없음 즉, `new` 키워드를 사용해서 의존 객체를 생성할 때, 클래스들 간에 강하게 결합(Tight Coupling)되어 있음.
  - 결론적으로 의존성 주입을 하더라도 의존성 주입의 혜택을 보기 위해서는 **클래스들 간의 강한 결합은 피해 느슨한 결합(Loose Coupling)이 필요**

<br>

#### 3) DI 방식 (Spring 기준)

| 방식              | 설명                      | 권장 여부                        |
| ----------------- | ------------------------- | -------------------------------- |
| ⭐**생성자 주입** | 생성자를 통해 주입        | ✅ 가장 권장됨                   |
| 필드 주입         | 필드를 통해 주입          | ❌ 테스트/불변성 측면에서 비권장 |
| 세터 주입         | setter 메서드를 통해 주입 | ⚠️ 선택적 의존성 주입 시 사용    |

> “The Spring team generally advocates constructor injection, as it lets you implement application components as immutable objects and ensures that required dependencies are not null. Furthermore, constructor-injected components are always returned to the client (calling) code in a fully initialized state.”
>
> ---
>
> "Spring 팀은 일반적으로 생성자 주입을 권장합니다. 생성자 주입은 애플리케이션 컴포넌트를 불변 객체로 구현할 수 있게 해주고, 필수 의존성이 누락되지 않도록 보장해줍니다. 또한, 생성자를 통해 주입된 컴포넌트는 항상 완전히 초기화된 상태로 반환됩니다."
>
> [Dependency Injection :: Spring Framework](https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html#beans-constructor-injection)
