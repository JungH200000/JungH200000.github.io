---
title: '[TIL 44일 차] Spring Mission6 - 페이징과 정렬'
excerpt: ''

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til044

toc: true
toc_sticky: true

date: 2026-03-08
last_modified_at: 2026-03-08
---

# 오늘의 학습

1. 개발 진행 상황
   - 특정 채널의 메시지를 출력하는 메서드의 N+1 문제 해결을 위해 `@BatchSize` 애너테이션 추가
   - 페이징과 정렬
     - 최근 50개씩 최근 메시지 순으로 조회
     - 일관된 페이지네이션 응답을 위해 `PageResponse<T>` DTO 구현
     - Slice 또는 Page 객체로부터 DTO를 생성하는 Mapper 구현

2. **batch fetch** (`@BatchSize`)
   - "연관 데이터를 한 번에 미리 join해서 가져오는 방법"이 아니라 LAZY 조회가 필요해지는 순간 여러 개를 묶어서 가져오게 해주는 Hibernate 최적화

3. **페이징**
   - `Pageable pageable` : Spring이 `page`, `size`, `sort`를 조합해 만들어주는 특수 파라미터
     - `GET  /api/messages?channelId=...&page=0&size=50`가 오면 Spring이 내부적으로 `Pageable pageable = PageRequest.of(0, 50, Sort.by(DESC, "createdAt"))`를 만듬

---

# 프로젝트 요구 사항

`// ...`

### 2-8. 페이징과 정렬

- [x] 메시지 목록을 조회할 때 다음의 조건에 따라 페이지네이션 처리를 해보세요.
  - 50개씩 최근 메시지 순으로 조회합니다.
  - 총 메시지가 몇개인지 알 필요는 없습니다.
- [x] 일관된 페이지네이션 응답을 위해 제네릭을 활용해 DTO로 구현하세요.
  - 패키지명: `com.sprint.mission.discodeit.dto.response`
  - 클래스 다이어그램

    <img src="https://bakey-api.codeit.kr/api/files/resource?root=static&seqId=12178&version=1&directory=/wj4q7nhn3-image.png&name=wj4q7nhn3-image.png" width=300px>

  - `content`: 실제 데이터입니다.
  - `number`: 페이지 번호입니다.
  - `size`: 페이지의 크기입니다.
  - `totalElements`: T 데이터의 총 갯수를 의미하며, null일 수 있습니다.

- [x] Slice 또는 Page 객체로부터 DTO를 생성하는 Mapper를 구현하세요.
  - 패키지명: `com.sprint.mission.discodeit.mapper`

    <img src="https://bakey-api.codeit.kr/api/files/resource?root=static&seqId=12178&version=1&directory=/x7qjncxm0-image.png&name=x7qjncxm0-image.png" width=400px>

  - 확장성을 위해 제네릭 메소드로 구현하세요.

---

## 3. 심화 요구사항

### 3-1. N+1 문제

- [x] N+1 문제가 발생하는 쿼리를 찾고 해결해보세요.

<br>

### 3-2. 읽기전용 트랜잭션 활용

- [x] 프로덕션 환경에서는 OSIV를 비활성화하는 경우가 많습니다. 이때 서비스 레이어의 조회 메소드에서 발생할 수 있는 문제를 식별하고, 읽기 전용 트랜잭션을 활용해 문제를 해결해보세요.
  - OSIV 비활성화하기
    ```yaml
    spring:
      jpa:
        open-in-view: false
    ```

`// ...`

### 3-4. MapStruct 적용

- [x] Entity와 DTO를 매핑하는 보일러플레이트 코드를 [MapStruct](https://mapstruct.org/) 라이브러리를 활용해 간소화해보세요.

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint6](https://github.com/JungH200000/10-sprint-mission/tree/sprint6)
