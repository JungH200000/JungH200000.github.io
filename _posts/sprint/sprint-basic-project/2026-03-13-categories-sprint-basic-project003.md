---
title: '[Sprint 백엔드 초급 프로젝트 3일차] 지수 데이터 수동 등록 로직 구현'
excerpt: ''

categories:
  - Sprint 백엔드 초급 프로젝트
tags:
  - [Codeit Sprint, Codeit Sprint 백엔드 초급 프로젝트]

permalink: /categories/codeit-sprint/sprint-basic-project/sprint-basic-project003

toc: true
toc_sticky: true

date: 2026-03-13
last_modified_at: 2026-03-13
---

# 지수 데이터 수동 등록 로직 구현

오늘 아침 회의에서 어제 정하지 못한 공통 패키지 구조를 정했다. 공통 기능을 `common` 패키지에, 예외 처리는 `exception` 패키지에, OpenAPI 문서 설정은 `config` 패키지에 두는게 어떻냐고 제안했고, 팀원들이 동의했다. 구현은 혹시 몰라 미리 작성해둔 내가 이어서 맡아 하기로 결정했다.

```
pagination
 ┣ CursorPageResponse.java
 ┗ CursorPageResponseMapper.java

config
 ┗ OpenApiConfig.java

exception
 ┣ ErrorResponse.java
 ┗ GlobalExceptionHandler.java
```

이제 본격적인 개발에 들어간다.

나는 먼저 사용자가 지수 데이터를 직접 등록하는 기능인 지수 데이터 등록 기능을 구현했다.(`POST /api/index-data`)

지수 데이터 등록 기능을 구현하면서 11개의 request 필드가 Request Body에 있는 것을 보고 다시 한 번 놀랐다. 이렇게 많은 필드가 request로 들어가는 것을 처음 봤기 때문이다.

먼저, 지수 데이터 생성 요청 `IndexDataCreateRequest` DTO, 지수 데이터 DTO `IndexDataDto`, `IndexDataDto` Mapper 구현했다.

이후로, `IndexDataController`와 `IndexDataService`, `IndexDataRepository` 파일을 생성하고, Controller에서는 요청을 받고 응답을 보내는 `create` 메서드, Service에서는 지수 데이터 등록 비즈니스 로직을 가진 `create` 메서드, Repository에서는 `indexInfoId`와 `baseDate` 조합으로 동일한 지수 데이터가 존재하는지 확인하는 `existsByIndexInfoIdAndBaseDate` 메서드 구현했다.

코드를 작성하던 중, Error 응답과 OpenAPI 문서 설정이 빠졌다는 것을 알게 되었다. 그래서 내가 담당해서 에러 응답 설정인 `ErrorResponse`, `GlobalExceptionHandler`와 OpenAPI 설정인 `OpenApiConfig`를 작성하기로 했다. 더불어 미처 발견하지 못했던 `SourceType` Enum에서 `Users` 오타를 `User`로 변경했다.

에러 설정 중 Bean Validation을 잡는 `HttpMessageNotReadableException`와 `MethodArgumentNotValidException` 예외를 고려하지 못했다는 것을 테스트 중에 알게 되었고, `GlobalExceptionHandler`에 추가 했다.

<br>

- **문제**: 보안과 관련된 `.DS_Store` 파일이 GitHub 각 폴더마다 생성되었다.
  - `DS_Store`는 macOS 운영체제에서 Finder로 폴더를 볼 때마다 자동으로 생성되는 폴더로, 해당 파일에 대한 색인을 유지하는 작업을 수행한다. 이때 위치한 파일과 주변 폴더에 대한 메타데이터 등이 저장되기 때문에 GitHub에는 노출시키지 않는 것이 좋다.
  - **해결 방법**
    - 먼저, local git bash에서 `find . -name .DS_Store -exec git rm --cached {} \;`를 실행하면 각 파일을 돌면서 `DS_Store`를 삭제한다.
    - 명령어가 완료되고, `git status`를 해보면 아래와 같이 출력된다.

      ```bash
      $ git status
      On branch dev
      Changes to be committed:
        (use "git restore --staged <file>..." to unstage)
              deleted:    .DS_Store

      Changes not staged for commit:
        (use "git add/rm <file>..." to update what will be committed)
        (use "git restore <file>..." to discard changes in working directory)
              deleted:    src/.DS_Store
              deleted:    src/main/.DS_Store
              deleted:    src/main/java/.DS_Store
              deleted:    src/main/java/org/.DS_Store
              deleted:    src/main/java/org/codeiteam3/.DS_Store
      ```

    - 이후 `git add .`와 `git commit -m "remove .DS_Store files"`하고 push 해주면 GitHub 저장소에 파일들이 삭제되어 있을 것이다.

<br>

- **질문**: 가격 관련 필드의 제약조건과 `lowPrice <= highPrice`되고, `lowPrice <= marketPrice <= highPrice`이어야 할 때 비즈니스 검증 로직은 어떻게 구현해야 할까?
  - 0보다 커야 하는 `marketPrice`, `closingPrice`, `highPrice`, `lowPrice`에 `@Positive` 애너테이션을 추가하고,
  - 0 이상이어야 하는 `tradingQuantity`, `tradingPrice`, `marketTotalAmount`에 `@PositiveOrZero` 애너테이션을 추가
  - 비교해야할 필드가 `BigDecimal`이기 때문에 `compareTo` 메서드를 이용해서 비교

    ```java
    BigDecimal lowPrice = request.lowPrice();
    BigDecimal highPrice = request.highPrice();
    BigDecimal marketPrice = request.marketPrice();
    BigDecimal closingPrice = request.closingPrice();

    // `lowPrice` <= `highPrice`
    if (lowPrice.compareTo(highPrice) > 0) {
        throw new IllegalArgumentException("고가(highPrice)는 저가(lowPrice)보다 작을 수 없습니다.");
    }
    // `lowPrice` <= `marketPrice <= `highPrice`
    if ((lowPrice.compareTo(marketPrice) > 0) || (highPrice.compareTo(marketPrice) < 0)) {
        throw new IllegalArgumentException("시가(marketPrice)는 저가(lowPrice)보다 크거나 같고, 고가(highPrice)보다 작거나 같아야 합니다.");
    }
    // `lowPrice` <= `closingPrice <= `highPrice`
    if ((lowPrice.compareTo(closingPrice) > 0) || (highPrice.compareTo(closingPrice) < 0)) {
        throw new IllegalArgumentException("종가(closingPrice)는 저가(lowPrice)보다 크거나 같고, 고가(highPrice)보다 작거나 같아야 합니다.");
    }
    ```

---

# GitHub Repository 주소

[https://github.com/sb10-team3/sb10-Findex-team3](https://github.com/sb10-team3/sb10-Findex-team3)
