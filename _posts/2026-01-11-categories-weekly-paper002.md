---
title: '위클리페이퍼02: Java 고급 과정'
excerpt: ''

categories:
  - Sprint Weekly Paper
tags:
  - [Codeit Sprint, Codeit Sprint Weekly Paper]

permalink: /categories/codeit-sprint/sprint-weekly-paper/weekly-paper002/

toc: true
toc_sticky: true

date: 2026-01-11
last_modified_at: 2026-01-11
---

# Q1. 객체지향 프로그래밍에서 ‘단일 책임 원칙(SRP)’과 ‘개방-폐쇄 원칙(OCP)’에 대해 설명하고, 각각의 원칙을 적용한 코드 예시를 들어주세요.

단일 책임 원칙과 개방-폐쇄 원칙은 객체지향 설계에서 유지보수 가능하고, 확장 가능한 코드를 만들기 위한 5가지 설계 원칙의 앞 글자를 모은 **SOLID 원칙** 중 일부로, 이 외에 **리스코브 치환의 원칙(LSP)**, **인터페이스 분리의 원칙(ISP)**, **의존성 역전의 원칙(DIP)**가 있다.

- **리스코브 치환의 원칙(LSP) :** 자식 클래스는 반드시 부모 클래스를 대체할 수 있어야 한다.
- **인터페이스 분리의 원칙(ISP) :** 하나의 범용 인터페이스보다 다수의 구체적인 인터페이스가 나으며, 클라이언트는 사용하지 않은 메소드에 의존하면 안된다.
- **의존성 역전의 원칙(DIP) :** 구체적인 클래스 보다는 인터페이스나 추상 클래스와 관계를 맺어야 하며, 상위 모듈은 하위 모듈에 의존하면 안된다.

<br>

## 01. 단일 책임 원칙(SRP; Single Responsibility Principle)

**“클래스는 하나의 책임만 가져야 한다”**는 객체지향 설계 원칙

- 각 클래스는 **하나의 책임**만 가져야 함.
  - 책임 = 역할
  - 특정 목적을 위해 선언한 클래스는 해당 목적과 직접적으로 관련있는 책임(역할)만을 가져야 한다.
    - 해당 클래스 수정을 위해 클래스의 원래 목적과 상관없는 정보가 필요한가?
- 잘못된 경우

```java
class Chef {
    // 클래스의 역할: 요리하기
    재료 주문하기();
    서빙하기();
    재료 손질하기();
    불 조절하기();
    플레이팅하기();
}
```

여기서 `재료 주문하기();`와 `서빙하기();`는 `chef` 클래스가 만들어진 목적인 “요리하기”와 상관없는 정보가 필요하고, 나머지 `재료 손질하기();`와 `불 조절하기();`, `플레이팅하기();`는 클래스가 만들어진 목적인 “요리하기”를 수행하기 위해 필요한 정보들이다.

- 책임 분리한 경우

```java
class Chef {
    // 클래스의 역할: 요리하기
    재료 손질하기();
    불 조절하기();
    플레이팅하기();
}

class Shopkeeper {
    재료 주문하기();
}

class Server {
    서빙하기();
}
```

<br>

## 02. 개방-폐쇄 원칙(OCP; Open-Closed Principle)

**“확장에는 열려 있고, 수정에는 닫혀 있어야 한다”**는 객체지향 설계 원칙

- **기존 코드를 변경하지 않고, 새로운 기능은 확장**을 통해 추가할 수 있도록 설계하라는 의미
  - 기존 클래스를 매번 수정하면 오류 위험이 증가하고, 유지보수 비용이 증가하기 때문
- 잘못된 경우

```java
class PaymentService {
    void pay(String method) {
        if (method.equals("card")) {
            System.out.println("카드 결제");
        } else if (method.equals("kakao")) {
            System.out.println("카카오페이");
        }
    }
}
```

여기서 새로운 결제 수단이 생길 때마다 `if-else`문이 늘어나면서 `pay()` 메소드가 수정되기 때문에 개방-폐쇄 원칙(OCP)에 위반됨

- 개방-폐쇄 원칙(OCP)이 적용된 경우

