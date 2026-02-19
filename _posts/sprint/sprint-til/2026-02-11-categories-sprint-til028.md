---
title: '[TIL 28일 차] 좋은 웹 API 디자인이란'
excerpt: 'API의 기본 이해 ~ API 버전 관리와 변경'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til028/

toc: true
toc_sticky: true

date: 2026-02-11
last_modified_at: 2026-02-11
---

# [TIL 28일 차] 좋은 웹 API 디자인이란

생성일: 2026년 2월 11일 18:44 (GMT+9)
요일: Wednesday
카테고리: TIL

# 오늘의 학습

## <span style="background-color: #FFF9C4">1. API의 기본 이해</span>

### 1-01. API(Application Programming Interface)의 정의

두 프로그램이 상호작용하기 위한 **인터페이스(규칙)이자 명세서**

즉, “내가 이 기능을 제공할 테니, 이 형식대로 요청하면 된다”라는 **협업 계약(메뉴판)** 이다.

- **추상화**
  - API는 **무엇을 할 수 있는지(what)**를 드러내고, **구현 방법(how)**은 숨긴다
- **캡슐화**
  - API는 내부 상태나 구조를 외부에서 함부로 건드리지 못하게 하고, **공개된 인터페이스를 통해서만 접근**하도록 보호
- **예시**: 아래 구조 전체가 각 계층별 API
  ```
  src
  └── main
      └── java
          └── com.example.api
              ├── controller      # HTTP 요청 진입점 (REST API)
              ├── service         # 비즈니스 로직 API (interface)
              ├── repository      # DB 접근 API (Spring Data JPA 등)
              └── dto             # API 입출력 객체
  ```
- **역할**
  - 기능 노출
  - 시스템 경계 관리
  - 안정성 보장
  - 협업 수단
  - 재사용성 강화

<br>

### 1-02. API의 다양한 유형

- **운영체제 API (System API)**
  - 운영체제(API)는 사용자 프로그램이 하드웨어나 커널 기능에 접근할 수 있도록 제공하는 **시스템 호출 인터페이스**
- **프로그래밍 언어 API (Language API)**
  - 프로그래밍 언어 자체가 제공하는 **표준 클래스 라이브러리 또는 인터페이스**입니다.
  - ➡️ 개발자가 반복 구현할 필요 없이 제공되는 기본 툴
  - 예시: Java Collection API
- **데이터베이스 API (DB API)**
  - 애플리케이션이 데이터베이스와 통신할 수 있도록 제공하는 API
  - 예시: Java JDBC API (JDBC = Java Database Connectivity)
- **웹 API (Web API / HTTP API)**
  - 인터넷을 통해 통신 가능한 API이며, 가장 대중적이고 많이 사용하는 형태
  - 예시: REST, GraphQL, SOAP 등의 스타일이 존재
  - Web API 구성요소: URL, Method, Status Code, Body

<br>

### 1-03. API 사용의 이점

- **코드 재사용성 (Code Reusability)**
  - API는 공통 구조를 제공하고 다양한 프로젝트에서 같은 기능을 공유할 수 있도록 함
  - **예시**: 문자열 뒤집기 등의 유틸 API를 만들어서 모든 프로젝트에 공유
- **구현 은닉 (Encapsulation)**
  - API는 내부 구현 방식(how)을 노출하지 않고, 외부에 필요한 기능(what)만 인터페이스로 제공
  - API 사용자는 구현을 알 필요 없이 정해진 사용 방법만 따르면 되고, 그 결과 내부 변경에 영향 받지 않으며 오용(실수) 가능성도 줄어듦

- **표준화된 데이터 교환 (Standardized Communication)**
  - REST API 및 JSON/개발자 개발 API들은 공통 구조가 있어 다양한 프로그램 간에 통신이 가능

---

## <span style="background-color: #FFF9C4">2. 웹 API의 특징과 발전</span>

### 2-01. 웹 API의 특징

