# 글 상세 페이지 4단계 통합 구현 결과

- 작성일: 2026-08-11
- 기준 문서: [4단계 조사 계획](audit-plan.md)
- 조사 결과: [전체 글 호환성 조사 결과](audit-result.md)
- 글별 현황: [post-inventory.csv](data/post-inventory.csv)
- 검증 대상: [validation-targets.json](data/validation-targets.json)
- 현재 상태: **공개 전환 글 158개 배포·화면·이미지 검증 완료 / 8개 전환 대상 제외 / 4단계 최종 완료**

## 1. 최종 결과

전체 게시글 166개를 분석한 뒤 공개 상태와 콘텐츠 위험 요소에 따라 나눠 전환했다. 최종적으로 공개 글 158개가 `single-editorial` 레이아웃과 GitHub Pages 검사를 통과했고, 비공개 초안·Template과 TIL 089 등 8개는 공개·전환 대상에서 제외했다.

| 범위 | 글 수 | 결과 |
| --- | ---: | --- |
| 기존 기준선 | 4 | 이전 단계에서 배포 검증 완료 |
| 🟢 신규 공개 글 | 131 | 일괄 적용·배포 검증 완료 |
| 🟡 1차: 긴 코드·넓은 표 | 5 | 배포·화면 검증 완료 |
| 🟡 2차: 긴 목차 | 5 | 배포·데스크톱·모바일 검증 완료 |
| 🟡 3차: heading 계층 | 9 | 콘텐츠 구조 교정·검증 완료 |
| 🟡 4차: 비표준 이미지 태그 | 2 | 표준 태그 전환·검증 완료 |
| 🔴 공개 permalink 충돌 | 2 | 주소 분리·검증 완료 |
| 공개 전환 합계 | 158 | 자동 검사 158/158 통과 |
| 전환 대상 제외 | 8 | 상태 확정, Pages 검사 제외 |

조사 초기에 🟢 공개 글은 132개였지만 TIL 089는 Pages에 포함되지 않은 작성 중 파일이어서 사용자의 결정에 따라 제외했다. 따라서 최종 🟢 신규 검증 수는 131개다.

## 2. 적용 원칙

- `_config.yml`의 posts 기본 layout은 바꾸지 않고 각 게시글에 `layout: single-editorial`을 명시했다.
- 🟢 글은 한 번에 적용한 뒤 URL 자동 검사로 누락 여부를 확인했다.
- 🟡·🔴 글은 위험 요소가 같은 글끼리 묶고, 필요한 경우에만 heading·이미지 태그·permalink를 수정했다.
- 제목, 날짜, excerpt, 본문 문장은 호환성 문제를 해결하는 데 필요하지 않으면 유지했다.
- 자동 검사는 HTTP 응답, 레이아웃 클래스, 제목·본문, 목차 fragment를 확인하고, 화면 검토는 가로 넘침·스크롤·이미지·모바일 목차를 확인했다.

현재 166개 게시글은 모두 `layout: single-editorial`을 명시한다. 제외한 8개도 나중에 공개할 때 같은 레이아웃을 사용할 수 있지만, 이번 Pages 검증 수에는 포함하지 않았다.

## 3. 🟢 공개 글 일괄 전환

정적 분석에서 새 레이아웃을 막을 요소가 발견되지 않은 공개 글 132개에 layout을 적용했다. 배포 후 신규 글 131개와 기준선 4개가 통과했고, Pages에 존재하지 않았던 TIL 089는 전환 대상에서 제외했다.

이 과정에서 TIL 048의 본문 내부 링크가 실제 heading fragment와 일치하지 않는 문제를 발견해 수정했다. 재배포 후 🟢 신규 131개와 기준선 4개는 실패·경고 없이 통과했다.

## 4. 🟡 1차: 긴 코드·넓은 표 5개

