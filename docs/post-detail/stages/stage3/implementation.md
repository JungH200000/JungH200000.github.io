# 글 상세 페이지 3단계 구현 결과

- 구현·검증일: 2026-08-10
- 기준 문서: [글 상세 페이지 편집형 리디자인 계획](../../redesign-plan.md)
- 상태: **3단계 최종 완료 — `aria-current` 수정 사항을 포함한 GitHub Pages 배포 후 검증 통과**

## 1. 범위와 결론

3단계는 새 디자인을 추가하는 단계가 아니라 `single-editorial` 레이아웃에서 기존 블로그 공통 기능이 유지되는지 확인하고 필요한 부분만 보완하는 단계다.

확인 대상은 다음과 같다.

- 이전 글·다음 글
- 같은 카테고리의 최신 글
- 카테고리와 태그
- Utterances 댓글
- Lunr 검색 결과와 기존 permalink

점검 결과 모든 기능이 이미 1단계 레이아웃에 연결돼 있었고 실제 GitHub Pages에서도 정상 동작했다. 따라서 기능을 다시 구현하지 않고, breadcrumb의 잘못된 접근성 속성 한 곳만 수정했다.

## 2. 현재 연결 구조

| 기능 | 구현 위치 | 현재 동작 |
| --- | --- | --- |
| 이전·다음 글 | `_includes/post/editorial-pagination.html` | Jekyll의 `page.previous`, `page.next`를 사용해 전체 글의 날짜 순서로 이동 |
| 같은 카테고리의 최신 글 | `_includes/post/editorial-related.html` | 현재 글의 첫 번째 카테고리에서 현재 글과 Template 글을 제외하고 최신 4개 표시 |
| 카테고리 | `_includes/post/editorial-breadcrumb.html` | `_data/navigation.yml`의 카테고리 URL과 연결 |
| 태그 | `_layouts/single-editorial.html` | 상단 정보 chip으로 표시 |
| 댓글 | `_includes/comments.html`과 Utterances provider | production 환경이고 `page.comments`가 참일 때 iframe 로드 |
| 검색 | Minimal Mistakes Lunr 검색 | `search: true`, `search_full_content: true` 설정으로 제목·본문 검색 |

`single-editorial.html`은 위 include와 댓글 조건을 본문 이후의 `.editorial-post__after` 안에서 사용한다. 공통 검색 스크립트와 댓글 provider 스크립트는 부모 `default` 레이아웃의 기존 로딩 경로를 그대로 사용한다.

## 3. 적용한 수정

### 3.1 카테고리 breadcrumb의 `aria-current` 제거

기존 카테고리 링크에는 다음 속성이 있었다.

```html
<a href="카테고리 URL" aria-current="page">현재 카테고리</a>
```

이 링크가 가리키는 대상은 현재 글이 아니라 카테고리 목록 페이지다. 따라서 현재 페이지 링크임을 뜻하는 `aria-current="page"`는 의미상 맞지 않는다. 링크와 화면 디자인은 유지하고 해당 속성만 제거했다.

변경 파일:

- `_includes/post/editorial-breadcrumb.html`

### 3.2 태그 정책 유지

현재 `_config.yml`에는 태그 아카이브가 활성화돼 있지 않다. 존재하지 않는 태그 페이지로 연결되는 링크를 만들지 않기 위해 이번 단계에서는 태그를 클릭할 수 없는 정보 chip으로 유지했다.

태그 아카이브와 태그별 탐색은 홈·아카이브 작업을 다시 시작할 때 함께 결정한다.

## 4. GitHub Pages 대표 글 검증

다음 대표 글 4종을 실제 배포본에서 확인했다.