- **네트워크 기반 통신**
  - 웹 API는 클라이언트와 서버가 **네트워크를 통해 데이터를 주고받는 구조**로, 클라이언트와 서버 간 데이터를 주고 받는 가장 일반적인 방식
  - **장점**
    - URL만 알면 접근 가능
    - 브라우저, 모바일 앱, 외부 서비스 등 다양한 클라이언트에서 호출 가능
    - 방화벽이나 인프라 제약이 적음 (HTTP 80/443 포트 사용)
- **플랫폼 독립성 (Platform Independence)**
  - 웹 API는 특정 OS나 언어에 의존하지 않고, **표준화된 HTTP 요청과 JSON/XML 등의 포맷**만 지키면 어떤 플랫폼에서든 접근이 가능
  - 시스템 간 통합에 매우 중요한 특성임
  - 플랫폼에 따른 호출 방법
    - Android(Java/Kotlin) ➡️ Retrofit / Volley 사용
    - iOS(Swift) ➡️ URLSession 사용
    - Web(JavaScript) ➡️ fetch(), axios() 등 사용
- **분산 시스템에서의 역할**
  - 대규모 시스템에서는 각 기능을 담당하는 **여러 개의 독립적인 마이크로서비스**가 각자의 API를 통해 서로 데이터를 주고받으며 동작
  - 웹 API는 이러한 서비스 간 통신의 **표준 채널**로서 동작
- **HTTP 프로토콜 활용의 장점**
  - **무상태성 (Statelessness)**
    - 서버는 클라이언트의 이전 요청 정보를 **저장하지 않음**, 즉 각 요청은 독립적
  - **비연결성 (Connectionless)**
    - HTTP는 요청-응답 후 **연결을 끊음** ➡️ 리소스 낭비를 줄임
  - **캐시 지원**
    - `Cache-Control`, `ETag`, `Last-Modified` 등을 통해 **불필요한 요청을 줄이고 성능 향상** 가능

<br>

### 2-02. 웹 API의 발전 과정

1. 초기 시스템이 하나의 서버에서 모두 실행되는 **모놀리식 구조**가 일반적
   - 기능이 점점 복잡해지고 서버 간 기능을 나눠야 하는 요구가 커지면서, **분산 시스템** 환경에서도 로컬처럼 서비스 호출이 가능한 방법이 필요해짐
2. 초기 분산 시스템 환경에서 가장 널리 사용된 방식 중 하나가 **RPC(Remote Procedure Call)**
   - 함수 호출이 네트워크를 통해 원격 서버로 전달되고, 거기서 실행된 후 결과가 다시 클라이언트로 돌아오는 방식
   - **문제점**
     - 클라이언트와 서버 간 결합도 증가
     - 원격 호출이므로 네트워크 장애 시 불안정
     - 언어/플랫폼 의존성
3. **SOAP(Simple Object Access Protocol)**
   - HTTP, SMTP 등의 프로토콜 위에서 **XML 형식의 메시지를 주고받는 방식의 API 통신 프로토콜**
   - 2000년대 초반 엔터프라이즈 시스템에서 표준으로 자리잡으며 대규모 시스템 간 연동에 사용
   - **특징**
     - 보안 및 신뢰성(WS-Security, WS-ReliableMessaging)
     - 트랜잭션 보장
   - **단점**
     - XML 구조가 지나치게 **무겁고 매우 복잡**해서 네트워크 트래픽 증가, 파싱 성능 저하
     - 브라우저 기반 호출이나 REST 클라이언트와 **호환성 떨어짐**