| 글 | 확인한 요소 |
| --- | --- |
| [TIL 005](../../../../_posts/sprint/sprint-til/2026-01-07-categories-sprint-til005.md) | 6열 표, 로컬 이미지 |
| [TIL 025-2](../../../../_posts/sprint/sprint-til/2026-02-06-categories-sprint-til025-2.md) | 1,050자 코드 줄 |
| [TIL 052](../../../../_posts/sprint/sprint-til/2026-03-30-categories-sprint-til052.md) | 191자 코드 줄과 모바일 폭 |
| [TIL 065-2](../../../../_posts/sprint/sprint-til/2026-05-11-categories-sprint-til065-2.md) | 목차 31개와 6열 표 |
| [TIL 073](../../../../_posts/sprint/sprint-til/2026-05-21-categories-sprint-til073.md) | 6열 표와 모바일 본문 폭 |

코드 블록과 표가 페이지 전체를 넓히지 않고 각 요소 안에서 가로 스크롤되는지 확인했다. TIL 005는 trailing slash가 있는 URL에서 `../../../assets/...`가 잘못 해석돼 이미지가 보이지 않았다. 해당 경로를 `relative_url`로 바꾼 뒤 실제 배포 화면에서 이미지 표시를 확인했다. 새로운 `alt`는 추가하지 않았다.

## 5. 🟡 2차: 긴 목차 5개

| 글 | H1~H3 목차 항목 | 함께 확인한 요소 |
| --- | ---: | --- |
| [Monew 개인 개발 리포트](../../../../_posts/sprint/sprint-intermediate-project/2026-05-06-categories-sprint-intermediate-project013.md) | 35 | 코드 19개, 이미지 7개 |
| [TIL 065-1](../../../../_posts/sprint/sprint-til/2026-05-11-categories-sprint-til065-1.md) | 33 | 코드 5개, 이미지 4개, 표 3개 |
| [TIL 077-4](../../../../_posts/sprint/sprint-til/2026-05-27-categories-sprint-til077-4.md) | 32 | 목차 내부 스크롤 시작 구간 |
| [TIL 078-2](../../../../_posts/sprint/sprint-til/2026-05-28-categories-sprint-til078-2.md) | 39 | 긴 본문 이동, 이미지 1개 |
| [TIL 078-3](../../../../_posts/sprint/sprint-til/2026-05-28-categories-sprint-til078-3.md) | 43 | 가장 긴 목차 |

1440×900에서는 왼쪽 목차의 sticky와 내부 스크롤을, 390×844에서는 접힌 목차 카드의 열기와 항목 이동을 확인했다. 다섯 글 모두 H1~H3 수와 목차 링크 수가 일치했고, 누락된 fragment와 페이지 전체 가로 넘침, 콘솔 오류가 없었다.

## 6. 🟡 3차: heading 계층 교정 9개

H1 다음에 H3·H4가 바로 나오던 제목을 문서 의미에 맞게 H2 또는 H3으로 조정했다. 본문 문장, 코드, 이미지와 permalink는 바꾸지 않았다.

| 글 | 교정 내용 |
| --- | --- |
| [TIL 021](../../../../_posts/sprint/sprint-til/2026-01-29-categories-sprint-til021.md) | 프로젝트 요구사항 아래 H4 2개를 H2로 변경 |
| [TIL 022](../../../../_posts/sprint/sprint-til/2026-01-30-categories-sprint-til022.md) | 프로젝트 요구사항 아래 H4 5개를 H2로 변경 |
| [TIL 039-2](../../../../_posts/sprint/sprint-til/2026-03-03-categories-sprint-til039-2.md) | 프로젝트 요구사항 아래 H3 2개를 H2로 변경 |
| [TIL 040](../../../../_posts/sprint/sprint-til/2026-03-04-categories-sprint-til040.md) | 프로젝트 요구사항 아래 H3 2개를 H2로 변경 |
| [TIL 041](../../../../_posts/sprint/sprint-til/2026-03-05-categories-sprint-til041.md) | 프로젝트 요구사항 아래 H3 3개를 H2로 변경 |
| [TIL 042](../../../../_posts/sprint/sprint-til/2026-03-06-categories-sprint-til042.md) | 프로젝트 요구사항 아래 H3 3개를 H2로 변경 |
| [TIL 043](../../../../_posts/sprint/sprint-til/2026-03-07-categories-sprint-til043.md) | 프로젝트 요구사항 아래 H3 2개를 H2로 변경 |
| [TIL 044](../../../../_posts/sprint/sprint-til/2026-03-08-categories-sprint-til044.md) | 프로젝트 요구사항 아래 H3 1개를 H2로 변경 |
| [TIL 077-2](../../../../_posts/sprint/sprint-til/2026-05-27-categories-sprint-til077-2.md) | H2 바로 아래 H4 1개를 H3으로 변경 |

