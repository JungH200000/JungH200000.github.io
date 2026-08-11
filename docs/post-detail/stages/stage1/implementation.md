# 글 상세 페이지 1단계 구현 결과

- 최초 구현일: 2026-08-08
- 최종 정리일: 2026-08-09
- 문서 위치: `docs/post-detail/`
- 대상 저장소: 현재 Jekyll 블로그 저장소
- 기준 문서: [글 상세 페이지 편집형 리디자인 계획](../../redesign-plan.md)
- 후속 문서: [글 상세 페이지 2단계 구현 결과](../stage2/implementation.md)
- 상태: **1단계 구현 완료** — 최신 MOPL GitHub Pages 화면에서 `-80px` 상단 보정과 읽기 시간 제거 확인 / 전체 기본값 전환 전 대표 글 3종 회귀 확인 권장

## 1. 최종 결론

기존 Jekyll·Minimal Mistakes 구조와 홈·카테고리 페이지는 유지한다. 글 상세 화면만 별도 `_layouts/single-editorial.html`로 분리하여 대표 글 3개에 적용했다.

최종 화면은 다음 원칙을 따른다.

- 글 제목과 이전·다음·관련 글 제목은 기존 `title`을 사용한다.
- 상단 메타데이터는 작성일과 작성일이 다를 때의 수정일만 표시한다. 예상 읽기 시간은 표시하지 않는다.
- 글 설명은 직접 작성한 `description` 또는 `excerpt`만 사용한다.
- 본문의 H1·H2·H3을 목차에 모두 표시한다.
- 데스크톱 상단 정보는 본문 시작선보다 80px 왼쪽에서 시작해 목차와 본문 사이의 빈 간격을 활용한다.
- 데스크톱 목차의 sticky 범위는 Markdown 본문이 끝나는 지점까지만 유지한다.
- 관련 글은 내용 유사도 추천이 아니라 같은 카테고리의 최신 글 목록으로 명확하게 표시한다.

## 2. 최종 화면 구조

### 2.1 데스크톱: 1101px 이상

상단과 본문은 같은 `목차 열 210px + 간격 72px + 읽기 열 760px` 외곽 grid를 공유한다. 상단 정보의 폭은 `760px + 48px = 808px`로 유지하면서 시작점만 본문보다 80px 왼쪽으로 이동한다. 따라서 72px 간격을 8px 넘어 보조 열에 들어가고, 오른쪽 끝은 본문보다 32px 안쪽에서 끝난다.

```text
기존 masthead

글 헤더 grid
├─ 210px: ← 글 목록
├─ 72px 간격
└─ 808px: 본문 시작선보다 80px 왼쪽에서 시작
           카테고리 · 작성일/수정일
           title · excerpt · 태그

본문 grid
├─ 210px: H1~H3 sticky 목차
├─ 72px 간격
└─ 760px: Markdown 본문

본문 이후 grid
├─ 210px: 비어 있음
├─ 72px 간격
└─ 760px: 이전·다음 글
           같은 카테고리의 최신 글
           Utterances 댓글
```

이 구조에서는 상단 제목이 본문보다 80px 왼쪽에서 시작한다. 계산상 보조 열과 8px 겹치지만, 현재 `← 글 목록`이 짧아 실제 요소 충돌이나 가로 넘침은 발생하지 않는다. 오른쪽 끝을 본문보다 32px 안쪽에 두는 비대칭이 긴 제목의 시각적 무게를 왼쪽으로 보정한다. 목차는 본문 grid 안에만 있으므로 관련 글과 댓글 옆까지 따라오지 않는다.

### 2.2 태블릿: 961~1100px

```text
170px 보조 열 + 24px 간격 + 최대 760px 읽기 열
상단 정보는 본문보다 12px 왼쪽에서 시작
```

본문 폭을 가능한 한 유지하면서 보조 열과 간격을 줄인다. 데스크톱의 80px 이동을 그대로 적용하면 작은 화면에서 왼쪽으로 과도하게 붙으므로 이동량도 12px로 줄인다.

### 2.3 모바일·작은 태블릿: 960px 이하