4. **RESTful API**
   - **REST(Representational State Transfer)**
     - **HTTP** 의 강점을 최대한 활용하여 리소스를 정의하고 상태를 전달하는 아키텍처 스타일
     - **HTTP 메서드** 사용 : GET / POST / PUT / PATCH / DELETE
     - **특징**
       - **무상태성 (Stateless)**
         - 서버가 각 호출의 상황을 기억하지 않는다는 의미
         - 그래서 매 호출마다 반복적인 정보 (AccessToken 등)를 모두 포함
       - **일관성 (Consistency)**
         - **HTTP 메서드**와 **자원 중심 URI 구조**를 일관되게 사용 ➡️ 처음 보는 API 예측 쉬워짐
       - **확장성 (Scalability)**
         - 자원 중심 설계라서 새로운 기능이 생기더라도 **기존 URI 설계 원칙을 유지하면서 자연스럽게 확장 가능**
     - **한계**
       - 필요 정보보다 너무 많은 데이터를 가져옴
       - 원하는 정보를 다 얻으려면 여러 번 요청
5. REST의 문제를 해결하기 위해 **GraphQL**과 **gRPC**가 등장
   - **GraphQL – 쿼리 기반 데이터 요청**
     - API 쿼리 언어로, 클라이언트가 **필요한 필드만 선택해서 요청**
     - 하나의 요청으로 여러 리소스 조합도 가능
     - **장점**
       - 불필요한 데이터까지 가져올 필요 없음
       - 필요한 데이터 조합을 한 번에 요청 가능
     - **단점**
       - 캐싱이 어렵고, 보안 필터링 로직 복잡해질 수 있음
   - **gRPC – 마이크로서비스를 위한 고성능 RPC**
     - RPC 프레임워크 (Remote Procedure Call)
     - **Protocol Buffers**(protobuf)라는 **이진(Binary) 포맷** 사용하여 **HTTP/2 기반**으로 **양방향 스트리밍, 서버 푸시, 멀티플렉싱** 등 고성능 기능을 지원
     - **내부 마이크로서비스 간 통신**에 매우 적합
     - **장점**
       - HTTP/2 + Binary 포맷으로 전송 속도가 빠름
       - 클라이언트와 서버 간 양방향 실시간 데이터 주고 받기 가
     - **단점**
       - 브라우저 지원이 불완전(프론트엔드에서는 거의 사용 불가)
       - Binary 포맷으로 디버깅이 어려움
       - 외부 API 제공에는 부적합

<br>

### 2-03. 현대 웹 API의 동향

1. **마이크로서비스 아키텍처와 API**
   - **마이크로서비스 아키텍처(MSA, Microservice Architecture)의 정의**
     - 단일 어플리케이션을 여러 개의 독립적인 서비스로 분해하여 운영하는 소프트웨어 구조로, 각 서비스는 하나의 **비즈니스 기능**을 수행하며, 자체적으로 **DB, 배포 주기, 팀 운영**을 가질 수 있음
   - **등장 배경**
     - 기존의 모놀리식(monolithic) 구조에서는 모든 기능이 하나의 시스템에 묶여 있어 아래의 **문제**가 발생
       - 작은 수정에도 전체 재배포 필요
       - 기능 간 결합도가 높아 유지보수에 어려움
     - 이에 따라 등장한 것이 “기능별로 쪼개고 독립 배포/운영하자”는 **MSA**
   - **특징**
     - 기능별 독립적으로 서비스 운영
     - 모든 서비스는 API를 통해 통신
     - 도메인 중심 팀 운영 가능
   - **서비스 간 API 통신 방식**
     - MSA에서 가장 중요한 요소로, 아래 3가지가 주로 활용됨
     - **REST**
     - **gRPC**
     - **메시지 브로커 (이벤트 기반 비동기 통신)**
       - Kafka, RabbitMQ, Redis Stream 등
   - **API GateWay**
     - 대규모 MSA에서는 각 서비스 API를 클라이언트가 직접 호출하지 않고, 중간에 **API Gateway**를 두어 “라우팅”, “인증/인가”, “공통 응답 포맷, 에러 처리” 등을 수행
