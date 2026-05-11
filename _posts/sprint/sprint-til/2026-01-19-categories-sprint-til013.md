---
title: '[TIL 13일차] 알고리즘과 자료구조 이해하기'
excerpt: ''

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til013/

toc: true
toc_sticky: true

date: 2026-01-19
last_modified_at: 2026-01-19
---

# 오늘의 학습

## <span style="background-color: #FFF9C4">1. Big O 표기법</span>

### 1-01. 표기법 종류

#### 1) Big-θ 표기법 (Big-Theta notation)

- 일반적으로 최선과 최악의 경우의 평균을 산정

<br>

#### 2) Big-O 표기법 (Big-O notation)

최악의 경우를 대비해 상한선을 잡아두는 개념

<br>

#### 3) Big-Ω 표기법 (Big-Omega notation)

최소한 어느 정도는 필요하다는 최선의 경우 분석(Best case)에서 사용됨

<br>

### 1-02. 시간 복잡도(Time complexity)

입력 크기(n)가 증가할 때, 알고리즘이 수행하는 연산의 횟수를 수학적으로 표현한 것

- 목적은 하드웨어나 언어에 상관없이 알고리즘의 **성능 증가율(성장 속도)**을 비교하는 것
- 일반적으로 Big O 표기법을 사용해 표현

<img src="https://github.com/JungH200000/JungH200000.github.io/blob/categories-ver2/assets/images/posts_img/til/BIG-O.png?raw=true" width=700px>

- O(1): 상수 시간 (Constant Time)
  - 입력 크기(n)에 상관없이 항상 일정한 시간 내에 연산이 완료되는 경우
- O(log n): 로그 시간 (Logarithmic Time)
  - 매 연산마다 입력을 절반으로 줄이는 방식(입력을 반복적으로 나누면서 처리하는 경우)
- O(n): 선형 시간 (Linear Time)
  - 입력 데이터 전체를 한 번씩 순회하며 연산하는 경우
- O(n log n): 선형 로그 시간 (Linearithmic Time)
  - 입력을 나누고, 각각에 대해 선형 연산을 수행
  - 데이터를 재귀적으로 반으로 나눈 뒤, 각 부분에 대해 n번 처리하는 알고리즘 구조에서 나타남
- O(n²): 제곱 시간 (Quadratic Time)
  - 중첩 반복문으로 인한 급격한 연산 증가
  - 각 요소마다 다른 모든 요소와 연산을 수행할 때 발생

<br>

### 1-03. 공간 복잡도(Space complexity)

알고리즘이 작업을 수행하는 동안 사용하는 메모리의 양으로, 입력 데이터 저장 공간 + 임시 작업 공간

- 시간 복잡도와 달리 메모리 효율성에 중점을 두고 판단
- 보조 공간(Auxiliary Space)
  - 입력 데이터를 제외하고, 알고리즘이 추가적으로 사용하는 공간

---

## <span style="background-color: #FFF9C4">2. 주요 자료구조</span>

### 2-01. List: ArrayList, LinkedList

데이터 접근 빈도가 높으면 ArrayList, 빈번한 데이터 삽입 및 삭제가 이루어진다면 LinkedList가 적합

비율은 2:8, 1:9 정도면 논의를 해보는 정도?

#### 1) ArrayList

자바에서 제공하는 기본 배열보다 느릴 수 있지만 동적 배열이 구현되어 있다.

- 내부 배열 관리 방식

  | index | 0   | 1   | 2   | 3   |
  | ----- | --- | --- | --- | --- |
  | data  | A   | B   | C   | D   |
  - 연속적인 메모리 공간을 활용한 배열 구조로, ArrayList로 인스턴스 생성 시 기본적으로 10칸 배열을 생성

- 장점 : (Random Access) 데이터 접근이 빠르다. ➡️ 조회 성능이 좋음
- 동적 크기 조정 메커니즘
  - 내부적으로 고정 크기 배열을 유지하지만 더 이상 데이터가 들어갈 공간이 없다면, 자동적으로 크기를 늘린다
  1. 기존 배열의 1.5배 크기의 새 배열 생성
  2. 기존 데이터를 새 배열에 복사(깊은 복사)
  3. 기존 배열이 가리키던 참조 주소를 새 배열의 참조 주소로 변경
- 다만, 크기 조정은 성능 면에서 아래와 같은 비용(cost)를 초래
  1. 깊은 복사의 과정에서 시간이 소모
  2. 불규칙한 성능(spike) 발생 가능 : 배열 복사 발생 시 갑자기 느려지는 현상
  3. 메모리 사용량의 일시적인 증가 : 깊은 복사가 이뤄지는 시점에 기존 배열과 새로운 배열이 동시에 메모리에 존재
