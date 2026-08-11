# 글 상세 페이지 4단계 전체 글 호환성 조사 결과

- 작성일: 2026-08-11
- 분석 범위: `_posts/` 아래 Markdown 게시글 166개 전체
- 글별 결과: [post-inventory.csv](data/post-inventory.csv)
- 적용 결과: [4단계 통합 구현 결과](implementation.md)
- 현재 상태: **4단계 최종 완료 / 공개 전환 글 158개 Pages·화면·이미지 검증 통과 / 비공개 8개 전환 대상 제외 / `_config.yml` 변경 없음**

## 1. 결론

166개 글을 빠짐없이 분석했다. 일부 글만 표본으로 고른 결과가 아니라, CSV의 한 행이 게시글 하나에 대응한다.

| 구분 | 전체 | 최종 검증 완료 | 제외 | 처리 전 |
| --- | ---: | ---: | ---: | ---: |
| 🟢 바로 적용 후보 | 153 | 147 | 6 | 0 |
| 🟡 화면 확인 | 11 | 11 | 0 | 0 |
| 🔴 높은 위험 | 2 | 0 | 2 | 0 |
| 합계 | 166 | 158 | 8 | 0 |

남아 있던 heading 글 9개, 비표준 이미지 태그 글 2개, 공개 permalink 충돌 글 2개까지 배포했다. 각 배치와 전체 158개 자동 검사가 실패·경고 없이 통과했고, 새 13개의 데스크톱·모바일 목차와 본문 배치도 정상이다. TIL 089, 비공개 초안 2개와 Template 5개는 전환 대상에서 제외했다.

전체 이미지 URL 검사에서 처음 발견한 TIL 002·003·013·015-2·016·024·027·037·038의 로컬 이미지 12회 참조는 `relative_url`로 수정했다. 재배포 후 공개 전환 글 158개와 본문 이미지 164회 참조가 모두 통과해 4단계를 최종 완료했다.

## 2. 어떻게 분석했는가

각 글에서 front matter와 본문을 분리한 뒤 다음 항목을 확인했다.

- 제목, 날짜, 카테고리, 태그, permalink, 공개 여부
- `layout`, `toc`, `sidebar`, `author_profile`, `share`, `comments`, `related`
- `excerpt` 또는 `description`, header 기능
- H1~H4와 H1~H3 목차 항목 수, heading 단계
- fenced·들여쓰기 코드 블록, 언어 없는 fence, 닫히지 않은 fence, 최장 코드 줄
- Markdown·HTML 이미지, 로컬 파일 존재 여부, 고정 너비
- Markdown·HTML 표와 열 수
- 코드 블록 밖의 HTML 태그와 embed

코드 블록 안의 `#`, `<div>`, 표 모양 문자열은 heading·HTML·표 통계에서 제외했다. permalink는 끝의 `/` 유무를 제거한 값으로 비교했다.

## 3. 판정 기준을 한 번 보정한 이유

계획 문서의 초기 기준을 기계적으로 적용하면 단순 `<br>`와 본문 H1이 있다는 이유만으로 161개 글이 🟡이 됐다. 이 결과로는 실제로 조심해야 할 글을 구분하기 어렵다.

현재 구현을 다시 대조한 결과 다음 항목은 새 레이아웃이 이미 처리하고 있었다.

- `excerpt`와 `description`이 모두 없으면 상단 설명만 생략한다.
- 목차는 H1~H3을 모두 읽고 본문의 H1~H4에도 별도 스타일이 있다.
- 코드 블록은 자체 가로 스크롤을 사용한다.
- 표는 본문 안에서 가로 스크롤되고, 이미지는 `max-width: 100%`로 제한된다.
- 대표 글 4개에서 여러 H1, 긴 목차, 코드, 이미지와 표를 이미 배포 검증했다.

따라서 다음 항목은 삭제하지 않고 CSV의 `참고 신호`에 남기되, 그 자체만으로 🟡로 올리지는 않았다.

