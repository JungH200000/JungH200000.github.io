---
title: '[TIL 55일 차] Sprint Mission7 - Controller 계층에서 주요 메서드 슬라이스 테스트'
excerpt: '2-7.슬라이스 테스트'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til055-2

toc: true
toc_sticky: true

date: 2026-04-02
last_modified_at: 2026-04-02
---

# 오늘의 성취

## 1. 개발 진행 상황

- Controller 계층에서 슬라이스 테스트를 작성
  - `@WebMvcTest`를 활용해 테스트를 구현
  - WebMvcTest에서 자동으로 등록되지 않는 유형의 Bean이 필요하다면 `@Import`를 활용해 추가
  - 주요 컨트롤러(User, Channel, Message)에 대해 테스트 케이스 작성
    - `ChannelController` 작업완료
    - `UserController` 작업 중
  - MockMvc를 활용해 Controller를 테스트
  - Service 계층을 mock하여 Controller 로직만 테스트
  - JSON 응답을 검증하는 테스트를 포함

---

# 프로젝트 요구 사항

## 2. 기본 요구사항

`//...`

### 2-7. 슬라이스 테스트

`//...`

- [진행 중] 컨트롤러 레이어의 슬라이스 테스트를 작성하세요.
  - [ ] `@WebMvcTest`를 활용해 테스트를 구현하세요.
  - [ ] `WebMvcTest`에서 자동으로 등록되지 않는 유형의 Bean이 필요하다면 `@Import`를 활용해 추가하세요.
    - 예시
      ```java
      @Import({ErrorCodeStatusMapper.class})
      ```
  - [ ] 주요 컨트롤러(User, Channel, Message)에 대해 최소 2개 이상(성공, 실패)의 테스트 케이스를 작성하세요.
  - [ ] MockMvc를 활용해 컨트롤러를 테스트하세요.
  - [ ] 서비스 레이어를 모의(mock)하여 컨트롤러 로직만 테스트하세요.
  - [ ] JSON 응답을 검증하는 테스트를 포함하세요.

<br>

### 2-8. 통합 테스트

- [ ] 통합 테스트 환경을 구성하세요.
  - [ ] `@SpringBootTest`를 활용해 Spring 애플리케이션 컨텍스트를 로드하세요.
  - [ ] H2 인메모리 데이터베이스를 활용하세요.
  - [ ] 테스트용 프로파일을 구성하세요.
- [ ] 주요 API 엔드포인트에 대한 통합 테스트를 작성하세요.
  - [ ] 주요 API에 대해 최소 2개 이상의 테스트 케이스를 작성하세요.
    - [ ] 사용자 관련 API (생성, 수정, 삭제, 목록 조회)
    - [ ] 채널 관련 API (생성, 수정, 삭제)
    - [ ] 메시지 관련 API (생성, 수정, 삭제, 목록 조회)
  - [ ] 각 테스트는 `@Transactional`을 활용해 독립적으로 실행하세요.

---

## 3. 심화 요구사항

### 3-1. MDC를 활용한 로깅 고도화

- [ ] 요청 ID, 요청 URL, 요청 방식 등의 정보를 MDC에 추가하는 인터셉터를 구현하세요.
  - [ ] 클래스명: `MDCLoggingInterceptor`
  - [ ] 패키지명: `com.**.discodeit.config`
  - [ ] 요청 ID는 랜덤한 문자열로 생성합니다. (UUID)
  - [ ] 요청 ID는 응답 헤더에 포함시켜 더 많은 분석이 가능하도록 합니다.
    - 헤더 이름: `Discodeit-Request-ID`
- [ ] `WebMvcConfigurer`를 통해 `MDCLoggingInterceptor`를 등록하세요.
  - [ ] 클래스명: `WebMvcConfig`
  - [ ] 패키지명: `com.**.discodeit.config`
