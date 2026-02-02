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

# Spring MVC에서 클라이언트의 요청 흐름을 `@Controller`와 `@RestController`의 차이점을 중심으로 각각의 처리 과정과 특징을 포함하여 설명하세요.

## 01. `@Controller`와 `@RestController`

- `@Controller`
  - 전통적인 Spring MVC 컨트롤러로, View 반환이 목적
- `@RestController`
  - `@Controller` + `@ResponseBody`
  - 데이터 자체를 반환하는 것이 목적이라, HTTP API에 개발에 특화

## 02. `@Controller`와 `@RestController`의 처리 과정

### 1) `@Controller`의 처리 과정

- DispatcherServlet이 요청을 받아
- HandlerMapping로 적합한 컨트롤러를 찾고
- 컨트롤러 로직을 처리 후 View 반환
- View가 HTML 생성
- 생성된 HTML을 클라이언트로 반환

### 2) `@RestController`

- DispatcherServlet이 요청을 받아
- HandlerMapping로 적합한 컨트롤러를 찾고
- 컨트롤러 로직 처리 후 객체 반환
- HttpMessageConverter가 객체를 JSON/XML로 변환
- 변환된 데이터를 클라이언트에 반환

---

# 해설

[위클리페이퍼04: Spring과 Spring Boot](https://www.notion.so/jungh20000/04-Spring-Spring-Boot-2f3f59816c0280aea075dd3ae7b091e5?source=copy_link)
