---
title: '[TIL 31~32일 차] Sprint Mission5 - 구현한 API를 API 스펙에 맞춰 RESTful API로 다시 설계'
excerpt: 'UserController와 AuthController 수정'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til031~32/

toc: true
toc_sticky: true

date: 2026-02-15
last_modified_at: 2026-02-16
---

# 오늘의 학습

## 1. 개발 진행 상황

- Spring Mission4에서 구현한 API를 API 스펙에 맞춰 RESTful API로 다시 설계
  - `UserService`와 `UserController`에서 "사용자 생성", "사용자 정보 수정", "모든 사용자 조회", "사용자 삭제" 기능 API 수정
    - 이미지 첨부를 위해 `create`와 `update`의 `Content-Type`이 `MULTIPART_FORM_DATA_VALUE`로 변경
    - `@Tag`로 핸들러 클래스 설명 추가
    - `@Operation`으로 핸들러 메서드 설명 추가
    - `@ApiResponse`로 성공/예외 코드 및 설명 추가
    - `@Parameter`로 request 설명 추가
  - `AuthController`에서 "사용자 로그인" 기능 API 수정
    - `@Tag`로 핸들러 클래스 설명 추가
    - `@Operation`으로 핸들러 메서드 설명 추가
    - `@ApiResponse`로 성공/예외 코드 및 설명 추가

---

# 프로젝트 요구 사항

`// ...`

## 3. 기본 요구사항

- [진행 중] 스프린트 미션#4에서 구현한 API를 RESTful API로 다시 설계해보세요.
  - [API 스펙](https://github.com/JungH200000/JungH200000.github.io/blob/categories-ver2/assets/images/posts_img/requirements/sprint5/api-docs.json)을 확인하고 본인이 설계한 API와 비교해보세요.
  - [oasdiff](https://www.oasdiff.com/diff-calculator)를 활용하면 좀 더 수월하게 비교할 수 있어요.
  - API 설계에 정답은 없지만, 이어지는 요구사항과 미션을 원활히 수행하기 위해 제공된 API 스펙에 맞추어 구현해주세요.
  - 특히, 심화 요구사항에서 제공되는 프론트엔드 코드는 제공된 API 스펙을 준수해야 연동할 수 있습니다.
- [진행 중] Postman을 활용해 컨트롤러를 테스트 하세요.
  - Postman API 테스트 결과를 export하여 PR에 첨부해주세요.

`// ...`

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint5](https://github.com/JungH200000/10-sprint-mission/tree/sprint5)
