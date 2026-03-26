---
title: '[TIL 44일 차] Sprint Mission6 - 페이징과 정렬 구현 및 최적화, 테스트'
excerpt: '2-8. 페이징과 정렬 ~ 3-3. 페이지네이션 최적화'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til044

toc: true
toc_sticky: true

date: 2026-03-08
last_modified_at: 2026-03-08
---

# 오늘의 학습

### 1. 개발 진행 상황

- 특정 채널의 메시지를 출력하는 메서드의 N+1 문제 해결을 위해 `@BatchSize` 애너테이션 추가
- 페이징과 정렬
  - 최근 50개씩 최근 메시지 순으로 조회
  - 일관된 페이지네이션 응답을 위해 `PageResponse<T>` DTO 구현
  - Slice 또는 Page 객체로부터 DTO를 생성하는 Mapper 구현

### 2. **batch fetch** (`@BatchSize`)

- "연관 데이터를 한 번에 미리 join해서 가져오는 방법"이 아니라 LAZY 조회가 필요해지는 순간 여러 개를 묶어서 가져오게 해주는 Hibernate 최적화

### 3. **페이징**

- `Pageable pageable` : Spring이 `page`, `size`, `sort`를 조합해 만들어주는 특수 파라미터
  - `GET  /api/messages?channelId=...&page=0&size=50`가 오면 Spring이 내부적으로 `Pageable pageable = PageRequest.of(0, 50, Sort.by(DESC, "createdAt"))`를 만듬

### 4. **오프셋 페이지네이션과 커서 페이지네이션**

- **오프셋(Offset) 페이지네이션**
  - 앞으로 몇 개를 건너뛴 뒤(`limit`) 가져오는 방식
  - 예시 : 10개씩 보여준다고 가정
    - 1페이지 ➡️ 0개 건너뛰고 10개 조회
    - 2페이지 ➡️ 10개 건너뛰고 10개 조회
    - 3페이지 ➡️ 20개 건너뛰고 10개 조회
  - SQL문으로 보면
    ```sql
    SELECT *
    FROM messages
    ORDER BY created_at DESC
    LIMIT 10 OFFSET 20; -- 앞의 20개를 건너뛰고, 그 다음 10개를 가져옴
    ```
  - 장점
    - 페이지 번호 기반 UI를 만들기 편함
    - 구현이 단순함
  - 단점:
    - 뒤로 갈수록 느려질 수 있음
      - 예시 : OFFSET이 100000...이면, DB는 앞의 많은 데이터를 스캔 후 버려야 함
    - 중간에 데이터 추가·삭제가 발생하면 중복 조회나 누락이 발생할 수 있음
      - 예시 : 1페이지 조회 ➡️ 최신글이 추가 ➡️ 2페이지 조회(1페이지에서 본 글을 또 볼 수 있음)

- **커서(Cursor) 페이지네이션**
  - 마지막으로 본 데이터의 기준값(`cursor`)을 이용해 다음 데이터를 가져오는 방식
  - 예시: created_at이 최신인 순서대로 글을 조회
    - 첫 번째 요청 ➡️ 최신 10개 조회
    - 두 번째 요청 ➡️ 마지막으로 본 글의 created_at이 21시라면 ➡️ created_at < 21시인 데이터 10개 조회
  - SQL 문으로 보면
    ```sql
    SELECT *
    FROM messages
    WHERE created_at < 21시 -- 21이 커서 역할을 함
    ORDER BY created_at DESC
    LIMIT 10;
    ```
  - 장점:
    - 대량의 데이터에서 더 효율적인 경우가 많음
    - 중간에 데이터가 추가되어도 중복·누락 문제에 강함
    - 무한 스크롤 같은 UI에 잘 맞음
  - 단점:
    - 오프셋 페이지네이션보다 복잡함
    - 페이지 번호 방식을 지원하기 어려움
    - 정렬 기준이 명확해야 함

---

# 프로젝트 요구 사항

`// ...`

### 2-8. 페이징과 정렬

- [x] 메시지 목록을 조회할 때 다음의 조건에 따라 페이지네이션 처리를 해보세요.
  - 50개씩 최근 메시지 순으로 조회합니다.
  - 총 메시지가 몇개인지 알 필요는 없습니다.
- [x] 일관된 페이지네이션 응답을 위해 제네릭을 활용해 DTO로 구현하세요.
  - 패키지명: `com.sprint.mission.discodeit.dto.response`
  - 클래스 다이어그램

    <img src="https://bakey-api.codeit.kr/api/files/resource?root=static&seqId=12178&version=1&directory=/wj4q7nhn3-image.png&name=wj4q7nhn3-image.png" width=300px>

  - `content`: 실제 데이터입니다.
  - `number`: 페이지 번호입니다.
  - `size`: 페이지의 크기입니다.
  - `totalElements`: T 데이터의 총 갯수를 의미하며, null일 수 있습니다.

