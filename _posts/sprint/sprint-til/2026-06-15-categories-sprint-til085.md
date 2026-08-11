---
layout: single-editorial
title: '[TIL 85일 차] Sprint Mission12'
excerpt: '3.기본 요구사항'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til085

toc: true
toc_sticky: true

date: 2026-06-15
last_modified_at: 2026-06-15
---

# 오늘의 성취

## 1. 개발 진행 상황

- **웹소켓 구현하기**
  - `WebSocketConfig` 구현
  - `MessageWebSocketController` 구현
  - `WebSocketRequiredEventListener` 구현
- **SSE 구현하기**
  - `SseController`
    - `GET /api/sse` 구현
  - `BasicSseService`
    - `connect`, `send`, `broadcast`, `cleanUp`, `ping` 구현
  - `SseEmitterRepository`
    - `SseEmitter` 객체를 메모리에 저장하는 컴포넌트
  - `SseMessageRepository`
    - 이벤트 유실 복원을 위해 SSE 메시지를 저장하는 컴포넌트

---

# 프로젝트 요구 사항

## 3. 기본 요구사항

### 3-01. 웹소켓 구현하기

- [x] 웹소켓 환경 구성
  - `spring-boot-starter-websocket` 의존성을 추가하세요.
    ```groovy
    implementation 'org.springframework.boot:spring-boot-starter-websocket'
    ```
  - 웹소켓 메시지 브로커 설정

    ```java
    @Configuration
    @EnableWebSocketMessageBroker
    public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {...}
    ```

    - 메모리 기반 `SimpleBroker`를 사용하세요.

      ```java
      @Override
      public void configureMessageBroker(MessageBrokerRegistry config) {...}
      ```

      - SimpleBroker의 Destination Prefix는 `/sub` 으로 설정하세요.
        - 클라이언트에서 메시지를 구독할 때 사용합니다.
      - Application Destination Prefix는 `/pub` 으로 설정하세요.
        - 클라이언트에서 메시지를 발행할 때 사용합니다.

      ```java
      @Override
      public void registerStompEndpoints(StompEndpointRegistry registry) {...}
      ```

      - STOMP 엔드포인트는 `/ws`로 설정하고, `SockJS` 연결을 지원해야 합니다.

- [x] 메시지 송신
  - 첨부파일이 없는 단순 텍스트 메시지인 경우 STOMP를 통해 메시지를 전송할 수 있도록 컨트롤러를 구현하세요.

    ```java
    @Controller
    public class MessageWebSocketController {
        ...
        @MessageMapping(...)
    }
    ```

    - 클라이언트는 웹소켓으로 `/pub/messages` 엔드포인트에 메시지를 전송할 수 있어야 합니다.
      - `@MessageMapping`을 활용하세요.
    - 메시지 전송 요청의 페이로드 타입은 `MessageCreateRequest` 를 그대로 활용합니다.

  - 첨부파일이 포함된 메시지는 기존의 API (`POST /api/messages`)를 그대로 활용합니다.

- [x] 메시지 수신
  - 클라이언트는 채널 입장 시 웹소켓으로 `/sub/channels.{channelId}.messages` 를 구독해 메시지를 수신합니다.
  - 이를 고려해 메시지가 생성되면 해당 엔드포인트로 메시지를 보내는 컴포넌트를 구현하세요.

    ```java
    @Component
    public class WebSocketRequiredEventListener {
        ...
        private final SimpMessagingTemplate messagingTemplate;

      @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
      public void handleMessage(MessageCreatedEvent event) {...}
    }
    ```

    - `MessageCreatedEvent`를 통해 새로운 메시지 생성 이벤트를 확인하세요.
    - `SimpMessagingTemplate`를 통해 적절한 엔드포인트로 메시지를 전송하세요.

### 3-02. SSE 구현하기

- [x] SSE 환경을 구성하세요.
  - 클라이언트에서 SSE 연결을 위한 엔드포인트를 구현하세요.
    - `GET /api/sse`
  - 사용자별 SseEmitter 객체를 생성하고 메시지를 전송하는 컴포넌트를 구현하세요.

    ```java
    @Service
    public class SseService {

      public SseEmitter connect(UUID receiverId, UUID lastEventId) {...}

      public void send(Collection<UUID> receiverIds, String eventName, Object data) {...}

      public void broadcast(String eventName, Object data) {...}

      @Scheduled(fixedDelay = 1000 * 60 * 30)
      public void cleanUp() {...}

      private boolean ping(SseEmitter sseEmitter) {...}
    }
    ```

    - `connect`: SseEmitter 객체를 생성합니다.
    - `send`, `broadcast`: SseEmitter 객체를 통해 이벤트를 전송합니다.
    - `cleanUp`: 주기적으로 ping을 보내서 만료된 `SseEmitter` 객체를 삭제합니다.
    - `ping`: 최초 연결 또는 만료 여부를 확인하기 위한 용도로 더미 이벤트를 보냅니다.

  - `SseEmitter` 객체를 메모리에서 저장하는 컴포넌트를 구현하세요.

    ```java
    @Repository
    public class SseEmitterRepository {
      private final ConcurrentMap<UUID, List<SseEmitter>> data = new ConcurrentHashMap<>();
        ...
    }
    ```

    - `ConcurrentMap`: 스레드 세이프한 자료구조를 사용합니다.
    - `List<SseEmitter>`: 사용자 당 N개의 연결을 허용할 수 있도록 합니다. (예: 다중 탭)

  - 이벤트 유실 복원을 위해 SSE 메시지를 저장하는 컴포넌트를 구현하세요.

    ```java
    @Repository
    public class SseMessageRepository {

      private final ConcurrentLinkedDeque<UUID> eventIdQueue = new ConcurrentLinkedDeque<>();
      private final Map<UUID, SseMessage> messages = new ConcurrentHashMap<>();
        ...
    }
    ```

    - 각 메시지 별로 고유한 ID를 부여합니다.
    - 클라이언트에서 `LastEventId`를 전송해 이벤트 유실 복원이 가능하도록 해야 합니다.

`//...`

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint12](https://github.com/JungH200000/10-sprint-mission/tree/sprint12)

---
