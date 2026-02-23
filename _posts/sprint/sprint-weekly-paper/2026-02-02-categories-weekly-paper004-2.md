---
title: '위클리페이퍼04-2: Spring과 Spring Boot'
excerpt: ''

categories:
  - Sprint Weekly Paper
tags:
  - [Codeit Sprint, Codeit Sprint Weekly Paper]

permalink: /categories/codeit-sprint/sprint-weekly-paper/weekly-paper004-2/

toc: true
toc_sticky: true

date: 2026-02-02
last_modified_at: 2026-02-02
---

## Q3. 웹 서버(Web Server)와 WAS(Web Application Server)의 차이를 설명하고, Spring Boot의 내장 톰캣이 이 둘 중 어디에 해당하는지 설명해주세요.

### Q3-1. 답변

#### 01. 웹 서버(Web Server)와 WAS(Web Application Server)의 차이

- **웹 서버(Web Server)**
  - HTTP 프로토콜로 클라이언트에게서 오는 요청을 처리하고 응답함
- **WAS(Web Application Server)**
  - 데이터베이스 같은 외부 API와 연동

#### 02. Spring Boot의 내장 톰캣(Tomcat)

**톰캣(Tomcat)**은 **WAS**의 한 종류로, Spring Boot에는 기본적으로 별도의 설치 없이 내장 서버로 활용한다. 이로 인해 테스트에 매우 편리하다.

<br>

### Q3-2. 정리

#### **웹 서버와 WAS의 기본 개념**

- 웹 서버
  - 정적 컨텐츠(HTML, CSS, 이미지 등) 처리에 특화
  - HTTP 프로토콜을 기반으로 클라이언트의 요청을 처리
  - 대표적으로 Nginx, Apache HTTP Server가 있음
- WAS(Web Application Server)
  - 동적 컨텐츠 처리에 특화
  - 비즈니스 로직 실행과 데이터베이스 연동 등을 담당
  - 대표적으로 Tomcat, JBoss, WebLogic이 있음

#### **Spring Boot의 내장 톰캣**

- 톰캣은 WAS의 한 종류입니다
- Spring Boot는 기본적으로 톰캣을 내장 서버로 제공
- 별도의 톰캣 설치 없이 애플리케이션을 실행할 수 있음
- 개발 환경과 테스트에 매우 편리
- JAR 파일 하나로 배포가 가능한 장점

---

## Q4. Spring Boot에서 사용되는 다양한 Bean 등록 방법들에 대해 설명하고, 각각의 장단점을 비교하세요.

### Q4-1. 답변

#### 01. Java Config 방식

`@Configuration` + `@Bean` 어노테이션을 함께 사용하는 방식으로, Spring 공식 문서에서는 해당 방법을 권장하고 있다.

- 장점
  - 메서드를 통한 Bean 등록으로 직관적
- 단점
  - 등록할 Bean이 많을 경우 코드가 길어짐

#### 02. Annotation Config 방식

`@Component`, `@Service`, `@Repository` 등의 어노테이션을 사용

- 장점
  - 간단한 어노테이션으로 Bean 등록 가능
  - 자동 탐지

<br>

### Q4-2. 정리

#### **`@Configuration`과 `@Bean` 사용**

```java

@Configuration
public class AppConfig {
    @Bean
    public MyService myService() {
        return new MyService();
    }
}

```

장점:

- 메서드를 통한 명시적인 Bean 등록으로 코드가 직관적
- Bean 생성 로직을 자유롭게 작성 가능
- 외부 라이브러리 클래스를 Bean으로 등록할 때 유용

단점:

- 많은 Bean을 등록할 경우 코드가 길어짐
- 설정 클래스 관리가 필요

#### **@Component와 컴포넌트 스캔**

```java

@Component
public class MyService {
// 비즈니스 로직
}

```

장점:

- 간단한 설정으로 Bean 등록 가능
- 자동 탐지로 편리한 사용
- 개발 생산성이 높음

단점:

- Bean의 등록 여부를 파악하기 위해 클래스를 직접 확인해야 함
- 광범위한 컴포넌트 스캔은 애플리케이션 시작 시간에 영향을 줄 수 있음

#### **Bean 등록 시 고려사항**

- 애플리케이션의 규모와 복잡도
- 팀의 개발 문화와 컨벤션
- 유지보수성과 확장성
- Bean 간의 의존관계 복잡도

#### **권장 사항**

- 개발자가 직접 작성한 클래스는 `@Component` 사용
- 외부 라이브러리나 복잡한 생성 로직이 필요한 경우 `@Configuration`과 `@Bean` 사용
- 동일한 타입의 여러 Bean을 등록할 때는 `@Configuration`과 `@Bean` 사용
- 조건부 Bean 등록이 필요한 경우 `@Configuration`과 `@Bean` 사용
