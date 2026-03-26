---
title: '[TIL 22일 차] Sprint Mission3 - 디스코드: `MessageService` 고도화와 `ReadStatusService`, `UserStatusService`, `BinaryContentService` 구현'
excerpt: ''

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til022/

toc: true
toc_sticky: true

date: 2026-01-30
last_modified_at: 2026-01-30
---

# 오늘의 성취

### 1. 개발 진행 상황

- `MessageService` 고도화
  - DTO를 활용해 `create`, `findAll`, `update`, `delete` 메소드 고도화
- `ReadStatusService` 구현
  - DTO를 활용해 `create`, `find`, `findAllByUserId`, `update`, `delete` 메소드 구현
- `UserStatusService` 구현
  - DTO를 활용해 `create`, `find`, `findAll`, `update`, `updateByUserId`, `delete` 메소드 구현
- `BinaryContentService` 구현
  - DTO를 활용해 `create`, `find`, `findAllByIdIn`, `delete` 메소드 구현
- 심화 요구사항 : 조건부 Bean 구성
  - `jcf`와 `file`에 따라 Repository 구현체 선택

### 2. `@ConditionalOnProperty(name = "discodeit.repository.type", havingValue = "file")`

- `prefix` : 프로퍼티 앞부분
- `name` : 프로퍼티 이름
- `havingValue` : 일치해야 할 값

---

# 프로젝트 요구사항

`// ...`

#### 4) MessageService 고도화

- 고도화
  - `create`
    - [x] 선택적으로 여러 개의 첨부파일을 같이 등록할 수 있습니다.
    - [x] DTO를 활용해 파라미터를 그룹화합니다.
  - `findAll`
    - [x] 특정 `Channel`의 Message 목록을 조회하도록 조회 조건을 추가하고, 메소드 명을 변경합니다. `findallByChannelId`
  - `update`
    - [x] DTO를 활용해 파라미터를 그룹화합니다.
      - 수정 대상 객체의 id 파라미터, 수정할 값 파라미터
  - `delete`
    - [x] 관련된 도메인도 같이 삭제합니다.
      - 첨부파일(`BinaryContent`)

- 의존성
  - 같은 레이어 간 의존성 주입은 순환 참조 방지를 위해 지양합니다. 다른 Service 대신 필요한 Repository 의존성을 주입해보세요.

  <img src="https://github.com/JungH200000/JungH200000.github.io/blob/categories-ver2/assets/images/posts_img/requirements/sprint3/MessageService_dependency.png?raw=true" width=700px>

<br>

#### 5) ReadStatusService 구현

- `create`
  - [x] DTO를 활용해 파라미터를 그룹화합니다.
  - [x] 관련된 `Channel`이나 `User`가 존재하지 않으면 예외를 발생시킵니다.
  - [x] 같은 `Channel`과 `User`와 관련된 객체가 이미 존재하면 예외를 발생시킵니다.
- `find`
  - [x] `id`로 조회합니다.
- `findAllByUserId`
  - [x] `userId`를 조건으로 조회합니다.
- `update`
  - [x] DTO를 활용해 파라미터를 그룹화합니다.
    - 수정 대상 객체의 `id` 파라미터, 수정할 값 파라미터
- `delete`
  - [x] `id`로 삭제합니다.

- 의존성
  - 같은 레이어 간 의존성 주입은 순환 참조 방지를 위해 지양합니다. 다른 Service 대신 필요한 Repository 의존성을 주입해보세요.

  <img src="https://github.com/JungH200000/JungH200000.github.io/blob/categories-ver2/assets/images/posts_img/requirements/sprint3/ReadStatusService_dependency.png?raw=true" width=600px>

<br>

#### 6) UserStatusService 고도화

- `create`
  - [x] DTO를 활용해 파라미터를 그룹화합니다.
  - [x] 관련된 `User`가 존재하지 않으면 예외를 발생시킵니다.
  - [x] 같은 `User`와 관련된 객체가 이미 존재하면 예외를 발생시킵니다.
- `find`
  - [x] `id`로 조회합니다.
- `findAll`
  - [x] 모든 객체를 조회합니다.
- `update`
  - [x] DTO를 활용해 파라미터를 그룹화합니다.
    - 수정 대상 객체의 `id` 파라미터, 수정할 값 파라미터
- `updateByUserId`
  - [x] `userId` 로 특정 `User`의 객체를 업데이트합니다.
- `delete`
  - [x] `id`로 삭제합니다.

- 의존성
  - 같은 레이어 간 의존성 주입은 순환 참조 방지를 위해 지양합니다. 다른 Service 대신 필요한 Repository 의존성을 주입해보세요.

  <img src="https://github.com/JungH200000/JungH200000.github.io/blob/categories-ver2/assets/images/posts_img/requirements/sprint3/UserStatusService_dependency.png?raw=true" width=400px>

<br>

#### 7) BinaryContentService 구현

- `create`
  - [x] DTO를 활용해 파라미터를 그룹화합니다.
- `find`
  - [x] `id`로 조회합니다.
- `findAllByIdIn`
  - [x] `id` 목록으로 조회합니다.
- `delete`
  - [x] `id`로 삭제합니다.

- 의존성
  - 같은 레이어 간 의존성 주입은 순환 참조 방지를 위해 지양합니다. 다른 Service 대신 필요한 Repository 의존성을 주입해보세요.

  <img src="https://github.com/JungH200000/JungH200000.github.io/blob/categories-ver2/assets/images/posts_img/requirements/sprint3/BinaryContentService_dependency.png?raw=true" width=300px>

<br>

#### 8) 새로운 도메인 Repository 구현체 구현

- [x] 지금까지 인터페이스로 설계한 각각의 Repository를 JCF, File로 각각 구현하세요.

<img src="https://github.com/JungH200000/JungH200000.github.io/blob/categories-ver2/assets/images/posts_img/requirements/sprint3/repo_imple.png?raw=true" width=400px>

---

## 4. 심화 요구사항

### 4-1. Bean 다루기

- [x] Repository 구현체 중에 어떤 구현체를 Bean으로 등록할지 Java 코드의 변경 없이 `application.yaml` 설정 값을 통해 제어해보세요.

  ```yaml
  # application.yaml
  discodeit:
    repository:
      type: jcf # jcf | file
  ```

  - [x] `discodeit.repository.type` 설정값에 따라 Repository 구현체가 정해집니다.
    - [x] 값이 `jcf` 이거나 없으면 JCF\*Repository 구현체가 Bean으로 등록되어야 합니다.
    - [x] 값이 `file` 이면 File\*Repository 구현체가 Bean으로 등록되어야 합니다.

- [x] File\*Repository 구현체의 파일을 저장할 디렉토리 경로를 `application.yaml` 설정 값을 통해 제어해보세요.

  ```yaml
  # application.yaml
  discodeit:
    repository:
      type: jcf # jcf | file
      file-directory: .discodeit
  ```

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint3](https://github.com/JungH200000/10-sprint-mission/tree/sprint3)
