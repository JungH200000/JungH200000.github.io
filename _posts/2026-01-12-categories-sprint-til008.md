---
title: '[TIL 8일차] Sprint Mission2 - 디스코드 도메인 모델링 및 서비스 설계'
excerpt: ''

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til008/

toc: true
toc_sticky: true

date: 2026-01-12
last_modified_at: 2026-01-12
---

# 1. 오늘의 성취

1. **개발 진행 상황**

- `UserService` 인터페이스의 구현체 `JCFUserService` 구현 완료
- `ChannelService` 인터페이스의 구현체 `JCFChannelService` 구현 중...

2. **Java Stream & Data Structure**

- **`filter()` 메소드 안에서의 논리 연산**
  - `filter()` 메소드 안에 논리 연산자 사용해 복합 조건 필터링 가능
  - ex: `filter(user -> user.getUserName().contains(partialName) || user.getNickName().contains(partialName))`
- **`Map<K, V>`으로 데이터 저장:**
  - 데이터를 저장할 때 `private final Map<UUID, Message> data = new HashMap<>();` 같이 UUID를 중복 저장하는 이유는 **Key**는 빠른 검색을 위한 색인(index) 역할을 하고 **Value**는 Message 데이터 그 자체의 역할을 한다.

3. **빈 문자열(`""`)이나 `null` 입력 시 `Optional.empty()`가 반환될 때 실패 원인을 파악하는 방법**

   - 메서드의 반환 타입 자체가 Optional일 경우
   - **입력 파라미터 자체가 비정상("", null)**: 서비스 내부에서 **IllegalArgumentException**을 던지기
     - 호출자가 잘못함
     - ex) `throw new IllegalArgumentException("message");`
   - **입력은 정상인데 결과(데이터)가 없음:** **Optional.empty()**를 반환하여 호출자(메서드를 사용하는 쪽)가 판단하게 함.
     - 데이터를 찾아봤는데 없음
     - ex) `return Collections.emptyList();`

4. **`orElseThrow()`:** `Optional` 래핑을 해제하고 내용물 반환하는 메서드

5. **메서드가 객체를 반환할 때**는 객체 자체가 이동하는 것이 아닌 **객체의 주소값이 복사되어 전달됨!!** 즉, 서로 다른 위치의 두 참조 변수가 **힙에 위치한 동일한 객체를 바라봄.**

6. 객체 간 양방향 관계에서 한쪽 리스트만 업데이트할 경우 데이터 불일치 발생 -> 한 쪽의 메서드 안에서 양쪽을 한꺼번에 처리하도록 구현

7. **Exception 종류**

- `NoSuchElementException`: 요청한 요소를 찾을 수 없다.
- `IllegalArgumentException`: 입력 파라미터가 잘못됐다.

---

# 2. 프로젝트 요구사항

<details><summary>접기/펼치기</summary>

## 기본 요구사항

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
- [진행 중] 다음의 조건을 만족하는 서비스 인터페이스의 구현체를 작성하세요.
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

## 심화 요구 사항

**서비스 간 의존성 주입**

- [ ] 도메인 모델 간 관계를 고려해서 검증하는 로직을 추가하고, 테스트해보세요.
  - 힌트: Message를 생성할 때 연관된 도메인 모델 데이터 확인하기

</details>

---

# 3. 구현 코드

## 도메인 모델 코드

### `User.java`

<details><summary>접기/펼치기</summary>

