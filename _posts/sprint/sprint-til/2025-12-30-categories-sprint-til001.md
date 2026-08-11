---
layout: single-editorial
title: '[TIL 1일 차] CLI와 GIT'
excerpt: ''

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til001/

toc: true
toc_sticky: true

date: 2025-12-30
last_modified_at: 2025-01-06
---

# 오늘의 학습

## <span style="background-color: #FFF9C4">1. CLI (Command Line Interface)</span>

- GUI보다 강력하고 유연한 작업 처리 능력을 갖춤
- 많은 서버는 GUI 없이 운영됨
  - 수많은 서버에 입력장치를 연결하는 것은 불가능하기 때문에 CLI를 통해 원격으로 접속하고 명령을 전달
- 서버 운영과 프로젝트 배포, 에러 해결, 자동화 스크립트 작성 등 백엔드 개발의 핵심 업무에 필수적
- `pwd`, `mkdir`, `ls`, `touch`, `echo`, `cat`, `rm`, `mv` 등 기본 명령어 학습
- `A > B` 에서 `>`는 실행 결과 A를 파일 B로 저장하는 리다이렉션 기능

---

## <span style="background-color: #FFF9C4">2. Git 버전 관리</span>

### **Git**

- "형상 관리를 위한 소프트웨어 개발에서 사용되는 분산 버전 관리 시스템(Distributed Version Controll System, DVCS)"으로,
- 각 파일의 변경사항 추적 및 버전 관리, 파일 백업, 협업 등을 도와주는 프로그램

<br>

### **GitHub**

- 백업 기능과 협업 기능을 위해서는 온라인 원격 저장소가 필요한데 이 기능을 제공하는 대표적인 서비스

---

## <span style="background-color: #FFF9C4">3. Git의 3가지 작업 영역</span>

1. **Working Directory (작업 디렉토리)**
   - 사용자가 직접 파일을 수정하는 실제 작업 공간
2. **Staging Area (스테이징 영역)**
   - commit할 파일을 준비하는 임시 공간
   - `git add` 명령어로 Working Directory의 변경사항을 올림
3. **Local Repository (로컬 저장소)**
   - `git commit` 명령어로 변경 이력이 영구 저장되는 공간
   - 모든 commit은 고유한 ID(SHA-1 Hash)로 식별됨

---

## <span style="background-color: #FFF9C4">4. Git branch와 tag</span>

### **branch**

- Git과 같은 버전 관리 시스템에서 코드의 한 가지 버전 , 즉 분기점을 의미한다. 메인 코드에서 갈라져 나온 **독립적인 개발 공간**으로 병렬 작업을 가능하게 함

<br>

### **tag**

- Git에서 특정 commit에 이름표를 붙여 쉽게 식별할 수 있도록 하는 기능
- 주로 배포 버전, 릴리즈 후보, 중요한 기능 완성 시점 등에 사용됨
- ex) v1.0.0, v1.0.0-alpha, v1.0.0-beta, v1.0.0-rc.1

---

## <span style="background-color: #FFF9C4">5. Git을 이용한 협업</span>

### **원격 저장소 (Remote Repository)**

- 로컬 저장소와 연결되어 **인터넷 상에서 접근 가능한 Git 저장소**로, 로컬에서 작업한 내용을 **백업 및 공유**하고 협업에서의 변경사항을 **동기화** 가능
- 대표적인 서비스: **GitHub**, GitLab, Bitbucket 등
- **GitHub 명령어**
  - `git remote` : 로컬 저장소와 원격 저장소를 연결하거나 관리
  - `git clone` : 원격 저장소의 모든 파일 및 히스토리를 로컬로 복사할 때 사용
  - `git push` : 로컬 저장소에서 만든 commit을 원격 저장소에 전송
    - `git push -u origin main`
      - `-u` (`--set-upstream`) : 로컬 branch와 원격 branch를 서로 연결해주는 역할
        - 한 번 이 옵션을 사용해 연결해두면 `origin main` 필요없이 `git pull` 이나 `git push` 만 입력해도 자동으로 연결된 branch로 동작
      - `origin` : 기본 원격 저장소 이름
      - `main` : push 대상 branch 이름
  - `git pull` : 원격 저장소의 최신 변경사항을 내 로컬 저장소로 가져와 자동으로 병합까지 수행 (내부적으로는 `get fetch` → `git merge` 두 단계가 자동 수행됨
  - `git fetch` : 원격 저장소의 변경 사항을 가져오지만 병합은 하지 않는다.
    - 이후 `git diff origin/main` 또는 `git log origin/main` 등을 통해 변경사항 확인
    - 필요 시 병합 `git merge origin/main`
- **Pull Request**
  - 독립된 branch에서 작업한 내용을 **검토(review) 후 main branch에 병합(merge)**하기 위한 협업 절차
  - branch 기반 작업, 코드 리뷰, 품질 관리 가능
- **Fork**
  - 다른 사용자(또는 조직)의 GitHub 저장소를 내 계정 공간으로 복제하여 개발할 수 있도록 하는 기능
  - 오픈소스 프로젝트나 외부 팀의 저장소에 직접 수정 권한이 없는 경우에 사용