재분석 결과 9개 모두 heading 단계 건너뜀이 없어졌고, 목차에서 H4라서 빠지던 항목도 올바른 계층으로 들어갔다.

## 7. 🟡 4차와 🔴 배치

### 비표준 이미지 태그

[TIL 060](../../../../_posts/sprint/sprint-til/2026-04-07-categories-sprint-til060.md)과 [TIL 061](../../../../_posts/sprint/sprint-til/2026-04-08-categories-sprint-til061.md)의 `<image>`를 표준 `<img>`로 바꿨다. 원본 URL과 400px 폭은 유지했고 새로운 `alt`는 추가하지 않았다. 재분석 결과 비표준 `<image>` 태그는 0개가 됐다.

### 공개 permalink 충돌

TIL 38이 TIL 37과 같은 `/sprint-til037/` 주소를 사용하고 있었다. TIL 37은 기존 주소를 유지하고 [TIL 38](../../../../_posts/sprint/sprint-til/2026-02-27-categories-sprint-til038.md)의 permalink만 `/sprint-til038/`로 바꿨다. 두 URL이 서로 다른 제목과 본문을 표시하는 것을 확인했다.

같은 미완성 permalink를 가진 비공개 TIL 초안 2개는 임의로 번호를 만들지 않고 전환 대상에서 제외했다.

## 8. 전체 이미지 경로 정리

마지막 전체 이미지 감사에서 TIL 002·003·013·015-2·016·024·027·037·038의 로컬 이미지 12회 참조가 실패했다. 저장소 파일은 존재했지만 `../../../assets/...`가 배포 URL에서 `/categories/assets/...`로 해석되는 문제였다.

아홉 글의 경로를 다음처럼 사이트 기준 URL로 바꿨다.

```liquid
{{ '/assets/images/...' | relative_url }}
```

재배포 후 공개 전환 글 158개의 본문 이미지 164회 참조와 157개 고유 URL이 모두 통과했다. TIL 044 이미지의 지정 폭 300px·400px·300px도 실제 화면에서 확인했다.

## 9. 최종 검증

다음 명령으로 최종 manifest 전체를 검사했다.

```powershell
node scripts/validate-post-detail-stage4.mjs --scope=all
```

| 검사 항목 | 결과 |
| --- | ---: |
| 전체 게시글 | 166 |
| `single-editorial` 명시 | 166 |
| Pages 검증 대상 | 158 |
| 전환 대상 제외 | 8 |
| Pages 자동 검사 | 158/158 통과 |
| 실패·경고 | 0 |
| 이미지 참조 | 164/164 통과 |
| 공개 permalink 중복 | 0 |
| heading 단계 건너뜀 | 0 |
| 비표준 `<image>` 태그 | 0 |

검증 스크립트는 [validate-post-detail-stage4.mjs](../../../../scripts/validate-post-detail-stage4.mjs), 마지막 결과는 [post-detail-stage4-live-validation.json](../../../../output/post-detail-stage4-live-validation.json)에 있다.

글별 최종 상태는 `새 레이아웃 배포 검증 완료` 154개, `기준선 배포 검증 완료` 4개, `공개·전환 대상 제외` 8개다.

## 10. 완료 판단

공개 전환 글 158개와 모든 본문 이미지의 배포 검증이 끝났고, 나머지 8개의 제외 상태도 확정했다. 따라서 글 상세 페이지 4단계는 최종 완료다.

`_config.yml`의 posts 기본 layout은 기능상 바꿀 필요가 없다. 모든 게시글이 layout을 직접 명시하고 있기 때문이다. 이후 기본값을 정리하더라도 이번 전환과 분리된 설정 단순화 작업으로 처리한다.
