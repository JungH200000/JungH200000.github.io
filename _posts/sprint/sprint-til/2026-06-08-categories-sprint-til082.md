---
layout: single-editorial
title: '[TIL 82일 차] Sprint Mission11'
excerpt: '3.기본 요구사항 ~ 4.심화 요구사항'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til082

toc: true
toc_sticky: true

date: 2026-06-08
last_modified_at: 2026-06-08
---

# 오늘의 성취

## 1. 개발 진행 상황

- Cache 적용하기
  - `Caffeine` Cache 설정
  - "사용자별 채널 목록 조회, 사용자별 알림 목록 조회, 사용자 목록 조회"에 `@Cacheable` 적용
  - Spring Actuator를 활용한 캐시 관련 통계 지표 확인
- Spring Kafka 도입하기
  - Docker Compose로 Kafka 구동을 위한 `docker-compose-kafka.yaml` 파일 구현
  - `application.yaml`에 Kafka 관련 설정 추가

---

# 프로젝트 요구 사항

## 3. 기본 요구사항

`//...`

### 3-05. 캐시 적용하기

- [x] Caffeine 캐시를 위한 환경을 구성하세요.
  - `org.springframework.boot:spring-boot-starter-cache` 의존성을 추가하세요.
  - `com.github.ben-manes.caffeine:caffeine` 의존성을 추가하세요.
  - application.yaml 설정 또는 Bean을 통해 캐시 Caffeine 캐시를 설정하세요.
- [x] `@Cacheable` 어노테이션을 활용해 캐시가 필요한 메소드에 적용하세요.
  - 사용자별 채널 목록 조회
  - 사용자별 알림 목록 조회
  - 사용자 목록 조회
- [x] 데이터 변경 시, 캐시를 갱신 또는 무효화하는 로직을 구현하세요.
  - `@CacheEvict`, `@CachePut`, `CacheManager` 등을 활용하세요.
  - 예시:
    - 새로운 채널 추가/수정/삭제 → 채널 목록 캐시 무효화
    - 알림 추가/삭제 → 알림 목록 캐시 무효화
    - 사용자 추가/로그인/로그아웃 → 사용자 목록 캐시 무효화
- [x] 캐시 적용 전후의 차이를 비교해보세요.
  - 로그를 통해 SQL 실행 여부를 확인해보세요.
- [x] Spring Actuator를 활용해 캐시 관련 통계 지표를 확인해보세요.
  - Caffein Spec에 `recordStats` 옵션을 추가하세요.

    ```yaml

      # application.yaml
      cache:
            ...
        caffeine:
          spec: >
            maximumSize=100,
            expireAfterAccess=600s,
            recordStats
    ```

  - `/actuator/caches`, `/actuator/metrics/cache.*` 를 통해 캐시 관련 데이터를 확인해보세요.

---

## 4. 심화 요구사항

### 4-00. 유의사항

- 이번 실습은 분산 환경을 대비한 기술 도입을 목표로 합니다. 특히, 여러 서버나 인스턴스로 구성되는 시스템에서 발생할 수 있는 문제를 해결하는 데 필요한 기술을 학습합니다.
  - Kafka를 통한 이벤트 발행/구독
  - Redis를 활용한 전역 캐시 저장소 구성
- 이번 미션에서는 Kafka, Redis의 세부 설정이나 고급 기능보다는, 기술을 간단하게 적용하고, **분산 환경의 필요성과 기존 시스템의 한계**를 이해하는 데 집중해주세요.

### 4-01. Spring Kafka 도입하기

- 회원이 늘어나면서 알림 연산량이 급증해 알림 기능만 별도의 마이크로 서비스로 분리하기로 결정했다고 가정해봅시다.
- 이제 알림 서비스와 메인 서비스는 완전히 분리된 서버이므로 Spring Event만을 통해서 이벤트를 발행/소비할 수 없습니다.
- 따라서 메인 서비스에서 Kafka를 통해 서버 외부로 이벤트를 발행하고, 알림 서비스에서는 서버 외부의 이벤트를 소비할 수 있도록 해야합니다.
- [x] **Kafka 환경을 구성하세요.**
  - Docker Compose를 활용해 Kafka를 구동하세요.

    ```yaml
    # docker-compose-kafka.yaml
    # https://developer.confluent.io/confluent-tutorials/kafka-on-docker/#the-docker-compose-file
    services:
      broker:
        image: apache/kafka:latest
        hostname: broker
        container_name: broker
        ports:
          - 9092:9092
        environment:
          KAFKA_BROKER_ID: 1
          KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT,CONTROLLER:PLAINTEXT
          KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://broker:29092,PLAINTEXT_HOST://localhost:9092
          KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
          KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS: 0
          KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
          KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
          KAFKA_PROCESS_ROLES: broker,controller
          KAFKA_NODE_ID: 1
          KAFKA_CONTROLLER_QUORUM_VOTERS: 1@broker:29093
          KAFKA_LISTENERS: PLAINTEXT://broker:29092,CONTROLLER://broker:29093,PLAINTEXT_HOST://0.0.0.0:9092
          KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
          KAFKA_CONTROLLER_LISTENER_NAMES: CONTROLLER
          KAFKA_LOG_DIRS: /tmp/kraft-combined-logs
          CLUSTER_ID: MkU3OEVBNTcwNTJENDM2Qk
    ```

    ```bash

    docker compose -f docker-compose-kafka.yaml up -d
    ```

  - Spring Kafka 의존성을 추가하고, `application.yml`에 Kafka 설정을 추가하세요.

    ```groovy

    implementation 'org.springframework.kafka:spring-kafka'
    ```

    ```yaml

    # application.yaml
    spring:
        ...
      kafka:
        bootstrap-servers: localhost:9092
        producer:
          key-serializer: org.apache.kafka.common.serialization.StringSerializer
          value-serializer: org.apache.kafka.common.serialization.StringSerializer
        consumer:
          group-id: discodeit-group
          auto-offset-reset: earliest
          key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
          value-deserializer: org.apache.kafka.common.serialization.StringDeserializer
    ```

`//...`

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint11](https://github.com/JungH200000/10-sprint-mission/tree/sprint11)