- [x] Slice 또는 Page 객체로부터 DTO를 생성하는 Mapper를 구현하세요.
  - 패키지명: `com.sprint.mission.discodeit.mapper`

    <img src="https://bakey-api.codeit.kr/api/files/resource?root=static&seqId=12178&version=1&directory=/x7qjncxm0-image.png&name=x7qjncxm0-image.png" width=400px>

  - 확장성을 위해 제네릭 메소드로 구현하세요.

---

## 3. 심화 요구사항

### 3-1. N+1 문제

- [x] N+1 문제가 발생하는 쿼리를 찾고 해결해보세요.

<br>

### 3-2. 읽기전용 트랜잭션 활용

- [x] 프로덕션 환경에서는 OSIV를 비활성화하는 경우가 많습니다. 이때 서비스 레이어의 조회 메소드에서 발생할 수 있는 문제를 식별하고, 읽기 전용 트랜잭션을 활용해 문제를 해결해보세요.
  - OSIV 비활성화하기
    ```yaml
    spring:
      jpa:
        open-in-view: false
    ```

<br>

### 3-3. 페이지네이션 최적화

- [x] 오프셋 페이지네이션과 커서 페이지네이션 방식의 차이에 대해 정리해보세요.
  - 상단에 작성함

- [x] 기존에 구현한 오프셋 페이지네이션을 커서 페이지네이션으로 리팩토링하세요.
  - PageResponse는 다음과 같이 변경하세요.

      <img src="https://bakey-api.codeit.kr/api/files/resource?root=static&seqId=12179&version=1&directory=/73leqaemv-image.png&name=73leqaemv-image.png" width=300px>

  - 다음의 API 명세를 준수하세요.
    - [API 스펙 v1.2](https://bakey-api.codeit.kr/api/files/resource?root=static&seqId=12179&version=1&directory=/%E1%84%86%E1%85%B5%E1%84%89%E1%85%A7%E1%86%AB%20%E1%84%8B%E1%85%A1%E1%86%AB%E1%84%82%E1%85%A2%20API%20%E1%84%86%E1%85%AE%E1%86%AB%E1%84%89%E1%85%A5%201.2.json&name=%E1%84%86%E1%85%B5%E1%84%89%E1%85%A7%E1%86%AB%20%E1%84%8B%E1%85%A1%E1%86%AB%E1%84%82%E1%85%A2%20API%20%E1%84%86%E1%85%AE%E1%86%AB%E1%84%89%E1%85%A5%201.2.json)
  - API 스펙을 준수한다면, 아래의 프론트엔드 코드와 호환됩니다.
    - [정적 리소스 v1.2.4](https://bakey-api.codeit.kr/api/files/resource?root=static&seqId=12179&version=1&directory=/Release%201.2.4%20dist.zip&name=Release%201.2.4%20dist.zip)
    - [소스 코드(참고용) v1.2.4](https://bakey-api.codeit.kr/api/files/resource?root=static&seqId=12179&version=1&directory=/0%20Sprint%20Mission%20Front%201.2.4.zip&name=0%20Sprint%20Mission%20Front%201.2.4.zip)

> ⚠️ 프론트엔드 소스 코드는 참고용으로만 활용하세요. 수정하여 활용하는 경우 이어지는 요구사항 또는 미션을 수행하는 데 어려움이 있을 수 있습니다.

<br>

### 3-4. MapStruct 적용

- [x] Entity와 DTO를 매핑하는 보일러플레이트 코드를 [MapStruct](https://mapstruct.org/) 라이브러리를 활용해 간소화해보세요.

---

# 페이지네이션 관련 코드

## Message Entity

```java
@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "messages")
public class Message extends BaseUpdatableEntity {

    @Column
    private String content; // 메시지 내용

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "channel_id", nullable = false)
    private Channel channel; // 메시지가 위치한 채널

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private User author; // 메시지 작성자

    @BatchSize(size = 50)
    @OneToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.REMOVE}, orphanRemoval = true)
    @JoinTable(
            name = "message_attachments",
            joinColumns = @JoinColumn(name = "message_id"),
            inverseJoinColumns = @JoinColumn(name = "attachment_id")
    )
    private List<BinaryContent> attachments; // 메세지 첨부파일

    // 생성자
    public Message(Channel channel, User author, String content) {
        this.channel = channel;
        this.author = author;
        this.content = content;
        this.attachments = new ArrayList<>();
    }

    // getter
    public List<BinaryContent> getAttachments() {
        return attachments.stream().toList();
    }

    public void addAttachment(BinaryContent attachment) {
        this.attachments.add(attachment);
    }
}


```

## Message Controller

```java
/**
 * 메시지 관리 Controller
 */
@RestController
@RequestMapping("/api/messages")
@AllArgsConstructor
@Tag(name = "Message", description = "Message API")
public class MessageController {
    private final MessageService messageService;

    /**
     * 특정 채널 메시지 목록 조회
     */
    @RequestMapping(method = RequestMethod.GET)
    @Operation(summary = "Channel의 Message 목록 조회")
    @ApiResponse(responseCode = "200", description = "Message 목록 조회 성공", content = @Content(schema = @Schema(implementation = PageResponse.class)))
    public ResponseEntity<PageResponse<MessageDto>> findAllByChannelId(
            @Parameter(description = "조회할 Channel ID") @RequestParam UUID channelId,
            @Parameter(description = "페이징 커서 정보") @RequestParam(required = false) Instant cursor,
            @Parameter(description = "페이징 정보", example = "{\"size\": 50, \"sort\": \"createdAt,desc\"}")
            @PageableDefault(size = 50, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        PageResponse<MessageDto> messages = messageService.findAllByChannelId(channelId, cursor, pageable);

        return ResponseEntity.status(HttpStatus.OK).body(messages);
    }
}

```

## Message Service

```java
@Service
@RequiredArgsConstructor
@Transactional
public class BasicMessageService implements MessageService {
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ChannelRepository channelRepository;
    private final BinaryContentRepository binaryContentRepository;
    private final MessageMapper messageMapper;
    private final BinaryContentStorage binaryContentStorage;
    private final PageResponseMapper pageResponseMapper;

    @Transactional(readOnly = true)
    @Override
    public PageResponse<MessageDto> findAllByChannelId(UUID channelId, Instant cursor, Pageable pageable) {
        // Channel ID null & channel 객체 존재 확인
        validateChannelByChannelId(channelId);
        Instant createdAt = Optional.ofNullable(cursor)
                .orElse(Instant.now());

        Slice<MessageDto> slice = messageRepository.findAllByChannelId(channelId, createdAt, pageable)
                .map(message -> messageMapper.toDto(message));

        Instant nextCursor = !slice.getContent().isEmpty() ? slice.getContent().get(slice.getContent().size() - 1).createdAt() : null;

        return pageResponseMapper.fromSlice(slice, nextCursor);
    }

    //// validation
    // 로그인 되어있는 user ID null & user 객체 존재 확인
    public void validateUserByUserId(UUID userId) {
        ValidationMethods.validateId(userId);
        userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User with id " + userId + " not found"));
    }
}


```

## Message JpaRepository

```java
public interface MessageRepository extends JpaRepository<Message, UUID> {

    @Query(value = "SELECT DISTINCT m FROM Message AS m " +
            "LEFT JOIN FETCH m.channel AS c " +
            "LEFT JOIN FETCH m.author AS a " +
            "LEFT JOIN FETCH a.status " +
            "LEFT JOIN FETCH a.profile " +
            "WHERE c.id = :channelId AND m.createdAt < :createdAt " +
            "ORDER BY m.createdAt DESC, m.id DESC")
    Slice<Message> findAllByChannelId(@Param("channelId") UUID channelId, @Param("createdAt") Instant createdAt, Pageable pageable);

}


```

## Message PageResponseMapper

```java
@Mapper(componentModel = "spring")
public abstract class PageResponseMapper {

    public <T> PageResponse<T> fromSlice(Slice<T> slice, Instant nextCursor) {
        return new PageResponse<>(
                slice.getContent(),
                nextCursor,
                slice.getSize(),
                slice.hasNext(),
                null
        );
    }

    public <T> PageResponse<T> fromPage(Page<T> page, Instant nextCursor) {
        return new PageResponse<>(
                page.getContent(),
                nextCursor,
                page.getSize(),
                page.hasNext(),
                page.getTotalElements()
        );
    }
}

```

## Message PageResponse

```java
public record PageResponse<T>(
        List<T> content, // 실제 데이터
        Object nextCursor,
//        int number, // 페이지 번호
        int size, // 페이지 크기
        boolean hasNext,
        Long totalElements // T 데이터의 총 갯수(null일 수 있음)
) {
}

```

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint6](https://github.com/JungH200000/10-sprint-mission/tree/sprint6)