2. **서버리스 아키텍처와 API**
   - **서버리스(Serverless)**
     - **서버가 없다는 뜻이 아니라, 개발자가 서버를 직접 관리하지 않는 구조**
     - 클라우드 제공자가 서버 실행 환경을 자동으로 관리
     - 개발자는 특정 기능(Function)만 작성하여 이벤트 기반으로 실행
   - **특징**
     - 서버 운영/보안 패치 등은 클라우드가 담당
     - 사용한 만큼만 비용 지불
     - 트래픽에 따라 자동 확장
     - 함수 단위로 빠르게 배포 가능
   - **단점**
     - 상태 유지가 불가능하기 때문에 외부 DB나 Redis 등 활용 필요
     - 복잡한 분산 로직으로 인해 추적이 어렵기 때문에 CloudWatch, X-Ray 등 필요

---

## <span style="background-color: #FFF9C4">3. API 설계 원칙과 패턴</span>

### 3-01. API 설계의 기본 원칙

- **일관성 (Consistency)**
  - API는 여러 개발자와 팀이 동시에 사용하기 때문에 **사용 방식과 결과가 예측 가능해야 함** ➡️ 문서를 전부 보지 않아도 쉽게 사용할 수 있고, 유지보수와 협업 비용이 획기적으로 줄어듦
    - 일관된 URI 패턴
    - HTTP 메서드의 일관된 의미 부여
    - 응답 필드 네이밍 규칙 통일
      - REST API 설계 시 자주 쓰는 네이밍 규칙
        - **소문자**와 **`-`(하이픈)** **권장**
        - **`-`(언더스코어)**와 **대문자**, **동사** **비권장**
    - 상태 코드의 명확한 구분
    - 일관된 필드명·구조 사용
- **단순성 (Simplicity)**
  - API는 복잡한 내부 로직을 감추고, **외부 개발자가 직관적으로 이해할 수 있어야 함**
  - 하나의 API는 한 가지 책임만
- **확장성 (Extensibility)**
  - API는 시간이 지나면서 **기능이 추가되거나 변경될 수밖에 없기 때문에** 이를 미리 고려한 유연한 설계가 필요
  - URI 구조는 세분화보다는 상위 구조를 유지하면서 하위 기능만 분기
- **안정성 (Stability)**
  - API는 한 번 공개되면 수많은 외부 시스템과 연결되므로 **변경을 최소화하고 예측 가능한 형태로 유지**하는 것이 매우 중요
  - 변경이 잦거나 예고 없이 이뤄질 경우, **프론트 오류, 클라이언트 크래시, 외부 파트너 서비스 장애**까지 유발 가능
    - **응답 필드 순서 고정**
    - **null 값 포함 제한 → 예측 가능한 구조 유지**
    - **Deprecated 필드 명시 & 제거 주기 관리**
    - **URI 구조 변경 시 버전 명시 또는 Proxy 유지**

<br>

### 3-02. API 엔드포인트 설계 원칙

- **명확한 의도 전달**
  - API는 "무엇을 하고자 하는지"가 URI에 드러나야 함
    즉, **리소스를 중심으로 표현**
- **계층 구조화**
  - URI를 **계층적으로 표현**
- **명명 규칙**
  - 복수형 사용
  - 동사 대신 명사 사용
  - **스네이크 케이스 대신 케밥 케이스 권장**
- **기능 단위 분할**
  - 비즈니스 기능이 복잡해질 경우, **하위 기능을 엔드포인트로 분리**

<br>

### 3-03. API 요청/응답 설계

- **요청(Request) 설계**
  - **데이터 구조화 (DTO 설계)**
    - 요청 데이터는 명확한 목적과 구조를 가져야 함
    - 데이터 전송 객체(DTO)를 통해 서버와 클라이언트 간 명확하게 계약되어야 함
  - **필터링과 정렬 패턴**
    - GET 요청에서는 다음과 같은 형식으로 파라미터를 구성하는 것이 일반적
    ```
    GET /api/users?age=20&city=seoul&sort=name,desc&page=0&size=10
    ```
