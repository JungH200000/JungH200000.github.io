# 블로그 디자인 문서

## 비교 자료

- [블로그 사이트 디자인 비교](overview/blog-design-comparison.md)
- [블로그 글 스타일·형식 비교](overview/blog-content-style-comparison.md)

## 적용 설계와 우선순위

| 우선순위 | 문서 | 상태 |
| --- | --- | --- |
| 상세 안내 | [글 상세 페이지 문서](post-detail/README.md) | 설계와 1~4단계 문서 탐색 |
| 계획 | [글 상세 페이지 편집형 리디자인 계획](post-detail/redesign-plan.md) | **1~4단계 완료** |
| 1단계 | [글 상세 페이지 1단계 구현 결과](post-detail/stages/stage1/implementation.md) | 전용 레이아웃·상단 정렬·읽기 시간 제거 완료 |
| 2단계 | [글 상세 페이지 2단계 구현 결과](post-detail/stages/stage2/implementation.md) | 본문 콘텐츠 스타일과 반응형 검증 완료 |
| 3단계 | [글 상세 페이지 3단계 구현 결과](post-detail/stages/stage3/implementation.md) | 공통 기능·검색·댓글·하단 영역 검증 완료 |
| 4단계 | [글 상세 페이지 4단계 패키지](post-detail/stages/stage4/README.md) | 전체 166개 처리 완료, 공개 글 158개 검증 통과 |
| 4단계 결과 | [글 상세 페이지 4단계 통합 구현 결과](post-detail/stages/stage4/implementation.md) | 배치별 변경과 최종 검증을 한 문서로 통합 |
| 4단계 데이터 | [글 상세 페이지 4단계 글별 현황 CSV](post-detail/stages/stage4/data/post-inventory.csv) | 166개 글의 구조·판정·최종 상태 |
| 보류 | [홈·아카이브 정보 배치안](home-archive/blog-home-archive-layout-plan.md) | 글 상세 안정화 이후 재검토 |

현재 Jekyll·Minimal Mistakes 구조를 유지한 채 글 상세 페이지 1~4단계를 완료했다. 공개 전환 글 158개는 Pages 자동 검사와 유형별 화면 검토를 통과했고, 본문 이미지 164회 참조도 모두 정상이다. 비공개 글 8개는 전환 대상에서 제외했다. posts 기본 layout 정리와 홈·아카이브 변경은 별도 작업으로 보류한다.

## 디렉터리 기준

```text
docs/
├─ README.md                 # 전체 문서 탐색과 현재 우선순위
├─ overview/                 # 프로젝트·레퍼런스의 전체 비교 자료
├─ home-archive/             # 홈·아카이브 화면의 계획과 구현 기록
└─ post-detail/              # 글 상세 화면의 계획·단계별 패키지·검증 데이터
```

새 문서는 영향을 주는 화면의 폴더에 추가한다. 여러 화면에 공통으로 적용되는 비교·원칙 문서만 `overview/`에 둔다. 한 단계에 계획·결과·데이터가 함께 생기면 `post-detail/stages/stageN/`처럼 단계별 패키지로 묶고 `README.md`에서 탐색 경로를 제공한다.