- 그래서 동적 크기 조정 메커니즘의 비용을 줄이기 위해 인스턴스를 생성하는 시점에서 초기 용량(initial capacity)을 설정
  - `ArrayList<String> list = new ArrayList<>(1000);`
  - 데이터 크기를 예측 가능한 상황에서는 초기 크기를 설정해주는 것이 좋음

<br>

#### 2) LinkedList

ArrayList 클래스가 배열과 유사하게 데이터를 저장하면서 발생하는 단점을 보완하기 위해 고안됨.

특정 위치의 데이터를 조회는 순회를 하기 때문에 시간 복잡도는 O(n)이다. 즉, `get(index)`를 하면 0~index까지 순회한다.

- 각 데이터 항목을 노드라는 독립적인 객체로 관리하고, 현재 데이터와 다음 요소가 있는 주소를 가짐.
  - 노드 : 두 개 이상의 선 또는 가지가 이어질 수 있는 연결 지점
- 단방향 연결 리스트와 양방향 연결 리스트
  - LinkedList는 단방향 연결 리스트와 양방향 연결 리스트가 있다. 자바의 LinkedList는 양방향 연결 리스트를 사용한다.
  - 단방향 연결 리스트 (singly-linked list) : 순서를 유지하지 않고 저장되지만, 노드 사이를 링크(참조)로 연결해서 리스트 같은 형태를 가지는 자료구조 ➡️ 이전 요소가 저장된 주소가 없어, 반대 방향으로 이동 불가
  - 양방향 연결 리스트 (doubly-linked list) : 다음 요소는 물론, 이전 요소도 링크하는 자료구조
- 메모리 사용 특성
  - 메모리 공간에 연속적으로 위치하지 않고, 곳곳에 흩어져 있음
  - 삽입/삭제는 메모리 이동(복사) 없이 효율적으로 수행됨 ➡️ 링크(참조)가 끊긴 데이터는 GC가 처리
  - 노드에는 데이터뿐만 아니라 링크(참조)를 위한 추가 메모리가 필요

<br>

### 2-02. Stack과 Queue

#### 1) Stack(스택)

제일 나중에 들어간 데이터가 가장 먼저 나오는 LIFO(Last In First Out; 후입 선출) 구조

- LIFO(Last-In-First-Out; 후입 선출): 가장 마지막에 삽입된 데이터가 가장 먼저 제거되는 구조로, 데이터의 삽입과 삭제가 한쪽 끝(top)에서만 이루어짐.
- `Stack<Integer> integerStack = new Stack<>();`
- 적용 사례
  - 실행 취소(Undo) 기능
  - 브라우저 뒤로 가기 기능

<br>

#### 2) Queue(큐)

가장 먼저 삽입된 데이터가 가장 먼저 처리되는 FIFO(First-In-First-Out; 선입선출**)** 구조

- FIFO(First-In-First-Out; 선입선출**) :** 가장 먼저 삽입된 데이터가 가장 먼저 처리되는 구조로, 데이터의 삽입과 삭제가 서로 반대편에서 일어남
- `Queue<String> que = new LinkedList<>();`
- 적용 사례
  - 작업 스케줄링
  - 버퍼 관리

<br>

#### 3) Deque

Deque(Double-ended Queue; 데크)란 양쪽 끝에서 삽입/삭제가 가능한 자료구조로, Stack과 Queue의 기능을 모두 제공하는 자료구조

- 양방향에서 데이터 처리가 가능해서 상황에 따라 Stack이나 Queue로 사용할 수 있다.
- 앞, 뒤에서 독립적인 데이터 처리 가능
- `Deque<Integer> deque = new ArrayDeque<>();`

<br>

### 2-03. Hash 기반 자료 구조

#### 1) 해시 함수(Hash Function)

임의의 입력값(키)을 고정된 크기의 정수(해시값)로 변환하는 함수

해시 값은 일반적으로 배열의 인덱스로 사용되고, 데이터를 빠르게 저장하거나 검색할 수 있도록 도움

- 해시 함수의 종류
  - ⭐나눗셈 방법 (Division Method)
  - ⭐곱셈 방법 (Multiplication Method)
  - ⭐문자열 해시 (Hashing for Strings)
    - 해밍 해시, 롤링 해시(Karp-Rabin), DJB 해시 함수 등
  - 비트 연산 기반 해시 (Bitwise Hashing)
    - 예: Java의 `String.hashCode()` 등
  - 보안 해시 함수 (Cryptographic Hash Functions)
    - SHA-256, MD5 등
- 해시 함수의 특징
  - 결정적(deterministic) : 동일한 입력은 항상 동일한 출력(해시값)을 생성
  - 빠른 계산 속도 : 해시 값은 계산이 빠르고 효율적
    - 단, 암호화는 예외
  - 균등한 분포 : 해시 값이 가능한 한 고르게 분포되어야 충돌을 줄일 수 있다.
