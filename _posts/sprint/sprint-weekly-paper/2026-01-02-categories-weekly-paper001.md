---
title: '위클리페이퍼01: Git을 통한 버전 관리'
excerpt: ''

categories:
  - Sprint Weekly Paper
tags:
  - [Codeit Sprint, Codeit Sprint Weekly Paper]

permalink: /categories/codeit-sprint/sprint-weekly-paper/weekly-paper001

toc: true
toc_sticky: true

date: 2026-01-02
last_modified_at: 2026-01-06
---

## Q1. `git rebase`와 `git merge`의 차이점을 설명하고, 각각 어떤 상황에서 사용하는 것이 더 적절한지 설명해주세요.

### Q1-1. 답변

#### 1. 차이점

##### `git merge`

두 branch를 합칠 때 사용하는 명령어

- branch가 생성되고 병합된 모든 history가 남음. (merge commit이 생성됨)
- branch 그래프로 보면 여러 branch가 merge commit에서 합쳐지는 것을 볼 수 있음
  - 종류
    - 3-way merge
      - branch에 각각 신규 commit이 1회 이상 있는 경우, `git merge` 를 하면 두 branch의 코드를 합쳐 새로운 merge commit을 자동으로 생성
        <img src="https://github.com/JungH200000/JungH200000.github.io/blob/categories-ver2/assets/images/posts_img/weeklypaper/3-way-merge(codingapple).png?raw=true" width=500px>
        > 출처: coding apple
    - fast-forward merge
      - 신규 branch에만 commit이 있고 기준이 되는 branch에는 신규 commit이 없을 때 딱히 합칠게 없으므로 신규 branch의 이름을 기준이 되는 branch 이름으로 변경
        <img src="https://github.com/JungH200000/JungH200000.github.io/blob/categories-ver2/assets/images/posts_img/weeklypaper/fast-forward_merge(codingapple).png?raw=true" width=500px>
        > 출처: coding apple

##### `git rebase`

한 branch의 시작점을 다른 branch의 최신 commit 끝으로 옮기는 명령어

- history가 한 줄로 다시 정렬됨

##### **사용 예시**

- 조건
  - A branch의 commit : `DB 연결` → `로그인 API` → `권한 확인`
  - B branch의 commit : `DB 연결` → `회원가입 API` → `이메일 인증`
  - A branch의 `로그인 API` commit이 B branch의 `회원가입 API` 과 `이메일 인증` commit 사이 시간에 commit 됨
- commit history
  - `git merge B`
    - `DB 연결` → `회원가입 API` → `로그인 API` → `이메일 인증` → `권한 확인` → `merge commit`
    - 그래프로 보면 두 branch가 나뉘어 진행되다가 `merge commit`에서 합쳐짐
  - `git rebase B`
    - `DB 연결` → `회원가입 API` → `이메일 인증` → `로그인 API` → `권한 확인`

#### 2. 사용하기 적절한 상황

##### `git merge`

- 모든 commit history를 보존해야 할 때
  - 함께 사용하는 공용 branch(Main 등)에 기능을 합칠 때
  - 두 기능이 합쳐짐을 명확히 남길 때

##### `git rebase`

- 로컬에서 개인 작업하던 commit history를 정리할 때

<br>

### Q1-2. 정리

`git rebase`와 `git merge`는 모두 한 브랜치의 변경사항을 다른 브랜치에 통합하는 방법이지만, 동작 방식과 결과가 다릅니다.

`git merge`:

- 두 브랜치의 최신 커밋을 가리키는 새로운 머지 커밋을 생성합니다.
- 브랜치의 전체 히스토리가 보존됩니다.
- 협업 시 브랜치의 컨텍스트가 명확하게 유지됩니다.
- 충돌 해결이 비교적 간단합니다.

`git rebase`:

- 한 브랜치의 커밋들을 다른 브랜치의 최신 커밋 뒤로 재배치합니다.
- 히스토리가 선형적으로 정리됩니다.
- 커밋 히스토리가 깔끔해지고 가독성이 좋아집니다.
- 공개된 브랜치에서는 사용을 피해야 합니다.

사용 상황:

- merge: 팀 프로젝트의 feature 브랜치를 main에 통합할 때, 공개된 브랜치 작업시
- rebase: 로컬의 작업 브랜치를 최신 main과 동기화할 때, 개인 브랜치의 히스토리 정리시

---

## Q2. `git fetch`와 `git pull`의 차이점을 설명하고, 각각을 사용하는 것이 적절한 상황을 설명해주세요.

### Q2-1. 답변

#### 1. 차이점

##### `git fetch`

원격 저장소의 최신 commit(변경사항)을 로컬 저장소로 가져오는 명령어

- 가져오기만 하고, 자동 병합(merge)하지 않음
- 현재 작업 branch가 아닌 `origin/main` 같은 별도의 branch에 저장
- 실제 파일에 영향 없이 `.git` 내부의 history만 업데이트
- `git log`로 commit(변경사항)을 확인하고, `git merge` or `git rebase`로 병합
  ⇒ **안전함**

##### `git pull`

원격 저장소의 최신 commit(변경사항)을 내 로컬 저장소로 가져와 자동 병합까지 수행하는 명령어

- 내부적으로 `git fetch` → `git merge` 로 동작
- commit(변경사항)을 가져오자마자 로컬에 있는 코드와 합치기 때문에, 수정 중인 파일이 겹칠 경우 **충돌(conflict)** 발생할 수 있음

<img src="https://github.com/JungH200000/JungH200000.github.io/blob/categories-ver2/assets/images/posts_img/weeklypaper/git.png?raw=true" width=600px>

##### 사용 예시

- `git fetch origin(원격 저장소 이름)` → `git merge origin/main`
  - 원격 저장소(`origin`)에 있는 최신 commit을 현재 로컬 branch로 가져오는 것
- `git pull origin main` ( = `git fetch origin` + `git merge origin/main`)

#### 2. 사용하기 적절한 상황

##### `git fetch`

- 파일 변경 없이 최신 commit(변경 사항)을 확인하고 싶을 때

##### `git pull`

- 원격 저장소의 commit(변경사항)을 로컬 저장소에 바로 반영하고 싶을 때
  (+ 충돌이 일어나지 않을 것이라는 확신)

<br>

### Q2-2. 정리

`git fetch`와 `git pull`은 원격 저장소의 변경사항을 가져오는 명령어이지만, 동작 방식과 사용 목적이 다릅니다.

`git fetch`는 원격 저장소의 변경사항을 확인만 하고, 자동으로 병합하지 않습니다. 변경사항을 로컬 저장소에 가져오지만, 작업 중인 브랜치에는 영향을 주지 않습니다. 이후 `git diff` 명령어로 변경사항을 검토한 후, 필요한 경우에만 수동으로 병합할 수 있습니다.

반면 `git pull`은 fetch와 merge를 동시에 수행합니다. 원격 저장소의 변경사항을 가져와서 현재 작업 중인 브랜치에 자동으로 병합합니다.

fetch는 다음과 같은 상황에서 유용합니다:

- 원격의 변경사항을 먼저 검토하고 싶을 때
- 병합 전에 충돌 가능성을 확인하고 싶을 때
- 팀원들의 작업 진행 상황을 확인하고 싶을 때

pull은 다음과 같은 상황에서 적합합니다:

- 원격의 최신 변경사항을 즉시 반영해야 할 때
- 팀원들의 작업을 신뢰할 수 있고 즉시 통합이 필요할 때