```text
← 글 목록
카테고리 · 작성일/수정일
title · excerpt · 태그

접을 수 있는 H1~H3 목차
Markdown 본문
이전·다음 글
같은 카테고리의 최신 글
댓글
```

- 2열 grid를 한 열로 전환한다.
- 상단의 왼쪽 이동을 해제하고 한 열의 공통 좌우 여백을 사용한다.
- 목차는 `<details>`로 접고 펼친다.
- 긴 목차는 최대 `58vh` 높이에서 목차 영역만 스크롤한다.
- 목차 `summary`의 키보드 포커스는 주황색 `:focus-visible` 테두리로 표시한다.
- 680px 이하 본문은 16px/1.85, 좌우 여백은 16px이다.

## 3. 콘텐츠와 메타데이터 결정

| 항목 | 최종 결정 | 이유 |
| --- | --- | --- |
| 제목 | 기존 `page.title` | 별도 `display_title` 없이 저장된 제목을 모든 위치에서 일관되게 사용 |
| 설명 | `page.description` 또는 `page.excerpt` | 본문 첫 문장 자동 복사는 질문·목록·코드를 잘못 노출할 수 있음 |
| 메타데이터 | 작성일·조건부 수정일만 표시 | 예상 시간이 실제 읽기 경험과 다를 수 있고 제목 위 정보가 복잡해지는 것을 방지 |
| 수정일 | 작성일과 다를 때만 표시 | 같은 날짜가 반복되는 정보 제거 |
| 목차 | 본문 H1~H3 전체 | 긴 글에서 원하는 정보를 빠르게 찾는 것을 우선 |
| 관련 글 | 같은 카테고리의 최신 글 최대 4개 | 현재 구현이 제공하는 실제 동작을 정확히 표현 |
| 댓글 | 운영 환경에서 Utterances | 기존 댓글 기능 유지 |

`_includes/post/editorial-meta.html`에서는 단어 수 계산을 수행하지 않는다. `_config.yml`의 `words_per_minute`와 기존 `_includes/page__meta.html`은 Minimal Mistakes의 다른 레이아웃에서 사용할 수 있으므로 이번 글 상세 전용 변경 범위에서는 유지한다.

## 4. 목차 결정

- 범위: Markdown 본문에 렌더링되는 H1, H2, H3 전체
- 데스크톱: 왼쪽 sticky 목차, 화면 높이를 넘으면 목차 내부 스크롤
- 모바일: 접힌 `<details>` 목차, 펼친 영역은 최대 `58vh`
- 접근성: 목차 링크와 모바일 `summary`에 명확한 포커스 표시
- 의미 구조 절충: 페이지 제목 H1과 본문 H1이 함께 존재할 수 있지만 기존 글의 탐색성을 우선한다.

대표 글의 예상 목차 항목 수는 다음과 같다.

| 대표 글 | H1 | H2 | H3 | 합계 |
| --- | ---: | ---: | ---: | ---: |
| MOPL 프로젝트 회고 | 3 | 4 | 0 | 7 |
| Spring Security TIL | 3 | 8 | 19 | 30 |
| Weekly Paper 12 | 0 | 2 | 2 | 4 |

## 5. 같은 카테고리의 최신 글 동작

`_includes/post/editorial-related.html`은 다음 순서로 동작한다.

1. 현재 글의 첫 번째 `categories` 값을 가져온다.
2. `site.categories[현재 카테고리]`에서 같은 카테고리의 글을 조회한다.
3. 현재 글과 제목에 `Template`이 포함된 글을 제외한다.
4. Jekyll의 글 순서에 따라 최신 글부터 최대 4개를 표시한다.
5. 카드에는 날짜, 기존 `title`, `description` 또는 `excerpt`를 표시한다.

태그나 본문 유사도를 계산하지 않으므로 기존의 `같이 읽을 글`보다 `같은 카테고리의 최신 글`이 실제 동작에 맞는 명칭이다. 예를 들어 TIL 67에서는 가까운 회차보다 최신 TIL이 먼저 표시될 수 있다.

## 6. 배포 화면 감사와 해결 내용