```java
// 인터페이스
interface PayStrategy {
    void pay();
}

// 구현체1
class CardPay implements PayStrategy {
    @Override
    public void pay() {
        System.out.println("카드 결제");
    }
}
// 구현체2
class KakaoPay implements PayStrategy {
    @Override
    public void pay() {
        System.out.println("카카오페이");
    }
}

// 결제 수단 Class
class PaymentService {
    private PayStrategy payStrategy;

    public PaymentService(PayStrategy payStrategy) {
        this.payStrategy = payStrategy;
    }

    public void processPayment() {
        payStrategy.pay(); // 구현체에 따라 동작(결제 수단)이 바뀜
    }
}

class Main {
		public static void main(String[] args) {
				PaymentService service =
						new PaymentService(new KakaoPay()); // 결제 수단 변경 시 이부분만 수정하면 됨.
				service.processPayment();
		}
}
```

이렇게 수정하면 네이버페이 같이 새로운 결제 수단이 필요한 경우 “새로운 구현체 클래스”를 새롭게 만들면 되고, `PaymentService`는 수정하지 않아도 된다.

즉, `PaymentService`가 `PayStrategy` 인터페이스에 의존하게 되므로, 새로운 기능 추가 시 코드 수정 없이 확장 가능하다.

---

# Q2. Stream API의 `map()`과 `flatMap()`의 차이점을 설명하고, 각각의 활용 사례를 예시 코드와 함께 설명해주세요.

Stream(스트림)은 배열, 컬렉션의 저장 요소를 **하나씩 참조해서 람다식으로 처리할 수 있도록 해주는 반복자**로, 이를 활용하면 다량의 데이터에 복잡한 연산을 수행하면서 가독성과 재사용성이 높은 코드를 작성할 수 있다.

`map()`과 `flatMap()`은 stream의 중간 연산에 활용되는 메서드이다. stream의 중간 연산자의 결과는 stream을 반환하기 때문에 여러 개의 중간 연산자를 연결하여 원하는 데이터를 처리할 수 있다.

<img src="https://github.com/JungH200000/JungH200000.github.io/blob/categories-ver2/assets/images/posts_img/weeklypaper/intermediation_operation.png?raw=true" width=600px>

<br>

## 01. `map()`과 `flatMap()`의 차이점

### `map()`(매핑)

stream 내의 **요소들에서 원하는 필드만 추출하거나 특정 형태로 변환할 때 사용**하는 중간 연산자로, 참조변수 안에 정의된 각 요소를 순회하면서 특정 연산을 수행한다.

- 입력된 요소 1개가 연산을 거쳐 결과 요소 1개로 반환

### `flatMap()`

**중첩된 stream 구조를 평탄화(flatten)**하여 하나의 stream으로 펼쳐주는 중간 연산자

- 입력된 요소 1개가 여러 개의 요소를 가진 stream으로 변환되고, 이것을 하나로 펼친다.

<br>

## 02. 활용 사례와 코드 예시

아래의 코드 예시처럼 중첩된 구조일 경우 `flatMap()` 메소드를 사용하고 단일 구조일 경우 `map()` 메소드를 사용한다.

```java
public class WeeklyMission {
    public static void main(String[] args) {
        List<List<String>> subjectList = Arrays.asList(
                Arrays.asList("Java", "Spring", "JPA"),
                Arrays.asList("SQL", "PostgreSQL", "MySQL")
        );

        // 내부 리스트를 또 다른 stream 객체로 변환만 했음.
        // 즉, stream 안에 stream이 들어있는 중첩 구조
        subjectList.stream()
                .map(subject -> subject.stream())
                .forEach(subject -> System.out.println(subject));

        // 중첩된 stream 구조를 합쳐서 하나의 새로운 stream으로 만듦
        subjectList.stream()
                .flatMap(subject -> subject.stream())
                .forEach(subject -> System.out.println(subject));
    }
}
```

```java
// `map()`
java.util.stream.ReferencePipeline$Head@63961c42
java.util.stream.ReferencePipeline$Head@65b54208

// `flatMap()`
Java
Spring
JPA
SQL
PostgreSQL
MySQL
```
