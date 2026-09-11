---
layout: single-editorial
title: '위클리페이퍼08: 테스트 주도 개발론(TDD)과 서비스 안정성'
excerpt: ''

categories:
  - Sprint Weekly Paper
tags:
  - [Codeit Sprint, Codeit Sprint Weekly Paper]

permalink: /categories/codeit-sprint/sprint-weekly-paper/weekly-paper008

toc: true
toc_sticky: true

date: 2026-04-05
last_modified_at: 2026-09-11
---

## Q1. 애플리케이션의 각 계층에서 수행되는 입력값 검증의 범위와 책임을 어떻게 나눌 것인지에 대해 설명해주세요. 특히 중복 검증을 피하면서도 안정성을 확보하는 방안과, 이와 관련된 트레이드오프에 대해 설명해주세요.

### Q1-1. 계층마다 검증 책임을 나누는 이유

애플리케이션에서는 입력값 검증을 한 계층에 몰아넣는 것보다 **각 계층이 자신의 책임에 맞는 검증을 담당하도록 나누는 것이 좋다.**

각 계층이 데이터를 바라보는 관점이 다르기 때문이다.

```text
외부 요청
⬇️
Presentation Layer
"API 요청 형식이 올바른가?"
⬇️
Service Layer
"비즈니스 정책상 이 작업을 수행할 수 있는가?"
⬇️
Domain Layer
"이 도메인 객체가 유효한 상태인가?"
```

모든 검증을 Controller나 Service 한 곳에 넣으면 해당 계층의 책임이 지나치게 커지고,  
검증 규칙의 성격과 위치가 섞이면 각 계층의 책임이 모호해지고, 변경 시 영향 범위를 파악하기 어려워진다.

반대로 계층별 책임을 나누면 잘못된 입력은 앞에서 걸러내면서, 내부에서는 비즈니스 규칙과 도메인 규칙을 별도로 보장할 수 있다.

### Q1-2. Presentation Layer에서의 검증

Presentation Layer에서는 주로

> **"요청이 API 스펙을 만족하는가?"**

를 검증한다.

예를 들어 회원가입 요청이 아래와 같다고 가정해보자.

```java
public record SignUpRequest (

  @NotBlank
  @Email
  String email,

  @NotBlank
  @Size(min = 8, max = 20)
  String password
) {
}
```

이때 아래처럼 **요청 데이터의 구조와 기본적인 제약조건**을 검증할 수 있다.

```text
email이 비어 있지 않은가?
email 형식에 맞는가?
password가 비어 있지 않은가?
password 길이가 허용하는 범위 안인가?
```

잘못된 요청을 Presentation Layer에서 빠르게 거절하면 Service나 DB까지 요청이 전달되는 것을 막을 수 있기 때문에 불필요한 처리 비용을 줄일 수 있다.

### Q1-3. Service Layer에서의 검증

Service Layer에서는

> **현재 비즈니스 규칙상 이 작업을 수행할 수 있는가?**

를 검증한다.

예를 들어 주문 생성이라면 단순히 요청 형식이 올바르다고 주문을 생성할 수 있는 것이 아니다.

```text
상품이 실제 존재하는가?
판매 중인 상품인가?
재고가 충분한가?
사용자가 구매할 권한이 있는가?
구매 제한 수량을 초과하지 않는가?
```

이런 조건들은 단순한 입력값 형식이 아니라 **현재 시스템의 상태나 다른 도메인과의 관계를 확인해야 하는 비즈니스 규칙**이다.

코드로 예시를 들어보면

```java
@Transactional
public void createOrder(Long memberId, Long productId, int quantity) {

  Product product = productRepository.findById(productId)
    .orElseThrow(ProductNotFoundException::new);

  if (!product.isAvailable()) {
    throw new ProductNotAvailableException();
  }

  if (product.getStock() < quantity) {
    throw new InsufficientStockException();
  }

  // 주문 생성
}
```

`productId`가 `null`인지 같은 기본적인 형식 검증을 다시 반복하는 것보다, **상품 존재 여부나 재고가 충분한지처럼 Service가 판단해야 하는 비즈니스 규칙**을 검증하는 것이다.

