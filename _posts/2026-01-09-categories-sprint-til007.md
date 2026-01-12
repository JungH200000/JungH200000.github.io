---
title: '[TIL 7일차] Sprint Mission2 - 디스코드 도메인 모델링 및 서비스 설계'
excerpt: ''

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til007/

toc: true
toc_sticky: true

date: 2026-01-09
last_modified_at: 2026-01-09
---

# 1. 오늘의 성취

1. **개발 진행 상황**

- `User` 클래스, `Channel` 클래스, `Message` 클래스의 공통 필드 관리를 위해 `BaseEntity` 클래스를 추상 클래스로 구현
- 디스코드의 핵심 도메인(`User`, `Channel`, `Message`)을 분석하여 도메인 모델링
- 도메인 모델 별 CRUD(생성, 읽기, 모두 읽기, 수정, 삭제) 기능을 인터페이스로 선언

2. **오늘 헷갈린 접근 제어자**

- default: "이 필드는 해당 패키지 식구들만 공유하자."
- protected: "이 필드는 나를 상속받은 자식들에게만 물려줄 것이다."

3. **데이터 부재 처리**

- **단건 조회(`Optional<T>`):** 결과가 존재하지 않을 수 있음을 반환 타입을 Optional로 감싸서 호출자가 `isPresent()`나 `ifPresent()`를 통해 NPE(NullPointerException) 방지
- **다건 조회(`List`/`Set`):** 데이터가 없을 경우 `null` 대신 빈 컬렉션(`Collections.emptyList()` 등)을 반환하여 NPE를 방지
  - ex) 컬렉션 `List<User>`은 데이터가 없을 경우 빈 리스트 `[]`를 반환해서 `list.isEmpty()`로 상태 확인 가능
  - ex) 일반 객체 `User`는 데이터가 없을 경우 `null` 반환하는데 상태 확인 가능한 방법이 없어서 `Optional<User>`로 감싸서 `isPresent()` 또는 `ifPresent()` 메소드로 상태 확인 가능

# 2. 프로젝트 요구사항

## 기본 요구사항

<details><summary>접기/펼치기</summary>

**도메인 모델링**

- [O] 디스코드 서비스를 활용해보면서 각 도메인 모델에 필요한 정보를 도출하고, Java Class로 구현하세요.
  - [O] 패키지명: `com.sprint.mission.discodeit.entity`
  - [O] 도메인 모델 정의
    - [O] 공통
      - [O] `id`: 객체를 식별하기 위한 id로 UUID 타입으로 선언합니다.
      - [O] `createdAt`, `updatedAt`: 각각 객체의 생성, 수정 시간을 유닉스 타임스탬프로 나타내기 위한 필드로 Long 타입으로 선언합니다.
    - [O] User
    - [O] Channel
    - [O] Message
  - [O] 생성자
    - [O] `id`는 생성자에서 초기화하세요.
    - [O] `createdAt`는 생성자에서 초기화하세요.
    - [O] `id`, `createdAt`, `updatedAt`을 제외한 필드는 생성자의 파라미터를 통해 초기화하세요.
  - [O] 메소드
    - [O] 각 필드를 반환하는 `Getter` 함수를 정의하세요.
    - [O] 필드를 수정하는 `update` 함수를 정의하세요.

**서비스 설계 및 구현**

- [O] 도메인 모델 별 CRUD(생성, 읽기, 모두 읽기, 수정, 삭제) 기능을 인터페이스로 선언하세요.
  - [O] 인터페이스 패키지명: `com.sprint.mission.discodeit.service`
  - [O] 인터페이스 네이밍 규칙: `[도메인 모델 이름]Service`
- [] 다음의 조건을 만족하는 서비스 인터페이스의 구현체를 작성하세요.
  - [ ] 클래스 패키지명: `com.sprint.mission.discodeit.service.jcf`
  - [ ] 클래스 네이밍 규칙: `JCF[인터페이스 이름]`
  - [ ] Java Collections Framework를 활용하여 데이터를 저장할 수 있는 필드(`data`)를 `final`로 선언하고 생성자에서 초기화하세요.
  - [ ] `data` 필드를 활용해 생성, 조회, 수정, 삭제하는 메소드를 구현하세요.

