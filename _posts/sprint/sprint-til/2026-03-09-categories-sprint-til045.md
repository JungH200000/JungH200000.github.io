---
layout: single-editorial
title: '[TIL 45일 차] Sprint Mission6 - Feedback'
excerpt: ''

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til045

toc: true
toc_sticky: true

date: 2026-03-09
last_modified_at: 2026-03-09
---

# 오늘의 학습

## 1. 개발 진행 상황

- Feedback : 채널 목록 조회 시 N+1 문제 발생 가능
  - 채널 목록 조회 시 `ReadStatus`를 조회하는 부분을 개선
  - [Feedback 바로가기](#260309---feedback)

<br>

## 2. 고민

### JPQL의 생성자 표현식(Constructor Expression)

조회 결과를 Entity가 아닌 DTO 객체로 바로 만들어서 반환하는 문법

- 형태 : `new DTO이름(조회값1, 조회값2)`
- 예시 : `SELECT new com.sprint.mission.discodeit.dto.message.ChannelLastMessageAtDto(m.channel.id, max(m.createdAt))`

### `Map` 만들기

- 하나의 키에 여러 값을 매핑해서 빠르게 찾고 싶을 때, `Map`과 `Stream API`, `getOrDefault()`를 함께 사용하면 깔끔한 코드를 만들 수 있다.
- Map을 사용하면, 관련 데이터를 한 번에 조회한 뒤, 메모리에서 빠르게 꺼내 사용할 수 있어, 매번 DB에 조회하여 발생하는 N+1 문제를 예발할 수 있다.
- `Collectors.toMap(keyMapper, valueMapper)` : `Stream` 요소들을 `Map`으로 변환하는 메서드
  - `keyMapper` : 어떤 값을 key로 사용할지
  - `valueMapper` : 어떤 값을 value로 사용할지
- `Collectors.groupingBy(classifier, downstream)` : `Stream` 요소들을 어떤 기준으로 묶어 `Map`으로 변환하는 메서드
  - `classifier` : 무엇을 기준으로 그룹의 데이터를 나눌지
  - `downstream` : 각 그룹 안의 데이터를 어떻게 가공할지
- `Collectors.mapping(mapper, downstream)` : 그룹에 들어있는 원소를 다른 형태로 변환한 뒤 수집할 때 사용
  - `mapper`: 어떤 값으로 변환할지
  - `downstream`: 변환 후 어떻게 모을지
- `Collectors.toList()` : Stream 결과를 `List`로 모아준다.

  ```java
  // 각 채널의 마지막 메시지 createdAt 시간
  Map<UUID, Instant> lastMessageAtMap = messageRepository.findLastMessageAtDtoByChannelIds(channelIds).stream()
          .collect(Collectors.toMap(
                          dto -> dto.id(),
                          dto -> dto.lastMessageAt()
                  )
          );

  // 채널별 참가자 목록 조회
  Map<UUID, List<UserDto>> participantMap = readStatusRepository.findAllByChannelIdsWithUserAndChannel(privateChannelIds).stream()
          .collect(Collectors.groupingBy(
                  readStatus -> readStatus.getChannel().getId(),
                  Collectors.mapping(
                          readStatus -> userMapper.toDto(readStatus.getUser()),
                          Collectors.toList()
                  )
          ));
  ```

### `getOrDefault(key, defaultValue)`

- 어떤 `key`로 값을 찾을 때, `key`가 존재하면 해당 값을 반환하고, `key`가 없다면 기본값을 대신 반환해주는 메서드로, `Map` 인터페이스에서 많이 사용함.
- `key` : 찾고 싶은 키
- `defaultValur` : 키가 없을 때 대신 반환할 값

```java
 protected List<UserDto> assignParticipantInMap(Channel channel, Map<UUID, List<UserDto>> participantMap) {
     if (!channel.getType().equals(ChannelType.PRIVATE)) {
         return List.of();
     }
     return participantMap.getOrDefault(channel.getId(), List.of());
 }

 protected Instant assignLastMessageAtInMap(Channel channel, Map<UUID, Instant> lastMessageAtMap) {
     return lastMessageAtMap.getOrDefault(channel.getId(), null);
 }
```

---

# 26.03.09 - Feedback

## Feedback01

### 문제: 채널 목록 조회 시 N+1 문제 발생 가능

- 채널 목록 조회 시 `ReadStatus`를 조회하는 부분을 개선 필요
- 채널 하나마다 `ReadStatus`를 조회하는 게 아니라
- 서비스 계층에서 쿼리를 2~3번으로 나눠서 조회 후, Mapper에서 합치기
  1. 채널 목록만 조회
  2. 채널별 마지막 메시지 시간 한 번에 조회
  3. 채널별 참가자 목록 조회
  4. 위 3개의 쿼리를 합쳐서 `ChannelDto`를 만들기.

### 수정 전 코드

```java
@Service
@RequiredArgsConstructor
@Transactional
public class BasicChannelService implements ChannelService {
    private final ChannelRepository channelRepository;
    private final UserRepository userRepository;
    private final ReadStatusRepository readStatusRepository;
    private final MessageRepository messageRepository;
    private final ChannelMapper channelMapper;

    @Transactional(readOnly = true)
    @Override
    public List<ChannelDto> findAllByUserId(UUID userId) {
        // User ID null 검증
        validateUserByUserId(userId);

        // 모든 채널에서 PUBLIC인 채널 전체와 유저가 참여한 모든 채널
        return channelRepository.findChannelByUserId(ChannelType.PUBLIC, userId).stream()
                .map(channel -> channelMapper.toDto(channel))
                .toList();
    }
    public void validateUserByUserId(UUID userId) {
        ValidationMethods.validateId(userId);
        userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User with id " + userId + " not found"));
    }
}
```

```java
public interface ReadStatusRepository extends JpaRepository<ReadStatus, UUID> {

    @Query(value = "SELECT r FROM ReadStatus AS r " +
            "LEFT JOIN FETCH r.channel " +
            "LEFT JOIN FETCH r.user AS u " +
            "LEFT JOIN FETCH u.profile " +
            "LEFT JOIN FETCH u.status " +
            "Where r.channel.id = :channelId")
    List<ReadStatus> findAllByChannelIdWithUserAndChannel(@Param("channelId") UUID channelId);

}
```

```java
@Mapper(componentModel = "spring", uses = {UserMapper.class})
public abstract class ChannelMapper {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ReadStatusRepository readStatusRepository;

    @Autowired
    private UserMapper userMapper;

    @Mapping(target = "participants", expression = "java(assignParticipants(channel))")
    @Mapping(target = "lastMessageAt", expression = "java(assignLastMessageAt(channel))")
    public abstract ChannelDto toDto(Channel channel);

    protected List<UserDto> assignParticipants(Channel channel) {
        List<UserDto> participants = new ArrayList<>();
        if (channel.getType().equals(ChannelType.PRIVATE)) {
            readStatusRepository.findAllByChannelIdWithUserAndChannel(channel.getId()).stream()
                    .map(readStatus -> userMapper.toDto(readStatus.getUser()))
                    .forEach(userDto -> participants.add(userDto));
        }
        return participants;
    }

    protected Instant assignLastMessageAt(Channel channel) {
        return messageRepository.findLastMessageAtByChannelId(channel.getId())
                .orElse(null);
    }
}
```

### 수정 후 코드

```java
@Service
@RequiredArgsConstructor
@Transactional
public class BasicChannelService implements ChannelService {
    private final ChannelRepository channelRepository;
    private final UserRepository userRepository;
    private final ReadStatusRepository readStatusRepository;
    private final MessageRepository messageRepository;
    private final ChannelMapper channelMapper;
    private final UserMapper userMapper;

    @Transactional(readOnly = true)
    @Override
    public List<ChannelDto> findAllByUserId(UUID userId) {
        // User ID null 검증
        validateUserByUserId(userId);

        // 접근 가능한 전체 채널 조회
        List<Channel> channels = channelRepository.findChannelByUserId(ChannelType.PUBLIC, userId);
        // 접근 가능한 전체 채널 ID
        List<UUID> channelIds = channels.stream()
                .map(channel -> channel.getId())
                .toList();
        // 접근 가능한 Private 채널 ID
        List<UUID> privateChannelIds = channels.stream()
                .filter(channel -> channel.getType().equals(ChannelType.PRIVATE))
                .map(channel -> channel.getId())
                .toList();

        // 각 채널의 마지막 메시지 createdAt 시간
        Map<UUID, Instant> lastMessageAtMap = messageRepository.findLastMessageAtDtoByChannelIds(channelIds).stream()
                .collect(Collectors.toMap(
                                dto -> dto.id(),
                                dto -> dto.lastMessageAt()
                        )
                );

        // 채널별 참가자 목록 조회
        Map<UUID, List<UserDto>> participantMap = readStatusRepository.findAllByChannelIdsWithUserAndChannel(privateChannelIds).stream()
                .collect(Collectors.groupingBy(
                        readStatus -> readStatus.getChannel().getId(),
                        Collectors.mapping(
                                readStatus -> userMapper.toDto(readStatus.getUser()),
                                Collectors.toList()
                        )
                ));

        return channels.stream()
                .map(channel -> channelMapper.toListDto(channel, participantMap, lastMessageAtMap))
                .toList();
    }

    public void validateUserByUserId(UUID userId) {
        ValidationMethods.validateId(userId);
        userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User with id " + userId + " not found"));
    }
}
```

```java
public interface MessageRepository extends JpaRepository<Message, UUID> {

    @Query(value = "SELECT max(m.createdAt) AS lastMessageAt " +
            "FROM Message AS m " +
            "WHERE m.channel.id = :channelId")
    Optional<Instant> findLastMessageAtByChannelId(@Param("channelId") UUID channelId);

    @Query(value = "SELECT new com.sprint.mission.discodeit.dto.message.ChannelLastMessageAtDto(m.channel.id, max(m.createdAt)) " +
            "FROM Message AS m " +
            "WHERE m.channel.id IN :channelIds " +
            "GROUP BY m.channel.id")
    List<ChannelLastMessageAtDto> findLastMessageAtDtoByChannelIds(@Param("channelIds") List<UUID> channelIds);

}
```

```java
package com.sprint.mission.discodeit.dto.message;

import java.time.Instant;
import java.util.UUID;

public record ChannelLastMessageAtDto(
        UUID id, // channelId
        Instant lastMessageAt
) {
}
```

```java
public interface ReadStatusRepository extends JpaRepository<ReadStatus, UUID> {

    @Query(value = "SELECT r FROM ReadStatus AS r " +
            "LEFT JOIN FETCH r.channel " +
            "LEFT JOIN FETCH r.user AS u " +
            "LEFT JOIN FETCH u.profile " +
            "LEFT JOIN FETCH u.status " +
            "Where r.channel.id = :channelId")
    List<ReadStatus> findAllByChannelIdWithUserAndChannel(@Param("channelId") UUID channelId);

    @Query(value = "SELECT r FROM ReadStatus AS r " +
            "LEFT JOIN FETCH r.channel " +
            "LEFT JOIN FETCH r.user AS u " +
            "LEFT JOIN FETCH u.profile " +
            "LEFT JOIN FETCH u.status " +
            "Where r.channel.id IN :channelIds")
    List<ReadStatus> findAllByChannelIdsWithUserAndChannel(@Param("channelIds") List<UUID> channelIds);

}
```

```java
@Mapper(componentModel = "spring", uses = {UserMapper.class})
public abstract class ChannelMapper {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ReadStatusRepository readStatusRepository;

    @Autowired
    private UserMapper userMapper;

    @Mapping(target = "participants", expression = "java(assignParticipants(channel))")
    @Mapping(target = "lastMessageAt", expression = "java(assignLastMessageAt(channel))")
    public abstract ChannelDto toDto(Channel channel);

    // `@Mapping`은 추상 메서드에서만 사용 가능
    public ChannelDto toListDto(Channel channel, Map<UUID, List<UserDto>> participantMap, Map<UUID, Instant> laseMessageAtMap) {
        return new ChannelDto(
                channel.getId(),
                channel.getType(),
                channel.getName(),
                channel.getDescription(),
                assignParticipantInMap(channel, participantMap),
                assignLastMessageAtInMap(channel, laseMessageAtMap)
        );
    }

    protected List<UserDto> assignParticipants(Channel channel) {
        List<UserDto> participants = new ArrayList<>();
        if (channel.getType().equals(ChannelType.PRIVATE)) {
            readStatusRepository.findAllByChannelIdWithUserAndChannel(channel.getId()).stream()
                    .map(readStatus -> userMapper.toDto(readStatus.getUser()))
                    .forEach(userDto -> participants.add(userDto));
        }
        return participants;
    }

    protected Instant assignLastMessageAt(Channel channel) {
        return messageRepository.findLastMessageAtByChannelId(channel.getId())
                .orElse(null);
    }

    protected List<UserDto> assignParticipantInMap(Channel channel, Map<UUID, List<UserDto>> participantMap) {
        if (!channel.getType().equals(ChannelType.PRIVATE)) {
            return List.of();
        }
        return participantMap.getOrDefault(channel.getId(), List.of());
    }

    protected Instant assignLastMessageAtInMap(Channel channel, Map<UUID, Instant> lastMessageAtMap) {
        return lastMessageAtMap.getOrDefault(channel.getId(), null);
    }
}
```

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint6](https://github.com/JungH200000/10-sprint-mission/tree/sprint6)
