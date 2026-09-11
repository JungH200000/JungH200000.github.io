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

### Q2-1. 테스트 대역(Test Double)이란?

단위 테스트에서는 테스트 대상이 DB, 외부 API, 다른 서비스 같은 의존성과 연결되어 있을 수 있다.

예를 들어

```text
`OrderService`
⬇️
`OrderRepository`
⬇️
Database
```

`OrderService`만 테스트하고 싶은데 실제 DB까지 사용하면 테스트가 느려지고, DB 상태에 따라 결과가 달라질 수 있다.

그래서 실제 의존성을 대신하는 객체를 사용하는데, 이런 객체를 **테스트 대역(Test Double)**이라고 한다.

Mock, Stub, Spy도 테스트 대역의 종류라고 볼 수 있다.

### Q2-2. Mock

**Mock**은 실제 객체를 대신하는 가짜 객체를 만들고, 특히 **특정 메서드가 원하는 방식으로 호출되었는지 검증할 때** 많이 사용한다.

Mockito에서는 아래 코드처럼 만들 수 있다.

```java
PaymentClient paymentClient = mock(PaymentClient.class);
```

별도로 Stubbing 하지 않은 메서드는 실제 구현을 실행하지 않고 Mockito가 제공하는 기본값을 반환한다.

예를 들어 주문 결제 로직이 있다고 가정해보자.

```java
public class OrderService {

  private final PaymentClient paymentClient;

  public OrderService(PaymentClient paymentClient) {
    this.paymentClient = paymentClient;
  }

  public void pay(Long orderId, int amount) {
    paymentClient.requestPayment(orderId, amount);
  }
}
```

테스트에서는 실제 결제 API를 호출할 필요 없다.

```java
@Test
void 결제를_요청한다() {

  PaymentClient paymentClient = mock(PaymentClient.class);
  OrderService orderService = new OrderService(paymentClient);

  orderService.pay(1L, 10000);

  verify(paymentClient).requestPayment(1L, 10000);
}
```

여기서 관심 있는 것은 반환값보다 아래와 같은 **상호작용**이다.

```text
PaymentClient가 호출되었는가?
어떤 인자로 호출되었는가?
몇 번 호출되었는가?
```

예를 들어 아래처럼 검증할 수 있다.

```java
verify(paymentClient).requestPayment(1L, 10000);

verify(paymentClient, times(1))
  .requestPayment(1L, 10000);

verify(paymentClient, never())
  .cancelPayment(anyLong());
```

#### Mock은 언제 사용할까?

외부 API, Repository, 메시지 발행기처럼 **실제 의존성을 호출하지 않고 테스트 대상을 격리하고 싶거나**, 그 의존성이 제대로 호출되었는지 확인해야 할 때 적합하다.

### Q2-3. Stub

**Stub**은 테스트에 필요한 상황을 만들기 위해 **특정 호출에 대해 미리 정해진 값을 반환하도록 설정하는 방식**이다.

예를 들어 회원을 조회하는 서비스가 있다고 가정해보자.

```java
public class MemberService {

  private final MemberRepository memberRepository;

  public MemberService(MemberRepository memberRepository) {
    this.memberRepository = memberRepository;
  }

  public String getMemberName(Long memberId) {
    Member member = memberRepository.findById(memberId)
      .orElseThrow();

    return member.getName();
  }
}
```

실제 DB 없이 특정 회원이 존재하는 상황을 만들고 싶다면

```java
@Test
void 회원_이름을_조회한다() {

  MemberRepository memberRepository =
    mock(MemberRepository.class);

  Member member = new Member(1L, "홍길동");

  when(memberRepository.findById(1L))
    .thenReturn(Optional.of(member));

  MemberService memberService =
    new MemberService(memberRepository);

  String result = memberService.getMemberName(1L);

  assertEquals("홍길동", result);
}
```

여기서

```java
when(memberRepository.findById(1L))
  .thenReturn(Optional.of(member));
```

위 코드가 **Stubbing**이다.

즉, 아래처럼 동작한다.

```text
`findById(1L)`이 호출되면
⬇️
실제 DB에 접근하지 않고
⬇️
미리 준비한 `member`를 반환
```

#### Stub은 언제 사용할까?

테스트 대상의 동작을 확인하기 위해 **의존 객체가 특정 값을 반환하는 상황을 만들어야 할 때** 사용한다.

예를 들면 아래의 테스트 상황을 만들 수 있다.

```text
회원이 존재하는 경우
회원이 존재하지 않는 경우
재고가 충분한 경우
재고가 부족한 경우
외부 API가 성공 응답을 반환하는 경우
```

### Q2-4. Mock과 Stub은 완전히 다른 객체인가?

Mockito에서는 이 부분을 구분해서 이해하는 것이 중요하다.

개념적으로 아래처럼 구분할 수 있다.

- **Mock**: "어떻게 호출되었는가?"에 관심
- **Stub**: "호출하면 무엇을 반환하는가?"에 관심

하지만 Mockito에서는 보통 **같은 Mock 객체에 Stubbing과 Verification을 모두 수행할 수 있다.**

