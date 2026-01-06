---
title: '[TIL 2일 차] Java 시작'
excerpt: ''

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til002/

toc: false
toc_sticky: false

date: 2025-12-31
last_modified_at: 2025-01-06
---

생성일: 2025년 12월 31일
요일: Wednesday

# 오늘의 성취

- Java의 기본 자료형과 참조 자료형을 메모리 할당의 관점에서 학습
- 참조 타입(Reference Type)은 “실제 값이 아닌 객체가 저장된 메모리 주소를 가지고 있음”을 이해

---

# 오늘의 학습

## <span style="background-color: #FFF9C4">1. Java 소개 및 환경 설정</span>

### Java 특징

- Write Once, Run Anywher
- 객체지향 언어(OOP)
- 자동 메모리 관리(GC)
- 함수형 프로그래밍 지원

<br>

### **JDK 구조**

<img src="https://github.com/JungH200000/JungH200000.github.io/blob/categories-ver2/assets/images/posts_img/til/jdk_structure.png?raw=true" width=500px>

| 구성 요소 | 설명                                                                               |
| --------- | ---------------------------------------------------------------------------------- |
| **JDK**   | Java 개발에 필요한 모든 것을 포함한 패키지입니다. 개발자는 반드시 설치해야 합니다. |
| **JRE**   | Java로 작성된 프로그램을 실행하기 위한 환경입니다. 개발 도구는 포함하지 않습니다.  |
| **JVM**   | 바이트코드를 실행하는 가상 머신으로 OS에 맞춰 자동 최적화됩니다.                   |

---

## <span style="background-color: #FFF9C4">2. 변수</span>

- 값을 저장할 수 있는 메모리(저장) 공간으로, 값이 변할 수 있다.
- 변수 선언과 할당 : `int num = 5;`

---

## <span style="background-color: #FFF9C4">3. 기본 타입 (Primitive Type)과 참조 타입(Reference Type)</span>

### **기본 타입 (Primitive Type)**

- **실제 값(value) 그 자체**를 저장

| 종류      | 예시                   | 크기                 | 설명               |
| --------- | ---------------------- | -------------------- | ------------------ |
| 정수 타입 | byte, short, int, long | 1~8 byte             | 정수 저장          |
| 실수 타입 | "float, double         | 4~8 byte             | 실수 저장          |
| 문자 타입 | char                   | 2 byte               | 유니코드 문자 저장 |
| 논리 타입 | boolean                | JVM 구현에 따라 다름 | true/false         |

<br>

### **참조 타입 (Reference Type)**

- 값을 저장할 때, 실제 값이 저장된 **메모리 주소(reference)를 저장**
- 기본 타입 8개를 제외한 모든 것(`String` , `Object` , 배열, 사용자 정의 클래스 등)

---

## <span style="background-color: #FFF9C4">4. 문자열(String)</span>

### 문자열(String)

- String 타입은 큰따옴표(””)로 감싸진 문자열
- String 타입 변수 선언 및 할당
  - `String name1 = "Lee C";`
  - `String name2 = new String("Lee H");`
- String 타입은 **불변 객체**
- String 타입 선언 및 할당이 된 변수는 **실제 문자열의 내용을 값으로 가지고 있는 것이 아니라 문자열이 존재하는 메모리 공간상의 주소값을 저장**하고 있다.
  - 때문에 두 String 변수를 등가 비교 연산자인 `==` 나 `equals` 로 비교할 때 값이 달라질 때가 있다.

---

## <span style="background-color: #FFF9C4">5. 연산자(Operator)</span>

### 연산자(Operator)

- **산술 연산자**: 사칙연산(`+`, `-`, `*`, `/`)와 나머지 연산자(`%`)
- **비교 연산자**: `boolean`타입으로 평가될 수 있는 조건식에 사용됨
  - 대소 비교 연산자: `>`, `<`, `<=`, `>=` 와 등가 비교 연산자: `==`, `!=`
- **논리 연산자**: AND 연산자(`&&`), OR 연산자(`||`), NOT 연산자(`!`)로, 공통으로 `boolean` 타입을 반환

---

## <span style="background-color: #FFF9C4">6. 제어문</span>

### **조건문**

- 특정 조건에 부합하는 경우 어떤 코드를 실행되도록 할 때 사용됨
- `if` 문, `if-else` 문, `switch` 문

<br>

### **반복문**

- 코드를 반복적으로 실행되도록 할 때 사용됨
- `for` , 향상된 `for` 문(Enhanced `for` 문), `while` 문, `do-while` 문
- `break`문과 `continue` 문

---

## <span style="background-color: #FFF9C4">7. 배열</span>

### 배열

- 동일한 타입의 값들을 하나의 묶음으로 묶인 자료를 의미
  - `자료형[] 변수명 = new 자료형[n];`
  - `자료형[] 변수명 = new 자료형[]{a, b, c, d, ...};`
- 가변 배열: `int[][] ages = new int[n][];`
- 배열 탐색: 기본적으로 인덱스와 배열의 크기(`.length`)를 활용하여 탐색

`if`문은 작은 범위부터 큰 범위로

---

# 내일의 계획

- 강의 진도 나간 부분까지 Java 연습 문제 풀기
- **스프린트 미션 1**
