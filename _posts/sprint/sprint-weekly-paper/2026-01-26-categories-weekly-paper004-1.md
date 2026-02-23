---
title: '위클리페이퍼04-1: Spring과 Spring Boot'
excerpt: ''

categories:
  - Sprint Weekly Paper
tags:
  - [Codeit Sprint, Codeit Sprint Weekly Paper]

permalink: /categories/codeit-sprint/sprint-weekly-paper/weekly-paper004-1/

toc: true
toc_sticky: true

date: 2026-01-26
last_modified_at: 2026-01-26
---

## Q1. Spring Framework가 탄생하게 된 배경과 이를 통해 해결하고자 했던 문제점에 대해 설명하세요.

### Q1 답변

#### 01. Spring Framework의 탄생 배경

기존에 사용하던 EJB는 아래와 같은 문제점이 존재했다.

1. WAS에 종속되어, 다른 환경에서 재사용하거나 이식하는 것이 어려움
2. 객체지향 언어인 Java의 철학과 어긋나는 구조를 강제하는 경우가 많음
   - 의존 객체를 내부에서 직접 생성
   - 인터페이스 구조 강제
3. XML을 중심으로 하는 방대한 설정을 요구하여, 구성 파일이 복잡해졌고, 이로 인해 유지보수 비용이 증가
4. 컨테이너 기반으로 동작하기 때문에, 일반적인 Java 환경에서 단위 테스트가 불가능하거나 제한적

이로 인해, 점차 관심에서 멀어지게 되는 상황이 됨

이런 상황에서 로드 존슨(Rod Johnson)이 EJB를 대체할 수 있는 경량 프레임워크의 필요성을 역설하면서 자신이 설계한 프레임워크의 초기 버전을 공개했다. 이것이 훗날 Spring Framework로 발전하게 된다.

#### 02. Spring Framework가 해결하고자 했던 문제점

1. 기존 Java EE 환경에서는 EJB 컴포넌트를 사용하기 위해 특정 인터페이스를 구현하거나, 컨테이너에 배포되어야 했다. 이런 문제는 개발자의 기술적 제약을 강제하고, 테스트와 재사용성을 크게 제한함.
   - 이런 한계를 극복하고자 POJO 기반 설계와 IoC/DI로 컨테이너 종속성을 낮추고, 테스트를 쉽게 만듦
2. 복잡한 구성 문제는 설정 방식 단순화로 개선
   - 초기 XML → 애너테이션/Java Config
3. 트랜잭션, 로깅, 보안 같은 공통 관심사는 **AOP**로 분리해 중복을 줄임.

---

## Q2. 프레임워크와 라이브러리의 차이점을 제어 흐름의 주체와 사용 방식을 중심으로 설명하고, Spring Framework와 일반 Java 라이브러리를 예시로 들어 설명하세요.

### Q2 답변

#### 01. 제어 흐름의 주체

- **프레임워크**
  - 프레임워크의 동작에 따라 개발자가 작성한 코드를 이용
  - 예시: Spring Framework에서는 Spring 컨테이너가 제어
- **라이브러리**
  - 사용자가 작성한 것에 따라 라이브러리가 동작
  - 예시: 사용자가 원할 때 `Spring`이나 `Math` 같은 Java 라이브러리 `import`

#### 02. 사용 방식

- **프레임워크**
  - 프레임워크가 제공하는 규칙에 개발자가 따라야 한다.
  - 예시: Spring MVC에서 `@Controller`, `@Service` 같은 정해진 어노테이션을 따라야 함.
- **라이브러리**
  - 개발자가 필요한 기능만 선택해서 사용
  - 예시: 숫자 계산이 필요한 곳에 `Math` 같은 Java 라이브러리 사용

---

## 정리

[위클리페이퍼04: Spring과 Spring Boot "정리"](https://www.notion.so/jungh20000/04-Spring-Spring-Boot-2f3f59816c0280aea075dd3ae7b091e5?source=copy_link)
