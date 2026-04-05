---
title: '[Sprint Mission5]'
excerpt: ''

categories:
  - Sprint Mission
tags:
  - [Codeit Sprint, Codeit Sprint Mission]

permalink: /categories/codeit-sprint/sprint-mission/sprint-mission0005

toc: true
toc_sticky: true

date: 2026-02-14
last_modified_at: 2026-02-14
---

## 1. 프로젝트 마일스톤

- RESTful API로 재설계 및 리팩토링
- Swagger를 활용한 API 문서 자동화
- 프론트엔드 연동
- PaaS를 활용한 배포

---

## 2. 주요 변경 사항

2-1. [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html)가 적용 되었습니다.

- IntelliJ 적용 방법
  - Google에서 제공하는 IntelliJ 적용 [파일](https://github.com/google/styleguide/blob/gh-pages/intellij-java-google-style.xml)을 다운로드합니다.
  - `IntelliJ 설정 > Editor > Code Style` 메뉴에서 다운로드한 xml 파일을 임포트합니다.
    <img src="https://github.com/JungH200000/JungH200000.github.io/blob/categories-ver2/assets/images/posts_img/requirements/sprint5/google_java_style_guide1.png?raw=true" width=700px>
  - 파일이 수정될 때마다 스타일이 자동으로 적용될 수 있도록 설정합니다.
    <img src="https://github.com/JungH200000/JungH200000.github.io/blob/categories-ver2/assets/images/posts_img/requirements/sprint5/google_java_style_guide2.png?raw=true" width=700px>

---

## 3. 기본 요구사항

- [ ] 스프린트 미션#4에서 구현한 API를 RESTful API로 다시 설계해보세요.
  - [API 스펙](https://github.com/JungH200000/JungH200000.github.io/blob/categories-ver2/assets/images/posts_img/requirements/sprint5/api-docs.json)을 확인하고 본인이 설계한 API와 비교해보세요.
  - [oasdiff](https://www.oasdiff.com/diff-calculator)를 활용하면 좀 더 수월하게 비교할 수 있어요.
  - API 설계에 정답은 없지만, 이어지는 요구사항과 미션을 원활히 수행하기 위해 제공된 API 스펙에 맞추어 구현해주세요.
  - 특히, 심화 요구사항에서 제공되는 프론트엔드 코드는 제공된 API 스펙을 준수해야 연동할 수 있습니다.
- [ ] Postman을 활용해 컨트롤러를 테스트 하세요.
  - Postman API 테스트 결과를 export하여 PR에 첨부해주세요.
- [ ] **springdoc-openapi**를 활용하여 Swagger 기반의 API 문서를 생성하세요.
- [ ] Swagger-UI를 활용해 API를 테스트해보세요.

---

## 4. 심화 요구사항

- [ ] 다음의 정적 리소스를 서빙하여 프론트엔드와 통합해보세요. API 스펙을 준수했다면 잘 동작할거예요.

  > [fe_1.0.0.zip](https://github.com/JungH200000/JungH200000.github.io/blob/categories-ver2/assets/images/posts_img/requirements/sprint5/fe_1.0.0.zip)

  > [화면 가이드](https://codeit.notion.site/18f6fd228e8d80828264ca0b1fb4078f)

- [ ] [Railway.app](https://railway.com/)을 활용하여 애플리케이션을 배포해보세요.
  - Railway.app은 애플리케이션을 쉽게 배포할 수 있도록 도와주는 PaaS입니다.
  - [ ] [Railway.app](https://railway.com/)에 가입하고, 배포할 GitHub 레포지토리를 연결하세요.
  - [ ] `Settings > Network` 섹션에서 `Generate Domain` 버튼을 통해 도메인을 생성하세요.
  - [ ] 생성된 도메인에 접속해 배포된 애플리케이션을 테스트해보세요.

> 무료 사용 제한이 있으므로, 코드 리뷰 이후에는 배포 인스턴스를 삭제해주세요.
