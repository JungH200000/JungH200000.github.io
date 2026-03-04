---
title: '[TIL 40일 차] Spring Mission6 - '
excerpt: ''

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til040/

toc: true
toc_sticky: true

date: 2026-03-03
last_modified_at: 2026-03-03
---

# 오늘의 학습

1. 개발 진행 상황
   - Entity 정의
     - `updatedAt` 관련 `BaseUpdatablEntity` 생성
       - `Channel`, `Message`, `User`, `ReadStatus`, `UserStatus`가 `BaseUpdatablEntity`를 상속하도록 관계 설정
       - `BinaryContent`와 `BaseUpdatablEntity`가 `BaseEntity`를 상속하도록 관계 설정
     - 클래스 다이어그램을 참고하여 Entity 클래스의 참조 관계 수정
       - JPA 애너테이션 없이 작성
     - JPA 애너테이션을 활용해 ERD와 연관관계 매핑 정보를 도메인 모델에 반영
       - 영속성 전이와 고아 객체 정의
   - Repository와 Service에 JPA 도입
     - 기존 Repository 인터페이스를 JpaRepository로 정의 후 대체 (기존 Repository 구현체 삭제)
     - 영속성 컨텍스트의 특징에 맞추어 Service 수정

2. **고민** : table 생성 DDL인 `schema.sql`로 table이 만들어지는데, Entity의 `@Column` 애너테이션이 필요한가?
   - 해결 :
     - `@Column` 애너테이션이 없고 필드만 정의되어 있다면 JPA는 기본적으로 해당 필드를 table의 column과 매핑되는 필드라고 간주한다.
     - 팀/개인의 규칙에 따라 다르지만, 어떤 필드는 `@Column`이 있고 어떤 필드는 없으면, 보는 사람이 “이건 왜 붙였지? 이 필드는 DB 컬럼명이 다른가? 제약이 다른가?”를 매번 추측할 수 있다. 그러므로 어느 한 부분에라도 `@Column`이 붙여질 경우 통일성있게 전부 붙이는 것을 현재 프로젝트에서는 추천

3. `columnDefinition`
   - JPA가 table 생성 DDL을 만들 때 사용하는 SQL을 직접 넘겨주는 옵션으로, 자바 타입에 따라 자동으로 결정되는 컬럼 타입 대신, `varchar(100) default 'EMPTY'`, `timestamptz`, `jsonb`처럼 DB 벤더에 특화된 타입이나 제약을 그대로 적을 수 있습니다.

4. `@MappedSuperclass `
   - 해당 클래스를 Entity의 공통 부모(베이스 클래스)로 쓰겠다(테이블을 만들지 않음)

5. `@EntityListeners()`
   - 특정 Entity에 대해 JPA 라이플사이클 이벤트를 받는 리스너를 등록하는 애너테이션
   - `@EntityListeners(AuditingEntityListener.class)` :
     - `AuditingEntityListener` 등록하면 저장/수정 시점에 `@CreatedDate`와 `@LastModifiedDate` 같은 필드들을 자동으로 채워줌

6. `@JoinTable` 속성
   - `name` : Join Table 이름
   - `joinColumns` : 현재 Entity를 참조하는 FK
   - `inverseJoinColumns` : 반대 방향 Entity를 참조하는 FK

7. `Cascade` 옵션
   - `MERGE` : 영속성 컨텍스트(관리 대상)에 다시 붙이기 위한 작업(단, 조회일 때는 예외)
   - `DETACH` : 영속성 컨텍스트(관리 대상)에 빠짐
   - `REFRESH` : 현재 영속성 컨텍스트에 가지고 있는 값을 DB에 있는 값으로 강제 덮어쓰기 할 때
     - 같은 트랜잭션 안에서 DB가 바뀌면 영속성 컨텍스트에 남아있는 객체는 그대로일 수 있기 때문에 DB 기준으로 동기화하는 것

8. 복합 UNIQUE를 Entity에서 표현하는 방법
   - 두 개 이상의 column을 묶어 UNIQUE 설정

   ```java
   @Table(
           name = "read_statuses",
           uniqueConstraints = {
                   @UniqueConstraint(
                           name = "uk_read_statuses_user_channel", // 복합 UNIQUE 이름 (uk_<table>_<col1>_<col2>)
                           columnNames = {"user_id", "channel_id"}
                   )
           }
   )
   public class ReadStatus extends BaseUpdatableEntity {...}
   ```

