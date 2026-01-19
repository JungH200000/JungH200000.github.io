---
title: '[TIL 14일차] Sprint Mission2.2 - 디스코드 File IO를 통한 데이터 영속화와 레포지토리 설계 및 구현'
excerpt: ''

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til014/

toc: true
toc_sticky: false

date: 2026-01-20
last_modified_at: 2026-01-20
---

# 1. 오늘의 성취

1. 개발 진행 현황
   - 피드백 받은 부분 수정 진행 : [Sprint2-1 Feedback](https://www.notion.so/jungh20000/Sprint2-1-Feedback-2e9f59816c02804295a9f76a9f0d3c62)
   - 전반적으로 메소드의 파라미터에 객체가 아닌 id를 가지도록 리팩토링
   - 전반적으로 메소드명 의미가 명확하게 수정
   - `UserService`와 ChannelService`, `MessageService` 의존 관계 재설정
   - `JCFMessageService`
     - 의존 관계 `UserService`, `ChannelService` 추가
   - entity 내부 필드를 UUID에서 객체 자체를 저장하게 수정

2. 식별자(id)가 아닌 객체를 저장
   - 우리가 사용하는 프로그래밍 언어가 자바이기에, 객체로 모든걸(상태와 행위) 바라봐야 한다.
   - 만약 TV의 리모콘을 우리가 하나의 클래스로 만들어보면

     ```java
     class Remote {
         UUID tvId;
     }
     ```

   - 실제로 이렇게 만들면 리모콘은 "어떤 TV인지만" 알게 됨
   - 사용하려면 저 리모콘을 통해 TV를 선별하고 결국 TV에 가서 뭔갈 직접 해야해요

     ```java
     TV tv = tvService.find(remote.tvId);
     tv.increaseVolume();
     ```

   - 즉, id만 사용하면 매번 조회 코드를 추가로 거쳐야 하는데, 객체를 사용하면 바로바로 접근이 가능하다.

3. `removeIf` : 람다식이나 Predicate로 조건을 정해 모든 일치 요소를 안전하게 제거

---

# 2. 프로젝트 요구사항

## 기본 요구사항

### File IO를 통한 데이터 영속화

- [ ] 다음의 조건을 만족하는 서비스 인터페이스의 구현체를 작성하세요.
  - [ ] 클래스 패키지명: `com.sprint.mission.discodeit.service.file`
  - [ ] 클래스 네이밍 규칙: `File[인터페이스 이름]`
  - [ ] JCF 대신 FileIO와 객체 직렬화를 활용해 메소드를 구현하세요.
  - [객체 직렬화/역직렬화 가이드](https://codeit.notion.site/13b6fd228e8d80c6b144cdfbf518a9f7)

- [ ] `Application`에서 서비스 구현체를 `File*Service`로 바꾸어 테스트해보세요.

### 서비스 구현체 분석

- [ ] `JCF*Service` 구현체와 `File*Service` 구현체를 비교하여 공통점과 차이점을 발견해보세요.
  - [ ] "비즈니스 로직"과 관련된 코드를 식별해보세요.
  - [ ] "저장 로직"과 관련된 코드를 식별해보세요.

### 레포지토리 설계 및 구현

- [ ] "저장 로직"과 관련된 기능을 도메인 모델 별 인터페이스로 선언하세요.
  - [ ] 인터페이스 패키지명: `com.sprint.mission.discodeit.repository`
  - [ ] 인터페이스 네이밍 규칙: `[도메인 모델 이름]Repository`

- [ ] 다음의 조건을 만족하는 레포지토리 인터페이스의 구현체를 작성하세요.
  - [ ] 클래스 패키지명: `com.sprint.mission.discodeit.repository.jcf`
  - [ ] 클래스 네이밍 규칙: `JCF[인터페이스 이름]`
  - [ ] 기존에 구현한 `JCF*Service` 구현체의 "저장 로직"과 관련된 코드를 참고하여 구현하세요.

- [ ] 다음의 조건을 만족하는 레포지토리 인터페이스의 구현체를 작성하세요.
  - [ ] 클래스 패키지명: `com.sprint.mission.discodeit.repository.file`
  - [ ] 클래스 네이밍 규칙: `File[인터페이스 이름]`
  - [ ] 기존에 구현한 `File*Service` 구현체의 "저장 로직"과 관련된 코드를 참고하여 구현하세요.

## 심화 요구 사항

### 관심사 분리를 통한 레이어 간 의존성 주입

- [ ] 다음의 조건을 만족하는 서비스 인터페이스의 구현체를 작성하세요.
  - [ ] 클래스 패키지명: `com.sprint.mission.discodeit.service.basic`
  - [ ] 클래스 네이밍 규칙: `Basic[인터페이스 이름]`
  - [ ] 기존에 구현한 서비스 구현체의 "비즈니스 로직"과 관련된 코드를 참고하여 구현하세요.
  - [ ] 필요한 Repository 인터페이스를 필드로 선언하고 생성자를 통해 초기화하세요.
  - [ ] "저장 로직"은 Repository 인터페이스 필드를 활용하세요. (직접 구현하지 마세요.)

- [ ] `Basic*Service` 구현체를 활용하여 테스트해보세요.

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

  - [ ] `JCF*Repository` 구현체를 활용하여 테스트해보세요.
  - [ ] `File*Repository` 구현체를 활용하여 테스트해보세요.

- [ ] 이전에 작성했던 코드(`JCF*Service` 또는 `File*Service`)와 비교해 어떤 차이가 있는지 정리해보세요.

---

# 3. GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint2](https://github.com/JungH200000/10-sprint-mission/tree/sprint2)
