---
title: '[TIL 42일 차] Spring Mission6 - DTO 도입 ~ BinaryContent 저장 로직 고도화'
excerpt: '2-6. DTO 적극 도입하기 ~ 2-7. BinaryContent 저장 로직 고도화'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til042

toc: true
toc_sticky: true

date: 2026-03-06
last_modified_at: 2026-03-06
---

# 오늘의 학습

1. 개발 진행 상황
   - DTO 도입
     - Entity를 DTO로 매핑하는 Mapper 컴포넌트 정의
     - Mapper 추가로 인한 Service 로직 수정
   - BinaryContent 저장 로직 고도화
     - 바이너리 데이터 저장만을 담당하는 `BinaryContentStorage` 인터페이스 설계 및 구현
       - 바이너리 데이터 저장 메서드 : `UUID put(UUID, byte[])`
       - 바이너리 데이터를 읽어 `InputStream` 타입으로 반환하는 메서드 : `InputStream get(UUID)`
       - HTTP API로 바이너리 데이터 다운로드 메서드 : `ResponoseEntity<?> download(BinaryContentDto)`
     - download API 구현

2. **고민**: Mapper가 다른 Mapper를 재사용하고, Mapper가 재사용한 Mapper로 만들어진 Dto를 필드로 가질 때 `@Mapper(componentModel = "spring", uses = BinaryContentMapper.class)` 이 설정 이외의 다른 설정이 필요 없을까?
   - `User` 안에 `profile` 필드가 있고, 그 타입이 `BinaryContent`이고,
   - `UserDto`의 `profile` 타입이 `BinaryContentDto`이며,
   - `BinaryContentMapper`에 `BinaryContentDto toDto(BinaryContent binaryContent)` 메서드가 있다면
   - MapStruct는 `profile` 필드를 보고 자동으로 `BinaryContentMapper`의 매핑 메서드를 찾아서 사용한다.

3. **고민**: Entity에 없는 필드가 `ChannelDto`에 존재하고, 직접 작성한 로직을 해당 Dto에 넣고 싶을 때, `ChannelMapper`는 어떻게 구성되어야 할까?
   - `@Mapping`의 `expression` 옵션을 사용하면 된다.
     - `source` 필드를 그대로 사용하지 않고, 직접 작성한 로직을 `target` 필드에 넣고 싶을 때 사용하는 옵션이다.
     - `@Mapping(target = "lastMessageAt", expression = "java(assignLastMessageAt(channel)))")`

   - 더불어, `@Mapping(source = "status.isOnlineStatus", target = "online")`처럼 메서드를 호출하는 식으로 작성되면 컴파일 문제가 발생할 수 있기 때문에 `expression` 옵션을 사용해 `@Mapping(target = "online", expression = "java(user.getStatus().isOnlineStatus())")`처럼 표현

4. **고민**: `ChannelMapper`를 만드는데 인터페이스가 아닌 추상 클래스를 사용한 이유
   - 요구사항에 따라 의존성 필드로 `MessageRepository`와 `ReadStatusRepository`, `UserMapper`를 사용되어야 하고,
   - "의존성 필드를 이용해 직접 작성한 로직 + 자동 MapStruct 매핑"이 존재하기 때문에 인터페이스보다는 추상 클래스가 더 선호됨
     - 참고로, MapStruct는 mapper를 인터페이스와 추상(abstract) 클래스로 만들 수 있다.

5. 추상 클래스로 작성된 `ChannelMapper`에서 직접 작성한 로직은 `protected`를 접근 제어자로 가져야 한다.
   - MapStruct는 인터페이스로 작성된 Mapper는 해당 Mapper를 구현하는 클래스로, 추상 클래스로 작성된 Mapper는 해당 Mapper를 상속하는 클래스로 실제 구현 클래스를 생성한다.
   - 그래서 상속한 자식 클래스에서 접근하기 위해서 `protected`를 접근 제어자로 가져야 한다.

6. **문제** : "org.hibernate.StaleObjectStateException: Row was updated or deleted by another transaction (or unsaved-value mapping was incorrect): [com.sprint.mission.discodeit.entity.User#354c200e-9876-427a-ab49-b933f3a14f93]" 예외 발생
   - **원인** : `BaseEntity`에 UUID를 랜덤 생성하는 로직이 있어서 Spring Data JPA의 `save()`가 id가 있는 객체로 보게 되고, `persist`가 아닌 `merge`를 하게 된다. 하지만 해당 id를 지닌 객체는 db에 존재하지 않음으로 예외 발생
   - **해결** : UUID를 랜덤 생성하는 로직을 지우고 `@NoArgsConstructor`를 추가

7. **문제** : "org.postgresql.util.PSQLException: 오류: "created_at" 칼럼(해당 릴레이션 "binary_contents")의 null 값이 not null 제약조건을 위반했습니다." 오류 발생
   - 즉, `@CreatedDate`가 제대로 동작하지 않아, `created_at`이 제때 생성되지 않음

   - **원인** : `BinaryContent`가 상속하고 있는 `BaseEntity`에 이미 `@EntityListeners(AuditingEntityListener.class)`가 있지만, auditing을 켜도록 안내하는 `@EnableJpaAuditing` 애너테이션이 존재하지 않음
   - **해결** : 메인 애플리케이션 클래스에 `@EnableJpaAuditing` 추가

---

# 프로젝트 요구 사항

`// ...`

### 2-5. 레포지토리와 서비스에 JPA 도입하기

`// ...`

- [x] 영속성 컨텍스트의 특징에 맞추어 서비스 레이어를 수정해보세요.
  - 힌트: `트랜잭션`, `영속성 전이`, `변경 감지`, `지연로딩`

<br>

