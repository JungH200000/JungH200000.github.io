---
title: '[TIL 20일 차] Sprint Mission3 - 디스코드: 새로운 도메인 추가와 `UserService` 고도화'
excerpt: '3-1. 시간 타입 변경하기 ~ 3-3. DTO 활용하기-1) UserService 고도화'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til020/

toc: true
toc_sticky: true

date: 2026-01-28
last_modified_at: 2026-01-28
---

# 오늘의 성취

## 1. 개발 진행 상황

- 시간 관련 필드 타입을 `Instant`로 변경
- 새로운 도메인 추가
  - 사용자가 채널별 마지막으로 메시지 읽은 시간을 저장하는 `ReadStatus` 도메인 구현
  - 사용자별 마지막으로 확인된 접속 시간을 저장하는 `UserStatus` 도메인 구현
  - 바이너리 데이터를 저장하는 `BinaryContent` 도메인 구현
- DTO와 `UserStatus`, `BinaryContent` 도메인을 이용한 `UserService` 고도화

<br>

## 2. 고민

### 바이너리 데이터를 저장할 때 byte 타입으로 하면 안될까?

- byte는 단일 8비트 정수 값을 저장하는 기본형
- byte[](byte 배열)은 여러 개의 byte를 연속적으로 저장하는 자료 구조
- byte를 사용하면 용량이 1바이트라서 바이너리 데이터 저장이 불가능하지만 byte[]을 사용하면 파일 크기만큼 저장 가능하다,

### Bean? `new`?

- Spring에서 Bean으로 관리해야 할 것들은 상태를 공유하거나(싱글톤), 의존성을 주입 받는 컴포넌트(Service/Repository/Controller) 같은 것들
- 도메인 객체는 보통 매 요청/호출마다 새로 만들어 사용하니 `new`로 만듦

### Array(배열) 비교

- `Arrays.equals(a, b);` ➡️ a와 b 배열이 동일하면 `true` 반환

<br>

## 3. 문제

### Duration.toMinutes()는 버림(floor division) 처리가 적용됨

- 기존 코드 : `Duration.between(lastOnlineTime, Instant.now()).toMinutes() <= 5`
- 해결 : `Instant.now().isBefore(lastOnlineTime.plus(Duration.ofMinutes(5)))`
  - `lastOnlineTime`에 `Duration.ofMinutes(5)`(5분;300초)을 더한 `Instant` 반환

---

# 프로젝트 요구사항

`// ...`

## 3. 추가 기능 요구사항

### 3-1. 시간 타입 변경하기

- [x] 시간을 다루는 필드의 타입은 `Instant`로 통일합니다.
  - 기존에 사용하던 `Long`보다 가독성이 뛰어나며, 시간대(Time Zone) 변환과 정밀한 시간 연산이 가능해 확장성이 높습니다.

<br>

### 3-2. 새로운 도메인 추가하기

- 도메인 모델 간 참조 관계를 참고하세요.

   <img src="https://github.com/JungH200000/JungH200000.github.io/blob/categories-ver2/assets/images/posts_img/requirements/sprint3/domain_reference.png?raw=true" width=550px>

- [x] 공통: 앞서 정의한 도메인 모델과 동일하게 공통 필드(`id`, `createdAt`, `updatedAt`)를 포함합니다.
- [x] `ReadStatus`
  - 사용자가 채널 별 마지막으로 메시지를 읽은 시간을 표현하는 도메인 모델입니다. 사용자별 각 채널에 읽지 않은 메시지를 확인하기 위해 활용합니다.

- [x] `UserStatus`
  - 사용자 별 마지막으로 확인된 접속 시간을 표현하는 도메인 모델입니다. 사용자의 온라인 상태를 확인하기 위해 활용합니다.
  - [x] 마지막 접속 시간을 기준으로 현재 로그인한 유저로 판단할 수 있는 메소드를 정의하세요.
    - 마지막 접속 시간이 현재 시간으로부터 5분 이내이면 현재 접속 중인 유저로 간주합니다.

- [x] `BinaryContent`
  - 이미지, 파일 등 바이너리 데이터를 표현하는 도메인 모델입니다. 사용자의 프로필 이미지, 메시지에 첨부된 파일을 저장하기 위해 활용합니다.
  - [x] 수정 불가능한 도메인 모델로 간주합니다. 따라서 `updatedAt` 필드는 정의하지 않습니다.
  - [x] `User`, `Message` 도메인 모델과의 의존 관계 방향성을 잘 고려하여 `id` 참조 필드를 추가하세요.

- [x] 각 도메인 모델 별 레포지토리 인터페이스를 선언하세요.

- 레포지토리 구현체(File, JCF)는 아직 구현하지 마세요. 이어지는 서비스 고도화 요구사항에 따라 레포지토리 인터페이스에 메소드가 추가될 수 있어요.

<br>

### 3-3. DTO 활용하기

#### 1) UserService 고도화

- 고도화
  - `create`
    - [x] 선택적으로 프로필 이미지를 같이 등록할 수 있습니다.
    - [x] DTO를 활용해 파라미터를 그룹화합니다.
      - 유저를 등록하기 위해 필요한 파라미터, 프로필 이미지를 등록하기 위해 필요한 파라미터 등
    - [x] `username`과 `email`은 다른 유저와 같으면 안됩니다.
    - [x] `UserStatus`를 같이 생성합니다.

  - `find`, `findAll`
    - DTO를 활용하여:
      - [x] 사용자의 온라인 상태 정보를 같이 포함하세요.
      - [x] 패스워드 정보는 제외하세요.

  - `update`
    - [x] 선택적으로 프로필 이미지를 대체할 수 있습니다.
    - [x] DTO를 활용해 파라미터를 그룹화합니다.
      - 수정 대상 객체의 id 파라미터, 수정할 값 파라미터

  - `delete`
    - [x] 관련된 도메인도 같이 삭제합니다.
      - `BinaryContent`(프로필), `UserStatus`

- 의존성
  - 같은 레이어 간 의존성 주입은 순환 참조 방지를 위해 지양합니다. 다른 Service 대신 필요한 Repository 의존성을 주입해보세요.

    <img src="https://github.com/JungH200000/JungH200000.github.io/blob/categories-ver2/assets/images/posts_img/requirements/sprint3/dependency.png?raw=true" width=700px>

`//...`

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint3](https://github.com/JungH200000/10-sprint-mission/tree/sprint3)
