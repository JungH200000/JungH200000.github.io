---
title: '[TIL 19일 차] Sprint Mission3 - 디스코드: Bean 선언 및 Lombok 적용'
excerpt: '2-1. Spring 프로젝트 초기화 ~ 2-4. Lombok 적용Permalink'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til019-2/

toc: true
toc_sticky: true

date: 2026-01-27
last_modified_at: 2026-01-27
---

# 오늘의 성취

## 1. 개발 진행 상황

- 기존 Java 프로젝트를 Spring Boot 프로젝트로 초기화
- `File*Repository`와 `Base*Service` Bean 등록 구현
- Lombok 적용 : 도메인의 getter 메소드를 `@Getter`로 대체

<br>

## 2. 고민

### Entity를 Bean으로 설정하지 않는 이유

- Entity는 Spring 컨테이너에서 공유해서 쓰는 객체가 아니라, 매 요청마다 생성되고 영속성 컨텍스트에서 관리되는 데이터 객체이기 때문

### "`File*Repository` 구현체를 `Repository` 인터페이스의 Bean으로 등록하세요."의 의미

- 구현체를 Bean으로 등록하되, 의존성 주입은 인터페이스 타입으로 이루어지게 하라.
- "`File*Repository` 구현체를 Spring Bean으로 등록하고, `*Repository` 인터페이스 타입으로 주입 가능하게 구성하세요."
- 사용과 주입은 인터페이스로 하라는 의미

### `@RequiredArgsConstructor`

- Lombok이 제공하는 애너테이션으로, `final` 필드나 `@NonNull` 필드에 대한 생성자를 자동 생성해준다.
- 즉, 생성자 주입(Constructor Injection)을 가장 깔끔하게 처리할 수 있다.

<br>

## 3. 문제

### 계속 빈 데이터가 출력됨

- `FileObjectStore`를 `@Component`로 설정할 시 Bean이 만들어지면, `loadData`가 되지 않아서, 인스턴스에 기존에 저장된 데이터가 없음
- 해결 방안: Bean을 만들 때, `loadData`가 된 인스턴스를 만들어야 함. ➡️ `config` 클래스로 Bean 등록

---

# 프로젝트 요구사항

## 2. 기본 요구사항

### 2-1. Spring 프로젝트 초기화

- [x] Spring Initializr를 통해 zip 파일을 다운로드하세요.
  - [x] 빌드 시스템은 Gradle - Groovy를 사용합니다.
  - [x] 언어는 Java 17를 사용합니다.
  - [x] Spring Boot의 버전은 `3.4.0`입니다.
  - [x] GroupId는 `com.sprint.mission`입니다.
  - [x] ArtifactId와 Name은 `discodeit`입니다.
  - [x] packaging 형식은 `Jar`입니다
  - [x] Dependency를 추가합니다.
    - [x] Lombok
    - [x] Spring Web
- [x] zip 파일을 압축해제하고 원래 진행 중이던 프로젝트에 붙여넣기하세요. 일부 파일은 덮어쓰기할 수 있습니다.
- [x] `application.properties` 파일을 `yaml` 형식으로 변경하세요.
- [x] `DiscodeitApplication`의 main 메서드를 실행하고 로그를 확인해보세요.

<br>

### 2-2. Bean 선언 및 테스트

- [x] `File*Repository` 구현체를 `Repository` 인터페이스의 Bean으로 등록하세요.
- [x] `Basic*Service` 구현체를 `Service` 인터페이스의 Bean으로 등록하세요.
- [x] `JavaApplication`에서 테스트했던 코드를 `DiscodeitApplication`에서 테스트해보세요.
  - [x] `JavaApplication`의 `main` 메소드를 제외한 모든 메소드를 `DiscodeitApplication`클래스로 복사하세요.
  - [x] `JavaApplication`의 `main` 메소드에서 Service를 초기화하는 코드를 Spring Context를 활용하여 대체하세요.
    - [x] `JavaApplication`의 `main` 메소드의 셋업, 테스트 부분의 코드를 `DiscodeitApplication`클래스로 복사하세요.

<br>

### 2-3. Spring 핵심 개념 이해하기

- [x] `JavaApplication`과 `DiscodeitApplication`에서 Service를 초기화하는 방식의 차이에 대해 다음의 키워드를 중심으로 정리해보세요.
  - IoC Container
  - Dependency Injection
  - Bean
  - 해당 내용은 PR에 첨부
    - `JavaApplication`에서는 `new` 키워드를 통해 `*Service` 객체를 생성했습니다.
    - `DiscodeitApplication`에서는 `*Service`에서 `@Service` 애너테이션을 붙여 서비스 생성을 IoC Container가 맡습니다.
    - Spring Boot 실행 시, `@Service` 애너테이션이 붙인 서비스가 Bean으로 생성되고, 이것을 Spring 컨테이너가 관리한다.
    - 서비스 사용 시, `@Service` 애너테이션으로 인해, 의존성을 주입(DI)해 생성자를 자동 생성한다.

### 2-4. Lombok 적용

- [x] 도메인 모델의 getter 메소드를 `@Getter`로 대체해보세요.
- [x] `Basic*Service`의 생성자를 `@RequiredArgsConstructor`로 대체해보세요.

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint3](https://github.com/JungH200000/10-sprint-mission/tree/sprint3)
