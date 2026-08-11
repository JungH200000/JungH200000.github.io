# 글 상세 페이지 2단계 구현 결과

- 구현일: 2026-08-10
- 문서 위치: `docs/post-detail/`
- 기준 문서: [글 상세 페이지 편집형 리디자인 계획](../../redesign-plan.md)
- 상태: **2단계 최종 완료 — 2026-08-10 GitHub Pages 배포 검증 통과**

## 1. 범위와 결론

2단계는 레이아웃을 다시 설계하는 작업이 아니라 대표 글의 Markdown 콘텐츠가 1단계 레이아웃에서 안정적으로 렌더링되도록 정리하는 작업이다.

이번 단계에서는 다음만 변경했다.

- 언어가 지정되지 않은 코드 fence에 `text` 지정
- 실제 Markdown 표가 있는 글을 네 번째 대표 글로 추가
- 새 대표 글에 `single-editorial` 레이아웃과 직접 작성한 `excerpt` 적용

다음 항목은 변경하지 않았다.

- 기존 제목·카테고리·태그·날짜·permalink
- H1~H4 의미 계층
- TIL 이미지 경로·크기·마크업
- 이미지 `alt`
- 글 상세 Sass와 Liquid 레이아웃
- 홈·아카이브

`alt`는 접근성 개선 후보지만 문서에서 정의한 2단계 완료 조건인 목차·설명·날짜·코드·표·이미지 넘침 검증에는 포함하지 않는다.

## 2. 적용 내용

### 2.1 표 검증 대표 글 추가

다음 글을 네 번째 대표 글로 추가했다.

- 파일: `_posts/sprint/sprint-advanced-project/2026-07-27-categories-sprint-advanced-project008.md`
- URL: `/categories/codeit-sprint/sprint-advanced-project/sprint-advanced-project08`
- 제목: `[Sprint 백엔드 고급 프로젝트] MOPL 개인 개발 리포트`

적용 내용은 다음과 같다.

- `layout: single-editorial` 추가
- 빈 `excerpt`를 글의 범위를 설명하는 문장으로 교체
- Kafka·Redis 처리 흐름 코드 블록 2개에 `text` 지정

이 글은 Markdown 표 18행, 로컬 이미지 7개, H1 3개·H2 8개·H3 21개를 포함한다. 따라서 표 가로 스크롤뿐 아니라 긴 목차와 이미지 반응형도 함께 검증할 수 있다.

### 2.2 Spring Security TIL 코드 fence 정리

`2026-05-14-categories-sprint-til067-1.md`의 `Set-Cookie` 예시 코드 블록에 `text`를 지정했다.

```text
Set-Cookie: JSESSIONID=abc123; Path=/; HttpOnly; Secure; SameSite=Strict
```

이미지 6개의 기존 상대 경로와 `width` 속성은 변경하지 않았다. 이번 단계에서는 파일 존재 여부와 editorial 이미지 CSS의 `max-width: 100%` 적용 가능 여부만 확인했다.

## 3. 최종 대표 글 구성

| 유형 | 파일 | H1 | H2 | H3 | 표 행 | 이미지 |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| 긴 프로젝트 회고 | `sprint-advanced-project009.md` | 3 | 4 | 0 | 0 | 0 |
| 코드·이미지·긴 목차 TIL | `sprint-til067-1.md` | 3 | 8 | 19 | 0 | 6 |
| 목록 중심 Weekly Paper | `sprint-weekly-paper012.md` | 0 | 2 | 2 | 0 | 0 |
| 표·이미지·긴 프로젝트 리포트 | `sprint-advanced-project008.md` | 3 | 8 | 21 | 18 | 7 |

H4는 목차 범위 밖이므로 H1~H3 검증 수치에서 제외한다. 목차에 넣기 위해 기존 H4를 H3으로 변경하지 않았다.

## 4. 완료한 정적 검증

- `git diff --check`
- 대표 글 4개에 `layout: single-editorial` 존재
- 대표 글 4개에 비어 있지 않은 `excerpt` 존재
- 모든 코드 fence의 시작 부분에 언어 지정
- 모든 코드 fence 시작·종료 짝 확인
- TIL 로컬 이미지 6개 존재
- MOPL 개인 개발 리포트 로컬 이미지 7개 존재
- `.editorial-prose table`의 자체 가로 스크롤 스타일 존재
- `.editorial-prose img`의 `max-width: 100%` 스타일 존재
- H1·H2·H3 개수 기록

작성일과 같은 `last_modified_at`을 숨기는 것은 1단계의 `_includes/post/editorial-meta.html` 조건을 그대로 사용한다. 콘텐츠 데이터는 삭제하지 않았다.

## 5. 로컬 검증 제약

현재 환경에는 Ruby와 Bundler가 없어 다음 명령을 실행하지 못했다.