```java
package com.sprint.mission.discodeit.entity;

import java.util.*;

public class User extends BaseEntity {
    private String email;
    private String nickName;
    private String userName;
    private String password;
    private String birthday;

    // 연관
    // 해당 유저가 참여 중인 채널 목록
    private final Set<Channel> joinChannelList;
    // 해당 유저가 보낸 메시지 목록
    private final List<Message> writeMessageList;

    // 생성자
    public User(String email, String nickName, String userName, String password, String birthday) {
        this.email = email;
        this.nickName = nickName;
        this.userName = userName;
        this.password = password; // 해싱?
        this.birthday = birthday;

        joinChannelList = new HashSet<>();
        writeMessageList = new ArrayList<>();
    }

    @Override
    public String toString() {
        return "User{" +
                "userId = " + getId() + ", " +
//                "createdAt = " + getCreatedAt() + ", " +
//                "updatedAt = " + getUpdatedAt() + ", " +
                "email = " + email + ", " +
                "nickName = " + nickName + ", " +
                "userName = " + userName + ", " +
//                "password = " + password + ", " +
//                "birthday = " + birthday + ", " +
//                "joinChannelList = " + joinChannelList + ", " +
//                "writeMessageList = " + writeMessageList +
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

    public Set<Channel> getJoinChannelList() {
        return joinChannelList;
    }

    public List<Message> getWriteMessageList() {
        return writeMessageList;
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

    // 해시??
    public void updatePassword(String password) {
        this.password = password;
        updateTime();
    }

    public void updateBirthday(String birthday) {
        this.birthday = birthday;
        updateTime();
    }

    // 채널 참가
    public void joinChannel(Channel channel) {
        this.joinChannelList.add(channel);
        updateTime();
        channel.addChannelMembers(this);
    }

    // 채널 탈퇴
    public void leaveChannel(Channel channel) {
        this.joinChannelList.remove(channel);
        updateTime();
        channel.removeChannelMembers(this);
    }

    // 메시지 작성
    public void writeMessageList(Message message) {
        this.writeMessageList.add(message);
        updateTime();
        message.addUserWriteMessageList(this, message.getContent());
    }
}

```

</details>

### `Channel.java`

<details><summary>접기/펼치기</summary>

```java
package com.sprint.mission.discodeit.entity;

import java.util.*;

public class Channel extends BaseEntity {
    private User owner;
    private Boolean isPrivate; // True = Private, False = Public
    private String channelName;
    private String channelDescription;

    // 연관 관계
    // 해당 채널에 참여 중인 유저 목록
    private final Set<User> channelMembersList; // 유저 중복 참가 불가
    // 해당 채널에 존재하는 메시지 목록
    private final List<Message> channelMessagesList; // 채팅창 안의 메시지들

    // 생성자
    public Channel(User owner, Boolean isPrivate, String channelName, String channelDescription) {
        this.owner = owner;
        this.isPrivate = isPrivate;
        this.channelName = channelName;
        this.channelDescription = channelDescription;
        channelMembersList = new HashSet<>();
        channelMessagesList = new ArrayList<>();
    }

    @Override
    public String toString() {
        return "Channel{" +
                "channelId = " + getId() + ", " +
//                "createdAt = " + getCreatedAt() + ", " +
//                "updatedAt = " + getUpdatedAt() + ", " +
                "owner = " + owner + ", " +
                "isPrivate = " + isPrivate + ", " +
                "channelName = " + channelName + ", " +
//                "channelDescription = " + channelDescription + ", " +
                "channelMembers = " + channelMembersList + ", " +
                "channelMessages = " + channelMessagesList +
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

    public Set<User> getChannelMembersList() {
        return channelMembersList;
    }

    public List<Message> getChannelMessagesList() {
        return channelMessagesList;
    }

    // update
    public void updateOwner(User owner) {
        this.owner = owner;
        updateTime();
    }

    public void updateIsPrivate(Boolean isPrivate) {
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

    // 채널 멤버 추가
    public void addChannelMembers(User user) {
        this.channelMembersList.add(user);
        updateTime();
    }

    // 채널 멤버 삭제
    public void removeChannelMembers(User user) {
        this.channelMembersList.remove(user);
        updateTime();
    }

    // 메시지 작성
    public void addChannelMessages(Message message) {
        this.channelMessagesList.add(message);
        updateTime();
    }
}

```

</details>

## 인터페이스 코드

### `UserService.java`

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
    // userName 또는 nickName을 이용한 전체 검색으로 특정 사용자 찾기
    List<User> searchAllUsersByPartialName(String partialName);
    // 특정 사용자가 참여한 모든 채널
    List<Channel> readAllJoinChannelsAtUserByUserId(UUID userId);
