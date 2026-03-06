---
title: '[TIL 41일 차] Spring Mission6 - JPA와 DTO 도입'
excerpt: '2-5. 레포지토리와 서비스에 JPA 도입하기 ~ 2-6. DTO 적극 도입하기'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til041/

toc: true
toc_sticky: true

date: 2026-03-05
last_modified_at: 2026-03-05
---

# 오늘의 학습

1. 개발 진행 상황
   - Repository와 Service에 JPA 도입
     - 영속성 컨텍스트의 특징에 맞추어 Service 수정
       - `UserService`, `UserStatusService`, `ChannelService`, `ReadStatusService`, `MessageService`, `BinaryContentService`, `AuthService`
     - DTO 도입
       - MapStruct 라이브러리 의존성 추가
       - 요구사항의 클래스 다이어그램을 참고하여 DTO 수정

2. OSIV (Open Session In View)란?

   Service 계층(트랜잭션 안)에서만 JPA 영속성 컨텍스트를 쓰는게 일반적인데, OSIV를 켜두면 Cotroller/View (응답 직렬화 시점)까지 영속성 컨텍스트를 열어두는 것
   - Jpa 기준으로는 "Open EntityManager In View"라고 보면 된다.
   - 예를 들어 Controller에서 `user.getStatus()` 메서드로 접근하면 `status`가 LAZY일 때 원래는 추가 조회가 필요하다. 그런데 Service 트랜잭션이 끝나고 영속성 컨텍스트가 닫혀 있으면, `user.getStatus` 시점에 DB에 접근할 수 없기 때문에 `LazyInitializationException`이 발생한다.
     - 물론, `JOIN FETCH`로 가져오면 추가 DB 조회는 없음
   - OSIV가 켜져 있으면 Controller/직렬화 단계까지 영속성 컨텍스트가 살아 있어서, 해당 시점에도 LAZY 로딩이 가능해진다.

3. MapStruct

   Entity ↔️ DTO 변환 코드를 컴파일 시점에 자동 생성해주는 라이브러리
   - annotation processor이고, 인터페이스만 정의하면 빌드 시 구현체를 생성

   - 의존성(dependencies) 추가
     - `implementation 'org.mapstruct:mapstruct:1.6.3'` : MapStruct 애너테이션(`@Mapper`, `@Mapping` 등)
     - `annotationProcessor 'org.mapstruct:mapstruct-processor:1.6.3'` : 컴파일 시 Mapper 구현체를 생성하는 annotation processor

   - annotation
     - `@Mapper` : "해당 인터페이스는 매핑 전용 인터페이스"라고 MapStruct에게 알려주는 애너테이션
     - `@Mapping" : 필드명이 다를 때 연결 규칙을 명시
     - `componentModel = "spring"` : Spring Bean으로 등록되게 해서 `@Service`에서 주입받아 사용
     - `uses = "Mapper/클래스명.class"` : 해당 Mapper가 매핑할 때, 다른 Mapper나 클래스를 함께 참조하라는 의미
     - 예시

       ```java
       @Mapper(componentModel = "spring")
       public interface ReadStatusMapper {

           @Mapping(source = "user.id", target = "userId")
           @Mapping(source = "channel.id", target = "channelId")
           ReadStatusDto toDto(ReadStatus readStatus);
       }
       ```

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

  - 답변
    - Entity를 그대로 노출하면 ➡️
    - 한 Entity가 다른 Entity와 연관관계에 있을 때, 무한하게 순환될 수 있다.
    - Entity에는 주민등록번호나 비밀번호와 같은 민감한 데이터가 존재할 수 있기 때문에 Dto를 이용해 제외해야 한다.
    - Entity나 DB가 변경될 경우, API 응답이 일관되지 않게 변경될 수 있어, 프론트엔드에서 문제가 발생할 가능성이 높다.
    - Entity를 반환하면서 Spring이 JSON으로 변경하기 위해 Entity의 필드를 읽는다. 이 때 `LazyInitializationException`이 발생할 수 있다.

- [x] 다음의 클래스 다이어그램을 참고하여 DTO를 정의하세요.

<img src="https://bakey-api.codeit.kr/api/files/resource?root=static&seqId=12178&version=1&directory=/hd4c6g1of-image.png&name=hd4c6g1of-image.png" width=600px>

- [진행 중] Entity를 DTO로 매핑하는 로직을 책임지는 Mapper 컴포넌트를 정의해 반복되는 코드를 줄여보세요.
  - 패키지명: `com.sprint.mission.discodeit.mapper`

  <img src="https://bakey-api.codeit.kr/api/files/resource?root=static&seqId=12178&version=1&directory=/buo7cmjvp-image.png&name=buo7cmjvp-image.png" width=700px>

`// ...`

### 3-4. MapStruct 적용

- [진행 중] Entity와 DTO를 매핑하는 보일러플레이트 코드를 [MapStruct](https://mapstruct.org/) 라이브러리를 활용해 간소화해보세요.

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint6](https://github.com/JungH200000/10-sprint-mission/tree/sprint6)
