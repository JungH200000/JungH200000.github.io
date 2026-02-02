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

# Q3. 웹 서버(Web Server)와 WAS(Web Application Server)의 차이를 설명하고, Spring Boot의 내장 톰캣이 이 둘 중 어디에 해당하는지 설명해주세요.

## 01. 웹 서버(Web Server)와 WAS(Web Application Server)의 차이

- **웹 서버(Web Server)**
  - HTTP 프로토콜로 클라이언트에게서 오는 요청을 처리하고 응답함
- **WAS(Web Application Server)**
  - 데이터베이스 같은 외부 API와 연동

## 02. Spring Boot의 내장 톰캣(Tomcat)

**톰캣(Tomcat)**은 **WAS**의 한 종류로, Spring Boot에는 기본적으로 별도의 설치 없이 내장 서버로 활용한다. 이로 인해 테스트에 매우 편리하다.

---

# Q4. Spring Boot에서 사용되는 다양한 Bean 등록 방법들에 대해 설명하고, 각각의 장단점을 비교하세요.

## 01. Java Config 방식

`@Configuration` + `@Bean` 어노테이션을 함께 사용하는 방식으로, Spring 공식 문서에서는 해당 방법을 권장하고 있다.

- 장점
  - 메서드를 통한 Bean 등록으로 직관적
- 단점
  - 등록할 Bean이 많을 경우 코드가 길어짐

## 02. Annotation Config 방식

`@Component`, `@Service`, `@Repository` 등의 어노테이션을 사용

- 장점
  - 간단한 어노테이션으로 Bean 등록 가능
  - 자동 탐지

---

# 해설

[위클리페이퍼04: Spring과 Spring Boot](https://www.notion.so/jungh20000/04-Spring-Spring-Boot-2f3f59816c0280aea075dd3ae7b091e5?source=copy_link)