- H1 2개 이상
- excerpt·description 없음
- `<br>`, `<span>`, `<img>`처럼 단순한 inline HTML
- 고정 너비 이미지
- 언어가 없는 코드 fence

실제 화면 부담이 예상되는 30개 초과 목차, heading 단계 건너뜀, 160자를 넘는 코드 줄, 6열 이상 표, 비표준 HTML 태그는 🟡로 유지했다. permalink 중복처럼 배포 결과 자체가 충돌할 수 있는 문제는 🔴로 분류했다.

## 4. 초기 예상과 실제 결과

| 항목 | 초기 예상 | 실제 분석 | 차이 |
| --- | ---: | ---: | ---: |
| 전체 글 | 166 | 166 | 0 |
| H1 없음 | 22 | 22 | 0 |
| H1 1개 | 26 | 30 | +4 |
| H1 2개 이상 | 118 | 114 | -4 |
| excerpt·description 있음 | 91 | 94 | +3 |
| excerpt·description 없음 | 75 | 72 | -3 |
| 코드 블록 포함 | 83 | 111 | +28 |
| 이미지 포함 | 61 | 57 | -4 |
| 표 포함 | 37 | 25 | -12 |
| inline HTML 포함 | 24 | 121 | +97 |
| 🟢 | 48 | 140 | +92 |
| 🟡 | 79 | 22 | -57 |
| 🔴 | 39 | 4 | -35 |

차이가 큰 이유는 현재 분석이 Markdown 파서가 실제 코드 블록으로 읽는 fenced·들여쓰기 블록을 함께 세고, 코드 블록 안의 표와 HTML은 제외했기 때문이다. inline HTML은 `<br>`까지 빠짐없이 세었다. 호환성 등급은 단순 사용 여부보다 현재 `single-editorial`이 처리할 수 있는지를 기준으로 다시 나눴다.

위 표의 실제 분석은 전환 전 조사 시점의 140·22·4다. 이후 heading·비표준 태그·공개 permalink를 수정한 현재 재분석 결과는 🟢 153개, 🟡 11개, 🔴 2개다. 현재 🔴 2개는 모두 `published: false`인 미완성 초안이며 전환 대상에서 제외했다.

## 5. 구조와 콘텐츠 분포

### 5.1 글 구조

| 항목 | 글 수 |
| --- | ---: |
| H1 없음 | 22 |
| H1 1개 | 30 |
| H1 2개 이상 | 114 |
| excerpt·description 있음 | 94 |
| excerpt·description 없음 | 72 |
| `single-editorial` 명시 | 166 |
| layout 미명시·기본 `single` 사용 | 0 |
| `published: false` | 8 |
| `published: false` Template | 5 |

H1 구간의 합과 excerpt 구간의 합은 각각 166개다. front matter를 읽지 못한 글과 Markdown 분석에 실패한 글은 없었다. 166개 모두 `single-editorial`을 명시하며 공개 전환 글 158개는 Pages 자동 검사를 통과했다. 비공개 글 8개는 전환 대상에서 제외했고, 이미지 URL 감사에서 실패한 9개는 레이아웃 검증 완료와 이미지 후속 수정을 구분해 기록한다.

### 5.2 콘텐츠

| 항목 | 글 수 | 참고 |
| --- | ---: | --- |
| 코드 블록 포함 | 111 | 이 중 fenced 코드 포함 96개 |
| 언어 없는 fence 포함 | 21 | 렌더링은 가능하나 문법 강조는 제한됨 |
| 이미지 포함 | 59 | 저장소 파일 누락 0개, 최종 배포 URL 실패 0개 |
| 고정 너비 이미지 포함 | 54 | 공통 CSS의 `max-width: 100%` 적용 대상 |
| 표 포함 | 25 | 6열 이상 표 포함 3개 |
| inline HTML 포함 | 123 | `<br>`, `<img>`, `<span>`이 대부분이며 비표준 `<image>`는 수정 후 0개 |
| 복잡한 embed 포함 | 0 | iframe, script, embed 등은 발견되지 않음 |