9. delete/update 쿼리를 실행할 때 `@Modifying`이 필요한 이유
   - `@Modifying`가 없으면 delete/update 쿼리가 실행되지 않거나 예외가 날 수 있기 때문
   - SELECT로만 인식

---

# 프로젝트 요구 사항

`// ...`

### 2-4. 엔티티 정의하기

- [x] 클래스 다이어그램을 참고해 도메인 모델의 공통 속성을 추상 클래스로 정의하고 상속 관계를 구현하세요.
  - 이때 Serializable 인터페이스는 제외합니다.
  - 패키지명: `com.sprint.mission.discodeit.entity.base`
  - 클래스 다이어그램

    <img src="https://bakey-api.codeit.kr/api/files/resource?root=static&seqId=12178&version=1&directory=/xs6bzcvs6-image.png&name=xs6bzcvs6-image.png" width=400px>

- [x] JPA의 어노테이션을 활용해 `createdAt`, `updatedAt` 속성이 자동으로 설정되도록 구현하세요.
  - `@CreatedDate`, `@LastModifiedDate`
- [x] 클래스 다이어그램을 참고해 클래스 참조 관계를 수정하세요. 필요한 경우 생성자, update 메소드를 수정할 수 있습니다. 단, 아직 JPA Entity와 관련된 어노테이션은 작성하지 마세요.
  - 클래스 다이어그램

    <img src="https://bakey-api.codeit.kr/api/files/resource?root=static&seqId=12178&version=1&directory=/pq5iz92wt-image.png&name=pq5iz92wt-image.png" width=400px>

  - 화살표의 방향과 화살표 유무에 유의하세요.

- [x] ERD와 클래스 다이어그램을 토대로 연관관계 매핑 정보를 표로 정리해보세요.**(이 내용은 PR에 첨부해주세요.)**
  - 예시

    | 엔티티 관계           | 다중성 | 방향성                   | 부모-자식 관계                     | 연관관계 주인 |
    | --------------------- | ------ | ------------------------ | ---------------------------------- | ------------- |
    | User:UserStatus       | 1:1    | User ↔️ UserStatus       | 부모: User, 자식: UserStatus       | UserStatus    |
    | User:BinaryContent    | 1:1    | User ➡️ BinaryContent    | 부모: User, 자식: BinaryContent    | User          |
    | User:ReadStatus       | 1:N    | User ⬅️ ReadStatus       | 부모: User, 자식: ReadStatus       | ReadStatus    |
    | Channel:ReadStatus    | 1:N    | Channel ⬅️ ReadStatus    | 부모: Channel, 자식: ReadStatus    | ReadStatus    |
    | Channel:Message       | 1:N    | Channel ⬅️ Message       | 부모: Channel, 자식: Message       | Message       |
    | User:Message          | 1:N    | User ⬅️ Message          | 부모: User, 자식: Message          | Message       |
    | Message:BinaryContent | 1:N    | Message ➡️ BinaryContent | 부모: Message, 자식: BinaryContent | Message       |

- [x] JPA 주요 어노테이션을 활용해 ERD, 연관관계 매핑 정보를 도메인 모델에 반영해보세요.
  - `@Entity`, `@Table`
  - `@Column`, `@Enumerated`
  - `@OneToMany`, `@OneToOne`, `@ManyToOne`
  - `@JoinColumn`, `@JoinTable`
- [x] ERD의 외래키 제약 조건과 연관관계 매핑 정보의 부모-자식 관계를 고려해 영속성 전이와 고아 객체를 정의하세요.
  - `cascade`, `orphanRemoval`

<br>

### 2-5. 레포지토리와 서비스에 JPA 도입하기

- [x] 기존의 Repository 인터페이스를 JPARepository로 정의하고 쿼리메소드로 대체하세요.
  - FileRepository와 JCFRepository 구현체는 삭제합니다.
- [진행 중] 영속성 컨텍스트의 특징에 맞추어 서비스 레이어를 수정해보세요.
  - 힌트: `트랜잭션`, `영속성 전이`, `변경 감지`, `지연로딩`

`// ...`

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint6](https://github.com/JungH200000/10-sprint-mission/tree/sprint6)
