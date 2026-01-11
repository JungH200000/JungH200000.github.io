---
title: '위클리페이퍼01: Git을 통한 버전 관리'
excerpt: ''

categories:
  - Sprint Weekly Paper
tags:
  - [Codeit Sprint, Codeit Sprint Weekly Paper]

permalink: /categories/codeit-sprint/sprint-weekly-paper/weekly-paper001/

toc: true
toc_sticky: true

date: 2026-01-02
last_modified_at: 2026-01-06
---

# Q1. `git rebase`와 `git merge`의 차이점을 설명하고, 각각 어떤 상황에서 사용하는 것이 더 적절한지 설명해주세요.

## 1. 차이점

### `git merge`

두 branch를 합칠 때 사용하는 명령어

- branch가 생성되고 병합된 모든 history가 남음. (merge commit이 생성됨)
- branch 그래프로 보면 여러 branch가 merge commit에서 합쳐지는 것을 볼 수 있음

- 종류

  - 3-way merge

    branch에 각각 신규 commit이 1회 이상 있는 경우, `git merge` 를 하면 두 branch의 코드를 합쳐 새로운 merge commit을 자동으로 생성

    <img src="https://github.com/JungH200000/JungH200000.github.io/blob/categories-ver2/assets/images/posts_img/weeklypaper/3-way-merge(codingapple).png?raw=true" width=400px>

  - fast-forward merge
    신규 branch에만 commit이 있고 기준이 되는 branch에는 신규 commit이 없을 때 딱히 합칠게 없으므로 신규 branch의 이름을 기준이 되는 branch 이름으로 변경

    <img src="https://github.com/JungH200000/JungH200000.github.io/blob/categories-ver2/assets/images/posts_img/weeklypaper/fast-forward_merge(codingapple).png?raw=true" width=450px>

<br>

### `git rebase`

한 branch의 시작점을 다른 branch의 최신 commit 끝으로 옮기는 명령어

- history가 한 줄(선형적)로 다시 정렬됨
- commit history가 깔끔해지고 가독성이 좋아짐
- 공개된 branch에서는 사용을 피해야 함

<br>

### **사용 예시**

- 조건
  - A branch의 commit : `DB 연결` → `로그인 API` → `권한 확인`
  - B branch의 commit : `DB 연결` → `회원가입 API` → `이메일 인증`
  - A branch의 `로그인 API` commit이 B branch의 `회원가입 API` 과 `이메일 인증` commit 사이 시간에 commit 됨
- commit history
  - **`git merge B`** :
    - `DB 연결` → `회원가입 API` → `로그인 API` → `이메일 인증` → `권한 확인` → `merge commit`
    - 그래프로 보면 두 branch가 나뉘어 진행되다가 `merge commit`에서 합쳐짐
  - **`git rebase B`** : `DB 연결` → `회원가입 API` → `이메일 인증` → `로그인 API` → `권한 확인`

<br>

## 2. 사용하기 적절한 상황

### `git merge`

- 모든 commit history를 보존해야 할 때
  - 함께 사용하는 공개 branch(Main 등)에 기능을 합칠 때
  - 두 기능이 합쳐짐을 명확히 남길 때

### `git rebase`

- 개인 branch의 commit history를 정리할 때
- 로컬의 작업 branch를 최신 main과 동기화할 때

---

# Q2. `git fetch`와 `git pull`의 차이점을 설명하고, 각각을 사용하는 것이 적절한 상황을 설명해주세요.

## 1. 차이점

### `git fetch`

원격 저장소의 최신 commit(변경사항)을 로컬 저장소로 가져오는 명령어

- 가져오기만 하고, 자동 병합(merge)하지 않음
- 현재 작업 branch가 아닌 `origin/main` 같은 별도의 branch에 저장
- 실제 파일에 영향 없이 `.git` 내부의 history만 업데이트
- `git log`로 commit(변경사항)을 확인하고, `git merge` or `git rebase`로 병합
  ⇒ **안전함**

<br>

### `git pull`

원격 저장소의 최신 commit(변경사항)을 내 로컬 저장소로 가져와 자동 병합까지 수행하는 명령어

- 내부적으로 `git fetch` → `git merge` 로 동작
- commit(변경사항)을 가져오자마자 로컬에 있는 코드와 합치기 때문에, 수정 중인 파일이 겹칠 경우 **충돌(conflict)** 발생할 수 있음

<img src="https://github.com/JungH200000/JungH200000.github.io/blob/categories-ver2/assets/images/posts_img/weeklypaper/git.png?raw=true" width=600px>

<br>

### 사용 예시

- `git fetch origin(원격 저장소 이름)` → `git merge origin/main`
  - 원격 저장소(`origin`)에 있는 최신 commit을 현재 로컬 branch로 가져오는 것
- `git pull origin main` ( = `git fetch origin` + `git merge origin/main`)

<br>

## 2. 사용하기 적절한 상황

### `git fetch`

- 파일 변경 없이 최신 commit(변경 사항)을 확인하고 싶을 때

### `git pull`

- 원격 저장소의 commit(변경사항)을 로컬 저장소에 바로 반영하고 싶을 때
  (+ 충돌이 일어나지 않을 것이라는 확신)
