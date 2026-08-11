---
layout: single-editorial
title: '[Sprint 백엔드 초급 프로젝트 6일차] PR 리뷰 및 테스트 후 QueryDSL기반 지수 데이터 조회 로직 구현'
excerpt: ''

categories:
  - Sprint 백엔드 초급 프로젝트
tags:
  - [Codeit Sprint, Codeit Sprint 백엔드 초급 프로젝트]

permalink: /categories/codeit-sprint/sprint-basic-project/sprint-basic-project006

toc: true
toc_sticky: true

date: 2026-03-17
last_modified_at: 2026-03-17
---

# PR 리뷰 및 테스트 후 QueryDSL기반 지수 데이터 조회 로직 구현

오늘 회의에서 어제 밤부터 오늘 아침까지 진행된 PR을 merge 후, merge된 부분을 프론트엔드에서 테스트를 진행하기로 했다. 테스트 중 발생한 오류를 수정하고, 아직 구현하지 못한 기능은 각자 이어서 작업하기로 결정했다.

이미 맡은 요구사항을 모두 구현한 팀원들은 Railway에 배포를 하여 지속적으로 테스트를 진행하고, 심화 요구사항인 쿼리 고도화를 진행하기로 했다. 기본 기능이 모두 구현되고, 테스트가 전부 통과하면 Github Projects의 간트차트를 정리하고 문서화나 PPT 제작 같은 후속 작업들에 대한 회의를 진행할 예정이다.

PR을 리뷰하는 과정에서 내가 작성한 **지수 데이터 조회 로직의 구조**가 `지수 정보 조회`, `연동 작업 목록 조회`, `자동 지수 연동 설정 조회`에도 비슷하게 활용되고 있다는 점을 발견했다. 이 로직을 구현하는데 2~3일 정도 걸렸는데 괜히 뿌듯한 했다.

조회 관련 로직 PR에서 데이터 조회 시 ID를 이용해 다른 테이블을 `JOIN`하지 않아 원하는 값이 출력이 되지 않는 문제와 PostgreSQL이 `LocalDate` 조건이 들어있는 JPQL에서 `IS NULL` 처리와 관련된 문제가 보여서 전달했다.

테스트 과정에서 두 가지 문제를 발견했다.

첫 번째 문제는 지수 정보나 지수 데이터 수정이 불가능하다는 것이다. 원인을 찾아봤는데, API 문서에 포함되지 않은 `baseDate`가 프론트엔드에서 함께 보내고 있었다. 이번 프로젝트는 프론트엔드와의 연동이 우선이라고 생각해서 호환성을 맞추는 방향으로 대응했다. 이를 위해 기존에 활성화했던 Jackson의 `fail-on-unknown-properties` 옵션을 비활성화했다.

다만, 이 설정을 비활성화하게 되면 정의되지 않은 필드가 들어올 수 있게 되므로, 보완할 필요가 있다고 느꼈다.

두 번째 문제는 지수 성과 랭킹 전체 조회 기능이었다. 전체 조회에서는 1순위만 출력되고, 지수로 단건 조회 시에는 아예 출력되지 않는 문제가 발생했다. 이 부분은 관련 팀원에게 전달해 수정하도록 요청했다.

연동 작업/자동 연동 관련 목록 조회를 구현하지 못한 팀원이 있어서 해당 팀원의 구현 부분만 제외하고 배포한 백엔드 서비스를 테스트 해보기로 했고, 그 결과 현재까지 구현된 기능들은 문제없이 정상 동작되었다.

이제 다른 팀원들이 자잘한 문제를 수정하고, 배포하는 동안 심화 요구사항에 도전해보기로 했다.

심화 요구사항은 Criteria API, Specification, QueryDSL 등을 활용해 복잡한 쿼리의 가독성을 높이는 쿼리 고도화 작업이다. 복잡한 쿼리문에 가독성까지 잡기 위해 QueryDSL로 진행해보기로 했다.

다만 QueryDSL을 진행하던 중 저녁 시간이 다 되어 오늘은 여기까지 마무리하고, 내일 이어서 진행하기로 했다.

---

# 팀 Notion 주소

[[SB10-3팀] Sprint Spring 백엔드 초급 팀 프로젝트](https://www.notion.so/jungh20000/SB10-3-Sprint-Spring-321f59816c02803aafbdf8a3354cfcdf?source=copy_link)

---

# GitHub Repository 주소

[https://github.com/sb10-team3/sb10-Findex-team3](https://github.com/sb10-team3/sb10-Findex-team3)