### 2-6. DTO 적극 도입하기

- [x] Entity를 Controller 까지 그대로 노출했을 때 발생할 수 있는 문제점에 대해 정리해보세요. DTO를 적극 도입했을 때 보일러플레이트 코드가 많아지지만, 그럼에도 불구하고 어떤 이점이 있는지 알 수 있을거에요.**(이 내용은 PR에 첨부해주세요.)**
  - 힌트
    - Entity와 API의 결합
    - 프로덕션 환경에서는 성능을 고려해 OSIV를 false로 설정하는 경우가 대부분
    - 양방향 연관관계 시 순환 참조
    - 민감한 데이터
- [x] 다음의 클래스 다이어그램을 참고하여 DTO를 정의하세요.

<img src="https://bakey-api.codeit.kr/api/files/resource?root=static&seqId=12178&version=1&directory=/hd4c6g1of-image.png&name=hd4c6g1of-image.png" width=600px>

- [x] Entity를 DTO로 매핑하는 로직을 책임지는 Mapper 컴포넌트를 정의해 반복되는 코드를 줄여보세요.
  - 패키지명: `com.sprint.mission.discodeit.mapper`

  <img src="https://bakey-api.codeit.kr/api/files/resource?root=static&seqId=12178&version=1&directory=/buo7cmjvp-image.png&name=buo7cmjvp-image.png" width=700px>

<br>

### 2-7. BinaryContent 저장 로직 고도화

데이터베이스에 이미지와 같은 파일을 저장하면 성능 상 불리한 점이 많습니다. 따라서 실제 바이너리 데이터는 별도의 공간에 저장하고, 데이터베이스에는 바이너리 데이터에 대한 메타 정보(파일명, 크기, 유형 등)만 저장하는 것이 좋습니다.

- [x] BinaryContent 엔티티는 파일의 메타 정보(`fileName`, `size`, `contentType`)만 표현하도록 `bytes` 속성을 제거하세요.
- [x] BinaryContent의 `byte[]` 데이터 저장을 담당하는 인터페이스를 설계하세요.
      저장 매체의 확장성(로컬 저장소, 원격 저장소)을 고려해 인터페이스부터 설계합니다.
  - 패키지명: `com.sprint.mission.discodeit.storage`
  - 클래스 다이어그램

      <img src="https://bakey-api.codeit.kr/api/files/resource?root=static&seqId=12178&version=1&directory=/nqt5zw2pk-image.png&name=nqt5zw2pk-image.png" width=500px>

  - BinaryContentStorage
    - 바이너리 데이터의 저장/로드를 담당하는 컴포넌트입니다.
    - `UUID put(UUID, byte[])`
      - UUID 키 정보를 바탕으로 `byte[]` 데이터를 저장합니다.
      - UUID는 BinaryContent의 Id 입니다.
    - `InputStream get(UUID)`
      - 키 정보를 바탕으로 `byte[]` 데이터를 읽어 InputStream 타입으로 반환합니다.
      - UUID는 BinaryContent의 Id 입니다.
    - `ResponseEntity<?> download(BinaryContentDto)`
      - HTTP API로 다운로드 기능을 제공합니다.
      - BinaryContentDto 정보를 바탕으로 파일을 다운로드할 수 있는 응답을 반환합니다.

- [x] 서비스 레이어에서 기존에 BinaryContent를 저장하던 로직을 BinaryContentStorage를 활용하도록 리팩토링하세요.
- [x] BinaryContentController에 파일을 다운로드하는 API를 추가하고, BinaryContentStorage에 로직을 위임하세요.
  - 엔드포인트: `GET /api/binaryContents/{binaryContentId}/download`
  - 요청
    - 값: BinaryContentId
    - 방식: Query Parameter
  - 응답: `ResponseEntity<?>`
  - 클래스 다이어그램

    <img src="https://bakey-api.codeit.kr/api/files/resource?root=static&seqId=12178&version=1&directory=/5qwe2kqno-image.png&name=5qwe2kqno-image.png" width=500px>

- [ ] 로컬 디스크 저장 방식으로 BinaryContentStorage 구현체를 구현하세요.
  - 클래스 다이어그램

    <img src="https://bakey-api.codeit.kr/api/files/resource?root=static&seqId=12178&version=1&directory=/skptrmm5p-image.png&name=skptrmm5p-image.png" width=400px>

- [ ] `discodeit.storage.type` 값이 `local` 인 경우에만 Bean으로 등록되어야 합니다.
  - `Path root`
    - 로컬 디스크의 루트 경로입니다.
    - `discodeit.storage.local.root-path` 설정값을 정의하고, 이 값을 통해 주입합니다.
  - `void init()`
    - 루트 디렉토리를 초기화합니다.
    - Bean이 생성되면 자동으로 호출되도록 합니다.
  - `Path resolvePath(UUID)`
    - 파일의 실제 저장 위치에 대한 규칙을 정의합니다.
      - 파일 저장 위치 규칙 예시: `{root}/{UUID}`
    - `put`, `get` 메소드에서 호출해 일관된 파일 경로 규칙을 유지합니다.
  - `ResponseEntity<Resource> donwload(BinaryContentDto)`
    - `get` 메소드를 통해 파일의 바이너리 데이터를 조회합니다.
    - BinaryContentDto와 바이너리 데이터를 활용해 `ResponseEntity<Resource>` 응답을 생성 후 반환합니다.

`// ...`

### 3-4. MapStruct 적용

- [x] Entity와 DTO를 매핑하는 보일러플레이트 코드를 [MapStruct](https://mapstruct.org/) 라이브러리를 활용해 간소화해보세요.

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint6](https://github.com/JungH200000/10-sprint-mission/tree/sprint6)
