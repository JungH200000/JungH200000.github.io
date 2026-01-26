---
title: '[TIL 19일 차] '
excerpt: ''

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til019/

toc: true
toc_sticky: true

date: 2026-01-27
last_modified_at: 2026-01-27
---

# 1. 오늘의 성취

1. 개발 진행 상황
   - 관심사 분리를 통한 레이어 간 의존성 주입
     - 이전에는 `Service`로 의존성을 나타냈다면, 이번에는 `Service`가 아닌 `Repository`로 의존성을 나타냄

2. `JCF*Service`랑 `File*Service`의 공통점과 차이점
   - 공통점
     - 비즈니스 규칙과 검증 로직은 거의 동일
     - 도메인 객체를 생성하고, 수정하는 로직도 거의 동일
   - 차이점
     - `JCF*Service`에서 데이터는 Map을 활용하기 때문에 실행 중 메모리에만 있고, 프로그램이 종료하면 사라진다.
     - `File*Service`에서 데이터는 시작할 때 파일에서 이전 데이터를 로드하여 메모리에 올려 사용하고, 작업한 데이터를 다시 파일에 저장할 수 있다.
     - 즉, 저장 로직에서 차이가 난다.

---

# 2. 프로젝트 요구사항

---

# 3. GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint2](https://github.com/JungH200000/10-sprint-mission/tree/sprint2)
