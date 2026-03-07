---
title: '[TIL 43일 차] Spring Mission6 - BinaryContent 저장 로직 고도화'
excerpt: '2-7. BinaryContent 저장 로직 고도화'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til043

toc: true
toc_sticky: true

date: 2026-03-07
last_modified_at: 2026-03-07
---

# 오늘의 학습

---

# 프로젝트 요구 사항

`// ...`

### 2-7. BinaryContent 저장 로직 고도화

`// ...`

- [x] 로컬 디스크 저장 방식으로 BinaryContentStorage 구현체를 구현하세요.
  - 클래스 다이어그램

    <img src="https://bakey-api.codeit.kr/api/files/resource?root=static&seqId=12178&version=1&directory=/skptrmm5p-image.png&name=skptrmm5p-image.png" width=400px>

- [x] `discodeit.storage.type` 값이 `local` 인 경우에만 Bean으로 등록되어야 합니다.
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

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint6](https://github.com/JungH200000/10-sprint-mission/tree/sprint6)
