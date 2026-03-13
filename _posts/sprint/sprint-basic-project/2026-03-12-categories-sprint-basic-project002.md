---
title: '[Sprint 백엔드 초급 프로젝트 2일차] 요구사항 정의와 Todo 생성까지'
excerpt: ''

categories:
  - Sprint 백엔드 초급 프로젝트
tags:
  - [Codeit Sprint, Codeit Sprint 백엔드 초급 프로젝트]

permalink: /categories/codeit-sprint/sprint-basic-project/sprint-basic-project002

toc: true
toc_sticky: true

date: 2026-03-12
last_modified_at: 2026-03-12
---

# 요구사항 정의와 Todo 생성까지

오늘 회의에서는 지수 데이터 관리 역할 분담, 요구사항 정의서 작성, ERD 작성, Branch 규칙 등을 정리했다.

이번 회의에서는 의견이 갈리기보다 필요한 기준들이 빠르게 맞춰졌다.

지수 데이터 관리는 범위가 넓어 두 사람이 맡아서 하기 결정했고, 기본적인 데이터 CRUD와 대시보드 기능으로 분리하기로 했다. 협업 시 충돌 방지를 위해서 `Repository`는 동일 클래스엣니, `Controller`, `Service`는 다른 클래스에서 구현하기로 결정했다

ERD는 어제 분담한 역할에 따라 각자 작성하기로 결정했고, 작성된 ERD와 기능 요구사항을 바탕으로 요구사항 정의서를 작성했다. 가독성을 위해 스프레드시트에서 작성하기로 했다.

또한, 작성한 요구사항 정의서를 바탕으로 GitHub Issues에 Todo를 작성하기로 했다.

이후 만든 ERD를 바탕으로 `schema.sql` DDL 파일을 생성했고, 각자 맡은 도메인의 Entity를 정의하기로 했다. Branch 규칙은 개발 Branch를 `feature/#이슈번호/task` 형식으로 생성하는 방식으로 정리했다.

각자 Entity를 정의하고 PR을 생성했는데, 처음 해보는 PR이라 PR을 Merge한 후에도 잘못된 점이 계속 발견되었다. 대표적으로 아래 같은 문제가 있었다.

**문제1**. `Could not determine recommended JdbcType for Java type 'org.codeiteam3.findex.indexinfo.IndexInfo'`

- Hibernate가 `IndexInfo`를 보고 연관관계 엔티티로 처리하지 못하고 그냥 일반 컬럼처럼 저장하려고 했다는 의미라고 볼 수 있는데, DB를 인식 못하는 문제인건가 싶었는데, 알고보니 필드명을 잘못 적은 문제였다. 그래서 필드명을 `indexInfoId`에서 `indexInfo`로 변경했다.

- 이 오류의 원인은 다음과 같다.
  - 자바에서 `IndexInfo` 객체를 들고, DB에서는 `index_info_id` 컬럼(FK)으로 저장
  - 그런데 필드명을 `indexInfoId`로 지어버리면 코드를 작성하는 입장에서는
  - "UUID 값이니 컬럼으로 다루면 되겠지?"라고 인식해서 잘못 매핑하게 된다.

---

# ERD

<img src="https://raw.githubusercontent.com/JungH200000/JungH200000.github.io/refs/heads/categories-ver2/assets/images/posts_img/basic-project/erd.png" width=900px>

---

# 요구사항 정의서

<img src="https://raw.githubusercontent.com/JungH200000/JungH200000.github.io/refs/heads/categories-ver2/assets/images/posts_img/basic-project/Requirements_Definition_Document.png">

---

# GitHub Repository 주소

[https://github.com/sb10-team3/sb10-Findex-team3](https://github.com/sb10-team3/sb10-Findex-team3)