**메인 클래스 구형**

- [ ] 메인 메소드가 선언된 `JavaApplication` 클래스를 선언하고, 도메인 별 서비스 구현체를 테스트해보세요.
  - [ ] 등록
  - [ ] 조회(단건, 다건)
  - [ ] 수정
  - [ ] 수정된 데이터 조회
  - [ ] 삭제
  - [ ] 조회를 통해 삭제되었는지 확인

</details>

## 심화 요구 사항

<details><summary>접기/펼치기</summary>

**서비스 간 의존성 주입**

- [ ] 도메인 모델 간 관계를 고려해서 검증하는 로직을 추가하고, 테스트해보세요.
  - 힌트: Message를 생성할 때 연관된 도메인 모델 데이터 확인하기

</details>

---

## 3. 구현 코드

### 도메인 모델 코드

#### `BaseEntity.java`

<details><summary>접기/펼치기</summary>

```java
package com.sprint.mission.discodeit.entity;

import java.time.Instant;
import java.util.UUID;

public abstract class BaseEntity {
    protected final UUID id; // 객체 식별을 위한 id
    protected final Long createdAt; // 객체 생성 시간(유닉스 타임스탬프)
    protected Long updatedAt; // 객체 수정 시간(유닉스 타임스탬프)

    protected BaseEntity() {
        // id 초기화
        this.id = UUID.randomUUID();
        // 시간 초기화
        this.createdAt = Instant.now().toEpochMilli();
        this.updatedAt = this.createdAt;
    }

    // Getter
    public UUID getId() {
        return id;
    }

    public Long getCreatedAt() {
        return createdAt;
    }

    public Long getUpdatedAt() {
        return updatedAt;
    }

    // update 시간 메소드
    public void updateTime() {
        this.updatedAt = Instant.now().toEpochMilli();
    }

}

```

</details>

#### `User.java`

<details><summary>접기/펼치기</summary>

```java
package com.sprint.mission.discodeit.entity;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class User extends BaseEntity {
    private String email;
    private String nickName;
    private String userName;
    private String password;
    private String birthday;

    // 연관
    // 해당 유저가 참여 중인 채널 목록
    private final List<Channel> channelList;
    // 해당 유저가 보낸 메시지 목록
    private final List<Message> messageList;

    // 생성자
    public User(String email, String nickName, String userName, String password, String birthday) {
        this.email = email;
        this.nickName = nickName;
        this.userName = userName;
        this.password = password; // 해싱?
        this.birthday = birthday;

        channelList = new ArrayList<>();
        messageList = new ArrayList<>();
    }

    @Override
    public String toString() {
        return "User{" +
                "userId = " + getId() + ", " +
                "createdAt = " + getCreatedAt() + ", " +
                "updatedAt = " + getUpdatedAt() + ", " +
                "email = " + email + ", " +
                "nickName = " + nickName + ", " +
                "userName = " + userName + ", " +
                "password = " + password + ", " +
                "birthday = " + birthday +
                "}";
    }

    // Getter
    public String getEmail() {
        return email;
    }

    public String getNickName() {
        return nickName;
    }

    public String getUserName() {
        return userName;
    }

    public String getPassword() {
        return password;
    }

    public String getBirthday() {
        return birthday;
    }

    public List<Channel> getChannelList() {
        return channelList;
    }

    public List<Message> getMessageList() {
        return messageList;
    }

    // update
    public void updateEmail(String email) {
        this.email = email;
        updateTime();
    }

    public void updateNickName(String nickName) {
        this.nickName = nickName;
        updateTime();
    }

    public void updateUserName(String userName) {
        this.userName = userName;
        updateTime();
    }

    public void updatePassword(String password) {
        this.password = password;
        updateTime();
    }

    public void updateBirthday(String birthday) {
        this.birthday = birthday;
        updateTime();
    }
}

```

</details>

#### `Channel.java`

<details><summary>접기/펼치기</summary>