```powershell
bundle exec jekyll build --trace
bundle exec jekyll serve
```

로컬 Jekyll 빌드는 수행하지 못했지만, 아래 GitHub Pages 배포본에서 실제 Kramdown 표 렌더링, Rouge 코드 강조, 이미지 로딩과 반응형 동작을 확인했다. 따라서 로컬 빌드 미수행은 이번 2단계의 완료를 막지 않는다. 추후 Ruby 개발 환경을 구성하면 변경을 push하기 전에 같은 명령을 로컬 사전 검증으로 사용한다.

## 6. GitHub Pages 배포 검증 결과

검증일은 2026-08-10이며, 이번 2단계에서 직접 수정·추가한 다음 두 글을 데스크톱과 390×844 모바일 화면에서 확인했다.

- [MOPL 개인 개발 리포트](https://jungh200000.github.io/categories/codeit-sprint/sprint-advanced-project/sprint-advanced-project08)
- [Spring Security TIL 67-1](https://jungh200000.github.io/categories/codeit-sprint/sprint-til/sprint-til067-1)

### 공통

- 기존 permalink와 직접 작성한 제목·excerpt가 정상 노출됨
- 메타 정보에는 작성일만 표시되고 읽기 시간과 작성일과 같은 수정일은 표시되지 않음
- H1~H3 목차가 생성되고 긴 목차는 데스크톱 sidebar와 모바일 목차 카드 내부에서 스크롤됨
- 데스크톱과 모바일 모두 문서 전체의 `clientWidth`와 `scrollWidth`가 같아 페이지 단위 가로 넘침이 없음
- 모바일에서는 데스크톱 목차가 숨겨지고 접을 수 있는 목차 카드가 표시됨
- 두 페이지 모두 브라우저 콘솔 오류 없음

### TIL 67-1

- `Set-Cookie`가 일반 텍스트 코드 블록으로 표시됨
- 모바일에서 해당 코드 블록은 `clientWidth 320px`, `scrollWidth 506px`, `overflow-x: auto`로 코드 영역 내부에서만 가로 스크롤됨
- 이미지 6개가 모두 로드됐으며 모바일 렌더링 폭은 최대 320px로 제한됨
- 긴 모바일 목차는 `clientHeight 489px`, `scrollHeight 931px`, `overflow-y: auto`로 카드 내부에서 스크롤됨

### MOPL 개인 개발 리포트

- 데스크톱 표는 `clientWidth 760px`, `scrollWidth 927px`, 모바일 표는 `clientWidth 320px`, `scrollWidth 873px`이며 모두 `overflow-x: auto`로 표 영역 내부에서만 가로 스크롤됨
- 모바일 문서 전체는 `clientWidth 380px`, `scrollWidth 380px`로 표 때문에 페이지가 넓어지지 않음
- 이미지 7개가 모두 로드됐으며 모바일 렌더링 폭은 320px로 제한됨
- 데스크톱의 `-80px` 헤더 보정은 글 목록 링크·목차·본문을 가리지 않고 상단 정보와 본문의 시각적 간격을 균형 있게 유지함
- 960px 이하에서는 헤더의 음수 margin이 해제되어 모바일 제목과 본문이 같은 안전 여백 안에 배치됨

목차 링크는 데스크톱용과 모바일용 목차가 함께 DOM에 존재하므로 MOPL은 64개, TIL은 60개로 관찰된다. 실제 본문 H1~H3 수는 각각 32개와 30개이며, 동일 heading을 두 반응형 목차가 한 번씩 참조한 결과이므로 중복 heading 오류가 아니다.

이번 검증은 화면 배치, 이미지 로딩, DOM 구조와 overflow 동작을 확인한 시각·기능 검토다. 키보드 탐색과 스크린 리더를 포함한 전체 접근성 적합성 검사는 별도 범위다.

## 7. 2단계 완료 판정

최종 판정은 다음과 같다.

- 콘텐츠 수정: 완료
- 정적 구조 검증: 완료
- Jekyll 로컬 빌드: 환경 제한으로 미수행
- GitHub Pages 시각·반응형 검증: 통과
- 2단계: **최종 완료**

향후 다른 대표 글에서 문제가 발견되면 해당 글의 Markdown 또는 공통 표·이미지 스타일만 보정하고, 1단계 레이아웃 구조 전체를 다시 변경하지 않는다.

## 8. 되돌리는 방법

새 대표 글에서 문제가 발생하면 `sprint-advanced-project008.md`의 다음 front matter만 제거하면 기존 `single` 레이아웃으로 돌아간다.

```yaml
layout: single-editorial
```

코드 fence의 `text` 지정과 excerpt는 기존 레이아웃에서도 안전하게 유지할 수 있다.
