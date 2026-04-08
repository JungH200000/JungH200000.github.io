---
title: '[TIL 59일 차] Sprint Mission8 - Dockerfile 작성 및 build 후 테스트'
excerpt: '2-01.애플리케이션 컨테이너화, 3-01.이미지 최적화하기'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til059

toc: true
toc_sticky: true

date: 2026-04-06
last_modified_at: 2026-04-06
---

# 오늘의 성취

## 1. 개발 진행 상황

- `Dockerfile` 작성
  - Amazon Corretto 17 이미지를 베이스 이미지로 활용
  - 이미지를 build 시 불필요한 파일을 `.dockerignore`를 활용해 제외
    - `.git`, .`gitignore`, `.gradle`, `.idea`, `.logs`, `build` 등등
  - `80` 포트를 노출하도록 설정
  - 실행할 `JAR` 파일의 이름을 추론하는데 프로젝트 이름, 버전 사용
- 이미지 빌드 및 실행
  - Docker 이미지 build, 태그는 `local`
    - `docker build -t jungh20000/discodeit-1.2-M8:local .`
  - build된 이미지로 컨테이너 실행 및 테스트
    - 로컬 PostgreSQL 서버 활용
    - `http://localhost:8081`로 접속하도록 포트 매핑

    ```powershell
    docker run -d `
      -p 8081:80 `
      -e SPRING_PROFILES_ACTIVE=prod `
      -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/discodeit `
      -e SPRING_DATASOURCE_USERNAME=discodeit_user `
      -e SPRING_DATASOURCE_PASSWORD=discodeit1234 `
      jungh20000/discodeit-1.2-m8:local
    ```