```java
package com.sprint.mission.discodeit.entity;

import java.time.Instant;
import java.util.*;

public class Channel extends BaseEntity {
    private User owner;
    private Boolean isPrivate; // True = Private, False = Public
    private String channelName;
    private String channelDescription;

    // 연관 관계
    // 해당 채널에 참여 중인 유저 목록
    private final Set<User> channelMembers; // 유저 중복 참가 불가
    // 해당 채널에 존재하는 메시지 목록
    private final List<Message> channelMessages; // 채팅창 안의 메시지들

    // 생성자
    public Channel(User owner, Boolean isPrivate, String channelName, String channelDescription) {
        this.owner = owner;
        this.isPrivate = isPrivate;
        this.channelName = channelName;
        this.channelDescription = channelDescription;
        channelMembers = new HashSet<>();
        channelMessages = new ArrayList<>();
    }

    @Override
    public String toString() {
        return "Channel{" +
                "channelId = " + getId() + ", " +
                "createdAt = " + getCreatedAt() + ", " +
                "updatedAt = " + getUpdatedAt() + ", " +
                "owner = " + owner + ", " +
                "isPrivate = " + isPrivate + ", " +
                "channelName = " + channelName + ", " +
                "channelDescription = " + channelDescription + ", " +
                "channelMembers = " + channelMembers +
                "}";
    }

    // Getter
    public User getOwner() {
        return owner;
    }

    public Boolean getPrivate() {
        return isPrivate;
    }

    public Boolean getIsPrivate() {
        return isPrivate;
    }

    public String getChannelName() {
        return channelName;
    }

    public String getChannelDescription() {
        return channelDescription;
    }

    public Set<User> getChannelMembers() {
        return channelMembers;
    }

    public List<Message> getChannelMessages() {
        return channelMessages;
    }

    // update
    public void updateOwner(User owner) {
        this.owner = owner;
        updateTime();
    }

    public void updateIsPrivate() {
        this.isPrivate = !this.isPrivate;
        updateTime();
    }

    public void updateChannelName(String channelName) {
        this.channelName = channelName;
        updateTime();
    }

    public void updateChannelDescription(String channelDescription) {
        this.channelDescription = channelDescription;
        updateTime();
    }

    public void updateChannelMembers(User user) {
        this.channelMembers.add(user);
        updateTime();
    }
}

```

</details>

#### `Message.java`

<details><summary>접기/펼치기</summary>

```java
package com.sprint.mission.discodeit.entity;

import java.time.Instant;
import java.util.UUID;

public class Message extends BaseEntity {
    private final Channel messageChannel; // 메시지가 위치한 채널
    private final User author; // 메시지 작성자
    private String content; // 메시지 내용

    // 생성자
    public Message(Channel messageChannel, User author, String content) {
        this.messageChannel = messageChannel;
        this.author = author;
        this.content = content;
    }

    @Override
    public String toString() {
        return "Message{" +
                "messageId = " + getId() + ", " +
                "createdAt = " + getCreatedAt() + ", " +
                "updatedAt = " + getUpdatedAt() + ", " +
                "author = " + author + ", " +
                "content = " + content +
                "}";
    }

    // Getter
    public Channel getMessageChannel() {
        return messageChannel;
    }

    public User getAuthor() {
        return author;
    }

    public String getContent() {
        return content;
    }

    // update
    public void updateContent(String content) {
        this.content = content;
        updateTime();
    }
}

```

</details>

### 인터페이스 코드

#### `UserService.java`

<details><summary>접기/펼치기</summary>

