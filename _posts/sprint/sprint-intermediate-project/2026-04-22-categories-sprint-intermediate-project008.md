---
title: '[Sprint 백엔드 중급 프로젝트 8일차] 무한 스크롤 트러블슈팅과 GitHub Actions 기반 Codecov 파이프라인 구축'
excerpt: ''

categories:
  - Sprint 백엔드 중급 프로젝트
tags:
  - [Codeit Sprint, Codeit Sprint 백엔드 중급 프로젝트]

permalink: /categories/codeit-sprint/sprint-intermediate-project/sprint-intermediate-project008

toc: true
toc_sticky: true

date: 2026-04-22
last_modified_at: 2026-04-22
---

# 무한 스크롤 트러블슈팅

오늘 내가 진행한 작업은 두 가지였다.

- 뉴스 기사 목록 무한 스크롤 페이지네이션 문제 해결
- GitHub Actions 기반 Codecov 파이프라인 구축

<br>

## 뉴스 기사 목록 무한 스크롤 페이지네이션 문제 해결

### 1. 시작: 첫 페이지는 보이는데, 다음 페이지가 안 보임

뉴스 기사 목록 조회는 커서 페이지네이션으로 다음 페이지를 연이어 조회할 수 있어야 한다.

상황은 아래와 같았다.

- 첫 페이지는 정상 조회
- 스크롤을 끝까지 내리면 다음 페이지가 조회되지 않음
- 로그를 확인해보면 프론트엔드는 `cursor`를 보내지만, 보조 커서 역할을 하는 `after`는 보내지 않고 있음

원래 API 문서에서 `cursor` + `after` 조합을 이용하기 때문에 아래의 검증 로직을 작성했었다.

```java
if ((request.getCursor() == null) != (request.getAfter() == null)) {
  throw new InvalidParameterException("cursor", request.getCursor(), "after", request.getAfter());
}

```

제대로 동작했으면 의도는 맞았을 것이다.

하지만 프론트엔드는 이렇게 동작하지 않고, 첫 요청 이후, 다음 요청부터는 `cursor`만 오고 `after`는 `null`이 온다. 결국 Controller 검증에서 예외가 발생했다.

<br>

### 2. 1차 문제 해결: Controller 검증 제거

이번 프로젝트에서 사용한 프론트엔드 코드는 부트캠프에서 제공된 코드였기 때문에, 프론트엔드 코드를 바로 수정하기 어려웠다. 그래서 백엔드에서 프론트엔드 요청에 맞춰 가기로 결정했다. 가장 먼저 Controller에서 `cursor`와 `after`를 동시에 검증하는 로직을 제거했다.

이렇게 하면 `cursor`만 들어오던 요청이 Controller 단계에서 막히지 않는다. 프론트엔드 테스트 결과, 다음 페이지 요청이 잘 들어왔다.

하지만 Repository의 커서 조건이 `cursor`와 `after` 모두 있어야만 만들어지는 구조였다. Controller만 지웠다고 해서 커서 페이지네이션이 올바르게 동작하지 않았다. 커서 조건이 통째로 빠지면서 첫 페이지와 동일한 페이지가 계속해서 출력되는 것이었다. 또 다른 경우에는 `after`를 그대로 비교하여 `NullPounterException`이 발생할 위험도 있었다.

<br>

### 3. 해결했다고 생각했지만 데이터가 누락된다.

다음으로 생각한 방법은 `after`가 없으면 1차 정렬값만 비교하자는 거였다. 예를 들어 `publishDate DESC` 정렬이라면 다음 페이지를 가져올 때 단순히 `publishDate < cursor`만 사용하는 것이다.

괜찮아 보였다. 다음 페이지도 잘 조회되는 것처럼 보였다.

하지만 같은 정렬값이 많이 몰려있는 경우 일부 데이터가 누락될 수 있다는 문제가 생겼다. 예를 들어 같은 `publishDate`를 가진 뉴스가 한 페이지 `llimit`보다 많이 몰려있다면 `publishDate`만 비교하는 방식으로는 경계 구간을 명확하게 가져올 수 없다. 이 문제는 `commentCount`와 `viewCount` 정렬에서도 동일하게 적용된다. 결국, 보조 커서 없이 1차 정렬값만 비교하는 것은 임시 대응일 뿐, 페이지네이션이 제대로 동작하기 위한 해결책은 아니었다.

<br>