- **응답(Response) 설계**
  - **일관된 응답 구조**
    - 모든 API 응답은 **공통된 틀**을 유지해야 클라이언트에서 일관된 파싱이 가능
  - **에러 처리 패턴**
    - HTTP 상태코드와 에러 메시지를 분리하여 프론트에서 명확히 대응할 수 있도록 설정

    ```java
    @ControllerAdvice
    public class GlobalExceptionHandler {

        @ExceptionHandler(EntityNotFoundException.class)
        public ResponseEntity<ApiErrorResponse> handleNotFound(EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiErrorResponse.of("USER_NOT_FOUND", e.getMessage()));
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException e) {
            return ResponseEntity.badRequest()
                .body(ApiErrorResponse.of("INVALID_INPUT", e.getBindingResult().toString()));
        }
    }
    ```

  - **페이지네이션 패턴**
    - Spring Data 또는 일반 API 설계 시 아래와 같은 응답 포맷을 따릅니다.

    ```java
    {
      "data": [
        { "id": 1, "name": "Alice" },
        { "id": 2, "name": "Bob" }
      ],
      "page": 0,
      "size": 2,
      "totalElements": 100,
      "totalPages": 50
    }
    ```

    - **data**: 실제 결과 목록
    - **page**: 현재 페이지 번호 (0-base)
    - **size**: 페이지 크기
    - **totalElements**: 전체 결과 수
    - **totalPages**: 전체 페이지 수

---

## <span style="background-color: #FFF9C4">4. API 버전 관리와 변경</span>

### 4-01. API 버전 관리 전략

- **URL 버전 관리**
  - API에 버전을 표기할 때, **URL 경로**에 버전 정보를 직접 명시하는 방식
  - `v1`, `v2` 같은 숫자나 날짜 형식
    - `GET /api/v1/items`, `GET /api/v2/items`
  - **장점**
    - 버전을 URI에서 명확히 표현하여 직관적이고 쉬움
    - 신규 기능은 새 버전 경로로, 기존 클라이언트 영향 없음
    - B2C 서비스나 외부 개발자 대상 API는 **URL 버전 방식이 유지보수와 문서화에 유리**
  - **단점**
    - 버전이 증가할수록 URI가 난잡
      - 예를 들어 User가 v1인데 Product는 v5인 경우
    - 문서 관리 및 마이그레이션 안내 필수
- **헤더 기반 버전 관리**
  - 버전을 **HTTP 헤더**(예: `Accept` 헤더)에 담아 구분하여, 클라이언트가 요청한 버전에 따라 서버가 해당 버전에 맞춰 응답
  - `Accept: application/json; version=2`
  - **장점**
    - URL이 깔끔함
    - 동일 URL에 버전만 바꿔 동작 분리
  - **단점**
    - 헤더 파잉 및 처리 로직 필요 ➡️ 구현 복잡도 증가
      - v1이면 어떤 DTO를 반환하고, v2면 어떤 DTO를 반환해야 하는지를 명확히 설계해야 함
    - 문서화 시 URI 버전 구분이 어려움
