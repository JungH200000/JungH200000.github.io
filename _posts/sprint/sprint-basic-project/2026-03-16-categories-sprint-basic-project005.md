---
title: '[Sprint 백엔드 초급 프로젝트 5일차] 지수 데이터 수정/삭제 로직 구현'
excerpt: ''

categories:
  - Sprint 백엔드 초급 프로젝트
tags:
  - [Codeit Sprint, Codeit Sprint 백엔드 초급 프로젝트]

permalink: /categories/codeit-sprint/sprint-basic-project/sprint-basic-project005

toc: true
toc_sticky: true

date: 2026-03-16
last_modified_at: 2026-03-16
---

# 지수 데이터 수정/삭제 로직 구현

오늘은 회의할 부분이 크게 없어 현재 진행 상황을 공유하고, 올라온 PR을 리뷰하기로 한 후, 각자 맡은 API를 구현하기로 결정했다.

리뷰할 PR은 지수 데이터 연동 PR, 지수 성과 랭킹 조회 PR이다.

지수 성과 랭킹 조회 PR에서는 `IndexPerformanceDto`를 만드는 `IndexPerformanceMapper`에서 `IndexInfo` entity를 참조하는데 repository에서는 fetch join을 하지 않아서 N+1 문제가 발생할 가능성을 comment했다.

지수 데이터 연동 PR에서는 외부 금융 Open API 응답 중에 `hasNext` 같이 다음 데이터 존재 여부를 확인하는 필드가 있다면 추가하는 것이 좋겠다고 의견을 제안했지만, 아쉽게도 그런 필드는 존재하지 않아 받아들여지지 않았다.

이번에 내가 구현할 부분은 **지수 데이터 수정** 기능이다. 지수(`indexInfoId`)와 날짜(`baseDate`)를 제외하면 모든 속성을 수정할 수 있게 구현해야 한다. 다만, `@Setter`로 설정하면 전체 필드를 수정할 수 있기 때문에 특정 필드만 수정할 수 있는 로직이 있어야 한다. 나는 개별적으로 `setter`를 두는 것이 아닌 수정 가능한 속성들을 모아둔 하나의 메서드로 구현할 생각이다.

Service 계층에서는 수정 요청 DTO에 들어있는 값들이 전부 `null`인지, 이전 값과 전부 동일한지 비교하는 로직을 작성했다. 처음에는 요청값을 그대로 반영하도록 구현했는데, 이 경우 실제로 변경되지 않은 필드도 함께 update되는 문제가 있었다. 이 문제를 해결하기 위해 요청값이 기존 값과 같으면 `null`을 반환하고, 다르면 요청값을 반영하는 로직으로 해결했다. 그 후에 전부 null인지 검사하는 메서드를 추가해 전부 입력되지 않았거나 전부 현재 값과 동일한지 검증했다.

구현하다보니 RequestDto에 정의되지 않은 JSON 필드가 들어올 경우도 검증할 방법이 필요하다는 것을 발견했다. 이 방법은 간단하다. **Jackson의 unknown field 실패 옵션**을 활성화하면 된다.

```yaml
spring:
  jackson:
    deserialization:
      fail-on-unknown-properties: true
```

이제 정의되지 않은 필드가 들어오면 역직렬화 단계에서 예외 메시지를 던져줄 것이다.

꽤 빠르게 지수 데이터 수정 로직 구현이 완료되고, PR 리뷰도 끝났다.

다음으로 **지수 데이터 삭제 로직**을 구현해볼 차례다. 이건 단순했다. Controller에서 지수 데이터 ID(`id`)를 받고, Service에서 지수 데이터 존재여부를 검증한 다음, `delete`하면 된다.

- **참고** : `BigDecimal`의 경우 `new BigDecimal(1.0).equals(new BigDecimal(1.00))`이 `False`기 때문에 `equals`보다 `a.compareTo(b) == 0`으로 비교하는 게 좋다.
- **참고** : `ifPresent(...)` 메서드는 `Optional` 객체에 값이 존재할 때, `(...)` 로직을 실행하는 조건부 액션 메서드

---

# GitHub Repository 주소

[https://github.com/sb10-team3/sb10-Findex-team3](https://github.com/sb10-team3/sb10-Findex-team3)