- [ ] Logback 패턴에 MDC 값을 포함시키세요.
  - 로그 출력 예시

    ```markdown
    # 패턴

    {년}-{월}-{일} {시}:{분}:{초}:{밀리초} [{스레드명}] {로그 레벨(5글자로 맞춤)} {로거 이름(최대 36글자)} [{MDC:요청ID} | {MDC:요청 메서드} | {MDC:요청 URL}] - {로그 메시지}{줄바꿈}

    # 예시

    25-01-01 10:33:55.740 [main] DEBUG o.s.api.AbstractOpenApiResource [827cbc0b | GET | /v3/api-docs] - Init duration for springdoc-openapi is: 216 ms
    ```

<br>

### 3-2. Spring Boot Admin을 활용한 메트릭 가시화

- [ ] Spring Boot Admin 서버를 구현할 모듈을 생성하세요.
  - IntelliJ 화면 참고

    <img src="https://bakey-api.codeit.kr/api/files/resource?root=static&seqId=13907&version=1&directory=/9l6b0q2dn-image.png&name=9l6b0q2dn-image.png" width=700px>

  - 모듈 정보는 다음과 같습니다.

    <img src="https://bakey-api.codeit.kr/api/files/resource?root=static&seqId=13907&version=1&directory=/b8812d4su-image.png&name=b8812d4su-image.png" width=400px>

  - 의존성

    <img src="https://bakey-api.codeit.kr/api/files/resource?root=static&seqId=13907&version=1&directory=/zjh3frl0m-image.png&name=zjh3frl0m-image.png" width=500px>

- [ ] `admin` 모듈의 메인 클래스에 `@EnableAdminServer` 애너테이션을 추가하고, 서버는 9090번 포트로 설정합니다.

  ```java
  import de.codecentric.boot.admin.server.config.EnableAdminServer;

  @SpringBootApplication
  @EnableAdminServer
  public class AdminApplication {
      public static void main(String[] args) {
          SpringApplication.run(AdminApplication.class, args);
      }
  }
  ```

  ```yaml
  # application.yaml
  spring:
    application:
      name: admin
  server:
    port: 9090
  ```

- [ ] `admin` 서버 실행 후 [localhost:9090/applications](http://localhost:9090/applications) 에 접속해봅니다.
- [ ] discodeit 프로젝트에 Spring Boot Admin Client를 적용합니다.
  - [ ] 의존성을 추가합니다.
    ```groovy
    dependencies {
        ...
        implementation 'de.codecentric:spring-boot-admin-starter-client:3.4.5
    }
    ```
  - [ ] admin 서버에 등록될 수 있도록 설정 정보를 추가합니다.
    ```yaml
    # application.yml
    spring:
      application:
        name: discodeit
        ...
      boot:
        admin:
          client:
            instance:
              name: discodeit
    ...
    ```
    ```yaml
    # application-dev.yml
    spring:
      application:
        name: discodeit
        ...
      boot:
        admin:
          client:
            url: http://localhost:9090
    ...
    ```
    ```yaml
    # application-prod.yml
    spring:
      application:
        name: discodeit
        ...
      boot:
        admin:
          client:
            url: ${SPRING_BOOT_ADMIN_CLIENT_URL}
    ...
    ```
  - [ ] discodeit 서버를 실행하고, admin 대시보드에 discodeit 인스턴스가 추가되었는지 확인합니다.
- [ ] admin 대시보드 화면을 조작해보면서 각종 메트릭 정보를 확인해보세요.
  - 주요 API의 요청 횟수, 응답시간 등
  - 서비스 정보

<br>

### 3-3. 테스트 커버리지 관리

- [ ] JaCoCo 플러그인을 추가하세요.

  ```groovy
  plugins {
      id 'jacoco'
  }

  test {
      finalizedBy jacocoTestReport
  }

  jacocoTestReport {
      dependsOn test
      reports {
          xml.required = true
          html.required = true
      }
  }
  ```

- [ ] 테스트 실행 후 생성된 리포트를 분석해보세요.
  - 리포트는 `build/reports/jacoco` 경로에서 확인할 수 있습니다.
- [ ] `com.sprint.mission.discodeit.service.basic` 패키지에 대해서 **60%** 이상의 코드 커버리지를 달성하세요.

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint7](https://github.com/JungH200000/10-sprint-mission/tree/sprint7)