inline HTML이 많다는 사실만으로 위험한 것은 아니다. 123개 대부분은 줄바꿈과 이미지 크기 지정에 사용한 단순 태그다. 조사 때 발견한 두 글의 `<image>`는 `<img>`로 교체했고 배포 화면에서 정상 로딩을 확인했다.

## 6. 카테고리와 연도

| 카테고리 | 글 수 |
| --- | ---: |
| Sprint TIL | 108 |
| Sprint Weekly Paper | 18 |
| Sprint 백엔드 중급 프로젝트 | 15 |
| Sprint 백엔드 초급 프로젝트 | 12 |
| Sprint 백엔드 고급 프로젝트 | 11 |
| Java 기본 | 1 |
| 객체지향 프로그래밍 | 1 |
| 합계 | 166 |

| 연도 | 글 수 |
| --- | ---: |
| 2025 | 4 |
| 2026 | 162 |

## 7. 🔴 배치 처리 결과

처음 분류한 네 글 모두 permalink 중복 문제였다. 공개 글과 비공개 초안을 나눠 처리했다.

| 중복 주소 | 글 | 처리 |
| --- | --- | --- |
| `/categories/codeit-sprint/sprint-til/sprint-til037` | [TIL 37](../../../../_posts/sprint/sprint-til/2026-02-26-categories-sprint-til037.md), [TIL 38](../../../../_posts/sprint/sprint-til/2026-02-27-categories-sprint-til038.md) | TIL 38을 `sprint-til038`로 수정, 두 URL과 제목·본문 검증 완료 |
| `/categories/codeit-sprint/sprint-til/sprint-til0` | [2025-12-28 TIL](../../../../_posts/sprint/sprint-til/2025-12-28-categories-sprint-til0.md), [2025-12-29 TIL](../../../../_posts/sprint/sprint-til/2025-12-29-categories-sprint-til0.md) | 두 글 모두 `published: false`, 전환 대상 제외 |

공개 글의 permalink 중복은 없어졌다. 두 비공개 초안은 제목과 번호가 미완성이므로 주소를 임의로 만들지 않았다. 이 중복은 Pages 빌드 대상 밖에 있으며, 나중에 공개할 때 각각의 제목과 permalink를 확정해야 한다.

## 8. 조사 시점 🟡 화면 확인 22개

아래 22개도 모두 분석했다. `MOPL 개인 개발 리포트`는 긴 목차를 이미 배포 검증한 기준선이므로 추가 전환 대상에서는 제외한다. 나머지 21개는 해당 요소를 중심으로 화면을 확인한다.