//    // 특정 사용자가 작성한 모든 메시지
//    List<Message> readAllMessageAtUserByUserId(UUID userId);

    // U. 수정
    Optional<User> updateEmail(UUID userId, String email); // 이메일 수정
    Optional<User> updatePassword(UUID userId, String password); // 비밀번호 수정
    Optional<User> updateNickName(UUID userId, String nickName); // 별명 수정
    Optional<User> updateUserName(UUID userId, String userName); // 사용자 이름 수정
    Optional<User> updateBirthday(UUID userId, String birthday); // 생년월일 수정
    Optional<User> joinChannel(UUID userId, Channel channel); // 채널 참여
    Optional<User> leaveChannel(UUID userId, Channel channel); // 채널 탈퇴
    Optional<User> writeMessage(UUID userId, String messageContent, Channel channel); // 메시지 작성

    // D. 삭제
    void deleteUser(UUID userId);
}

```

</details>

### `ChannelService.java`

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
    // 특정 채널 정보 읽기
    Optional<Channel> readChannelByChannelId(UUID channelId);
    // 특정 채널 이름이 들어간 채널 검색
    List<Channel> searchChannelByChannelName(String partialChannelName);

    // R. 모두 읽기
    // 채널 목록 전체
    List<Channel> readAllChannel();
    // 비공개 여부에 따른 채널 목록
    List<Channel> readPublicOrPrivateChannel(Boolean isPrivate);
    // 특정 채널에 속한 모든 유저
    List<User> readAllUsersByChannelId(UUID channelId);
    // 특정 채널에서 특정 사용자 찾기
    List<User> searchUserAtChannelByChannelIdAndPartialName(UUID channelId, String partialName);
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

## 구현체 코드

### `JCFUserService.java`

<details><summary>접기/펼치기</summary>

```java
package com.sprint.mission.discodeit.service.jcf;

import com.sprint.mission.discodeit.entity.Channel;
import com.sprint.mission.discodeit.entity.User;
import com.sprint.mission.discodeit.service.UserService;

import java.util.*;

public class JCFUserService implements UserService {
    private final Map<UUID, User> data = new HashMap<>();

    @Override
    public String toString() {
        return "JCFUserService{" +
//                "data = " + data + ", " +
                "data key = " + data.keySet() + ", " +
                "data values = " + data.values() + ", " +
                "data size = " + data.size() +
                '}';
    }