- 해시 함수 장점
  - 평균적으로 **O(1)** 시간 복잡도로 데이터 접근이 가능하여 빠른 검색 성능 제공
  - 해시값을 배열의 인덱스로 활용하여 접근 속도 향상
  - key를 이용하여 value에 직접 접근 가능 (HashMap 등)

<br>

#### 2) 해시 충돌(Hash Collision 또는 Hash Clash)

서로 다른 두 입력값이 동일한 해시값을 생성하는 상황으로, 해시 함수가 유한한 크기의 해시값을 생성하므로 필연적으로 발생할 수밖에 없는 문제

- 해결 방법
  - 체이닝 (Separate Chaining 또는 Chaining)
  - 오픈 어드레싱 (Open Addressing)

<br>

#### 3) HashSet과 HashMap

`HashSet`이 내부적으로 `HashMap`을 사용하고, `HashMap`이 내부적으로 해시 테이블을 사용함.

즉, `HashSet`도 해시 테이블을 이용해 데이터를 저장

- HashSet
  - `Set`의 특징을 가지고 있으며, 중복된 값이 저장되지 않음
  - 인덱스가 아닌 키 값(중복없는 유일값)을 이용하여 데이터에 저장과 접근
  - `HashSet<String> data = new HashSet<>();`
- HashMap
  - **Key-Value 쌍**으로 데이터를 저장하며 다양한 value를 가질 수 있지만 **Key는 중복이 안된다.**
  - 해시 함수를 거치기 때문에 List보다는 상대적으로 저장은 느리지만, Hashing 이라는 해시 함수를 이용해서 데이터를 해시 테이블에 저장하기 때문에 검색 측면에서 뛰어나다. ➡️ 조회할 때 시간 복잡도는 O(1)이 된다.
  - Q. 그럼 List를 사용하지 Map은 왜 사용하는가?
    - Map은 key-value로 데이터를 저장하기 때문에 값이 무엇과 연관되어 있는지 의미 부여 가능
  - `HashMap<UUID, String> data = new HashMap<>();`

---

## <span style="background-color: #FFF9C4">3. 제네릭 타입과 메서드</span>

### 3-01. 제네릭(Generic)

자바에서 제네릭이란 클래스나 메서드의 코드를 작성할 때, 타입을 구체적으로 지정하는 것이 아니라, 추후에 지정할 수 있도록 일반화해 두는 것

즉, 작성한 클래스 또는 메서드의 코드가 특정 데이터 타입에 얽매이지 않게 해 둔 것을 말함

<br>

### 3-02. 제네릭 클래스(Generic Class)

```java
class Basket<T> {
    private T item;

    public Basket(T item) {
        this.item = item;
    }

    public T getItem() {
        return item;
    }

    public void setItem(T item) {
        this.item = item;
    }
}
```

`T`를 타입 파라미터라고 하며, `<T>`와 같이 꺾쇠 안에 넣어 클래스 이름 옆에 작성하여 클래스 내부에서 사용할 타입 파라미터를 선언할 수 있음.

- ⭐타입 파라미터(Type Parameter)란?
  - 제네릭 클래스나 메서드에서 타입을 일반화하기 위해 사용하는 **대체 타입 변수.**
  - 보통 `T`, `E`, `K`, `V` 같은 대문자 한 글자를 사용함.
    - `T` : Type
    - `E` : Element
    - `K` : Key
    - `V` : Value
    - `N` : Name
  - 선언부에 `<T>` 형식으로 지정하며, **실제 타입은 사용하는 시점(런타임)에 결정**됨.
- 주의할 점
  - 클래스 변수에는 타입 매개변수를 사용 불가
  - `static  T item2; // X`

<br>

### 3-03. 제네릭 메서드(Generic Method)

클래스 전체를 제네릭으로 선언할 수도 있지만, 클래스 내부의 특정 메서드만 제네릭으로 선언할 수 있는데, 이것을 제네릭 메서드라고 함.

- 타입 매개 변수 선언은 반환타입 앞에서 이루어지며, 해당 메서드 내에서만 선언한 타입 매개 변수를 사용 가능
  ```java
  class Basket<T> {
      public <T> void add(T element) {
          // 클래스 T와 메서드 T는 다름
          // 이때는 메서드에는 T가 아니라 E를 사용
      }
  }
  ```
