---
title: '[TIL 33~35일 차] Sprint Mission5 - 구현한 API를 API 스펙에 맞춰 RESTful API로 다시 설계'
excerpt: 'ChannelController, MessageController, ReadStatusController, BinaryController 수정'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til033~35/

toc: true
toc_sticky: true

date: 2026-02-16
last_modified_at: 2026-02-19
---

# 오늘의 학습

### 1. 개발 진행 상황

- Spring Mission4에서 구현한 API를 API 스펙에 맞춰 RESTful API로 다시 설계
  - `ChannelController`에서 "공개 채널 생성", "비공개 채널 생성", "특정 유저에 대한 채널 조회", "채널 업데이트", "채널 삭제" 기능 API 수정
  - `MessageController`에서 "메시지 생성", "메시지 수정", "특정 채널의 모든 메시지 조회", "메시지 삭제" 기능 API 수정
  - `ReadStatusController`에서 "메시지 읽음 상태 생성", "메시지 읽음 상태 수정", "특정 유저의 메시지 읽음 상태 목록 조회" API 수정
  - `BinaryController`에서 "바이너리 파일 1개 조회", "바이너리 파일 여러 개 조회" API 수정
  - 각 컨트롤러에 문서화 애너테이션 추가
    - `@Tag`로 핸들러 클래스 설명 추가
    - `@Operation`으로 핸들러 메서드 설명 추가
    - `@ApiResponse`로 성공/예외 코드 및 설명 추가
    - `@Parameter`로 request 설명 추가
- Spring Mission5 화면 가이드에서 보여지는 동작에 대한 수정
  - `UserService`
    - 유저 삭제 시 메시지는 존재함. -> 유저 삭제 시 유저와 UserStatus, binaryContent만 삭제되도록
      - 메시지 조회/응답에서 author가 없으면? author의 id를 찾는 로직에 예외 발생 -> null로 대체하도록 설정
      - 이미 프론트에서는 유저 목록과 메시지의 authorId를 대조해서 못 찾으면 유저는 `undefined`가 되게 설정되어 있음
  - `ChannelService`와 `MessageRepository`, `ReadStatusService`
    - 채널 삭제할 때 채널의 message와 ReadStatus 전체 삭제
      - **해결**
        - userId와 ChannelId로 ReadStatus가 있는지 검증 X -> User가 이미 삭제된 상태면 확인 불가
        - message repo에서 channelId에 따라 메시지 전체 삭제 로직 추가
        - channelId만으로 채널의 모든 ReadStatus도 삭제
  - `MessageService`
    - 공개 채널은 채널 참여 여부와 관계 없이 모두 메시지를 생성할 수 있어야 한다.
      - **해결** : 공개 채널에 한해서 메시지 관련해서 채널 참여자인지에 대한 검증 로직 삭제
  - `ReadStatusService`
    - 공개 채널에서는 누구든지 참여하므로 메시지 읽음 상태(`ReadStatus`)를 create할 때 채널 참여 여부 상관 없이 생성
      - **해결** : `ReadStatusService`에서 채널 참여 여부와 관련된 검증 로직 삭제 처리
  - 구현할 때, 채널 생성 시 owner가 설정되고, 삭제와 수정 같은 작업을 할 때 owner인지 검증하도록 했지만, 요구사항에 존재하지 않고 프론트엔드에서 제대로 동작하지 않을 수 있기 때문에 owner 검증 관련 로직 전체 삭제 처리

### 2. 사용한 문서화 애너테이션의 역할이 뭐지??

- `@Tag` : 컨트롤러(핸들러 클래스)를 기능·도메인 단위로 묶는 그룹 정보를 추가하는 애너테이션
- `@Operation` : 특정 엔드포인트(핸들러 메서드) 하나가 무슨 일을 하는지 요약·설명하는 애너테이션
- `@ApiResponse` : 해당 엔드포인트가 반환할 수 있는 응답 코드별 설명과 응답 바디 스키마·예시를 문서에 명시하는 애너테이션
- `@Parameter` : 요청 파라미터(경로 변수, 쿼리 파라미터, 헤더 등)의 의미·필수 여부·예시·제약 조건을 문서화하는 애너테이션(이 값이 뭔지, 어떤 형식인지 등)

---

# 프로젝트 요구 사항

`// ...`

## 3. 기본 요구사항

- [x] 스프린트 미션#4에서 구현한 API를 RESTful API로 다시 설계해보세요.
  - [API 스펙](https://github.com/JungH200000/JungH200000.github.io/blob/categories-ver2/assets/images/posts_img/requirements/sprint5/api-docs.json)을 확인하고 본인이 설계한 API와 비교해보세요.
  - [oasdiff](https://www.oasdiff.com/diff-calculator)를 활용하면 좀 더 수월하게 비교할 수 있어요.
  - API 설계에 정답은 없지만, 이어지는 요구사항과 미션을 원활히 수행하기 위해 제공된 API 스펙에 맞추어 구현해주세요.
  - 특히, 심화 요구사항에서 제공되는 프론트엔드 코드는 제공된 API 스펙을 준수해야 연동할 수 있습니다.
- [x] Postman을 활용해 컨트롤러를 테스트 하세요.
  - Postman API 테스트 결과를 export하여 PR에 첨부해주세요.
- [x] **springdoc-openapi**를 활용하여 Swagger 기반의 API 문서를 생성하세요.
- [x] Swagger-UI를 활용해 API를 테스트해보세요.

---

## 4. 심화 요구사항

- [x] 다음의 정적 리소스를 서빙하여 프론트엔드와 통합해보세요. API 스펙을 준수했다면 잘 동작할거예요.

  > [fe_1.0.0.zip](https://github.com/JungH200000/JungH200000.github.io/blob/categories-ver2/assets/images/posts_img/requirements/sprint5/fe_1.0.0.zip)

  > [화면 가이드](https://codeit.notion.site/18f6fd228e8d80828264ca0b1fb4078f)

- [x] [Railway.app](https://railway.com/)을 활용하여 애플리케이션을 배포해보세요.
  - Railway.app은 애플리케이션을 쉽게 배포할 수 있도록 도와주는 PaaS입니다.
  - [x] [Railway.app](https://railway.com/)에 가입하고, 배포할 GitHub 레포지토리를 연결하세요.
  - [x] `Settings > Network` 섹션에서 `Generate Domain` 버튼을 통해 도메인을 생성하세요.
  - [x] 생성된 도메인에 접속해 배포된 애플리케이션을 테스트해보세요.

> 무료 사용 제한이 있으므로, 코드 리뷰 이후에는 배포 인스턴스를 삭제해주세요.

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint5](https://github.com/JungH200000/10-sprint-mission/tree/sprint5)
