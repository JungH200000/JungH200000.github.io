---
title: '[TIL 58일 차] Sprint Mission7 - 테스트 커버리지 관리'
excerpt: '3-3.테스트 커버리지 관리'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til058

toc: true
toc_sticky: true

date: 2026-04-05
last_modified_at: 2026-04-05
---

# 오늘의 성취

## 1. 개발 진행 상황

- 테스트 커버리지 관리
  - JaCoCo 플러그인을 추가 후 테스트 실행
  - 테스트 실행 후 생성된 report 분석
    - report 경로 : `build/reports/jacoco` 내에서 확인 가능
  - `BasicUserService` 테스트 커버리지 98% 달성
  - `BasicChannelService` 테스트 커버리지 99% 달성
  - `BasicMessageService` 테스트 커버리지 85% 달성

## 2. 질문

### 코드 커버리지(Code Coverage)란?

테스트 코드가 실제 애플리케이션 코드를 얼마나 실행했는지 수치로 보여주는 지표

즉, "내가 작성한 테스트가 전체 코드 중 어디까지 검증했는가?"를 퍼센트로 나타냄

보통 아래의 경우를 확인할 때 사용

- 테스트가 어느 정도 범위까지 코드를 실행했는지
- 테스트하지 않은 사각지대가 어디인지

#### JaCoCo

Java 코드 커버리지를 측정하는 라이브러리

- Line Coverage
  - 테스트 중 실행된 코드 줄 수 비율
- Branch Coverage
  - `if`, `else`, `switch` 같은 분기문이 얼마나 다양하게 테스트됐는지 보는 지표
  - 즉, "코드를 실행했는가?"보다는 "조건의 여러 경우를 다 테스트했는가?"를 보는 것
- Method Coverage
  - 메서드가 테스트 중 한 번이라도 호출됐는지 보는 지표
- class Coverage
  - 클래스 단위로 테스트가 닿았는지 보는 지표

---

# 프로젝트 요구 사항

`//...`

## 3. 심화 요구사항

`//...`

### 3-3. 테스트 커버리지 관리

- [x] JaCoCo 플러그인을 추가하세요.

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

- [x] 테스트 실행 후 생성된 리포트를 분석해보세요.
  - 리포트는 `build/reports/jacoco` 경로에서 확인할 수 있습니다.
- [x] `com.sprint.mission.discodeit.service.basic` 패키지에 대해서 **60%** 이상의 코드 커버리지를 달성하세요.
  - `BasicUserService` 테스트 커버리지 98% 달성
  - `BasicChannelService` 테스트 커버리지 99% 달성
  - `BasicMessageService` 테스트 커버리지 85% 달성

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint7](https://github.com/JungH200000/10-sprint-mission/tree/sprint7)