### 4. 최종 해결: `nextCursor` 하나에 모든 필요한 값을 담아 복합 `cursor`로 만든다.

페이지네이션 구조 자체를 변경했다.

프론트엔드에서 `cursor` 하나만 보내고 있고, 백엔드에서 보내는 `nextCursor`를 프론트엔드에서 변경없이 그대로 `cursor`로 요청을 보내고 있어서 백엔드에서 `nextCursor`를 보낼 때 페이지네이션에 필요한 모든 정보를 담아버리면 된다.

즉, 프론트엔드는 여전히 `cursor` 하나만 보낸다.

- 백엔드는 그 문자열 안에 정렬값, `createdAt`, `articleId`를 함께 넣는다.
- 다음 요청이 오면 백엔드는 그 문자열을 분해하여 정확한 비교 조건을 복원한다.

정렬 기준별 복합 커서 형식은 아래와 같다.

- `publishDate` 정렬: `publishDate|createdAt|articleId`
- `commentCount` 정렬: `commentCount|createdAt|articleId`
- `viewCount` 정렬: `viewCount|createdAt|articleId`

이제 백엔드는 이 값을 파싱해 정렬값이 같은 경우에도 `createdAt`이나 `id`를 이용해 안정적으로 뉴스 기사 목록 순서를 누락 없이 출력할 수 있다.

---

# GitHub Actions 기반 Codecov 파이프라인 구축

오늘의 두 번째 작업은 GitHub Actions 기반 Codecov 파이프라인 구축이었다.

팀 프로젝트에서는 아무래도 여러 명이서 작업하기 때문에 PR이나 dev branch를 기준으로 테스트 결과와 커버리지를 지속적으로 확인할 수 있는 구조가 중요할 것이다.

아래의 시점에 Workflow가 실행되도록 구현했다.

- `dev` branch를 대상으로 하는 `pull-request`
- `dev` branch에 대한 `push`

```yml
name: Codecov를 이용한 테스트 커버리지 뱃지 추가 Workflow # Workflow 이름 (Github Actions 탭에 표시되는 이름)

on: # Workflow 실행 조건(트리거 이벤트) 정의
  pull_request: # PR 생성 이벤트 발생 시 실행
    branches: ['dev'] # dev branch를 대상으로 하는 PR일 때만 실행
  push: # push 이벤트 발생 시 실행
    branches: ['dev'] # dev branch에서 push(merge 포함)될 때만 실행

permissions: # Workflow에 권한 부여
  contents: read # repo 코드를 checkout 후 read만 할 수 있는 최소 권한 부여

jobs: # 실행할 작업(job)들을 정의
  # Codecov로 테스트 커버리지 report 업로드
  codecov: # "codecov"라는 이름의 job
    runs-on: ubuntu-latest # 실행 환경 설졍(job이 이 환경에서 실행됨)

    steps: # job 안에시 실행될 단계
      # 1) 현재 repo에서 code를 checkout(가져옴)
      - name: Checkout
        uses: actions/checkout@v6

      # 2) JDK 설정
      - name: JDK 설정
        uses: actions/setup-java@v5
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: gradle # Gradle 의존성과 wrapper 캐시를 재사용해 build 및 테스트 속도를 높이는 설정

      # 3) 실행 권한 부여
      - name: 실행 권한 부여
        run: chmod +x gradlew

      # 4) test 실행 및 JaCoCo report 생성
      - name: test 실행 및 JaCoCo report 생성
        env:
          NAVER_CLIENT_ID: ${{ secrets.NAVER_CLIENT_ID }}
          NAVER_CLIENT_SECRET: ${{ secrets.NAVER_CLIENT_SECRET }}
        run: ./gradlew clean test jacocoTestReport

      # 5) Codecov로 JaCoCo report 파일 업로드
      - name: Codecov로 테스트 커버리지 report 업로드
        uses: codecov/codecov-action@v5
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: build/reports/jacoco/test/jacocoTestReport.xml # 지정 파일만 업로드
```

---

# 팀 Notion 주소

[[SB10-5팀] Sprint Spring 백엔드 중급 팀 프로젝트](https://www.notion.so/jungh20000/SB10-Monew-Team05-342f59816c0280948b6ac9c8f80492eb?source=copy_link)

---

# GitHub Repository 주소

[https://github.com/SB10-Part03-Team05/sb10-monew-team05](https://github.com/SB10-Part03-Team05/sb10-monew-team05)