| 실제 화면에서 확인한 문제 | 반영한 해결책 |
| --- | --- |
| Minimal Mistakes의 루트 글자 크기 때문에 `rem` 기반 제목이 예상보다 커짐 | 편집형 레이아웃의 주요 크기를 `px`로 고정 |
| 빈 설명이 본문 질문·목록을 복사함 | 본문 fallback 제거, 대표 글에 직접 작성한 `excerpt` 추가 |
| 긴 모바일 목차가 화면 대부분을 차지함 | H1~H3은 유지하고 `58vh` 내부 스크롤 적용 |
| 건너뛰기 링크의 `#main` 대상이 없음 | `<main id="main" tabindex="-1">` 적용 |
| Utterances 저장소가 예시 문자열임 | `_config.yml`의 `site.repository`와 연결 |
| 관련 글에 Template 글이 노출됨 | 템플릿 글 5개에 `published: false`, 관련 글에서도 추가 제외 |
| 이전·다음 글에 실제 제목이 없음 | 실제 `title`이 표시되는 카드로 교체 |
| 한국어 사이트에서 탐색·검색·댓글 문구가 영어로 표시됨 | `ko`, `ko-KR` UI 문구 활성화 |
| `display_title`, `reading_minutes`가 기존 front matter와 중복됨 | 두 필드 제거, 기존 `title` 사용 |
| 자동 계산된 `5분 읽기`가 불필요함 | 글 상세 전용 meta include에서 계산과 출력 모두 제거 |
| 상단을 본문선에 맞추자 제목 덩어리가 오른쪽으로 치우쳐 보임 | 최종 배포 화면을 기준으로 데스크톱은 상단만 80px, 태블릿은 12px 왼쪽으로 이동하고 모바일은 이동 해제 |
| 긴 목차가 관련 글·댓글 옆까지 따라옴 | Markdown 본문과 하단 기능 영역을 별도 grid로 분리 |
| 모바일 목차 포커스가 브라우저 기본 검은 테두리로 표시됨 | 주황색 `:focus-visible` 스타일 적용 |
| `같이 읽을 글`이 의미 기반 추천처럼 보임 | `같은 카테고리의 최신 글`로 명칭 변경 |

## 7. 주요 변경 파일

| 파일 | 변경 내용 |
| --- | --- |
| `_layouts/single-editorial.html` | 상단·본문·본문 이후 영역을 분리한 구조 유지 |
| `_sass/_editorial-post.scss` | 상단의 반응형 왼쪽 보정, 데스크톱 grid, sticky 범위, 모바일 포커스, 본문 타이포그래피 |
| `_includes/post/editorial-meta.html` | 작성일·조건부 수정일만 표시하고 읽기 시간 계산·출력 제거 |
| `_includes/post/editorial-description.html` | 직접 작성한 설명만 표시 |
| `_includes/post/editorial-breadcrumb.html` | 실제 카테고리 URL 기반 breadcrumb |
| `_includes/post/editorial-pagination.html` | 기존 `title`을 사용하는 이전·다음 글 카드 |
| `_includes/post/editorial-related.html` | 같은 카테고리 최신 글 최대 4개 |
| `_includes/comments-providers/utterances.html` | `site.repository` 기반 댓글 저장소 |
| `_data/ui-text.yml` | 한국어 UI 문구 |
| 대표 글 3개 | `layout`, `excerpt`, TIL H1 인라인 스타일 정리 |
| 템플릿 글 5개 | `published: false` |

다음 범위는 변경하지 않았다.

- `_layouts/single.html`
- `_config.yml`의 posts 기본 layout
- `index.html`
- `_layouts/home.html`
- `_layouts/posts.html`
- `_data/navigation.yml`

## 8. 대표 글 적용 대상

| 유형 | 파일 | 배포 URL |
| --- | --- | --- |
| 긴 프로젝트 회고 | `_posts/sprint/sprint-advanced-project/2026-07-27-categories-sprint-advanced-project009.md` | `/categories/codeit-sprint/sprint-advanced-project/sprint-advanced-project09` |
| 코드·이미지가 많은 TIL | `_posts/sprint/sprint-til/2026-05-14-categories-sprint-til067-1.md` | `/categories/codeit-sprint/sprint-til/sprint-til067-1` |
| 목록 중심 Weekly Paper | `_posts/sprint/sprint-weekly-paper/2026-06-19-categories-weekly-paper012.md` | `/categories/codeit-sprint/sprint-weekly-paper/weekly-paper012` |

