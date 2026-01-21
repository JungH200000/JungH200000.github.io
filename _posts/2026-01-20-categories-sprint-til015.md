---
title: '[TIL 15일차] Sprint Mission2.2 - 디스코드: 관심사 분리를 통한 레이어 간 의존성 주입
'
excerpt: ''

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til015/

toc: true
toc_sticky: false

date: 2026-01-21
last_modified_at: 2026-01-21
---

# 1. 오늘의 성취

1. 개발 진행 상황
   - 관심사 분리를 통한 레이어 간 의존성 주입
     - 이전에는 `Service`로 의존성을 나타냈다면, 이번에는 `Service`가 아닌 `Repository`로 의존성을 나타냄

2. `JCF*Service`랑 `File*Service`의 공통점과 차이점
   - 공통점
     - 비즈니스 규칙과 검증 로직은 거의 동일
     - 도메인 객체를 생성하고, 수정하는 로직도 거의 동일
   - 차이점
     - `JCF*Service`에서 데이터는 Map을 활용하기 때문에 실행 중 메모리에만 있고, 프로그램이 종료하면 사라진다.
     - `File*Service`에서 데이터는 시작할 때 파일에서 이전 데이터를 로드하여 메모리에 올려 사용하고, 작업한 데이터를 다시 파일에 저장할 수 있다.
     - 즉, 저장 로직에서 차이가 난다.

---

# 2. 프로젝트 요구사항

## 기본 요구사항

### File IO를 통한 데이터 영속화

- [x] 다음의 조건을 만족하는 서비스 인터페이스의 구현체를 작성하세요.
  - [x] 클래스 패키지명: `com.sprint.mission.discodeit.service.file`
  - [x] 클래스 네이밍 규칙: `File[인터페이스 이름]`
  - [x] JCF 대신 FileIO와 객체 직렬화를 활용해 메소드를 구현하세요.
  - [객체 직렬화/역직렬화 가이드](https://codeit.notion.site/13b6fd228e8d80c6b144cdfbf518a9f7)

- [x] `Application`에서 서비스 구현체를 `File*Service`로 바꾸어 테스트해보세요.

### 서비스 구현체 분석

- [x] `JCF*Service` 구현체와 `File*Service` 구현체를 비교하여 공통점과 차이점을 발견해보세요.
  - [x] "비즈니스 로직"과 관련된 코드를 식별해보세요.
  - [x] "저장 로직"과 관련된 코드를 식별해보세요.

### 레포지토리 설계 및 구현

참고: 레포지토리는 데이터를 관리하는 로직을 가짐

- [x] "저장 로직"과 관련된 기능을 도메인 모델 별 인터페이스로 선언하세요.
  - [x] 인터페이스 패키지명: `com.sprint.mission.discodeit.repository`
  - [x] 인터페이스 네이밍 규칙: `[도메인 모델 이름]Repository`

- [x] 다음의 조건을 만족하는 레포지토리 인터페이스의 구현체를 작성하세요.
  - [x] 클래스 패키지명: `com.sprint.mission.discodeit.repository.jcf`
  - [x] 클래스 네이밍 규칙: `JCF[인터페이스 이름]`
  - [x] 기존에 구현한 `JCF*Service` 구현체의 "저장 로직"과 관련된 코드를 참고하여 구현하세요.

- [x] 다음의 조건을 만족하는 레포지토리 인터페이스의 구현체를 작성하세요.
  - [x] 클래스 패키지명: `com.sprint.mission.discodeit.repository.file`
  - [x] 클래스 네이밍 규칙: `File[인터페이스 이름]`
  - [x] 기존에 구현한 `File*Service` 구현체의 "저장 로직"과 관련된 코드를 참고하여 구현하세요.

## 심화 요구 사항

### 관심사 분리를 통한 레이어 간 의존성 주입

- [x] 다음의 조건을 만족하는 서비스 인터페이스의 구현체를 작성하세요.
  - [x] 클래스 패키지명: `com.sprint.mission.discodeit.service.basic`
  - [x] 클래스 네이밍 규칙: `Basic[인터페이스 이름]`
  - [x] 기존에 구현한 서비스 구현체의 "비즈니스 로직"과 관련된 코드를 참고하여 구현하세요.
  - [x] 필요한 Repository 인터페이스를 필드로 선언하고 생성자를 통해 초기화하세요.
  - [x] "저장 로직"은 Repository 인터페이스 필드를 활용하세요. (직접 구현하지 마세요.)

- [x] `Basic*Service` 구현체를 활용하여 테스트해보세요.

  ```java
  public class JavaApplication {
      static User setupUser(UserService userService) {
          User user = userService.create("woody", "woody@codeit.com", "woody1234");
          return user;
      }

      static Channel setupChannel(ChannelService channelService) {
          Channel channel = channelService.create(ChannelType.PUBLIC, "공지", "공지 채널입니다.");
          return channel;
      }

      static void messageCreateTest(MessageService messageService, Channel channel, User author) {
          Message message = messageService.create("안녕하세요.", channel.getId(), author.getId());
          System.out.println("메시지 생성: " + message.getId());
      }

      public static void main(String[] args) {
          // 서비스 초기화
          // TODO Basic*Service 구현체를 초기화하세요.
          UserService userService;
          ChannelService channelService;
          MessageService messageService;

          // 셋업
          User user = setupUser(userService);
          Channel channel = setupChannel(channelService);
          // 테스트
          messageCreateTest(messageService, channel, user);
      }
  }
  ```

  - [x] `JCF*Repository` 구현체를 활용하여 테스트해보세요.
  - [x] `File*Repository` 구현체를 활용하여 테스트해보세요.

- [x] 이전에 작성했던 코드(`JCF*Service` 또는 `File*Service`)와 비교해 어떤 차이가 있는지 정리해보세요.

---

# 3. GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint2](https://github.com/JungH200000/10-sprint-mission/tree/sprint2)
