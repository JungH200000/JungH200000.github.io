---
title: '[TIL 17일 차] Spring Boot: 코드 레벨 아키텍처'
excerpt: ''

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til017/

toc: true
toc_sticky: true

date: 2026-01-23
last_modified_at: 2026-01-23
---

# 오늘의 학습

## <span style="background-color: #FFF9C4">1. 애플리케이션 실행 프로세스</span>

Spring Boot 애플리케이션은 `SpringApplication.run()` 호출을 통해 실행되며, 실행과 동시에 **애플리케이션 컨텍스트 생성**, **자동 설정 적용**, **Bean 등록**, **생명주기 콜백 실행** 등의 일련의 핵심 단계가 체계적으로 작동

<br>

### 1-01. 애플리케이션 컨텍스트 생성 단계

Spring Boot는 실행 시 `SpringApplication` 객체를 생성하고, 내부적으로 다양한 초기화 작업을 수행하는데, 이 때 가장 중요한 과정 중 하나가 **`ApplicationContext`의 생성 및 구성 단계**

1. `SpringApplication` 객체 생성
2. `WebApplicationType` 결정
3. `ApplicationContext` 생성
4. `ApplicationContext` 구성

<br>

### 1-02. 자동 설정 적용 과정

`ApplicationContext`가 준비되면, Spring Boot는 자동 구성 로직을 적용하여 필요한 Bean과 설정을 자동으로 주입한다. 이 과정에서 핵심은 **`@EnableAutoConfiguration`에 의해 동작하는 자동 설정 클래스의 로딩**

1. `AutoConfiguration` 클래스 로딩
2. 조건 기반 설정 판단 ← `@Conditional` 계열
3. 자동 설정된 Bean 등록

<br>

### 1-03. Bean 등록 과정과 순서

Spring Boot는 `@ComponentScan`에 의해 탐색된 클래스들과 자동 설정에서 제공하는 Bean들을 모두 컨테이너에 등록한다. 이 과정은 **정해진 순서**에 따라 진행된다.

1. `@Component` 계열 Bean 등록
2. 자동 설정 클래스에 정의된 Bean 등록
3. `@Configuration` 클래스의 수동 Bean 등록
4. 후처리기(Post-processor) 적용

<br>

### 1-04. 이벤트 리스너와 생명주기 콜백

Spring Boot는 실행 도중 다양한 생명주기 이벤트를 발생시키며, 이를 통해 개발자는 애플리케이션 시작 시점 또는 종료 직전에 특정 동작을 삽입할 수 있다.

---

## <span style="background-color: #FFF9C4">2. Spring Boot Starter의 이해</span>

### 2-01. spring-boot-starter의 구성과 역할

**Spring Boot Starter**는 특정 기능을 구현하는 데 필요한 **의존성 묶음(prescriptive dependency set)**을 하나의 이름으로 정리해놓은 메타 의존성(Meta-dependency)

이런 구조 덕분에 **개발자는 어떤 라이브러리를 골라야 할지, 버전 충돌은 없는지 등을 고민하지 않고, Spring Boot 팀이 검증한 조합을 그대로 사용할 수 있다.**