- **컨텐트 협상 기반 버전 관리 (Content Negotiation)**
  - HTTP의 컨텐트 협상(Content Negotiation) 기능을 활용하여, 클라이언트가 요청 헤더의 `Accept` 값에 **미디어 타입(Media Type)** 형식으로 버전을 명시하는 방식
  - **사용 방법**
    - **request**
      - `application/vnd.{회사명}.{버전}+{포맷}` 형식
        - `Accept: application/vnd.myapp.v1+json`
    - **server**

      ```java
      @RestController
      @RequestMapping("/items")
      public class ItemController {

          @GetMapping(produces = "application/vnd.myapp.v1+json")
          public ResponseEntity<ItemV1> getItemV1() {
      		    //...
          }
      ```

  - HTTP 표준에 부합하며, API의 버전뿐 아니라 데이터 형식도 함께 지정 ➡️ URI 유지 가능
  - **장점**
    - URI는 자원의 위치만 나타내고, 표현 방식(버전)은 헤더에서 협상하는 **REST 철학에 부합**
    - 응답 형식 및 버전 등을 헤더에서 조정하여 **세밀한 제어가 가능**
    - 데이터 포맷(json/xml 등)을 조합하여 사용하기 때문에 **미디어 타입 확장 가능**
  - **단점**
    - **헤더 기반이기 때문에** 생각보다 귀찮아서 개발자에게 부담
    - 디버깅이나 테스트 시 Postman이나 Swagger 같은 도구에서 헤더 설정이 번거로움
    - 프레임워크에서 기본적으로 제공하지 않을 시 직접 구현해야 하기 때문에 **서버 라우팅 복잡도 증가**
      - Spring Boot 4.0.2(Spring 7)부터 지원함

<br>

### 4-02. API 하위 호환성 유지

API는 시간이 지나면서 변하게 된다. 하지만 기존 클라이언트에서는 문제 없이 동작해야 하므로, API 변경 시에는 반드시 **호환성 유지** 여부를 고려해야 한다.

- **API 변경 유형**
  - **비파괴적(Non-breaking) 변경**
    - 기존 API 사용자에게 영향을 주지 않음
    - 기존 필드는 그대로 유지하면서 **선택적 필드 추가** 또는 **응답 확장**

    ```java
    {
      "id": 1,
      "name": "Alice",
      "nickname": "Ali",           // deprecated, 2025.01 제거 예정
      "displayName": "Alice"
    }
    ```

    - `@Deprecated` 주석을 붙여 문서화하고, 제거 일정 명시

  - **파괴적(Breaking) 변경**
    - 기존 클라이언트가 **정상 동작하지 않거나 오류** 발생
      - 기존 필드 제거 또는 이름 변경
      - 필수 요청 파라미터 추가
      - 응답 구조 자체를 변경(ex: 객체 ➡️ 배열)

- 점진적 변경 적용 절차
  - 변경이 반드시 필요할 때는
    기존 클라이언트가 **자연스럽게 전환**할 수 있도록 **단계적 프로세스**를 밟아야 한다.
  - **절차**
    1. 신규 버전 API 배포
    2. 기존 버전 API에 Deprecation 알림 추가
       - ex) 응답 헤더로 Deprecation 알림 제공
         - Warning 헤더, custom deprecation 헤더 등
    3. 릴리스 노트, 공식 문서에 마이그레이션 안내
    4. v1과 v2 엑세스 데이터 측정
    5. 일정 기간 후 구 버전 폐기

<br>

### 4-03. API 변경 시 필요한 커뮤니케이션

- **변경 문서화 필요**
  - API는 한 번 배포되면 다양한 클라이언트가 의존하게 되므로,
    변경이 발생할 경우 **명확하고 일관된 문서화 전략**이 필요
  - 단순히 변경했다고 공지하는 것이 아닌,
    실제 사용자가 쉽게 마이그레이션할 수 있도록 문서 구조와 안내 방식까지 설계
  - **문서화 수단**
    - 릴리스 노트, Swagger / OpenAPI 명세, API Portal, README.md, ChangeLog.md
- **사용 중단(Deprecation) 정책**
  - API Deprecation은 단순한 삭제가 아니라 사용자가 **확인/제공해야 하는 필수 정책**
  - **핵심 요소**
    - 최소 3 ~ 6개월 전 **사전 공지** 필요
    - **정확한 제거 시점**을 고지
    - 응답 헤더를 통해 **프로그램적**으로 자동화된 경고 제공
- **마이그레이션 가이드**
  - 새로운 API 버전을 배포할 때, 개발자가 쉽게 이전할 수 있도록 **전환 단계별 가이드**를 제공
  - 이전 버전과 변경 사항 비교 + 예제 코드 포함 + 점진적 안내