```java
MemberRepository repository = mock(MemberRepository.class);
Member member = new Member(1L, "홍길동");
MemberService memberService = new MemberService(repository);

// Stub 역할
when(repository.findById(1L))
  .thenReturn(Optional.of(member));

// 테스트 실행
memberService.getMemberName(1L);

// Mock 역할 - 상호작용 검증
verify(repository).findById(1L);
```

그래서  
**Stub**은 테스트에 필요한 반환값을 미리 지정하는 역할이고,  
**Mock**은 호출 여부와 같은 상호작용 검증에 초점을 둔 개념이라고 할 수 있다.

### Q2-5. Spy

**Spy**는 **실제 객체를 기반으로 하며, 기본적으로 실제 메서드를 실행하지만 필요한 일부 메서드만 Stubbing할 수 있다.**

예를 들어 실제 객체 `PriceCalculator`가 있다고 가정해보자.

```java
public class PriceCalculator {

  public int calculate(int price) {
    return price - discount(price);
  }

  public int discount(int price) {
    return price / 10;
  }
}
```

Spy를 만들고 `discount()`만 Stubbing하면 아래처럼 작성할 수 있다.

```java
PriceCalculator calculator = spy(new PriceCalculator());

doReturn(2000)
  .when(calculator)
  .discount(10000);

int result = calculator.calculate(10000);

assertEquals(8000, result);
verify(calculator).discount(10000);
```

그러면 아래처럼 동작한다.

```text
calculate()
➡️ 실제 코드 실행

discount()
➡️ 실제 코드 대신 2000 반환

결과
➡️ 10000 - 2000 = 8000
```

또한, Spy도 호출 여부를 검증할 수 있다.

```java
verify(calculator).discount(10000);
```

### Q2-6. Spy에서 `when()`보다 `doReturn()`을 사용하는 이유

Spy에서는 중요한 주의점이 있다.

아래처럼 작성하면

```java
when(calculator.discount(10000))
  .thenReturn(2000);
```

`when()` 안에 있는 실제 메서드가 **Stubbing하는 시점에 먼저 실행될 수 있다.**

Spy는 기본적으로 실제 객체이기 때문이다.

그래서 실제 메서드 실행을 피하고 싶다면

```java
doReturn(2000)
  .when(calculator)
  .discount(10000);
```

위 코드처럼 `doReturn()` 방식을 사용하는 것이 안전하다.

실제 메서드가 DB 접근, 상태 변경, 예외 발생 같은 동작을 포함한다면 이 차이는 중요하다.

### Q2-7. 그렇다면 언제 무엇을 선택해야 할까?

| 방식 | 핵심 관심사             | 사용 상황                                    |
| ---- | ----------------------- | -------------------------------------------- |
| Mock | 호출 여부와 상호작용    | 외부 API가 올바르게 호출됐는지 확인          |
| Stub | 특정 입력에 대한 반환값 | Repository가 특정 데이터를 반환하는 상황     |
| Spy  | 실제 구현 + 일부만 대체 | 대부분 실제 동작을 사용하고 특정 부분만 변경 |

예를 들어 주문 서비스 테스트라면

```text
OrderService
 ├─ OrderRepository
 ├─ PaymentClient
 └─ PriceCalculator
```

아래처럼 사용할 수 있다.

```text
OrderRepository
➡️ Stub
➡️ 특정 주문이나 상품 데이터를 반환하도록 설정

PaymentClient
➡️ Mock
➡️ 결제 요청이 정확히 한 번 호출됐는지 검증

PriceCalculator
➡️ Spy
➡️ 실제 가격 계산은 사용하되, 특정 할인 계산만 테스트용 값으로 변경
```

다만 실제 Mockito 코드에서는 `OrderRepository`도 `mock()`으로 생성한 뒤 `when().thenReturn()`을 사용하므로,  
**Stub은 Mockito에서 별도의 객체 생성 방식이라기보다 Mock 객체에 특정 반환 동작을 설정한 역할로 이해하면 편하다.**

### Q2-8. Spy는 많이 사용해도 되는가?

Spy는 **우선적으로 선택할 방법은 아니다.**

테스트 대상의 일부 동작을 Spy로 계속 바꿔야 한다면 객체의 책임이 너무 크거나 의존성 분리가 충분하지 않은 경우일 수 있다.

예를 들어 하나의 Service를 아래처럼 테스트한다면

```text
메서드 A는 실제 실행
메서드 B는 Spy로 가짜 처리
메서드 C는 실제 실행
메서드 D는 Spy로 가짜 처리
```

구현 세부사항에 테스트가 강하게 결합될 수 있다.

가능하다면 필요한 의존성을 별도의 객체로 분리한 뒤 Mock으로 주입하는 것이 테스트하기 쉬운 구조일 수 있다.

따라서

```text
필요한 의존성을 격리하고 반환값이나 호출 관계만 제어하면 되는 경우
➡️ Mock / Stubbing을 우선으로 하고,

실제 객체의 대부분의 동작을 유지하면서 일부 동작만 바꿔야 하는 경우
➡️ Spy 고려
```