## 9. 검증 상태

### 완료한 정적 검사

- `git diff --check`
- 대표 글 front matter 필수 값과 제거한 필드 확인
- Liquid `if`·`for` 시작/종료 수 검사
- Sass 중괄호와 1100px·960px·680px breakpoint 검사
- 데스크톱 상단·본문·하단 grid 규칙 일치 여부 확인
- H1~H3 목차 include 2개 확인
- TIL이 참조하는 로컬 이미지 존재 여부 확인
- 문서 코드 블록과 내부 링크 검사

### 현재 환경의 제한

현재 PATH에는 Ruby와 Bundler가 없어 다음 Jekyll 통합 검사는 실행하지 못한다.

```powershell
bundle exec jekyll build --trace
bundle exec jekyll serve
```

최신 MOPL GitHub Pages 화면에서 데스크톱 `-80px` 보정, 읽기 시간 제거, 제목 줄바꿈과 본문·목차 조합을 확인했다. 이 확인으로 1단계 구현은 완료로 처리한다.

다만 최신 CSS를 적용한 대표 글 3종의 1440px·1024px·390px 전체 조합을 다시 확인한 것은 아니다. 이는 1단계 구현을 다시 여는 조건이 아니라, 4단계의 전체 posts 기본 layout 전환 전에 수행할 회귀 확인 항목이다.

## 10. 전체 기본값 전환 전 회귀 확인 목록

대표 글 3개를 1440px, 1024px, 390px에서 확인한다.

- 1440px에서 상단 정보가 본문보다 약 80px 왼쪽에서 시작하고 `← 글 목록`과 실제로 겹치지 않는가
- 1100px와 1101px 사이에서 헤더 위치 변화가 과도하게 느껴지지 않는가
- 1024px에서 상단 정보가 본문보다 약 12px만 왼쪽에서 시작하는가
- 960px 이하에서 상단과 본문이 같은 한 열 여백으로 정렬되는가
- 데스크톱에서 `← 글 목록`이 목차 열에 배치되는가
- 기존 `title`의 긴 접두어가 760px와 390px에서 자연스럽게 줄바꿈되는가
- `5분 읽기` 같은 예상 읽기 시간이 상단에 표시되지 않는가
- 목차에 H1~H3이 모두 표시되는가
- 긴 목차가 데스크톱과 모바일에서 내부 스크롤되는가
- 목차가 본문 종료 후 관련 글·댓글 옆에 남지 않는가
- 모바일 목차 포커스가 주황색으로 표시되는가
- 하단 제목이 `같은 카테고리의 최신 글`로 표시되는가
- 이전·다음 글과 최신 글 카드가 올바른 URL로 이동하는가
- TIL의 이미지와 코드 블록이 화면 폭을 넘지 않는가
- Utterances 댓글이 정상 표시되는가
- 기존 permalink가 유지되는가
- 인쇄 미리보기에서 상단 정보가 왼쪽으로 잘리지 않는가

## 11. 되돌리는 방법

특정 대표 글에서 문제가 발생하면 해당 글의 다음 front matter를 제거한다.

```yaml
layout: single-editorial
```

그러면 `_config.yml`의 기존 `single` 레이아웃으로 돌아간다. 전체 posts 기본 layout은 변경하지 않았다.

## 12. 이후로 미룬 항목

2단계에서 실제 표가 있는 MOPL 개인 개발 리포트를 네 번째 대표 글로 추가했다. 표·이미지의 GitHub Pages 검증 상태는 [2단계 구현 결과](../stage2/implementation.md)에서 관리한다.

- 새 글의 페이지 제목과 본문 H1 의미 계층 규칙 확정
- 나머지 글에 직접 작성한 `excerpt` 점진 적용
- 최신순이 아닌 공통 태그·가까운 회차 기반 관련 글 알고리즘
- 코드 복사 버튼, 현재 목차 항목 강조, Mermaid, 다크 모드
- 대표 글 검증 후 전체 posts 기본 layout 전환 여부 결정
- 넓은 인쇄 viewport에서도 `margin-left`를 초기화할지 결정
