# 글 상세 페이지 문서

글 상세 페이지 리디자인의 설계와 단계별 구현·검증 기록을 모은다.

## 문서 안내

| 문서 | 내용 | 상태 |
| --- | --- | --- |
| [리디자인 계획](redesign-plan.md) | 목표 구조, 디자인 원칙, 단계별 적용 순서 | 1~4단계 완료 |
| [1단계 구현 결과](stages/stage1/implementation.md) | 전용 레이아웃, 상단·본문 정렬, 읽기 시간 제거 | 완료 |
| [2단계 구현 결과](stages/stage2/implementation.md) | 이미지·코드·표 등 본문 콘텐츠 스타일 | 완료 |
| [3단계 구현 결과](stages/stage3/implementation.md) | 검색·댓글·관련 글·이전·다음 글 등 공통 기능 | 완료 |
| [4단계 패키지](stages/stage4/README.md) | 전체 글 조사, 점진적 전환, 최종 검증과 데이터 | 완료 |

## 디렉터리 구조

```text
post-detail/
├─ README.md
├─ redesign-plan.md
└─ stages/
   ├─ stage1/
   │  └─ implementation.md
   ├─ stage2/
   │  └─ implementation.md
   ├─ stage3/
   │  └─ implementation.md
   └─ stage4/
      ├─ README.md
      ├─ audit-plan.md
      ├─ audit-result.md
      ├─ implementation.md
      └─ data/
         ├─ post-inventory.csv
         └─ validation-targets.json
```

1~3단계는 단계별 결과가 한 문서이므로 각각 작은 패키지로 둔다. 4단계는 전체 조사와 여러 배치, 검증 데이터가 함께 있어 계획·조사 결과·통합 구현 결과·데이터를 분리했다.