| 글 | 확인할 이유 |
| --- | --- |
| [MOPL 개인 개발 리포트](../../../../_posts/sprint/sprint-advanced-project/2026-07-27-categories-sprint-advanced-project008.md) | 목차 32개, 기준선 검증 완료 |
| [Monew 개인 개발 리포트](../../../../_posts/sprint/sprint-intermediate-project/2026-05-06-categories-sprint-intermediate-project013.md) | 목차 35개 |
| [TIL 005](../../../../_posts/sprint/sprint-til/2026-01-07-categories-sprint-til005.md) | 6열 표 |
| [TIL 021](../../../../_posts/sprint/sprint-til/2026-01-29-categories-sprint-til021.md) | heading 단계 건너뜀 |
| [TIL 022](../../../../_posts/sprint/sprint-til/2026-01-30-categories-sprint-til022.md) | heading 단계 건너뜀 |
| [TIL 025-2](../../../../_posts/sprint/sprint-til/2026-02-06-categories-sprint-til025-2.md) | 최장 코드 줄 1,050자 |
| [TIL 039-2](../../../../_posts/sprint/sprint-til/2026-03-03-categories-sprint-til039-2.md) | heading 단계 건너뜀 |
| [TIL 040](../../../../_posts/sprint/sprint-til/2026-03-04-categories-sprint-til040.md) | heading 단계 건너뜀 |
| [TIL 041](../../../../_posts/sprint/sprint-til/2026-03-05-categories-sprint-til041.md) | heading 단계 건너뜀 |
| [TIL 042](../../../../_posts/sprint/sprint-til/2026-03-06-categories-sprint-til042.md) | heading 단계 건너뜀 |
| [TIL 043](../../../../_posts/sprint/sprint-til/2026-03-07-categories-sprint-til043.md) | heading 단계 건너뜀 |
| [TIL 044](../../../../_posts/sprint/sprint-til/2026-03-08-categories-sprint-til044.md) | heading 단계 건너뜀 |
| [TIL 052](../../../../_posts/sprint/sprint-til/2026-03-30-categories-sprint-til052.md) | 최장 코드 줄 191자 |
| [TIL 060](../../../../_posts/sprint/sprint-til/2026-04-07-categories-sprint-til060.md) | 비표준 `<image>` 태그 |
| [TIL 061](../../../../_posts/sprint/sprint-til/2026-04-08-categories-sprint-til061.md) | 비표준 `<image>` 태그 |
| [TIL 065-1](../../../../_posts/sprint/sprint-til/2026-05-11-categories-sprint-til065-1.md) | 목차 33개 |
| [TIL 065-2](../../../../_posts/sprint/sprint-til/2026-05-11-categories-sprint-til065-2.md) | 목차 31개, 6열 표 |
| [TIL 073](../../../../_posts/sprint/sprint-til/2026-05-21-categories-sprint-til073.md) | 6열 표 |
| [TIL 077-2](../../../../_posts/sprint/sprint-til/2026-05-27-categories-sprint-til077-2.md) | heading 단계 건너뜀 |
| [TIL 077-4](../../../../_posts/sprint/sprint-til/2026-05-27-categories-sprint-til077-4.md) | 목차 32개 |
| [TIL 078-2](../../../../_posts/sprint/sprint-til/2026-05-28-categories-sprint-til078-2.md) | 목차 39개 |
| [TIL 078-3](../../../../_posts/sprint/sprint-til/2026-05-28-categories-sprint-til078-3.md) | 목차 43개 |

### 8.1 🟡 1차 배치 진행 상태

긴 코드·넓은 표 유형 5개는 GitHub Pages에 배포됐고 `yellow-batch-1` 5/5와 전체 140/140 자동 검사를 통과했다. TIL 005의 trailing slash 때문에 발생한 이미지 404도 `relative_url`로 수정해 실제 배포 화면에서 정상 표시되는 것을 확인했다. 자세한 근거는 [4단계 통합 구현 결과](implementation.md)에 정리했다.

### 8.2 🟡 2차 배치 진행 상태

남은 긴 목차 글 5개에 새 레이아웃을 적용했다. Monew 개인 개발 리포트와 TIL 065-1·077-4·078-2·078-3의 목차 대상은 32~43개다. `yellow-batch-2` 5/5와 전체 145/145 자동 검사가 실패·경고 없이 통과했다. 1440×900 데스크톱에서는 5개 모두 목차 내부 스크롤과 sticky 동작이 정상이고, 390×844 모바일에서는 접힌 목차 카드가 정상적으로 열렸다. 본문 H1~H3과 목차 링크 수도 모두 일치했으며 fragment 누락과 페이지 전체 가로 넘침, 브라우저 콘솔 오류가 없었다. 자세한 범위는 [4단계 통합 구현 결과](implementation.md)에 정리했다.

### 8.3 🟡 3차 heading 배치

heading 단계가 건너뛰던 9개는 문서 의미에 맞게 H2·H3 계층을 교정하고 새 레이아웃을 적용했다. 재분석에서 9개 모두 `heading 단계 건너뜀: false`가 됐다. `yellow-batch-3` 자동 검사는 9/9로 통과했고, 데스크톱·모바일에서 H1~H3 수와 목차 링크 수가 일치하며 fragment 누락과 가로 넘침이 없었다.

