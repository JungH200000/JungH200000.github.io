---
title: '[TIL 60일 차] Sprint Mission8 - Docker Compose 구성 및 BinaryContentStorage 고도화'
excerpt: '2-01.애플리케이션 컨테이너화 ~ 2-02.BinaryContentStorage 고도화 (AWS S3)'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til060

toc: true
toc_sticky: true

date: 2026-04-07
last_modified_at: 2026-04-07
---

# 오늘의 성취

## 1. 개발 진행 상황

- Docker Compose 구성
  - 개발 환경용 `docker-compose.yml` 파일 작성
  - 애플리케이션과 PostgreSQL 서비스 포함
  - 환경변수를 `.env` 파일 활용하되, `.env`는 형상관리에서 제외
  - 애플리케이션과 PostgreSQL에 볼륨 구성하여 데이터 유지되도록 설정

- AWS S3를 활용한 `BinaryContentStorage` 고도화
  - `S3BinaryContentStorage를` 구현
    - `download` 메서드는 `PresignedUrl`을 활용해 리다이렉트하는 방식
  - `S3BinaryContentStorageTest`를 함께 작성하면서 구현

- [docker compose 정리 코드](#docker-composeyaml)
- [AWSS3Test 테스트 정리 코드](#awss3test-테스트-코드)
- [AwsProperties 정리 코드](#awsproperties-코드)
- [S3Config 정리 코드](#s3config-코드)

<br>

## 2. 문제

### PostgreSQL 18+에서는 권장 볼륨 마운트 방식 변경

- 기존 사용 방식

```yaml
volumes: # PostgreSQL 볼륨 구성
  - postgres-data:/var/lib/postgresql/data
```

```
there appears to be PostgreSQL data in: /var/lib/postgresql/data (unused mount/volume)
The suggested container configuration for 18+ is to place a single mount at /var/lib/postgresql which will then place PostgreSQL
```

Postgres 18+에서는 권장 마운트 경로가 `/var/lib/postgresql`로, Postgres 18+ 이미지들은 내부적으로 메이저 버전별 하위 디렉터리를 쓰는 방식으로 변경됨

#### 해결

```yaml
volumes: # PostgreSQL 볼륨 구성
  - postgres-data:/var/lib/postgresql
```

### `Could not autowire. No beans of 'String' type found.` 오류 발생

```java
@Component
@ConditionalOnProperty(name = "discodeit.storage.type", havingValue = "s3")
public class S3BinaryContentStorage implements BinaryContentStorage {

    private final String accessKey;
    private final String secretKey;
    private final String region;
    private final String bucket;

    public S3BinaryContentStorage(String accessKey, String secretKey, String region, String bucket) {
        this.accessKey = accessKey;
        this.secretKey = secretKey;
        this.region = region;
        this.bucket = bucket;
    }
// ...
}

```

`public S3BinaryContentStorage(String accessKey, String secretKey, String region, String bucket) {...}` 이 부분의 파라미터에서 `Could not autowire. No beans of 'String' type found.` 예외가 발생했다.

Spring은 생성자 주입을 할 때 `String`, `int`, `boolean` 같은 기본값들은 자동으로 Bean으로 등록하지 않는다.

#### 해결

`AwsProperties` 설정 객체 주입

- [AwsProperties 정리 코드](#awsproperties-코드)
- [S3Config 정리 코드](#s3config-코드)

```java
@Component
@ConditionalOnProperty(name = "discodeit.storage.type", havingValue = "s3")
public class S3BinaryContentStorage implements BinaryContentStorage {

    private final AwsProperties awsProperties;
    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    public S3BinaryContentStorage(AwsProperties awsProperties, S3Client s3Client, S3Presigner s3Presigner) {
        this.awsProperties = awsProperties;
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
    }

    // ...
}

```

---

# 프로젝트 요구 사항

## 2. 기본 요구사항

### 2-01. 애플리케이션 컨테이너화

`//...`

#### Docker Compose 구성

- 개발 환경용 `docker-compose.yml` 파일을 작성합니다.
- [x] 애플리케이션과 PostgreSQL 서비스를 포함하세요.
- [x] 각 서비스에 필요한 모든 환경 변수를 설정하세요.
  - `.env` 파일을 활용하되, `.env`는 형상관리에서 제외하여 보안을 유지하세요.
- [x] 애플리케이션 서비스를 로컬 Dockerfile에서 build하도록 구성하세요.
- [x] 애플리케이션 볼륨을 구성하여 컨테이너가 재시작되어도 `BinaryContentStorage` 데이터가 유지되도록 하세요.
- [x] PostgreSQL 볼륨을 구성하여 컨테이너가 재시작되어도 데이터가 유지되도록 하세요.
- [x] PostgreSQL 서비스 실행 후 `schema.sql`이 자동으로 실행되도록 구성하세요.
- [x] 서비스 간 의존성을 설정하세요(`depends_on`).
- [x] 필요한 포트 매핑을 구성하세요.
- [x] Docker Compose를 사용하여 서비스를 시작하고 테스트하세요.
  - `--build` 플래그를 사용하여 서비스 시작 전에 이미지를 build하도록 합니다.

### 2-02. BinaryContentStorage 고도화 (AWS S3)

#### AWS S3 버킷 구성

- [x] AWS S3 버킷을 생성하세요.
  - [x] 버킷 이름을 `discodeit-binary-content-storage-(사용자 이니셜)` 형식으로 지정하세요.
  - [x] 퍼블릭 액세스 차단 설정을 활성화하세요(모든 퍼블릭 액세스 차단).
  - [x] 버전 관리는 비활성화 상태로 두세요.

#### AWS S3 접근을 위한 IAM 구성

- [x] S3 버킷에 접근하기 위한 IAM 사용자(`discodeit`)를 생성하세요.
- [x] `AmazonS3FullAccess` 권한을 할당하고, 사용자 생성을 완료하세요.
- [x] 생성된 사용자에 엑세스 키를 생성하세요.
- [x] 발급받은 키를 포함해서 AWS 관련 정보는 `.env` 파일에 추가합니다.

  ```
  ...
  # AWS
  AWS_S3_ACCESS_KEY=**엑세스_키**
  AWS_S3_SECRET_KEY=**시크릿_키**
  AWS_S3_REGION=**ap-northeast-2**
  AWS_S3_BUCKET=**버킷_이름**
  ```

  - 작성한 `.env` 파일은 리뷰를 위해 PR에 별도로 첨부해주세요. 단, 엑세스 키와 시크릿 키는 제외하세요.

#### AWS S3 테스트

- [x] AWS S3 SDK 의존성을 추가하세요.

  ```groovy
  implementation 'software.amazon.awssdk:s3:2.31.7'
  ```

- [x] S3 API를 간단하게 테스트하세요.
  - 패키지명: `com.sprint.mission.discodeit.stoarge.s3`
  - 클래스명: `AWSS3Test`
  - [x] `Properties` 클래스를 활용해서 `.env`에 정의한 AWS 정보를 로드하세요.
  - [x] 작업 별 테스트 메서드를 작성하세요.
    - 업로드
    - 다운로드
    - PresignedUrl 생성

#### AWS S3를 활용한 `BinaryContentStroage` 고도화

- [x] 앞서 작성한 테스트 메서드를 참고해 `S3BinaryContentStorage`를 구현하세요.
  - 클래스 다이어그램

    <image src="https://bakey-api.codeit.kr/api/files/resource?root=static&seqId=13951&version=1&directory=/evsb0sfio-image.png&name=evsb0sfio-image.png" width=400px>

- [x] `discodeit.storage.type` 값이 `s3`인 경우에만 Bean으로 등록되어야 합니다.
- [ ] `S3BinaryContentStorageTest`를 함께 작성하면서 구현하세요.
- [ ] `BinaryContentStorage` 설정을 유연하게 제어할 수 있도록 `application.yaml`을 수정하세요.

  ```yaml
  discodeit:
    storage:
  -    type: local
  +    type: ${STORAGE_TYPE:local}  # local | s3 (기본값: local)
      local:
  -      root-path: .discodeit/storage
  +      root-path: ${STORAGE_LOCAL_ROOT_PATH:.discodeit/storage}
  +    s3:
  +      access-key: ${AWS_S3_ACCESS_KEY}
  +      secret-key: ${AWS_S3_SECRET_KEY}
  +      region: ${AWS_S3_REGION}
  +      bucket: ${AWS_S3_BUCKET}
  +      presigned-url-expiration: ${AWS_S3_PRESIGNED_URL_EXPIRATION:600} # (기본값: 10분)
  ```

  - [ ] AWS 관련 정보는 형상관리하면 안되므로 `.env` 파일에 작성된 값을 임포트하는 방식으로 설정하세요.
  - [ ] Docker Compose에서도 위 설정을 주입할 수 있도록 수정하세요.

- [x] `download` 메서드는 `PresignedUrl`을 활용해 리다이렉트하는 방식으로 구현하세요.

`//...`

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint8](https://github.com/JungH200000/10-sprint-mission/tree/sprint8)

---

# 정리 및 보관용 코드

## `docker-compose.yaml`

```yaml
# 서비스 정의
services:
  app: # 애플리케이션 서비스
    build: . # 현재 디렉터리의 Dockerfile을 사용해 이미지 build
    image: discodeit:local-slim
    environment: # 환경변수 바인딩
      SPRING_PROFILES_ACTIVE: ${SPRING_PROFILES_ACTIVE}
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/${POSTGRES_DB}
      SPRING_DATASOURCE_USERNAME: ${POSTGRES_USER}
      SPRING_DATASOURCE_PASSWORD: ${POSTGRES_PASSWORD}
      STORAGE_LOCAL_ROOT_PATH: ${STORAGE_LOCAL_ROOT_PATH}
      STORAGE_TYPE: ${STORAGE_TYPE}
      AWS_S3_ACCESS_KEY: ${AWS_S3_ACCESS_KEY}
      AWS_S3_SECRET_KEY: ${AWS_S3_SECRET_KEY}
      AWS_S3_REGION: ${AWS_S3_REGION}
      AWS_S3_BUCKET: ${AWS_S3_BUCKET}
      AWS_S3_PRESIGNED_URL_EXPIRATION: ${AWS_S3_PRESIGNED_URL_EXPIRATION}
    ports: # 포트 매핑(로컬:컨테이너)
      - '8081:80'
    volumes: # 애플리케이션 볼륨 구성
      # 컨테이너가 재시작되어도 `BinaryContentStorage` 데이터 유지
      - binary-content-data:/app/${STORAGE_LOCAL_ROOT_PATH}
    depends_on: # 서비스간 의존성 설정
      postgres:
        # PostgreSQL 서비스가 정상 상태(healthy)가 된 후 app 서비스가 실행되도록 설정
        condition: service_healthy
    networks:
      # backend 네트워크에 app 서비스 연결
      - backend

  postgres: # PostgreSQL 서비스
    image: postgres:17 # `postgres:17` 이미지 사용
    environment: # 환경변수 바인딩
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports: # 포트 매핑(로컬:컨테이너)
      - '5433:5432'
    volumes: # PostgreSQL 볼륨 구성
      # 컨테이너 재시작되어도 PostgreSQL 데이터가 유지되도록 설정
      #      - postgres-data:/var/lib/postgresql
      - postgres-data:/var/lib/postgresql/data # 17버전 이하
      # 서비스 실행 후 `schema.sql`이 자동으로 실행되도록 구성
      - ./src/main/resources/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    healthcheck: # PostgreSQL 서비스 상태 확인을 위한 healthcheck 구성
      # 지정한 사용자/db 기준으로 PostgreSQL 준비 상태 확인
      test: ['CMD-SHELL', 'pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}']
      # 10초마다 확인
      interval: 10s
      # 각 확인의 최대 대기 시간
      timeout: 5s
      # 3번 재시도 후 실패 처리
      retries: 3
    networks:
      # backend 네트워크에 postgres 서비스 연결
      - backend

networks: # 서비스 간 통신을 위한 네트워크 정의
  backend:

volumes: # 데이터 영속성을 위한 볼륨 정의
  # 애플리케이션의 `BinaryContentStorage` 저장용 볼륨
  binary-content-data:
  # PostgreSQL 데이터 저장용 볼륨
  postgres-data:
```

## `AWSS3Test` 테스트 코드

```java
import org.junit.jupiter.api.*;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.io.FileInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Properties;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * AWS S3 SDK가 실제로 정상 동작하는지 확인하기 위한 테스트 클래스
 *
 * 이 테스트는 Spring의 MultipartFile 업로드 기능을 검증하는 것이 아니라,
 * AWS SDK를 사용해서 아래 3가지 작업이 실제로 가능한지 확인하는 목적이다.
 *
 * 1. S3에 파일 업로드
 * 2. S3에서 파일 다운로드
 * 3. Presigned URL 생성
 *
 * 참고:
 * - 테스트에서 실제 파일을 사용하지 않고, 문자열을 byte[]로 바꿔 업로드한다.
 * - 테스트가 끝난 뒤에는 업로드한 객체를 삭제해서 버킷에 테스트 파일이 남지 않게 한다.
 */
@DisplayName("AWS S3 API 연결 확인 테스트(실제 파일 사용 X)")
public class AWSS3Test {

    /**
     * 실제 S3 API 호출에 사용하는 클라이언트
     * - 업로드, 다운로드, 삭제 같은 작업을 수행할 때 사용한다.
     */
    private static S3Client s3Client;

    /**
     * Presigned URL 생성을 위한 전용 객체
     * - 특정 S3 객체에 일정 시간 동안 접근 가능한 URL을 만들 때 사용한다.
     */
    private static S3Presigner s3Presigner;

    /**
     * .env 파일에서 읽어온 AWS 접속 정보
     */
    private static String accessKey;
    private static String secretKey;
    private static String region;
    private static String bucket;

    /**
     * 모든 테스트 시작 전에 1번만 실행된다.
     *
     * 여기서 하는 일:
     * 1. .env 파일을 읽는다.
     * 2. AWS Access Key / Secret Key / Region / Bucket 값을 가져온다.
     * 3. 가져온 정보로 S3Client와 S3Presigner를 생성한다.
     *
     * @BeforeAll 이 static인 이유:
     * - 테스트 클래스 전체에서 한 번만 실행되는 초기화 메서드이기 때문이다.
     */
    @BeforeAll
    static void setUpBeforeAll() throws IOException {
        Properties properties = new Properties();

        // 프로젝트 루트의 .env 파일을 읽어서 AWS 설정값을 불러온다.
        properties.load(new FileInputStream(".env"));

        // .env에 저장해 둔 AWS 정보를 꺼낸다.
        accessKey = properties.getProperty("AWS_S3_ACCESS_KEY");
        secretKey = properties.getProperty("AWS_S3_SECRET_KEY");
        region = properties.getProperty("AWS_S3_REGION");
        bucket = properties.getProperty("AWS_S3_BUCKET");

        // Access Key와 Secret Key를 기반으로 AWS 자격 증명 객체를 만든다.
        AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKey, secretKey);

        // 실제 S3 작업(업로드/다운로드/삭제)에 사용할 S3Client 생성
        s3Client = S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .build();

        // Presigned URL 생성에 사용할 S3Presigner 생성
        s3Presigner = S3Presigner.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .build();
    }

    /**
     * 모든 테스트가 끝난 뒤 1번만 실행된다.
     *
     * 사용이 끝난 S3Client, S3Presigner를 닫아서 리소스를 정리한다.
     */
    @AfterAll
    static void tearDownAfterAll() {
        s3Client.close();
        s3Presigner.close();
    }

    /**
     * [업로드 테스트]
     *
     * 목적:
     * - 문자열 데이터를 byte[]로 만들어 S3에 업로드할 수 있는지 확인한다.
     *
     * 검증 방식:
     * - putObject 호출 시 예외가 발생하지 않으면 업로드 성공으로 본다.
     *
     * 정리:
     * - 테스트가 끝나면 업로드한 객체를 삭제한다.
     */
    @Test
    @DisplayName("S3에 파일 업로드 테스트")
    void upload() {
        // 테스트용 S3 객체 key 생성
        String key = createKey("upload");

        // 실제 파일 대신 간단한 문자열을 byte[]로 변환해서 업로드 데이터로 사용
        byte[] content = "Amazon S3 File Upload Test".getBytes(StandardCharsets.UTF_8);

        try {
            // 어떤 버킷에, 어떤 key 이름으로, 어떤 타입의 파일을 올릴지 설정
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .contentType("text/plain")
                    .build();

            // 예외 없이 업로드가 수행되는지 확인
            assertDoesNotThrow(() ->
                    s3Client.putObject(putObjectRequest, RequestBody.fromBytes(content)));

        } catch (Exception e) {
            throw new RuntimeException("S3 업로드 실패", e);
        } finally {
            // 테스트용으로 업로드한 객체를 삭제해서 버킷을 깔끔하게 유지
            s3Client.deleteObject(builder -> builder.bucket(bucket).key(key));
        }
    }

    /**
     * [다운로드 테스트]
     *
     * 목적:
     * - S3에 올린 파일을 다시 다운로드할 수 있는지 확인한다.
     *
     * 테스트 흐름:
     * 1. 먼저 테스트용 데이터를 S3에 업로드한다.
     * 2. 업로드한 객체를 getObjectAsBytes()로 다운로드한다.
     * 3. 업로드한 내용과 다운로드한 내용이 같은지 비교한다.
     */
    @Test
    @DisplayName("S3에서 파일 다운로드 테스트")
    void download_file() {
        // 먼저 다운로드 대상 파일을 S3에 올려둔다.
        String key = createKey("download");
        byte[] content = "Amazon S3 File Download Test".getBytes(StandardCharsets.UTF_8);
        uploadFile(key, content);

        try {
            // 어떤 버킷의 어떤 객체를 다운로드할지 지정
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .build();

            // S3에서 파일을 byte[] 형태로 읽어온다.
            byte[] result = s3Client.getObjectAsBytes(getObjectRequest).asByteArray();

            // 업로드한 내용과 다운로드한 내용이 같아야 정상
            assertArrayEquals(content, result);

        } catch (Exception e) {
            throw new RuntimeException("파일 다운로드 실패", e);
        } finally {
            // 테스트가 끝난 뒤 업로드했던 객체 삭제
            s3Client.deleteObject(builder -> builder.bucket(bucket).key(key));
        }
    }

    /**
     * [Presigned URL 생성 테스트]
     *
     * 목적:
     * - S3 객체에 접근할 수 있는 임시 URL을 생성할 수 있는지 확인한다.
     *
     * Presigned URL이란?
     * - 인증 정보가 없는 사용자도,
     *   정해진 시간 동안만 특정 S3 객체에 접근할 수 있게 해주는 임시 URL이다.
     *
     * 테스트 흐름:
     * 1. 테스트용 파일을 S3에 업로드한다.
     * 2. 해당 객체를 가리키는 GetObjectRequest를 만든다.
     * 3. 5분 동안 유효한 Presigned URL을 생성한다.
     * 4. URL이 null이 아니고, https:// 로 시작하는지 확인한다.
     */
    @Test
    @DisplayName("Presigned Url 생성 테스트")
    void create_presign_url() {
        // Presigned URL을 만들 대상 파일을 먼저 S3에 업로드
        String key = createKey("PresignUrl");
        byte[] content = "Create Presign Url Test".getBytes(StandardCharsets.UTF_8);
        uploadFile(key, content);

        try {
            // 어떤 S3 객체에 대한 URL을 만들지 지정
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .build();

            // URL 유효 시간을 5분으로 설정하고 Presign 요청 생성
            GetObjectPresignRequest getObjectPresignRequest = GetObjectPresignRequest.builder()
                    .getObjectRequest(getObjectRequest)
                    .signatureDuration(Duration.ofMinutes(5))
                    .build();

            // 실제 Presigned URL 생성
            String signedUrl = s3Presigner.presignGetObject(getObjectPresignRequest).url().toString();

            // URL이 정상적으로 생성되었는지 확인
            assertNotNull(signedUrl);
            assertTrue(signedUrl.startsWith("https://"));
            assertTrue(signedUrl.contains("PresignUrl"));

        } catch (Exception e) {
            throw new RuntimeException("Presigned Url 생성 실패", e);
        } finally {
            // 테스트 후 업로드했던 객체 삭제
            s3Client.deleteObject(builder -> builder.bucket(bucket).key(key));
        }
    }

    /**
     * 다운로드 테스트와 Presigned URL 테스트에서 공통으로 사용하는 업로드 헬퍼 메서드
     *
     * 역할:
     * - 전달받은 key와 content를 이용해 S3에 텍스트 파일을 업로드한다.
     *
     * 왜 분리했는가?
     * - 중복 코드를 줄이고,
     * - 테스트 메서드가 "무엇을 검증하는지"에 더 집중할 수 있게 하기 위해서다.
     */
    private void uploadFile(String key, byte[] content) {
        try {
            PutObjectRequest putReq = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .contentType("text/plain")
                    .build();

            s3Client.putObject(putReq, RequestBody.fromBytes(content));
        } catch (Exception e) {
            throw new RuntimeException("S3 업로드 실패", e);
        }
    }

    /**
     * 테스트용 S3 객체 key를 생성하는 메서드
     *
     * 예:
     * - test/upload/UUID.txt
     * - test/download/UUID.txt
     *
     * UUID를 사용하는 이유:
     * - 테스트를 여러 번 실행해도 파일명이 겹치지 않게 하기 위해서다.
     */
    private String createKey(String method) {
        return "test/" + method + "/" + UUID.randomUUID().toString() + ".txt";
    }
}
```

## `AwsProperties` 코드

```java
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "discodeit.storage.s3")
@Getter
@Setter
public class AwsProperties {

    private String accessKey;
    private String secretKey;
    private String region;
    private String bucket;
    private long presignedUrlExpiration = 600;
}

```

## `S3Config` 코드

```java
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

@Configuration
@ConditionalOnProperty(name = "discodeit.storage.type", havingValue = "s3") // s3일 때만 로드되게 설정
public class S3Config {

    private final AwsProperties awsProperties;

    public S3Config(AwsProperties awsProperties) {
        this.awsProperties = awsProperties;
    }

    @Bean
    public S3Client s3Client() {
        if (awsProperties.getAccessKey() != null
                && !awsProperties.getAccessKey().isBlank()) {
            return S3Client.builder()
                    .region(Region.of(awsProperties.getRegion()))
                    .credentialsProvider(
                            StaticCredentialsProvider.create(
                                    AwsBasicCredentials.create(
                                            awsProperties.getAccessKey(),
                                            awsProperties.getSecretKey()
                                    )
                            )
                    ).build();
        }
        return S3Client.builder()
                .region(Region.of(awsProperties.getRegion()))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }

    @Bean
    public S3Presigner s3Presigner() {
        if (awsProperties.getAccessKey() != null
        && !awsProperties.getAccessKey().isBlank()) {
            return S3Presigner.builder()
                    .region(Region.of(awsProperties.getRegion()))
                    .credentialsProvider(
                            StaticCredentialsProvider.create(
                                    AwsBasicCredentials.create(
                                            awsProperties.getAccessKey(),
                                            awsProperties.getSecretKey()
                                    )
                            )
                    ).build();
        }
        return S3Presigner.builder()
                .region(Region.of(awsProperties.getRegion()))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }
}

```