| 대표 글 | 이전·다음 | 관련 글 | 카테고리 | Utterances |
| --- | --- | ---: | --- | --- |
| [MOPL 개인 개발 리포트](https://jungh200000.github.io/categories/codeit-sprint/sprint-advanced-project/sprint-advanced-project08) | 이전·다음 모두 정상 | 4개 | Sprint 백엔드 고급 프로젝트 | iframe 로드 |
| [MOPL 프로젝트 회고록](https://jungh200000.github.io/categories/codeit-sprint/sprint-advanced-project/sprint-advanced-project09) | 이전만 표시되는 경계 조건 정상 | 4개 | Sprint 백엔드 고급 프로젝트 | iframe 로드 |
| [Spring Security TIL 67-1](https://jungh200000.github.io/categories/codeit-sprint/sprint-til/sprint-til067-1) | 이전·다음 모두 정상 | 4개 | Sprint TIL | iframe 로드 |
| [Weekly Paper 12](https://jungh200000.github.io/categories/codeit-sprint/sprint-weekly-paper/weekly-paper012) | 이전·다음 모두 정상 | 4개 | Sprint Weekly Paper | iframe 로드 |

추가 확인 결과는 다음과 같다.

- 관련 글에 현재 글이 다시 포함되지 않음
- 관련 글 URL과 카테고리 URL이 모두 기존 permalink를 사용함
- MOPL 리포트와 TIL의 이전·다음 링크 제목 및 URL이 실제 인접 글과 일치함
- MOPL 프로젝트 회고록은 현재 전체 글 순서의 마지막 글이므로 다음 글 없이 이전 글만 표시됨
- 대표 글 4종 모두 브라우저 콘솔 오류 없음

이전·다음 글은 같은 카테고리가 아니라 Jekyll 전체 글의 날짜 순서다. 같은 카테고리 탐색은 바로 아래의 관련 글 영역이 담당하므로 현재 역할 분리를 유지한다.

## 5. 검색과 permalink 검증

배포된 Lunr 검색에서 `MOPL 개인 개발 리포트`를 입력했을 때 해당 글이 첫 번째 결과로 표시되고 다음 기존 URL로 연결됐다.

```text
/categories/codeit-sprint/sprint-advanced-project/sprint-advanced-project08
```

레이아웃 이름은 검색 URL이나 permalink 생성에 사용되지 않으므로 `single-editorial` 적용 전후 URL이 유지된다.

현재 Lunr 검색은 한국어 검색어를 정교하게 형태소 분석하지 않아 구체적인 검색어에도 결과가 넓게 나올 수 있다. 정확한 대표 글이 첫 결과에 나오고 기존 URL로 이동하는 것은 확인했으며, 검색 품질 개선은 이번 단계의 범위에 포함하지 않는다.

## 6. 모바일 하단 영역 검증

390×844 화면에서 MOPL 리포트와 Weekly Paper의 하단 공통 기능을 확인했다.

| 항목 | 측정 결과 |
| --- | --- |
| 문서 전체 | `clientWidth 380px`, `scrollWidth 380px` |
| 하단 콘텐츠 | 320px |
| 이전·다음 링크 | 각 320px, 한 열 배치 |
| 관련 글 카드 | 각 320px, 한 열 배치 |
| Utterances iframe | 320px |

하단 기능 때문에 페이지 전체 가로 스크롤이 생기지 않았고, 다음 글 링크의 오른쪽 정렬도 모바일에서는 왼쪽 정렬로 전환됐다.

## 7. 검증 범위와 최종 확인

완료한 검증:

- 대표 글 4종의 실제 GitHub Pages DOM과 링크 확인
- 관련 글 개수·현재 글 제외·카테고리 일치 확인
- Utterances 컨테이너와 iframe 로드 확인
- Lunr 검색 결과와 permalink 확인
- 390px 하단 카드·댓글 반응형과 페이지 가로 넘침 확인
- 브라우저 콘솔 오류 확인
- 배포된 대표 글 4종에서 breadcrumb의 `aria-current`가 제거됐는지 확인
- 고급 프로젝트·TIL·Weekly Paper 카테고리 링크가 각각 정상 카테고리 페이지로 이동하는지 확인
- `git diff --check`

현재 환경에는 Ruby와 Bundler가 없어 `bundle exec jekyll build --trace`는 실행하지 못했다. 대신 수정 사항이 반영된 GitHub Pages를 다시 확인했다. 대표 글 4종 모두 breadcrumb에 `aria-current`가 남아 있지 않았고, 카테고리 링크·이전/다음 글·관련 글·Utterances가 그대로 동작했다. 세 카테고리 대상 페이지도 404 없이 정상 렌더링됐으며 브라우저 콘솔 오류는 없었다. 추가로 남은 3단계 검증 항목은 없다.

## 8. 3단계 완료 판정

- 이전·다음 글: 완료
- 같은 카테고리의 최신 글: 완료
- 카테고리 링크: 완료
- 태그 정책: 링크 없는 정보 chip 유지로 확정
- Utterances 댓글: 완료
- 검색과 기존 permalink: 완료
- 모바일 하단 반응형: 완료
- `aria-current` 수정 배포 검증: 완료
- 3단계: **최종 완료**

다음 단계는 대표 글에서 검증한 `single-editorial`을 전체 posts 기본값으로 전환할지 결정하는 4단계다. 3단계 완료가 자동으로 전체 전환을 의미하지는 않는다.
