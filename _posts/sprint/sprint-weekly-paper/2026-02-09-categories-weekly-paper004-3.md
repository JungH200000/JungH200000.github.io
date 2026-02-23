---
title: '위클리페이퍼04-3: Spring과 Spring Boot'
excerpt: ''

categories:
  - Sprint Weekly Paper
tags:
  - [Codeit Sprint, Codeit Sprint Weekly Paper]

permalink: /categories/codeit-sprint/sprint-weekly-paper/weekly-paper004-3/

toc: true
toc_sticky: true

date: 2026-02-09
last_modified_at: 2026-02-09
---

## Q5. Spring에서 AOP(Aspect Oriented Programming)가 필요한 이유와 이를 활용한 실제 애플리케이션 개발 사례에 대해 설명하세요.

### 답변

#### 01. Spring에서 AOP가 필요한 이유

AOP는 로깅이나 트랜잭션, 보안 검사, 실행 시간 측정 등 모든 모듈에서 반복적으로 등장하는 로직에 사용되는데,

- AOP가 없다면
  - 모든 비즈니스 메소드에 중복해서 들어가는 코드가 존재
  - 로직을 변경해야 할 경우, 모든 메소드를 수정해야 함

그래서 AOP를 사용해 모든 모듈에 반복적으로 등장하는 로직을 공통화하여 재사용 가능하게 만들기 위해 필요하다.

#### 02. AOP를 활용한 실제 애플리케이션 개발 사례

- 메소드 실행 전 해당 유저의 존재 여부나 권한 확인
- 디버깅을 위한 로깅

---

## Q6. Spring MVC에서 클라이언트의 요청 흐름을 `@Controller`와 `@RestController`의 차이점을 중심으로 각각의 처리 과정과 특징을 포함하여 설명하세요.

### 답변

#### 01. `@Controller`와 `@RestController`

- `@Controller`
  - 전통적인 Spring MVC 컨트롤러로, View 반환이 목적
- `@RestController`
  - `@Controller` + `@ResponseBody`
  - 데이터 자체를 반환하는 것이 목적이라, HTTP API에 개발에 특화

##### 02. `@Controller`와 `@RestController`의 처리 과정

02-1. `@Controller`의 처리 과정

- `DispatcherServlet`이 요청을 받아
- `HandlerMapping`와 `HandlerAdapter`가 적합한 컨트롤러를 찾고
- 컨트롤러 로직을 처리 후 View 이름을 반환
- `ViewResolver`가 View를 찾고,
- View가 HTML 생성
- 생성된 HTML을 클라이언트로 반환

2. `@RestController`
   - `DispatcherServlet`이 요청을 받아
   - `HandlerMapping`와 `HandlerAdapter`가 적합한 컨트롤러를 찾고
   - 컨트롤러 로직 처리 후 객체 반환
   - `HttpMessageConverter`가 객체를 JSON/XML로 변환
   - 변환된 데이터를 클라이언트에 반환

---

## 정리

[위클리페이퍼04: Spring과 Spring Boot 정리](https://www.notion.so/jungh20000/04-Spring-Spring-Boot-2f3f59816c0280aea075dd3ae7b091e5?source=copy_link)