```java
package com.sprint.mission.discodeit.service;

import com.sprint.mission.discodeit.entity.Channel;
import com.sprint.mission.discodeit.entity.User;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserService {
    // CRUD(생성, 읽기, 모두 읽기, 수정, 삭제 기능)
    // C. 생성: userId와 기타 등등 출력
    User createUser(String email, String nickName, String userName, String password, String birthday);

    // R. 읽기
    // 이메일+비번(로그인?)
    Optional<User> readUserByEmailAndPw(String email, String password);
    // 본인?
    Optional<User> readUserById(UUID userId);

    // R. 모두 읽기
    // 모든 사용자
    List<User> readAllUsers();
    // 특정 채널에 속한 모든 유저
    List<User> readAllUsersByChannelId(UUID channelId);
    // 특정 채널에서 특정 사용자들 찾기
    List<User> searchUserAtChannelByChannelIdAndPartialUserName(UUID channelId, String partialUserName);
    // 전체 검색으로 특정 사용자 이름 찾기
    List<User> searchAllUsersByPartialUserName(String partialUserName);

    // U. 수정
    User updateEmail(UUID userId, String email); // 이메일 수정
    User updatePassword(UUID userId, String password); // 비밀번호 수정
    User updateNickName(UUID userId, String nickName); // 별명 수정
    User updateUserName(UUID userId, String userName); // 사용자 이름 수정
    User updateBirthday(UUID userId, String birthday); // 생년월일 수정

    // D. 삭제
    void deleteUser(UUID userId);
}

```

</details>

#### `ChannelService.java`

<details><summary>접기/펼치기</summary>

```java
package com.sprint.mission.discodeit.service;

import com.sprint.mission.discodeit.entity.Channel;
import com.sprint.mission.discodeit.entity.User;

import javax.swing.text.html.Option;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChannelService {
    // CRUD(생성, 읽기, 모두 읽기, 수정, 삭제 기능)
    // C. 생성: channelId와 owner 기타 등등 출력
    Channel createChannel(User owner, Boolean isPrivate, String channelName, String channelDescription);

    // R. 읽기
    // 채널 하나
    Optional<Channel> readChannelByChannelId(UUID channelId);
    Optional<Channel> readChannelByChannelName(String channelName);

    // R. 모두 읽기
    // 채널 목록 전체
    List<Channel> readAllChannel();
    // 공개 채널 전체
    List<Channel> readAllPublicChannel(Boolean isPrivate);
    // 특정 사용자가 참여한 모든 채널
    List<Channel> readAllChannelsAtUserByUserId(UUID userId);
    // 특정 사용자가 참여한 채널 중에서 특정 채널 검색
    List<Channel> searchAllChannelsAtUserByUserIdAndPartialChannelName(UUID userId, String partialChannelName);

    // U. 수정
    // 채널 channelName 수정
    Channel updateChannelName(UUID channelId, String channelName);
    // 채널 isPrivate 수정
    Channel updateChannelIsPrivate(UUID channelId, Boolean isPrivate);
    // 채널 owner 수정
    Channel updateChannelOwner(UUID channelId, User owner);
    // 채널 description 수정
    Channel updateChannelDescription(UUID channelId, String channelDescription);

    // D. 삭제
    void deleteChannel(UUID channelId);
}

```

</details>

#### `MessageService.java`

<details><summary>접기/펼치기</summary>

```java
package com.sprint.mission.discodeit.service;

import com.sprint.mission.discodeit.entity.Channel;
import com.sprint.mission.discodeit.entity.Message;
import com.sprint.mission.discodeit.entity.User;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MessageService {
    // CRUD(생성, 읽기, 모두 읽기, 수정, 삭제 기능)
    // C. 생성: messageID과 내용 출력
    Message createMessage(Channel channel, User author, String content);

    // R. 읽기
    Optional<Message> readMessageById(UUID messageId);

    // R. 모두 읽기 : 시간순으로 정렬?
    // 메시지 전체
    List<Message> readAllMessage();
    // 특정 채널의 모든 메시지 읽어오기
    List<Message> readAllMessageAtChannelByChannelId(UUID channelId);
    // 특정 유저의 모든 메시지 읽어오기
    List<Message> readAllMessageAtUserByUserIdAndMessageId(UUID userId);
    // 특정 채널에서 원하는 메시지 찾기
    List<Message> searchAllMessageAtChannelByChannelIdAndWord(UUID channelId, String partialWord);

    // U. 수정
    // 메시지 수정
    Message updateMessageContent(UUID messageId, String content);

    // D. 삭제
    void deleteMessage(UUID messageId);
}

```

</details>
