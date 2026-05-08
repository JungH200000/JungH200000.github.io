---
title: '[Sprint 백엔드 중급 프로젝트 4일차] 뉴스 기사 출처 목록과 뉴스 기사 목록 조회 구현'
excerpt: ''

categories:
  - Sprint 백엔드 중급 프로젝트
tags:
  - [Codeit Sprint, Codeit Sprint 백엔드 중급 프로젝트]

permalink: /categories/codeit-sprint/sprint-intermediate-project/sprint-intermediate-project004

toc: true
toc_sticky: true

date: 2026-04-17
last_modified_at: 2026-04-17
---

# 뉴스 기사 출처 목록과 뉴스 기사 목록 조회 구현

어제 뉴스 기사 단건 조회를 마무리한 후, 오늘 뉴스 기사 출처 목록 조회 로직을 완료했고 뉴스 기사 목록 조회 로직을 구현하기 시작했다. 뉴스 기사 조회 관련 로직이 추가되면서 단순히 조회 기능 추가뿐만 아니라 입력값 처리 방식과 예외 처리 기준도 같이 구현했다.

<br>

## 뉴스 기사 출처 목록 조회 로직 구현

어제 수행했던 작업을 이어나가 Repository 로직 구현과 테스트 케이스 작성을 오전 11시를 기준으로 완료했다.

처음에는 중복 없이 뉴스 기사 출처만 가져오면 될 것이라고 생각했지만, 이렇게 되면 특정 출처의 뉴스 기사가 전부 논리 삭제되었을 경우에도 해당 출처가 출력되는 문제가 발생하기 때문에 `deletedAt IS NULL` 조건을 추가하여 삭제되지 않은 기사만을 기준으로 뉴스 기사 출처 목록을 조회하게 수정했다. 또한 JPQL에서는 모든 속성에 Entity 별칭을 넣는 쪽이 파싱 단계에서 안전하다고 보고, 별칭을 포함한 형태로 수정했다.

<br>

## 뉴스 기사 목록 조회 로직 구현 시작

출처 목록 조회를 구현한 뒤 뉴스 기사 목록 조회 로직 구현에 들어갔다.

현재 진행 중인 상태고, 오늘의 범위는 다음과 같다.

- Controller 로직 구현
- 커서 페이지네이션 응답 DTO 구현
- Service 로직에서 커서 페이지네이션 방식으로 정리

<br>

## `sourceIn`과 `orderBy`를 enum으로 다루는 방식

목록 조회를 구현하면서 생각보다 오래 본 부분 중 하나는 `sourceIn`과 `orderBy`를 어떤 타입으로 받을 것인지 였다.

`sourceIn`은 API 문서에 명시된 `NAVER`, `HANKYUNG`처럼 enum 상수명과 그대로 일치한다. 그래서 `List<ArticleSource>`로 받아도 Spring이 자연스럽게 바인딩해준다. 반면에 `orderBy`는 API 문서에 명시된 `publishDate`, `commentCount`, `viewCount`처럼 lowCamelCase 형태라서, enum 이름을 일반적으로 쓰는 방식처럼 `PUBLISH_DATE`, `COMMENT_COUNT`, `VIEW_COUNT`로 만들면 기본 바인딩만으로 바로 맞지 않는다. 그래서 API 문서 값과 enum 이름을 그대로 맞춘 `publishDate`, `commentCount`, `viewCount` 형태가 구현하기 단순하다고 판단했다.

이 부분은 구현 전에는 enum 내부에 별도의 값을 두면 자동으로 바인딩되는 것으로 알았는데, 실제로는 Spring이 enum의 상수 이름 자체를 기준으로 변환한다는 점을 확인했다.

<br>

## 입력 오류 나눠 처리

입력 오류를 크게 두 가지로 나눠 구현했다. 예를 들어 `orderBy`에 잘못된 enum 값이 들어오는 경우 `MethodArgumentTypeMismatchException`이, 필수 파라미터가 누락된 경우 `MissingServletRequestParameterException`이, 필수 헤더가 없는 경우 `MissingRequestHeaderException`이 예외로 떨어진다. 이런 경우 `GlobalExceptionHandler`에서 400 Bad Request 응답으로 처리하도록 로직을 구현했다.

다른 하나는 타입 변환은 성공했지만 비즈니스적으로 허용되지 않는 입력값의 경우이다. 예를 들어 검색어가 공백인 경우, `publishDateFrom`이 `publishDateTo`보다 늦은 경우, `limit`이 1미만인 경우 Controller 로직에서 직접 검증하고 커스텀 예외인 `InvalidParameterException`을 던지도록 했다.

<br>

## Validation 예외 처리 수정

예외 처리 쪽을 보다가 `MethodArgumentNotValidException` 처리 로직도 수정했다. 기존에는 `getAllErrors()` 결과가 필드 레벨 에러의 `FieldError`뿐만 아니라 클래스 레벨의 `GlobalError`도 포함하기 때문에 `FieldError`로 강제 캐스팅하는 방식이 문제가 될 수 있었다. 그래서 잘못하면 `ClassCastException`이 발생할 수 있다. 이 부분은 `getFieldErrors()`와 `getGlobalErrors()`를 분리해서 처리하도록 수정했다.

---

# 팀 Notion 주소

[[SB10-5팀] Sprint Spring 백엔드 중급 팀 프로젝트](https://www.notion.so/jungh20000/SB10-Monew-Team05-342f59816c0280948b6ac9c8f80492eb?source=copy_link)

---

# GitHub Repository 주소

[https://github.com/SB10-Part03-Team05/sb10-monew-team05](https://github.com/SB10-Part03-Team05/sb10-monew-team05)