    // C. 생성: User 생성 후 User 객체 반환
    @Override
    public User createUser(String email, String nickName, String userName, String password, String birthday) {
        // 이메일 검증
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("이메일이 입력되지 않았습니다.");
        }
        // 이메일 중복인지 확인
        data.values().stream()
                .filter(user -> user.getEmail().equals(email))
                .findAny()
                .ifPresent(user -> {
                    throw new IllegalStateException("동일한 이메일이 존재합니다");
                });
        // userName, password 검증
        if (userName == null || userName.isBlank()) {
            throw new IllegalArgumentException("userName이 입력되지 않았습니다.");
        }
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("비밀번호가 입력되지 않았습니다.");
        }

        User user = new User(email, nickName, userName, password, birthday);
        data.put(user.getId(), user);
        return user;
    }

    // R. 읽기
    // 이메일+비번(로그인?)
    @Override
    public Optional<User> readUserByEmailAndPw(String email, String password) {
        // 입력된 이메일과 비밀번호가 유효한 값인지 확인
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("이메일이 입력되지 않았습니다.");
        }
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("비밀번호가 입력되지 않았습니다.");
        }
        return data.values().stream()
                .filter(user -> user.getEmail().equals(email))
                .filter(user -> user.getPassword().equals(password))
                .findAny();
    }

    // 본인?
    @Override
    public Optional<User> readUserById(UUID userId) {
        // 입력된 UUID가 null인지 확인(null이면 NPE+message)
        Objects.requireNonNull(userId, "User ID가 null입니다.");

        return Optional.ofNullable(data.get(userId));
    }

    // R. 모두 읽기
    // 모든 사용자
    @Override
    public List<User> readAllUsers() {
        return new ArrayList<>(data.values());
    }

    // 전체 검색으로 특정 사용자 찾기
    @Override
    public List<User> searchAllUsersByPartialName(String partialName) {
        return data.values().stream()
                .filter(user -> user.getUserName().contains(partialName) ||
                        user.getNickName().contains(partialName))
                .toList();
    }

    // 특정 사용자가 참여한 모든 채널
    public List<Channel> readAllJoinChannelsAtUserByUserId(UUID userId) {
        // UUID가 null인지 확인
        Objects.requireNonNull(userId, "User ID가 null입니다.");

        User user = data.get(userId);
        // 유저 없으면 빈 리스트 반환
        if (user == null) {
            return Collections.emptyList();
        }

        return user.getJoinChannelList().stream().toList();
    }

    // 특정 사용자가 작성한 모든 메시지


    // U. 수정
    // 이메일 수정
    @Override
    public Optional<User> updateEmail(UUID userId, String email) {
        // UUID null인지 확인
        Objects.requireNonNull(userId, "User ID가 null입니다.");
        // 이메일이 빈 문자열인지 null인지 확인
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("이메일이 입력되지 않았습니다.");
        }
        // 중복된 이메일인지 확인
        data.values().stream()
                .filter(user -> user.getEmail().equals(email))
                .findAny()
                .ifPresent(user -> {
                    throw new IllegalStateException();
                });

        return Optional.ofNullable(data.get(userId))
                        .map(user -> {
                            user.updateEmail(email);
                            return user;
                        });
    }

    // 비밀번호 수정
    @Override
    public Optional<User> updatePassword(UUID userId, String password) {
        // UUID null인지 확인
        Objects.requireNonNull(userId, "User ID가 null입니다.");
        // 이메일이 빈 문자열인지 null인지 확인
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("비밀번호가 입력되지 않았습니다.");
        }

        return Optional.ofNullable(data.get(userId))
                        .map(user -> {
                            user.updatePassword(password);
                            return user;
                        });
    }

    // 별명 수정
    @Override
    public Optional<User> updateNickName(UUID userId, String nickName) {
        // UUID null인지 확인
        Objects.requireNonNull(userId, "User ID가 null입니다.");

        return Optional.ofNullable(data.get(userId))
                        .map(user -> {
                            user.updateNickName(nickName);
                            return user;
                        });
    }

    // 사용자 이름 수정
    @Override
    public Optional<User> updateUserName(UUID userId, String userName) {
        // UUID null인지 확인
        Objects.requireNonNull(userId, "User ID가 null입니다.");

        return Optional.ofNullable(data.get(userId))
                .map(user -> {
                    user.updateUserName(userName);
                    return user;
                });
    }

    // 생년월일 수정
    @Override
    public Optional<User> updateBirthday(UUID userId, String birthday) {
        // UUID null인지 확인
        Objects.requireNonNull(userId, "User ID가 null입니다.");

        return Optional.ofNullable(data.get(userId))
                .map(user -> {
                    user.updateBirthday(birthday);
                    return user;
                });
    }

    // 채널 참여
    @Override
    public Optional<User> joinChannel(UUID userId, Channel channel) {
        // UUID null인지 확인
        Objects.requireNonNull(userId, "User ID가 null입니다.");

        return Optional.ofNullable(data.get(userId))
                .map(user -> {
                    user.joinChannel(channel);
                    return user;
                });
    }

    // 채널 탈퇴
    @Override
    public Optional<User> leaveChannel(UUID userId, Channel channel) {
        // UUID null인지 확인
        Objects.requireNonNull(userId, "User ID가 null입니다.");

        return Optional.ofNullable(data.get(userId))
                .map(user -> {
                    user.leaveChannel(channel);
                    return user;
                });
    }

    // 메시지 작성 - 수정 중...
    @Override
    public Optional<User> writeMessage(UUID userId, String messageContent, Channel channel) {
        // UUID null인지 확인
        Objects.requireNonNull(userId, "User ID가 null입니다.");

        return Optional.empty();
    }

    // D. 삭제
    @Override
    public void deleteUser(UUID userId) {
        // UUID null인지 확인
        Objects.requireNonNull(userId, "User ID가 null입니다.");

        data.remove(userId);
    }
}

```

</details>
