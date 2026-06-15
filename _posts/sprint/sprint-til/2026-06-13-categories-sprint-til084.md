---
title: '[TIL 84일 차] Sprint Mission11'
excerpt: '4.심화 요구사항'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til085

toc: true
toc_sticky: true

date: 2026-06-13
last_modified_at: 2026-06-13
---

# 오늘의 성취

## 1. 개발 진행 상황

- Radis Cache 도입
  - Redis 환경/설정 구성 및 `@Bean` 추가
  - DataGrip으로 저장된 캐시 정보 조회

---

# 프로젝트 요구 사항

## 4. 심화 요구사항

`//...`

### 4-02. Redis Cache 도입하기

- 대용량 트래픽을 감당하기 위해 서버의 인스턴스를 여러 개로 늘렸다고 가정해봅시다.
- `Caffeine`과 같은 로컬 캐시는 서로 다른 서버에서 더 이상 활용할 수 없습니다.
  따라서 `Redis`를 통해 전역 캐시 저장소를 구성합니다.
- [x] **Redis 환경을 구성하세요.**
  - Docker Compose를 활용해 Redis를 구동하세요.

    ```yaml
    # docker-compose-redis.yml
    # https://developer.confluent.io/confluent-tutorials/kafka-on-docker/#the-docker-compose-file
    services:
      redis:
        image: redis:7.2-alpine
        container_name: redis
        ports:
          - '6379:6379'
        volumes:
          - redis-data:/data
        command: redis-server --appendonly yes

    volumes:
      redis-data:
    ```

    ```bash

    docker compose -f docker-compose-redis.yml up -d
    ```

  - Redis 의존성을 추가하고, `application.yml`에 Redis 설정을 추가하세요.

    ```groovy

    implementation 'com.github.ben-manes.caffeine:caffeine'
    implementation 'org.springframework.boot:spring-boot-starter-data-redis'
    ```

    ```yaml

    # application.yaml
    spring:
      ...
      cache:
        type: caffeine
        type: redis
        cache-names:
          - channels
          - notifications
          - users
        caffeine:
          spec: >
            maximumSize=100,
            expireAfterAccess=600s,
            recordStats
        redis:
          enable-statistics: true
      data:
        redis:
          host: ${REDIS_HOST:localhost}
          port: ${REDIS_PORT:6379}
    ```

  - 직렬화 설정을 위해 다음과 같이 Bean을 선언하세요.

    ```java

    // CacheConfig
    @Bean
    public RedisCacheConfiguration redisCacheConfiguration(ObjectMapper objectMapper) {
      ObjectMapper redisObjectMapper = objectMapper.copy();
      redisObjectMapper.activateDefaultTyping(
          LaissezFaireSubTypeValidator.instance,
          DefaultTyping.EVERYTHING,
          As.PROPERTY
      );

      return RedisCacheConfiguration.defaultCacheConfig()
          .serializeValuesWith(
              RedisSerializationContext.SerializationPair.fromSerializer(
                  new GenericJackson2JsonRedisSerializer(redisObjectMapper)
              )
          )
          .prefixCacheNameWith("discodeit:")
          .entryTtl(Duration.ofSeconds(600))
          .disableCachingNullValues();
    }
    ```

- [x] DataGrip을 통해 Redis에 저장된 캐시 정보를 조회해보세요.

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint11](https://github.com/JungH200000/10-sprint-mission/tree/sprint11)

---