그리고 DB 상태를 확인해야 하는 비즈니스 검증과 상태 변경은 가능한 한 같은 트랜잭션 경계에서 처리해 데이터 일관성을 유지한다.

### Q1-4. Domain Layer의 검증

Domain Layer에서는

> **도메인 객체가 항상 지켜야 하는 규칙을 만족하는가?**

를 검증한다.

이것을 흔히 **도메인의 불변식(Invariant)**이라고 한다.

예를 들어 주문 상품의 수량은 항상 1개 이상이어야 한다고 가정해보자.

```java
public class OrderItem {

  private int quantity;

  public OrderItem(int quantity) {
    if (quantity < 1) {
      throw new IllegalArgumentException(
        "주문 수량은 1개 이상이어야 합니다."
      );
    }

    this.quantity = quantity;
  }
}
```

이렇게 하면 `OrderItem`이 어디에서 생성되더라도 잘못된 상태의 객체가 만들어지는 것을 방지할 수 있다.

상태 변경에서도 아래 같은 원칙을 적용할 수 있다.

```java
public void cancel() {

  if (status == OrderStatus.SHIPPED) {
    throw new IllegalStateException(
      "배송이 시작된 주문은 취소할 수 없습니다."
    );
  }

  status = OrderStatus.CANCELED;
}
```

즉, Domain Layer에서는 **도메인 객체 자체가 유효한 상태를 유지하도록 보장하는 것**이 핵심이다.

### Q1-5. 같은 값을 여러 계층에서 검증하면 안 되는가?

중복 검증을 피한다는 것은

> **"어떤 값도 두 번 검사하면 안 된다."**

는 뜻이 아니다.

> **같은 책임의 검증을 의미 없이 여러 계층에 반복하지 않는 것**이다.

예를 들어

```text
Presentation Layer
quantity >= 1 검사

Service Layer
quantity >= 1 또 검사

Domain Layer
quantity >= 1 또 검사
```

위와 같이 아무런 이유 없이 같은 검증을 세 계층에서 반복하면 유지보수하기 어려워진다.

반면 아래처럼 검증 책임을 나누면 각각의 역할이 다르다.

```text
Presentation Layer
요청 형식과 기본 제약 확인

Service Layer
상품 존재 여부, 재고, 권한 확인

Domain Layer
OrderItem이 유효한 상태를 유지하도록 보장
```

따라서 **규칙마다 주된 책임 계층을 정하는 것**이 중요하다.

### Q1-6. Presentation과 Domain 검증이 겹칠 수 있지 않은가?

그럴 수 있다.

예를 들어 API에서 주문 수량을 아래처럼 검사하고,

```java
@Min(1)
int quantity;
```

Domain에서도 아래처럼 검사할 수 있다.

```java
if (quantity < 1) {
  throw new IllegalArgumentException();
}
```

표면적으로는 같은 조건이 두 번 존재하지만, 목적이 다르다.

```text
Presentation의 `@Min(1)`
➡️ 잘못된 HTTP 요청을 빠르게 거절
➡️ 사용자에게 적절한 400 응답 제공

Domain의 quantity 검증
➡️ `OrderItem` 자체가 잘못된 상태가 되지 않도록 보장
➡️ HTTP 외의 다른 경로로 객체를 생성해도 보호
```

예를 들어 나중에 Kafka Consumer나 Batch Job, 테스트 코드 등에서 직접 Domain 객체를 생성한다면 Presentation Layer의 검증을 거치지 않을 수 있다.

따라서 이런 경우에는 **같은 조건이더라도 서로 다른 경계를 보호하기 위한 의도적인 중복**이 될 수 있다.

### Q1-7. 중복 검증을 줄이는 방법

**각 검증 규칙의 주된 책임 계층을 명확하게 정의하는 것**이다.

```text
API 형식·기본 제약
➡️ Presentation Layer

여러 객체나 시스템 상태가 필요한 비즈니스 규칙
➡️ Service Layer

객체가 항상 유지해야 하는 규칙
➡️ Domain Layer

데이터 무결성을 위한 최종 방어선
➡️ DB Constraint
```

