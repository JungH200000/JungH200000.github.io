# 글 상세 페이지 4단계 문서

4단계는 게시글 166개의 호환성을 조사하고, 공개 글에 `single-editorial`을 적용한 뒤 GitHub Pages와 실제 화면에서 검증한 작업이다.

## 먼저 볼 문서

| 순서 | 문서 | 용도 |
| ---: | --- | --- |
| 1 | [조사 계획](audit-plan.md) | 무엇을 어떤 기준으로 분석했는지 확인 |
| 2 | [조사 결과](audit-result.md) | 166개 분포와 위험 유형, 최종 처리 결과 확인 |
| 3 | [통합 구현 결과](implementation.md) | 🟢·🟡·🔴 배치의 변경과 최종 검증 확인 |
| 4 | [글별 현황 CSV](data/post-inventory.csv) | 게시글 하나씩 판정·상태 확인 |
| 5 | [검증 대상 JSON](data/validation-targets.json) | 자동 검사 범위와 제외 목록 확인 |

배치별로 작성했던 네 개의 구현 문서는 [통합 구현 결과](implementation.md)로 합쳤다. 중간 배포 수치와 실패 원인은 필요한 범위만 시간순으로 남기고, 현재 상태는 최종 검증 결과를 기준으로 정리했다.

## 최종 상태

- 전체 게시글: 166개
- 공개 전환·Pages 검증: 158개
- 공개·전환 대상 제외: 8개
- `single-editorial` 명시: 166개
- Pages 자동 검사: 158/158, 실패·경고 0개
- 본문 이미지 검사: 164/164, 실패 0개
- `_config.yml` 변경: 없음

자동 검사는 저장소 루트에서 다음 명령으로 다시 실행할 수 있다.

```powershell
node scripts/validate-post-detail-stage4.mjs --scope=all
```

스크립트는 [validation-targets.json](data/validation-targets.json)을 읽고 결과를 `output/post-detail-stage4-live-validation.json`에 기록한다.
