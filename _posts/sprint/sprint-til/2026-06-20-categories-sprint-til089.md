---
layout: single-editorial
title: '[TIL 89일 차] Sprint Mission12'
excerpt: '4.심화 요구사항'
published: false

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til089

toc: true
toc_sticky: true

date: 2026-06-20
last_modified_at: 2026-06-20
---

# 오늘의 성취

## 1. 개발 진행 상황

## 2. 문제

## 2. 질문

## 2. 고민

## 3. 질문

## 3. 고민

## 3. 문제

---

# 프로젝트 요구 사항

`//...`

## 4. 심화 요구사항

`//...`

### 4-02. 분산 환경 배포 아키텍처 구성하기

- [ ] 다음의 다이어그램에 부합하는 배포 아키텍처를 Docker Compose를 통해 구현하세요.

  ![zkdz2mts7-image.png](https://bakey-api.codeit.kr/api/files/resource?root=static&seqId=14134&version=1&directory=/zkdz2mts7-image.png&name=zkdz2mts7-image.png)
  - `Backend-*`
    - `deploy.replicas` 설정을 활용하세요.
  - `Reverse Proxy`
    - `upstream` 블록을 수정해 다음의 로드밸런싱 전략을 적용해 `Backend`로 트래픽을 분산시켜보세요.
      - **Round Robin** `기본값`
      - **Least Connections**
      - **IP Hash**
      - **Weight**
    - `$upstream_addr` 변수를 활용해 실제 요청을 처리하는 서버의 IP를 헤더에 추가하고 브라우저 개발자 도구를 활용해 비교해보세요.

      ```
          location ^~ /api/sse {
                  ...
            add_header X-Upstream-Server $upstream_addr;
          }

          location ^~ /api/ {
              ...
            add_header X-Upstream-Server $upstream_addr;
          }

          location ^~ /ws/ {
              ...
            add_header X-Upstream-Server $upstream_addr;
          }
      ```

- [ ] 분산환경에 따른 `InMemoryJwtRegistry`의 한계점을 식별하고 Redis를 활용해 리팩토링하세요.
  - 어떤 한계가 있는지 식별하고 PR에 남겨주세요.
  - `RedisJwtRegistry` 구현체를 활용하세요.

    ```java
    @Configuration
    public class RedisConfig {

      @Bean
      public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory,
          @Qualifier("redisSerializer") GenericJackson2JsonRedisSerializer redisSerializer) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        // Use String serializer for keys
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());

        // Use JSON serializer for values
        template.setValueSerializer(redisSerializer);
        template.setHashValueSerializer(redisSerializer);

        template.afterPropertiesSet();
        return template;
      }

      @Bean("redisSerializer")
      public GenericJackson2JsonRedisSerializer redisSerializer(ObjectMapper objectMapper) {
        ObjectMapper redisObjectMapper = objectMapper.copy();
        redisObjectMapper.activateDefaultTyping(
            LaissezFaireSubTypeValidator.instance,
            DefaultTyping.EVERYTHING,
            As.PROPERTY
        );
        return new GenericJackson2JsonRedisSerializer(redisObjectMapper);
      }
    }
    ```

    ```java
    package com.sprint.mission.discodeit.redis;

    import java.time.Duration;
    import lombok.RequiredArgsConstructor;
    import lombok.extern.slf4j.Slf4j;
    import org.springframework.data.redis.core.RedisTemplate;
    import org.springframework.data.redis.core.ValueOperations;
    import org.springframework.stereotype.Component;

    @Slf4j
    @RequiredArgsConstructor
    @Component
    public class RedisLockProvider {

      private static final Duration LOCK_TIMEOUT = Duration.ofSeconds(10);
      private static final String LOCK_KEY_PREFIX = "lock:";

      private final RedisTemplate<String, Object> redisTemplate;

      public void acquireLock(String key) {
        String lockKey = LOCK_KEY_PREFIX + key;
        String lockValue = Thread.currentThread().getName() + "-" + System.currentTimeMillis();
        ValueOperations<String, Object> valueOps = redisTemplate.opsForValue();

        // SETNX: 키가 없으면 설정하고 TTL 지정
        Boolean acquired = valueOps.setIfAbsent(lockKey, lockValue, LOCK_TIMEOUT);

        if (Boolean.TRUE.equals(acquired)) {
          log.debug("분산 락 획득 성공: {} (값: {})", lockKey, lockValue);
        } else {
          log.debug("분산 락 획득 실패: {}", lockKey);
          throw new RedisLockAcquisitionException("분산 락 획득 실패: " + lockKey);
        }
      }

      public void releaseLock(String key) {
        String lockKey = LOCK_KEY_PREFIX + key;
        try {
          redisTemplate.delete(lockKey);
          log.debug("분산 락 해제 완료: {}", lockKey);
        } catch (Exception e) {
          log.warn("분산 락 해제 실패: {}", lockKey, e);
        }
      }
      public static class RedisLockAcquisitionException extends RuntimeException {

        public RedisLockAcquisitionException(String message) {
          super(message);
        }
      }
    }
    ```

    - 원자적 연산을 위해 분산락을 사용합니다.

    ```java
    package com.sprint.mission.discodeit.security.jwt;

    import com.sprint.mission.discodeit.dto.data.JwtInformation;
    import com.sprint.mission.discodeit.event.message.UserLogInOutEvent;
    import com.sprint.mission.discodeit.redis.RedisLockProvider.RedisLockAcquisitionException;
    import com.sprint.mission.discodeit.redis.RedisLockProvider;
    import java.time.Duration;
    import java.util.List;
    import java.util.Set;
    import java.util.UUID;
    import lombok.RequiredArgsConstructor;
    import lombok.extern.slf4j.Slf4j;
    import org.springframework.cache.annotation.CacheEvict;
    import org.springframework.context.ApplicationEventPublisher;
    import org.springframework.data.redis.core.RedisTemplate;
    import org.springframework.retry.annotation.Backoff;
    import org.springframework.retry.annotation.Retryable;
    import org.springframework.scheduling.annotation.Scheduled;

    @Slf4j
    @RequiredArgsConstructor
    public class RedisJwtRegistry implements JwtRegistry {

      private static final String USER_JWT_KEY_PREFIX = "jwt:user:";
      private static final String ACCESS_TOKEN_INDEX_KEY = "jwt:access_tokens";
      private static final String REFRESH_TOKEN_INDEX_KEY = "jwt:refresh_tokens";
      private static final Duration DEFAULT_TTL = Duration.ofMinutes(30);

      private final int maxActiveJwtCount;
      private final JwtTokenProvider jwtTokenProvider;
      private final ApplicationEventPublisher eventPublisher;
      private final RedisTemplate<String, Object> redisTemplate;
      private final RedisLockProvider redisLockProvider;

      @CacheEvict(value = "users", key = "'all'")
      @Retryable(retryFor = RedisLockAcquisitionException.class, maxAttempts = 10,
          backoff = @Backoff(delay = 100, multiplier = 2))
      @Override
      public void registerJwtInformation(JwtInformation jwtInformation) {
        String userKey = getUserKey(jwtInformation.getUserDto().id());
        String lockKey = jwtInformation.getUserDto().id().toString();

        redisLockProvider.acquireLock(lockKey);
        try {
          Long currentSize = redisTemplate.opsForList().size(userKey);

          while (currentSize != null && currentSize >= maxActiveJwtCount) {
            Object oldestTokenObj = redisTemplate.opsForList().leftPop(userKey);
            if (oldestTokenObj instanceof JwtInformation oldestToken) {
              removeTokenIndex(oldestToken.getAccessToken(), oldestToken.getRefreshToken());
            }
            currentSize = redisTemplate.opsForList().size(userKey);
          }

          redisTemplate.opsForList().rightPush(userKey, jwtInformation);
          redisTemplate.expire(userKey, DEFAULT_TTL);
          addTokenIndex(jwtInformation.getAccessToken(), jwtInformation.getRefreshToken());

        } finally {
          redisLockProvider.releaseLock(lockKey);
        }

        eventPublisher.publishEvent(
            new UserLogInOutEvent(jwtInformation.getUserDto().id(), true)
        );
      }

      @CacheEvict(value = "users", key = "'all'")
      @Override
      public void invalidateJwtInformationByUserId(UUID userId) {
        String userKey = getUserKey(userId);

        List<Object> tokens = redisTemplate.opsForList().range(userKey, 0, -1);
        if (tokens != null) {
          tokens.forEach(tokenObj -> {
            if (tokenObj instanceof JwtInformation jwtInfo) {
              removeTokenIndex(jwtInfo.getAccessToken(), jwtInfo.getRefreshToken());
            }
          });
        }

        redisTemplate.delete(userKey);
        eventPublisher.publishEvent(new UserLogInOutEvent(userId, false));
      }

      @Override
      public boolean hasActiveJwtInformationByUserId(UUID userId) {
        String userKey = getUserKey(userId);
        Long size = redisTemplate.opsForList().size(userKey);
        return size != null && size > 0;
      }

      @Override
      public boolean hasActiveJwtInformationByAccessToken(String accessToken) {
        return Boolean.TRUE.equals(
            redisTemplate.opsForSet().isMember(ACCESS_TOKEN_INDEX_KEY, accessToken)
        );
      }

      @Override
      public boolean hasActiveJwtInformationByRefreshToken(String refreshToken) {
        return Boolean.TRUE.equals(
            redisTemplate.opsForSet().isMember(REFRESH_TOKEN_INDEX_KEY, refreshToken)
        );
      }

      @Retryable(retryFor = RedisLockAcquisitionException.class, maxAttempts = 10,
          backoff = @Backoff(delay = 100, multiplier = 2))
      @Override
      public void rotateJwtInformation(String refreshToken, JwtInformation newJwtInformation) {
        String userKey = getUserKey(newJwtInformation.getUserDto().id());
        String lockKey = newJwtInformation.getUserDto().id().toString();

        redisLockProvider.acquireLock(lockKey);
        try {
          List<Object> tokens = redisTemplate.opsForList().range(userKey, 0, -1);

          if (tokens != null) {
            for (int i = 0; i < tokens.size(); i++) {
              if (tokens.get(i) instanceof JwtInformation jwtInfo &&
                  jwtInfo.getRefreshToken().equals(refreshToken)) {

                removeTokenIndex(jwtInfo.getAccessToken(), jwtInfo.getRefreshToken());
                jwtInfo.rotate(newJwtInformation.getAccessToken(),
                    newJwtInformation.getRefreshToken());
                redisTemplate.opsForList().set(userKey, i, jwtInfo);
                addTokenIndex(newJwtInformation.getAccessToken(),
                    newJwtInformation.getRefreshToken());
                redisTemplate.expire(userKey, DEFAULT_TTL);
                break;
              }
            }
          }

        } finally {
          redisLockProvider.releaseLock(lockKey);
        }
      }

      @Scheduled(fixedDelay = 1000 * 60 * 5)
      @Override
      public void clearExpiredJwtInformation() {
        Set<String> userKeys = redisTemplate.keys(USER_JWT_KEY_PREFIX + "*");

        for (String userKey : userKeys) {
          List<Object> tokens = redisTemplate.opsForList().range(userKey, 0, -1);

          if (tokens != null) {
            boolean hasValidTokens = false;

            for (int i = tokens.size() - 1; i >= 0; i--) {
              if (tokens.get(i) instanceof JwtInformation jwtInfo) {
                boolean isExpired =
                    !jwtTokenProvider.validateAccessToken(jwtInfo.getAccessToken()) ||
                        !jwtTokenProvider.validateRefreshToken(jwtInfo.getRefreshToken());

                if (isExpired) {
                  redisTemplate.opsForList().set(userKey, i, "EXPIRED");
                  redisTemplate.opsForList().remove(userKey, 1, "EXPIRED");
                  removeTokenIndex(jwtInfo.getAccessToken(), jwtInfo.getRefreshToken());
                } else {
                  hasValidTokens = true;
                }
              }
            }

            if (!hasValidTokens) {
              redisTemplate.delete(userKey);
            }
          }
        }
      }

      private String getUserKey(UUID userId) {
        return USER_JWT_KEY_PREFIX + userId.toString();
      }

      private void addTokenIndex(String accessToken, String refreshToken) {
        // Set에 토큰 추가 (add: 중복되면 무시됨)
        redisTemplate.opsForSet().add(ACCESS_TOKEN_INDEX_KEY, accessToken);
        redisTemplate.opsForSet().add(REFRESH_TOKEN_INDEX_KEY, refreshToken);

        // 인덱스 키에도 만료 시간 설정 (메모리 누수 방지)
        redisTemplate.expire(ACCESS_TOKEN_INDEX_KEY, DEFAULT_TTL);
        redisTemplate.expire(REFRESH_TOKEN_INDEX_KEY, DEFAULT_TTL);
      }

      private void removeTokenIndex(String accessToken, String refreshToken) {
        // Set에서 토큰 제거
        redisTemplate.opsForSet().remove(ACCESS_TOKEN_INDEX_KEY, accessToken);
        redisTemplate.opsForSet().remove(REFRESH_TOKEN_INDEX_KEY, refreshToken);
      }
    }
    ```

- [ ] 분산환경에 따른 웹소켓과 SSE의 한계점을 식별하고 Kafka를 활용해 리팩토링하세요.
  - 어떤 한계가 있는지 식별하고 PR에 남겨주세요.
  - 일반적인 카프카 이벤트와 다르게 각 서버 인스턴스마다 이벤트를 받을 수 있어야 합니다. 따라서 `컨슈머 group id`를 적절히 설정하세요.

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint12](https://github.com/JungH200000/10-sprint-mission/tree/sprint12)

---

# 정리 및 보관용 코드