- [Dockerfile](#dockerfile)

<br>

## 2. 질문

### `.dockerignore` 활용 방법

`.dockerignore`은 Docker 이미지를 build할 때 보내지 않을 파일/폴더를 정하는 파일

```shell
docker build -t my-app .
```

위 코드에서 마지막 `.`은 현재 폴더 전체를 build 컨텍스트(context)로 Docker에 보내겠다는 의미

아래의 파일들은 포함될 수 있으나 필요 없는 경우가 많음

- `.git`
- `.gitignore`
- `.gradle`
- `.idea`
- `.logs`
- `build`
- `storage`

### Dockerfile 명령어 `ARG`와 `ENV`

- `ARG` : 빌드 전용 변수
- `ENV` : 실행 시에도 남는 환경 변수

### `RUN ./gradlew clean build --no-daemon`에서 `daemon`이 뭘까?

daemon은 Gradle이 다음 빌드를 빠르게 하려고 뒤에서 계속 켜 두는 보조 프로세스

Docker는 보통 한 번만 실행하고 끝나는 일회성 작업이라 `--no-daemon`을 많이 쓴다.

<br>

## 3. 문제

### `ENTRYPOINT ["java", "$JVM_OPTS", ...]`는 `QUOTE expected, got '$'` 이런 문제 발생

Dockerfile의 JSON 배열 형태는 쉘을 거치지 않고 바로 프로세스를 실행하기 때문에

```Dockerfile
ENTRYPOINT ["java", "$JVM_OPTS", "-jar", "app.jar"]
```

위 코드처럼 쓰면 `$JVM_OPTS`이 JVM 옵션이 아닌 문자 그대로 사용됨

#### 해결책

```Dockerfile
ENTRYPOINT ["sh", "-c", "exec java $JVM_OPTS -jar app.jar"]
```

`sh -c`를 사용하면 shell이 `$JVM_OPTS`를 환경변수 값으로 치환해 준다. 즉, 옵션 여러 개를 문자열로 넣어두고 실행 시점에 분리해서 적용하려면 shell이 필요하다.

참고로 여기서 `exec`를 사용하는 이유는 shell 프로세스를 java 프로세스로 교체해줘서 동작이 깔끔해진다.

### `Dockerfile` build 중 test에서 오류 발생

```java
@SpringBootTest
class DiscodeitApplicationTests {

    @Test
    void contextLoads() {
    }

}
```

컨텍스트를 띄우는 순간 Spring은 DB 설정도 읽는데, "test 프로파일"이 설정되어 있지 않다면 `application.yml` 설정을 따라 가서 운영/개발 DB 설정을 읽게 됨. 더군다나 Docker에서 실행하는 거라 이때 `localhost`는 우리 PC가 아닌 컨테이너 자신이 됨으로 DB 설정을 읽을 수 없게 됨

#### 해결

`contextLoads()`에 기존에 설정한 "test 프로파일" 적용하여 PostgreSQL이 아닌 H2를 사용하여 테스트하도록 설정

```java
@SpringBootTest
@ActiveProfiles("test")
class DiscodeitApplicationTests {

    @Test
    void contextLoads() {
    }

}
```

---

# 프로젝트 요구 사항

## 2. 기본 요구사항

### 2-01. 애플리케이션 컨테이너화

#### Dockerfile 작성

- [x] [Amazon Corretto 17 이미지](https://hub.docker.com/layers/library/amazoncorretto/17/images/sha256-8929bdc3e2be20250ae46b3bc1dc361fcd637cd189ec02174251b0e499a22fad)를 베이스 이미지로 사용하세요.
- [x] 작업 디렉터리를 설정하세요. (`/app`)
- [x] 프로젝트 파일을 컨테이너로 복사하세요. 단, 불필요한 파일은 `.dockerignore`를 활용해 제외하세요.
- [x] Gradle Wrapper를 사용하여 애플리케이션을 build하세요.
- [x] `80` 포트를 노출하도록 설정하세요.
- [x] 프로젝트 정보를 환경 변수로 설정하세요.
  - 실행할 jar 파일의 이름을 추론하는데 활용됩니다.
  - `PROJECT_NAME`: discodeit
  - `PROJECT_VERSION`: 1.2-M8
- [x] JVM 옵션을 환경 변수로 설정하세요.
  - `JVM_OPTS`: 기본값은 빈 문자열로 정의
- [x] 애플리케이션 실행 명령어를 설정하세요. 이때 환경변수로 정의한 프로젝트 정보를 활용하세요.

#### 이미지 build 및 실행 테스트

- [x] Docker 이미지를 build하고 태그(`local`)를 지정하세요.
- [x] build된 이미지를 활용해서 컨테이너를 실행하고 애플리케이션을 테스트하세요.
  - [x] `prod` 프로필로 실행하세요.
  - [x] 데이터베이스는 로컬 환경에서 구동 중인 PostgreSQL 서버를 활용하세요.
  - [x] `http://localhost:8081`로 접속 가능하도록 포트를 매핑하세요.

`//...`

## 3. 심화 요구사항

### 3-01. 이미지 최적화하기

- [x] 멀티 스테이지(`빌드`, `런타임`) 빌드를 활용해 이미지의 크기를 줄여보세요.
  - 태그명: `local-slim`
  - 이전에 빌드한 이미지(`1.2-M8` 또는 `local`)와 크기를 비교해보세요.

    <img width="700" src="https://github.com/user-attachments/assets/3fbfe953-9a65-4272-8765-20d918ad2087" />

- [x] 이미지 레이어 캐시를 고려해 Dockerfile을 수정해보세요.

`//...`

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint8](https://github.com/JungH200000/10-sprint-mission/tree/sprint8)

---

# 정리 및 보관용 코드

## `Dockerfile`

```Dockerfile
# ========== 1. Build stage ==========
# 1-1. Amazon Corretto 17 이미지를 build 베이스 이미지로 설정
FROM amazoncorretto:17 AS builder

# 1-2. 작업 디렉터리 설정
WORKDIR /app

# 1-3. 레이어 캐시를 고려해, 자주 변경되지 않는 Gradle 관련 파일 먼저 복사
# COPY 원본_경로 컨테이너_안의_목적지_경로
COPY gradlew ./
COPY gradle ./gradle
COPY build.gradle settings.gradle ./

# 1-4. `gradlew` 파일에 실행 권한 부여
# `chmod` : 파일의 권한을 변경하는 리눅스 명령어
# `+x` : `chmod`와 함께 쓰이며, 실행 권한을 추가하는 명령어
RUN chmod +x ./gradlew

# 1-5. Gradle 의존성 관련 레이어를 먼저 생성하여 캐시 활용
# `--no-daemon` : 백그라운드 상주 프로세스(daemon) 없이 한 번만 실행하고 끝내라는 명령어
RUN ./gradlew dependencies --no-daemon
# 즉, 소스코드만 바뀌고, Gradle 관련 설정이 안 바뀌면, 이 앞의 레이어 재사용 가능해짐

# 1-6. 실제 소스 코드 복사
COPY src ./src

# 1-7. Gradle Wrapper 사용하여 실행 가능한 `JAR` 파일 생성
RUN ./gradlew clean bootJar --no-daemon

# ========== 2. Runtime stage ==========
# 2-1. Amazon Corretto 17 이미지를 런타임 베이스 이미지로 설정
FROM amazoncorretto:17

# 2-2. 작업 디렉터리 설정
WORKDIR /app

# 2-3. 서비스 포트 노출
EXPOSE 80

# 2-4. 프로젝트 정보를 환경 변수로 설정 -> 실행할 jar 파일의 이름을 추론하는데 활용
ENV PROJECT_NAME=discodeit
ENV PROJECT_VERSION=1.2-M8

# 2-5. JVM 옵션을 환경 변수로 설정 (기본값은 빈 문자열)
ENV JVM_OPTS=""

# 2-6. Build stage에서 생성된 JAR 파일 복사
COPY --from=builder /app/build/libs/${PROJECT_NAME}-${PROJECT_VERSION}.jar ./

# 2-7. 컨테이너가 실행될 때 실행할 명령어
ENTRYPOINT ["sh", "-c", "exec java $JVM_OPTS -jar ${PROJECT_NAME}-${PROJECT_VERSION}.jar"]
```