내부 구성을 보고 싶다면 [maven central repository](https://central.sonatype.com/artifact/org.springframework.boot/spring-boot-starter-web/dependents) 참고.

<br>

### 2-02. 의존성(dependency) 관리

의존성(dependency)이란, 하나의 모듈 또는 프로그램이 동작하기 위해 다른 모듈이나 라이브러리의 기능을 참조하거나 사용하는 관계를 말함.

- 의존성은 개발 편의성과 유지보수성을 높여주지만, 관리되지 않으면 **버전 충돌, 보안 취약점, 성능 저하** 등의 문제를 유발할 수 있다.
- Spring Boot는 **Maven** 또는 **Gradle**과 같은 **빌드 도구에 기반하여 의존성을 선언하고 관리**

<br>

#### 1) Spring Boot에서 의존성 충돌 대응 방식: BOM 관리

**BOM(Bill of Materials)**은 의존성들의 **버전 정보를 한 곳에 모아 관리하는 POM 파일**

Spring Boot에서는 `spring-boot-dependencies` 라는 BOM을 제공하며, 개발자는 **Starter만 선언하면**, 해당 BOM을 통해 **정해진 버전의 라이브러리들이 자동으로 매핑**

- Spring Boot의 모든 Starter들은 **공통적으로** `spring-boot-dependencies` **BOM에 의존**
- 버전 관리의 이점
  - 일관된 버전 구성
  - 자동 버전 지정
  - 업그레이드 용이성
  - 보안 패치 반영 용이

---

## <span style="background-color: #FFF9C4">3. 의존성 관리 심화</span>

### 3-01. 의존성 제외와 대체 방법

Spring Boot Starter는 불필요한 하위 라이브러리가 함께 따라오는 경우가 발생할 수 있다. Gradle에서는 `exclude` 블록을 활용하여 이러한 하위 라이브러리를 제외하거나, 원하는 구현체로 대체할 수 있다.

```java
dependencies {
    implementation('org.springframework.boot:spring-boot-starter-web') {
        exclude group: 'org.springframework.boot',
                module: 'spring-boot-starter-logging'
    }
    implementation 'org.springframework.boot:spring-boot-starter-log4j2'
}
```

- `exclude group` 키워드와 제거할 `module`을 명시하여 **의존성 트리에서 명확히 제거**
- `exclude`의 한계와 주의사항
  - 의존성을 한 번 제외하더라도 의도치 않게 **다른 라이브러리가 동일한 의존성을 다시 참조**
  - 다른 모듈과의 의존 관계를 따져보지 않고 무턱대고 특정 모듈을 제외했을 때 **런타임에서 ClassNotFoundException**이 발생

<br>

### 3-02. **선택적 의존성(optional dependency)**

프로젝트의 일부 환경(예: 개발, 테스트)에만 필요하지만, 전체 애플리케이션에는 반드시 포함되지 않아도 되는 라이브러리를 말한다.

- Gradle에서 선택적 의존성을 선언하는 방법
  | 스코프 | 사용 시점 | 예시 |
  | -------------------- | ----------------------------------- | ----------------------- |
  | `implementation` | **일반 의존성 (default)** | DB 드라이버, 웹 서버 등 |
  | `developmentOnly` | **개발 환경 전용** | Spring DevTools |
  | `compileOnly` | 컴파일 시만 필요, **런타임 미포함** | Lombok |
  | `runtimeOnly` | 런타임에만 필요 | JDBC Driver, DBMS |
  | `testImplementation` | 테스트 전용 | JUnit, Mockito |

<br>

### 3-03. 버전 오버라이딩

Spring Boot는 `spring-boot-dependencies` BOM을 통해 라이브러리들의 버전을 일관되게 관리하지만, **개발자가 의도적으로 특정 라이브러리의 버전을 변경(오버라이딩)**해야 하는 경우도 있다.

- 보안 이슈가 있어 특정 버전에서 벗어나야 할 때
- 특정 하위 의존성에서 충돌이 발생할 때

<br>

#### 1) BOM을 무시하고 다른 버전 지정

```java
dependencies {
    implementation 'com.fasterxml.jackson.core:jackson-databind:2.18.3'
}
```

<br>

#### 2) dependencyManagement 직접 사용

Gradle에서 BOM을 직접 선언

```java
dependencyManagement {
    imports {
        mavenBom "org.springframework.boot:spring-boot-dependencies:3.2.3"
    }
}
```

<br>

#### 3) 버전 오버라이딩의 리스크

- 의도하지 않은 비호환 발생

---

## <span style="background-color: #FFF9C4">4. Spring Boot 아키텍처 패턴</span>

### 4-01. 레이어드 아키텍처**(Layered Architecture)**

Spring Boot는 기본적으로 **레이어드 아키텍처(Layered Architecture)**를 기반으로 애플리케이션을 구성

각 레이어는 **관심사의 분리(Separation of Concerns)**를 통해 유지보수와 확장성을 확보

| 계층           | 주요 책임            | 설명                                                         |
| -------------- | -------------------- | ------------------------------------------------------------ |
| **Controller** | 요청 수신, 응답 반환 | 클라이언트의 요청을 받아 처리 흐름을 제어                    |
| **Service**    | 비즈니스 로직 처리   | 핵심 도메인 로직과 트랜잭션 처리 담당                        |
| **Repository** | 데이터 접근          | 실무로 보면 DB와의 직접적인 통신 수행 (JPA, MyBatis 등 사용) |

- **계층 간 의존성**
  - Controller → Service → Repository
  - **의존성 방향은 단방향** ➡️ 지키지 않을 경우, 구조적 순환 의존성을 만들 수 있음 ➡️ 테스트 및 유지보수 시 오류 발생 시킬 수 있음
  - **Controller**는 사용자의 요청을 수신하고 Service를 호출
  - **Service**는 비즈니스 로직을 처리하고, 필요 시 Repository에 데이터를 요청하거나 저장한
  - **Repository**는 DB와의 연결을 직접 담당하며, JPA나 MyBatis 같은 ORM/SQL 매퍼를 통해 구현
- **같은 계층끼리의 의존일 때 지켜야 할 원칙**
  - 일방향
  - 역할과 책임이 명확
  - 계층적 위계가 어긋나지 않아야 함

<br>

### 4-02. 이벤트 기반 아키텍처

이벤트 기반(Event-Driven) 프로그래밍은 **시스템의 흐름을 이벤트(event)**라는 신호나 메시지를 중심으로 처리하는 방식

즉, **누가 발생시켰는지 알 필요 없이, 무언가 일어났다는 사실에 반응하는 방식"**

| 구성 요소                | 설명                                                                      |
| ------------------------ | ------------------------------------------------------------------------- |
| **이벤트(Event)**        | 시스템에서 발생한 사실 또는 행위 (예: `UserRegisteredEvent`)              |
| **이벤트 발행(Publish)** | 이벤트 객체를 생성하고 시스템에 전파                                      |
| **리스너(Listener)**     | 특정 이벤트가 발생했을 때 동작을 정의하는 컴포넌트                        |
| **비동기 처리**          | 이벤트와 리스너는 일반적으로 느슨하게 결합되며, 필요에 따라 비동기로 작동 |

- **장점**
  - 결합도를 낮춤
  - 관심사 분리
  - 확장성 향상
- **주의할 점**
  - 이벤트 기반이라고 해서 **무조건 비동기 방식인 것은 아님**
  - 이벤트 흐름이 **명시적이지 않기에**, 코드 추적이 어려워질 수 있음
- **이벤트의 기본 동작 방식**
  1. 이벤트 발행
  2. EventMulticaster 위임
  3. 리스너 탐색 및 실행
  4. 이벤트 정달
  5. (옵션) 비동기 실행
