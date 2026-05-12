---
title: '위클리페이퍼05: RESTful APIs 구현하기'
excerpt: ''

categories:
  - Sprint Weekly Paper
tags:
  - [Codeit Sprint, Codeit Sprint Weekly Paper]

permalink: /categories/codeit-sprint/sprint-weekly-paper/weekly-paper005

toc: true
toc_sticky: true

date: 2026-02-23
last_modified_at: 2026-02-23
---

## Q1. 웹 API의 발전 과정에서 SOAP에서 REST로의 전환이 일어난 이유와 그 장단점에 대해 설명하세요.

### Q1-1. 답변

#### SOAP에서 REST로의 전환 이유

SOAP(Simple Object Access Protocol)는 XML 형식의 메시지를 주고 받는 API 통신 프로토콜

- **XML 구조**
  - 무겁고 복잡함 ➡️ 네트워크 트래픽 증가, 파싱 성능 저하
  - 메시지 해석과 작성에 높은 복잡도 ➡️ 개발자가 직접 다루기 힘듦
- 브라우저 기반 호출이라 REST 클라이언트와 호환성이 떨어짐

#### REST의 장점

- HTTP 메서드와 자원 중심 URI 구조를 일관되게 사용 ➡️ 처음 보는 API 예측이 쉬어짐
- 자원 중심 설계라 규칙만 잘 지키면 쉽게 확장 가능 ➡️ 새로운 기능이 생기더라도 자연스럽게 확장 가능

#### REST의 단점

- Over-fetching: 불필요한 정보도 가져올 수 있음
- Under-fetching: 원하는 정보를 얻기 위해서는 여러 번 요청해야 함.

<br>

### Q1-2. 정리

#### **SOAP에서 REST로의 전환 배경**

- SOAP는 엄격한 XML 기반 프로토콜로, 복잡한 구조와 무거운 메시지 포맷으로 인해 처리 오버헤드가 컸습니다.
- 웹의 성장과 함께 더 가벼운 통신 방식의 필요성이 대두되었습니다.

#### **REST의 장점**

- HTTP 프로토콜의 특성을 활용하여 별도의 프로토콜이 불필요합니다.
- JSON 등 가벼운 데이터 포맷 사용으로 처리가 용이합니다.
- 웹의 기존 인프라(캐시 등)를 활용할 수 있습니다.
- 단순한 인터페이스로 인해 학습 곡선이 낮습니다.

#### **REST의 한계**

- 표준화된 에러 처리 방식이 부재합니다.
- 대규모 엔터프라이즈 환경에서 SOAP의 일부 기능(트랜잭션, 보안 등)을 구현하기 어렵습니다.
- 모든 REST 제약조건을 완벽히 만족시키기 어렵습니다.

---

## Q2. Spring Boot에서 @RestController로 들어온 HTTP 요청이 처리되어 응답으로 변환되는 전체 과정을 설명하세요. 특히 HTTP 메시지 컨버터가 동작하는 시점과 역할을 포함해서 설명하세요.

### Q2-1. 답변

1. 요청 진입점: `DispatcherServlet`
   - HTTP 요청은 `DispatcherServlet`에 가장 먼저 들어옴
2. `RequestMappingHandlerMapping`를 통해 호출할 핸들러 메서드 찾음
   - 요청 URI와 HTTP 메서드를 기준으로 찾음
3. `RequestMappingHandlerAdapter`를 사용해 찾아낸 핸들러 메서드를 실행시킬 Adapter들을 찾음
4. 핸들러 메서드의 파라미터에 따라 적합한 Adapter가 동작
5. 이때 `@RequestBody` 애너테이션이 있는 경우, HTTP 메시지 컨버터가 동작하여 요청 본문을 Java 객체로 변환
6. 그 후 비즈니스 로직 처리 후 반환 값이 생성된다.
7. `@ResponseBody`나 `@RestController`가 존재할 경우, HTTP 메시지 컨버터가 동작해 반환 값을 HTTP 응답 본문으로 변환된다.

<br>

### Q2-2. 정리

#### 요청의 시작과 컨트롤러 매핑

클라이언트로부터 HTTP 요청이 들어오면 가장 먼저 `DispatcherServlet`이 이를 받습니다. `DispatcherServlet`은 프론트 컨트롤러로서 모든 웹 요청의 진입점 역할을 합니다. 이후 RequestMappingHandlerMapping을 사용하여 요청 URL과 HTTP 메서드를 기반으로 적절한 컨트롤러 메서드를 찾습니다. 이 과정에서 해당 요청을 처리할 수 있는 핸들러 어댑터가 선택되어 실제 컨트롤러 메서드 호출을 준비합니다.

#### 요청 데이터의 변환 과정

컨트롤러 메서드가 선택된 후, 해당 메서드의 파라미터를 처리하는 과정이 시작됩니다. 특히 `@RequestBody` 애너테이션이 있는 경우, HTTP 메시지 컨버터가 동작하여 요청 본문을 Java 객체로 변환합니다. 이때 요청의 Content-Type 헤더를 확인하여 적절한 메시지 컨버터가 선택되는데, JSON 요청의 경우 일반적으로 `MappingJackson2HttpMessageConverter`가 사용됩니다. URL 경로 변수나 쿼리 파라미터도 이 시점에서 적절한 타입으로 변환되어 메서드 파라미터에 바인딩됩니다.

#### 응답 생성과 변환

컨트롤러 메서드가 실행되어 비즈니스 로직을 처리한 후, 반환값이 생성됩니다. @RestController 애너테이션이 있거나 메서드에 `@ResponseBody`가 있는 경우, 반환된 객체는 뷰 리졸버를 거치지 않고 직접 HTTP 응답 본문으로 변환됩니다. 이때도 HTTP 메시지 컨버터가 동작하는데, 클라이언트의 Accept 헤더를 기반으로 적절한 메시지 컨버터가 선택됩니다. `ResponseEntity`를 사용하면 HTTP 상태 코드나 응답 헤더와 같은 세부적인 응답 제어가 가능합니다.

#### HTTP 메시지 컨버터의 역할

HTTP 메시지 컨버터는 요청과 응답 과정에서 핵심적인 역할을 수행합니다. 요청 시에는 HTTP 요청 본문을 Java 객체로 역직렬화하고, 응답 시에는 Java 객체를 HTTP 응답 본문으로 직렬화합니다. 특히 Spring Boot에서는 Jackson 라이브러리를 기본으로 사용하여 JSON 형식의 데이터를 처리합니다. 메시지 컨버터는 Content-Type과 Accept 헤더를 기반으로 자동으로 선택되며, `@ResponseBody`와 `@RequestBody` 애너테이션과 긴밀하게 연동되어 동작합니다.