### 8.4 🟡 4차 비표준 이미지 태그 배치

TIL 060·061의 `<image>`를 표준 `<img>`로 바꾸고 새 레이아웃을 적용했다. 원본 URL과 400px 폭은 유지했고 새로운 `alt`는 추가하지 않았다. 재분석에서 비표준 HTML 태그는 0개가 됐다. `yellow-batch-4` 자동 검사는 2/2로 통과했고, 외부 이미지와 GitHub 첨부 이미지가 실제 크기로 로딩되는 것도 확인했다. 자세한 결과는 [4단계 통합 구현 결과](implementation.md)에 정리했다.

## 9. 🟢 공개 글 일괄 적용 결과

조사 당시 🟢 공개 글 132개에 새 레이아웃을 한 번에 적용했다. 이 중 Git에 포함되지 않아 Pages에 존재하지 않았던 TIL 089는 사용자의 결정에 따라 전환 대상에서 제외했고, 나머지 신규 131개와 기존 기준선 4개를 배포 검증했다. 아래 다섯 유형은 최초 적용 범위를 보여준다.

| 유형 | 글 수 | 확인의 중심 |
| --- | ---: | --- |
| 코드·이미지·표·HTML이 없는 글 | 13 | 기본 제목·본문·목차 |
| 단순 HTML만 있는 글 | 22 | 줄바꿈과 본문 간격 |
| 코드가 있고 이미지·표는 없는 글 | 52 | 코드 자체 스크롤 |
| 이미지가 있고 표는 없는 글 | 26 | 이미지 폭과 외부 이미지 |
| 표가 있는 글 | 19 | 표 자체 스크롤과 셀 가독성 |
| 합계 | 132 | 모든 글을 일괄 적용 대상에 포함 |

132개를 10개씩 나눠 수동 검토하면 배포 횟수와 대기 시간이 지나치게 늘어난다. 🟢는 정적 분석에서 새 레이아웃을 막을 요소가 발견되지 않은 글이므로, 자동 검사를 함께 준비한다면 한 번에 적용하는 편이 더 효율적이다.

### 적용한 방법

1. `_config.yml`은 그대로 두고 🟢 공개 글 132개에만 `layout: single-editorial`을 명시했다.
2. 🟡 21개, 🔴 4개, 비공개 Template 5개는 변경하지 않았다.
3. 변경된 파일 목록이 CSV의 대상 132개와 정확히 일치하는지 검사했다.
4. 새로 적용한 132개와 기존 대표 글 4개를 합한 136개 URL 목록을 만들었다.
5. GitHub Pages 배포 후 136개 URL을 검사했다.
6. 기존 대표 글 4개와 신규 글 131개는 통과했고, Pages에 없던 TIL 089는 전환 대상에서 제외했다.

### 136개 전체에 적용할 배포 검사

배포 페이지 검사 도구는 136개 URL에서 다음 항목을 확인했다.

- HTTP 응답과 HTML 파일 생성 여부
- `single-editorial` 레이아웃 클래스, 제목과 본문 존재 여부
- 목차 링크가 실제 heading ID를 가리키는지
- HTML에 빌드 오류 문구가 포함됐는지

URL 검사는 새로 적용한 132개와 회귀 기준선 4개에서 시작했다. TIL 048의 잘못된 본문 내부 링크를 수정해 재배포했고, TIL 089를 제외한 135개는 HTTP 응답, 레이아웃 클래스, 제목·본문과 fragment 연결 검사를 경고 없이 통과했다. 이후 🟡·🔴 배치를 추가해 최종 검사 범위를 158개로 확장했다. 자세한 과정은 [4단계 통합 구현 결과](implementation.md)에 정리했다.

## 10. 비공개 Template 5개