그리고 검증 로직이 여러 곳에서 필요하다면 똑같은 조건문을 복사하기보다 **도메인 객체, Value Object, 공통 Validator 등 적절한 위치에 규칙을 모으는 방법**도 생각해볼 수 있다.

### Q1-8. 트레이드오프

#### 검증을 많이 하는 경우

**장점**

- 잘못된 데이터가 내부로 들어갈 가능성이 낮아짐
- 여러 경로에서 시스템을 보호할 수 있음

**단점**

- 같은 검증이 반복될 수 있음
- 중복 검증이나 추가 조회로 인한 처리 비용 증가
- 규칙 변경 시 여러 곳을 수정해야 할 수 있음

#### 검증 책임을 엄격하게 한 곳에만 두는 경우

**장점**

- 중복 코드 감소
- 검증 책임이 명확해짐

**단점**

- 해당 계층을 우회하는 호출이 생긴다면 검증이 빠질 수 있음
- 너무 늦은 계층에서 검증하면 불필요한 로직이나 DB 접근이 먼저 수행될 수 있음

따라서 중요한 것은 **모든 계층에서 같은 검증을 반복하는 것도 아니고, 모든 검증을 한 계층에 몰아넣는 것도 아니다.**

각 계층의 책임에 맞게 검증하면서, **도메인 불변식이나 DB 무결성처럼 반드시 지켜야 하는 규칙은 마지막 방어선에서도 보장하는 것**이 핵심이다.

---

## Q2. 테스트에서 사용되는 Mockito의 Mock, Stub, Spy 개념을 각각 설명하고, 어떤 상황에서 어떤 방식을 선택해야 하는지 구체적인 예시와 함께 설명하세요.

### Q2-1. 답변

#### Mockito

Java에서 널리 사용되는 Mocking 라이브러리로, Mock 객체를 만들어주는 도구이다.

#### Stub (스텁)

테스트 대상 객체가 의존하는 외부 컴포넌트의 동작을 미리 하드코딩하여, 요청에 대해 항상 고정된 응답(결과값)만을 반환하는 단순한 객체

- **선택 상황**
  - 외부 시스템의 복잡한 로직을 무시하고, 단순한 조건이나 특정 고정된 결과값이 필요한 테스트 환경을 구축할 때 선택
- **예시**
  - `getBalance(userId)` 메서드 호출 시 무조건 10,000원을 반환하도록 `when(...).thenReturn(...)`(`given(…).willReturn(…)`) 설정하면 비즈니스 로직만 집중해서 테스트 가능

#### Mock

실제 객체처럼 동작하도록 조작하고, 테스트 중에 특정 메서드가 호출되었는지, 몇 번 호출되었는지, 어떤 파라미터가 호출되었는지 등의 행위(Behavior) 자체를 검증하는 가짜 객체

- **선택 상황**
  - 값을 반환하는 것을 넘어서 외부 시스템과의 연동 등 객체 간의 상호작용이 올바르게 일어났는지 검증할 때 선택
- **예시**
  - 회원가입 로직에서 회원가입이 완료되면 가입 환영 메일을 보내는 `EmailService`가 있을 때, `verify()`메서드를 이용해 `sendEmail()`메서드가 정확한 수신자와 제목으로 1회 호출되었는지 검증

#### Spy

가짜 객체를 완전히 대체하는 Mock과 달리, 실제 객체를 감싸(Wrapper) 기본적으로 실제 로직대로 동작하게 함으로써, 특정 일부 메서드만 가짜(Mocking) 동작으로 덮어씌워 대체하거나 호출 기록을 감시할 수 있는 객체

- **선택 상황**
  - 객체의 모든 동작을 가짜로 만들지 않고, 대부분의 코드는 실제 시스템 로직을 그대로 사용하지만 특정 외부 연동 메서드 등 일부만 대체하여 테스트할 때 선택
- **예시**
  - 외부 결제 게이트웨이와 연동하는 시스템을 테스트할 때, 다른 비즈니스 로직은 그대로 사용하고 외부 게이트웨이와 통신하는 메서드만 가짜 응답을 반환하도록 조작

---