- 제네릭 메서드의 타입 매개 변수는 제네릭 클래스의 타입 매개 변수와 별개의 것
- ⭐클래스 타입 파라미터는 인스턴스화 시점에 지정됨
- ⭐메서드 타입 파라미터는 메서드 호출 시점에 지정됨
- 메서드 타입 파라미터는 클래스가 제네릭이 아니어도 `static` 메서드로 선언하여 사용할 수 있음
- 주의사항
  - 호출 시점에 타입이 결정되므로, 정의 시점에는 실제 타입을 알 수 없음.
    ```java
    class Basket {
        public <T> void print(T item) {
            System.out.println(item.length()); // ❌ 컴파일 오류
        }
    }
    ```

<br>

### 3-04. 와일드카드(Wildcard)

제네릭 타입에 모호한 타입 또는 범위를 제한하고자 할 때 사용하는 문법으로, 제네릭 객체를 사용하는 쪽(매개변수 등)에서 사용됨

- 제네릭 클래스나 메서드의 사용 유연성을 높일 수 있음
- 종류
  - `<?>` : 모든 클래스 타입 허용 (`<? extends Object>`와 동일)
  - `<? extends T>`
    - `T`와 `T`를 상속받는 하위 타입만 타입 파라미터로 받을 수 있도록 지정 (상한 제한)
    - 읽기 전용 (읽을 수 O, 쓸 수 X)
  - `<? super T>`
    - `T`와 `T`의 상위 클래스만 타입 파라미터로 받을 수 있도록 지정 (하한 제한)
    - 쓰기 전용 (쓸 수 O, 읽을 수 X)

<br>

### 3-05. Bounded Type Parameter

제네릭 클래스와 메서드를 정의할 때 사용하는 문법

```java
public class Box<T extends Number> {
    private T value;
}
```

- `T extends Number`는 상한 제한(Bounded Type Parameter)으로, `T`는 반드시 `Number` 또는 그 하위 클래스여야 함.
- 클래스나 메서드를 정의할 때 타입 변수에 제한을 명시할 수 있음.

---

## <span style="background-color: #FFF9C4">4. File I/O 기초와 활용</span>

### 4-01. 파일 시스템 기초

운영체제에서 파일 시스템은 데이터를 디렉터리(=폴더)와 파일 단위로 저장하고 관리하는 구조

- 파일은 바이트(byte) 단위로 구성되며, 하드디스크, SSD 등 물리 저장 장치에 위치
- 파일의 경로
  - 절대 경로(Absolute Path) : 루트 디렉터리부터 시작하는 전체 경로
  - 상대 경로(Relative Path) : 현재 작업 디렉터리 기준으로 표시

<br>

### 4-02. 입출력

자바에서 입출력(I/O, Input/Output)은 스트림(Stream)을 통해 데이터를 처리

- 입출력과 관련된 API는 `java.io` 패키지에에서 제공

<br>

### 4-03. 스트림 기반 입출력

- 스트림은 **데이터의 흐름을 추상화**한 개념으로, 연속적으로 데이터를 주고받는 통로
  - 기본 스트림(노드 스트림)과 보조 스트림(필터 스트림)으로 나뉨
- 기본 스트림
  - 자바에서 데이터는 byte 단위로 다룸. 자바에서 문자는 2 byte가 기본.
    | 목적 | 입력 스트림 | 출력 스트림 |
    | ------------- | ------------- | -------------- |
    | 바이트 단위로 | `InputStream` | `OutputStream` |
    | 문자 단위로 | `Reader` | `Writer` |
- 보조 스트림
  | 기능 | 입력 | 출력 |
  | ------------- | --------------------- | ---------------------- |
  | 버퍼 처리 | `BufferedInputStream` | `BufferedOutputStream` |
  | 문자 변환 | `InputStreamReader` | `OutputStreamWriter` |
  | 기본형 처리 | `DataInputStream` | `DataOutputStream` |
  | ⭐객체 직렬화 | `ObjectInputStream` | `ObjectOutputStream` |

---

## <span style="background-color: #FFF9C4">5. **객체 직렬화**</span>

### 5-01. 객체 직렬화(Serialization)

메모리에 존재하는 객체를 바이트(byte) 형태로 변환하여 저장하거나 전송할 수 있도록 만드는 과정

반대로, 저장된 바이트 데이터를 다시 객체로 복원하는 과정을 역직렬화(Deserialization)

- 필요성
  - 컴퓨터는 객체를 메모리에 올려두고 사용하는데, 메모리는 휘발성이므로, JVM이 종료되면 객체도 사라짐
  - 그래서 객체를 파일, DB, 네트워크 전송 데이터 같은 외부 자원으로 변환해야 할 때 직렬화가 필요

<br>

### 5-02. Serializable 인터페이스

직렬화를 위해서는 클래스가 반드시 java.io.Serializable 인터페이스를 구현해야 함

- Serializable은 메서드가 하나도 없는 Marker Interface(표식 인터페이스)
- Serializable을 구현하지 않으면 객체는 직렬화될 수 없음.
