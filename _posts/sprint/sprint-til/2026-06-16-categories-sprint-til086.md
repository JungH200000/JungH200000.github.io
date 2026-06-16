---
title: '[TIL 86일 차] Sprint Mission12'
excerpt: '3.기본 요구사항'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til086

toc: true
toc_sticky: true

date: 2026-06-16
last_modified_at: 2026-06-16
---

# 오늘의 성취

## 1. 개발 진행 상황

- SSE를 이용해 데이터 실시간 전달하도록 리팩토링

---

# 프로젝트 요구 사항

## 3. 기본 요구사항

`//...`

- [x] 기존에 클라이언트에서 폴링 방식으로 주기적으로 요청하던 데이터를 SSE를 이용해 서버에서 실시간으로 전달하는 방식으로 리팩토링하세요.
  - 새로운 알림 이벤트 전송
    - 새 알림이 생성되었을 때 클라이언트에 이벤트를 전송하세요.
    - 클라이언트는 이 이벤트를 수신하면 알림 목록에 알림을 추가합니다.
    - 이벤트 명세

      | **id**   | **이벤트 고유 ID**          |
      | -------- | --------------------------- |
      | **name** | **`notifications.created`** |
      | **data** | **`NotificationDto`**       |

  - 파일 업로드 상태 변경 이벤트 전송
    - 파일 업로드 상태가 변경될 때 이벤트를 발송하세요.
    - 클라이언트는 해당 상태를 수신하면 파일 상태 UI를 다시 렌더링합니다.
    - 이벤트 명세

      | **id**   | **이벤트 고유 ID**           |
      | -------- | ---------------------------- |
      | **name** | **`binaryContents.updated`** |
      | **data** | **`BinaryContentDto`**       |

  - 채널 갱신 이벤트 전송
    - 채널 정보가 변경될 때, 이벤트를 발송하세요.
    - 클라이언트는 해당 이벤트를 수신하면 채널 UI를 다시 렌더링합니다.
    - 이벤트 명세

      | **id**   | **이벤트 고유 ID**                               |
      | -------- | ------------------------------------------------ |
      | **name** | **`channels.created` or `updated` or `deleted`** |
      | **data** | **`ChannelDto`**                                 |

  - 사용자 갱신 이벤트 전송
    - 사용자 정보 또는 로그인 상태가 변경될 때, 이벤트를 발송하세요.
    - 클라이언트는 해당 이벤트를 수신하면 사용자 UI를 다시 렌더링합니다.
    - 이벤트 명세

      | **id**   | **이벤트 고유 ID**                            |
      | -------- | --------------------------------------------- |
      | **name** | **`users.created` or `updated` or `deleted`** |
      | **data** | **`UserDto`**                                 |

`//...`

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint12](https://github.com/JungH200000/10-sprint-mission/tree/sprint12)

---
