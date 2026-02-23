---
title: '위클리페이퍼05: RESTful APIs 구현하기'
excerpt: ''

categories:
  - Sprint Weekly Paper
tags:
  - [Codeit Sprint, Codeit Sprint Weekly Paper]

permalink: /categories/codeit-sprint/sprint-weekly-paper/weekly-paper005/

toc: true
toc_sticky: true

date: 2026-02-20
last_modified_at: 2026-02-20
---

## Q1. 웹 API의 발전 과정에서 SOAP에서 REST로의 전환이 일어난 이유와 그 장단점에 대해 설명하세요.

### 답변

#### SOAP에서 REST로의 전환 이유

SOAP(Simple Object Access Protocol)는 XML 형식의 메시지를 주고 받는 API 통신 프로토콜

- XML 구조
  - 무겁고 복잡함 ➡️ 네트워크 트래픽 증가, 파싱 성능 저하
  - 메시지 해석과 작성에 높은 복잡도 ➡️ 개발자가 직접 다루기 힘듦
- 브라우저 기반 호출이라 REST 클라이언트와 호환성이 떨어짐

#### REST의 장점

- HTTP 메서드와 자원 중심 URI 구조를 일관되게 사용 ➡️ 처음 보는 API 예측이 쉬어짐
- 자원 중심 설계라 규칙만 잘 지키면 쉽게 확장 가능 ➡️ 새로운 기능이 생기더라도 자연스럽게 확장 가능

#### REST의 단점

- Over-fetching: 불필요한 정보도 가져올 수 있음
- Under-fetching: 원하는 정보를 얻기 위해서는 여러 번 요청해야 함.

---

## Q2. Spring Boot에서 @RestController로 들어온 HTTP 요청이 처리되어 응답으로 변환되는 전체 과정을 설명하세요. 특히 HTTP 메시지 컨버터가 동작하는 시점과 역할을 포함해서 설명하세요.

### 답변

1. 요청 진입점: `DispatcherServlet`
   - HTTP 요청은 `DispatcherServlet`에 가장 먼저 들어옴
2. `RequestMappingHandlerMapping`를 통해 호출할 핸들러 메서드 찾음
   - 요청 URI와 HTTP 메서드를 기준으로 찾음
3. `RequestMappingHandlerAdapter`를 사용해 찾아낸 핸들러 메서드를 실행시킬 Adapter들을 찾음
4. 핸들러 메서드의 파라미터에 따라 적합한 Adapter가 동작
5. 이때 `@RequestBody` 애너테이션이 있는 경우, HTTP 메시지 컨버터가 동작하여 요청 본문을 Java 객체로 변환
6. 그 후 비즈니스 로직 처리 후 반환 값이 생성된다.
7. `@ResponseBody`나 `@RestController`가 존재할 경우, HTTP 메시지 컨버터가 동작해 반환 값을 HTTP 응답 본문으로 변환된다.

---

## 정리

[위클리페이퍼05: RESTful APIs 구현하기 "정리"](https://www.notion.so/jungh20000/05-RESTful-APIs-307f59816c0280b5a75fce1d7059b9db?source=copy_link)