다음 글은 `published: false`이므로 호환성 통계에는 포함하되 공개 글 전환 대상에서는 제외했다.

- [Java 기본 Template](../../../../_posts/java/basic/2026-08-06-categories-basic000.md)
- [객체지향 프로그래밍 Template](../../../../_posts/java/oop/2026-08-06-categories-oop000.md)
- [초급 프로젝트 Template](../../../../_posts/sprint/sprint-basic-project/2026-03-11-categories-sprint-basic-project000.md)
- [중급 프로젝트 Template](../../../../_posts/sprint/sprint-intermediate-project/2026-04-12-categories-sprint-intermediate-project000.md)
- [Weekly Paper Template](../../../../_posts/sprint/sprint-weekly-paper/2026-01-01-categories-weekly-paper000.md)

## 11. `_config.yml` 변경 판단

현재 판단은 **기능상 변경 불필요**다.

1. ~~TIL 089를 배포·검증하거나 공개·전환 대상 제외로 결정한다.~~ — 전환 대상 제외 완료
2. 🟡 21개를 위험 유형별로 적용·검증한다. — 21개 완료
3. 🔴 4개의 처리 방법을 정한다. — 공개 2개 permalink·레이아웃 검증 완료, 비공개 2개 제외 완료
4. 비공개 Template 5개를 기본 layout 변경 대상에서 제외한다. — 완료
5. 모든 글이 `새 레이아웃 검증 완료`, `배포 검증 전`, `공개·전환 대상 제외` 중 하나가 된다. — 완료

현재 166개 모두 `layout: single-editorial`을 명시하므로 `_config.yml`의 posts 기본 layout은 실제 글 렌더링에 영향을 주지 않는다. 기본값을 바꾸더라도 현재 글의 결과는 달라지지 않으므로, 이미지 경로 후속 수정과 분리한 선택적 설정 정리로 다룬다.

## 12. 배포 검사와 전체 이미지 점검 결과

현재 [배포 검사 결과 JSON](../../../../output/post-detail-stage4-live-validation.json)은 전체 158개가 통과했고 실패·경고가 0개다. 새 13개는 1440×900과 390×844에서 다음 항목도 확인했다.

- H1~H3 본문 heading과 목차 링크 수 일치
- 목차 fragment 누락 0개, 모바일 목차 열기와 깊은 항목 이동 정상
- 페이지 전체 가로 넘침 0px
- TIL 060·061 외부 이미지 정상 로딩
- TIL 37·38 URL 분리와 제목·본문 정상
- 브라우저 콘솔 경고·오류 0개

별도의 전체 이미지 감사에서도 158개 글 HTML 요청이 모두 성공했다. 본문 이미지가 있는 글은 56개였고, 164회 참조한 157개 고유 URL을 검사했다. 처음에는 9개 글의 로컬 이미지 12회 참조가 잘못된 상대 경로 때문에 실패했지만, 모두 `relative_url`을 사용하는 사이트 루트 기준 경로로 바꿨다. 재배포 후 이미지 실패는 0개이며 TIL 044의 지정 폭 300px·400px·300px도 확인했다.

현재 환경에서는 `ruby`와 `bundle` 명령을 찾을 수 없어 Jekyll 로컬 빌드는 실행하지 않았다. CSV 166행·52열, manifest의 158개 파일·URL 중복 여부와 제목 인코딩, 실제 front matter를 함께 검사했다.

## 13. 완료 판단

공개 전환 글 158개는 Pages 자동 검사와 유형별 화면 검토를 통과했고, 전체 이미지 URL 감사도 실패 0개로 끝났다. 나머지 8개는 공개·전환 대상 제외로 상태를 확정했으므로 4단계에는 처리 전인 글이 없다.

`_config.yml` 변경은 기능상 필요하지 않다. 166개 게시글이 모두 `layout: single-editorial`을 명시하고 있기 때문이다. 기본 layout 정리는 이후 설정 단순화가 필요할 때 별도 작업으로 다룬다.
