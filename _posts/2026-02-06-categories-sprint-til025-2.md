---
title: '[TIL 25일 차] Sprint Mission4 - 디스코드: Controller Layer 구현'
excerpt: '3-1. 사용자 관리'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til025-2/

toc: true
toc_sticky: true

date: 2026-02-06
last_modified_at: 2026-02-06
---

# 오늘의 성취

1. 개발 진행 상황
   - Service 로직을 활용해 웹 API 구현
     - 사용자 관리 Controller인 `UserController` 구현
       - 사용자 등록, 사용자 정보 수정, 모든 사용자 조회, 사용자 온라인 상태 업데이트 핸들러 메서드 생성
       - 사용자 삭제 핸들러 메서드는 채널 관리 Controller 완성 후 생성

2. **고민** : `UserController` 핸들러에서 `createUser` 핸들러 메서드의 반환 값에 `isOnline`을 포함시킬지 고민
   - 기존 `UserResponse` DTO 활용 시, `createUser` 핸들러 메서드에서 `User`와 `UserStatus` 객체를 만들게 되고, `UserStatusService`에도 `userId`로 `UserStatus` 객체를 찾는 메서드를 만들어야 됨
   - **해결** : Read할 때와 Create할 때의 DTO 분리
     - `UserCreateResponse` DTO를 만들어서 `UserResponse` DTO와 분리

3. **고민**: `@Valid`로 인한 예외 메시지가 아래처럼 너무 난잡해서 직접적인 예외 메시지만 뽑아내고 싶음

   ```json
       "message": "Validation failed for argument [0] in public org.springframework.http.ResponseEntity com.sprint.mission.discodeit.controller.UserController.createUser(com.sprint.mission.discodeit.dto.user.UserCreateRequest) with 2 errors: [Field error in object 'userCreateRequest' on field 'userName': rejected value [null]; codes [NotBlank.userCreateRequest.userName,NotBlank.userName,NotBlank.java.lang.String,NotBlank]; arguments [org.springframework.context.support.DefaultMessageSourceResolvable: codes [userCreateRequest.userName,userName]; arguments []; default message [userName]]; default message [userName이 입력되지 않았습니다.]] [Field error in object 'userCreateRequest' on field 'email': rejected value [aa]; codes [Email.userCreateRequest.email,Email.email,Email.java.lang.String,Email]; arguments [org.springframework.context.support.DefaultMessageSourceResolvable: codes [userCreateRequest.email,email]; arguments []; default message [email],[Ljakarta.validation.constraints.Pattern$Flag;@547629d2,.*]; default message [email 형식에 맞지 않습니다.]] "
   ```

   - 해결:
     - `MethodArgumentNotValidException` 안에는 검증 실패 정보가 `BindingResult`에 들어있고, 그 중 어떤 필드가 틀렸는지, 어떤 값이 문제인지, 어떤 메시지인지에 대한 정보가 `FieldError` 목록에 저장되어 있다.
     - 메시지가 여러 개일 수 있어서 순회

     ```java
         @ExceptionHandler(MethodArgumentNotValidException.class)
         public ResponseEntity handleException(MethodArgumentNotValidException e) {
             String ErrorMessage = e.getBindingResult().getFieldErrors().stream()
                     .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                     .collect(Collectors.joining(", "));
             ErrorResponse errorResponse = new ErrorResponse(HttpStatus.BAD_REQUEST.getReasonPhrase(), ErrorMessage);
             return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
         }
     ```

     ```json
     {
       "code": "Bad Request",
       "message": "email: email 형식에 맞지 않습니다., userName: userName이 입력되지 않았습니다."
     }
     ```

# 프로젝트 요구 사항

## 2. 기본 요구사항

### 2-1. 컨트롤러 레이어 구현

- [x] DiscodeitApplication의 테스트 로직은 삭제하세요.
- [진행 중] 지금까지 구현한 서비스 로직을 활용해 웹 API를 구현하세요.
  - 이때 `@RequestMapping`만 사용해 구현해보세요.
  - 아래의 "웹 API 요구사항" 참고

- [ ] 웹 API의 예외를 전역으로 처리하세요.

`//...`

## 3. 웹 API 요구사항

### 3-1. 사용자 관리

- [x] 사용자를 등록할 수 있다.
- [x] 사용자 정보를 수정할 수 있다.
- [ ] 사용자를 삭제할 수 있다.
- [x] 모든 사용자를 조회할 수 있다.
- [x] 사용자의 온라인 상태를 업데이트할 수 있다.

`//...`

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint4](https://github.com/JungH200000/10-sprint-mission/tree/sprint4)
