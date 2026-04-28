---
title: '[Sprint 백엔드 초급 프로젝트 10일차] AWS ECS 자동 배포 CD 파이프라인 구축'
excerpt: ''

categories:
  - Sprint 백엔드 중급 프로젝트
tags:
  - [Codeit Sprint, Codeit Sprint 백엔드 중급 프로젝트]

permalink: /categories/codeit-sprint/sprint-intermediate-project/sprint-intermediate-project010

toc: true
toc_sticky: true

date: 2026-04-24
last_modified_at: 2026-04-24
---

# AWS ECS 자동 배포 CD 파이프라인 구축

어제는 로컬에서 Docker 이미지를 build하고, ECR에 push한 뒤 ECS service를 수동으로 업데이트해 봤다. 이번에는 이 과정을 GitHub Actions로 자동화하여, `dev` branch에 코드가 merge되면 자동으로 Docker 이미지를 build하고 ECS service까지 업데이트되도록 구현했다.

<br>

## 배포 흐름

우리 팀은 각자 `feature/*` branch에서 작업한 뒤 `dev` branch`로 PR을 날리는 방식으로 협업하고 있다.

그래서 처음부터 ECS 배포 Workflow를 PR에서 실행하면 안된다고 생각했다. PR은 아직 리뷰가 끝나지 않은 코드이고, 테스트가 실패할 수 있기 때문이다.

최종적으로 아래와 같다.

```
feature/* branch에서 작업
→ dev branch로 PR 생성
→ Codecov CI에서 테스트 및 테스트 커버리지 확인
→ PR merge
→ dev branch에 push 이벤트 발생
→ Docker 이미지 build
→ ECS task definition 업데이트
→ ECS service 재시작
→ ECS service 안정화 확인
```

- Codecov Workflow는 PR과 `dev` push에서 테스트와 테스트 커버리지 확인을 담당하고, ECS 배포 Workflow는 `dev` branch에 merge된 이후에만 실행되도록 구현했다.

ECS 배포 workflow의 실행 조건은 아래와 같다.

```yaml
on:
  push:
    branches: ['dev']
```

<br>

## GitHub Actions Workflow 구성

두 개의 job으로 나눴다.

```
1. docker-images-build-and-push
   - JDK 설정
   - Gradle 캐시 설정
   - bootJar 실행
   - Public ECR 로그인
   - Docker 이미지 build
   - Docker 이미지 push

2. ecs-service-update
   - 현재 ECS task definition 다운로드
   - task definition의 container 이미지 교체
   - ECS service desired-count 조정
   - 새 task definition으로 service 업데이트
   - ECS service 안정화 확인
```

첫 번째 job에서 만든 Docker 이미지 tag는 두 번째 job에서도 필요하다. 그래서 `GITHUB_SHA` 값을 `image_tag`로 사용해, job output으로 넘기도록 구현했다.

```yaml
outputs:
  image_tag: ${{ steps.prep.outputs.image_tag }}
```

```yaml
- name: Prepare 이미지 tags
  id: prep
  run: |
    echo "IMAGE_TAG=${GITHUB_SHA}" >> "$GITHUB_ENV"
    echo "REPO_URI=${{ vars.ECR_REPOSITORY_URI }}" >> "$GITHUB_ENV"
    echo "image_tag=${GITHUB_SHA}" >> "$GITHUB_OUTPUT"
```

`GITHUB_ENV`는 같은 job 안의 다음 step에서 환경 변수로 사용할 값을 저장하는 용도이고, `GITHUB_OUTPUT`은 step output을 만들어 다른 job에서도 참조할 수 있게 하는 용도이다.

이후 만들어진 Docker 이미지는 commit 해시 태그와 `latest` 태그를 함께 붙여 build했다.

```yaml
- name: Docker build
  run: |
    docker build \
    -t "$REPO_URI:$IMAGE_TAG" \
    -t "$REPO_URI:latest" \
    .
```

ECR에 push도 했다.

```yaml
- name: Docker push
  run: |
    docker push "$REPO_URI:$IMAGE_TAG"
    docker push "$REPO_URI:latest"
```

<br>

## Gradle 캐시 설정

`actions/setup-java`의 `cache: gradle` 옵션과 `gradle/actions/setup-gradle` step이 같은 역할인지 헷갈렸다.

둘 다 Gradle build 속도를 높이기 위해 캐시를 사용한다는 점은 같지만, 역할과 범위는 다르다.

<br>

### `actions/setup-java`의 `cache: gradle`

`setup-java`의 `cache: gradle`은 JDK를 설정하는 과정에서 Gradle 의존성 캐시를 간단히 활성화하는 옵션이다.

```yml
- name: JDK 17 설정
  uses: actions/setup-java@v5
  with:
    java-version: '17'
    distribution: 'temurin'
    cache: gradle
```

JDK 설정과 Gradle 캐시 설정을 한 step에서 처리할 수 있다. 보통 `Gradle wrapper`, `build.gradle`, `settings.gradle` 같은 파일을 기준으로 캐시 키를 만들고, Gradle 의존성 다운로드 결과를 재사용한다.

즉, JDK 설정 + 간단한 Gradle 의존성 캐시

<br>

### gradle/actions/setup-gradle

반면 `gradle/actions/setup-gradle`은 Gradle build에 더 특화된 공식 Action이다.

```yaml
- name: Gradle 캐시
  uses: gradle/actions/setup-gradle@v5
```

단순히 의존성만 캐시하는게 아니라 Gradle 실행 환경에 더 집중한다. Gradle User Home을 기준으로 의존성 wrapper distribution, 일부 build 캐시 등을 재사용할 수 있다.

즉, Gradle 실행 환경 최적화 + Gradle 전용 캐시 관리

<br>

### 같이 사용되지 않는 이유

둘다 Gradle User Home과 관련된 캐시를 다루기 때문에 같이 쓰면 캐시 범위가 겹칠 수 있다. 그래서 현재 Workflow에서는 `setup-java`는 JDK 설정만 담당하고, Gradle 캐시는 `gradle/actions/setup-gradle`에 맡겼다.

<br>

## `GITHUB_TOKEN` 권한 제한

```yaml
permissions:
  contents: read
```

`GITHUB_TOKEN`이 무엇인지 헷갈렸었다. `GITHUB_TOKEN`은 GitHub Actions가 Workflow를 실행할 때 자동으로 발급하는 임시 토큰이다. 직접 Secrets에 등록하는 값이 아니라 GitHub가 job 실행 중 repository에 접근할 수 있도록 제공하는 토큰이다.

`contents: read`는 이 토큰으로 repository 내용을 읽는 권한만 허용한다는 의미다.

현재 Workflow에는 코드를 checkout하고 build하는 정도만 필요했기 때문에 repository에 write 권한을 줄 필요가 없다. 그래서 최소 권한 원칙에 맞게 `contents: read`만 설정했다.

<br>

## ECS 배포 중 기존 task가 내려가지 않던 문제

배포 테스트 중 기존 task가 바로 내려가지 않는 문제가 있었다.

ECS는 기본적으로 다음 순서로 배포하려고 한다.

```
기존 task 유지
→ 새 task 시작
→ 새 task가 정상 상태가 됨
→ 기존 task 중지
```

이 방식은 무중단 배포에는 좋지만, EC2 기반 ECS에서 인스턴스가 1대이고, task도 1개만 실행하는 구조에서는 문제가 생길 수 있다.

기존 task가 이미 포트나 리소스를 사용 중이면 새 task를 동시에 띄울 공간이 부족할 수 있다. 그러면 ECS는 기존 task를 유지하려고 하고, 새 task는 계속 provisioning 상태에 머무를 수 있다.

그래서 이번 Workflow에서는 단순하게 기존 서비스를 먼저 내렸다가 새 task definition으로 업데이트한 뒤 다시 desired count를 1로 올리는 방식을 사용했다.

```yaml
- name: 기존 ECS service 중지
  run: |
    aws ecs update-service \
    --cluster ${{ vars.ECS_CLUSTER }} \
    --service ${{ vars.ECS_SERVICE }} \
    --desired-count 0
```

그 후 ECS service를 업데이트했다.

```yaml
- name: ECS service 업데이트
  uses: aws-actions/amazon-ecs-deploy-task-definition@v2
  with:
  task-definition: ${{ steps.task-definition.outputs.task-definition }}
  cluster: ${{ vars.ECS_CLUSTER }}
  service: ${{ vars.ECS_SERVICE }}
  wait-for-service-stability: true
```

그리고 다시 desired count를 1로 복원했다.

```yaml
- name: ECS service 다시 시작
  run: |
  aws ecs update-service \
   --cluster ${{ vars.ECS_CLUSTER }} \
   --service ${{ vars.ECS_SERVICE }} \
   --desired-count 1
```

<br>

## 안정화 확인을 추가한 이유

리뷰를 받으면서 아래의 피드백을 받았다.

```
서비스 재기동 후 안정화 확인이 없어 배포 성공을 오판할 수 있습니다.
desired count만 1로 복원하고 종료하면, 태스크가 곧바로 죽어도 워크플로우는 성공 처리될 수 있습니다.
aws ecs wait services-stable을 추가해 최종 상태를 검증해 주세요.
```

처음에는 `amazon-ecs-deploy-task-definition`에서 이미 `wait-for-service-stability: true`를 사용하고 있으니 충분하다고 생각했다.

하지만 현재 Workflow에서는 그 전에 desired count를 0으로 내려둔다. 즉, `wait-for-service-stability: true`가 task 0개인 상태의 안정화를 기다릴 가능성이 있었다.

진짜로 중요한 것은 마지막에 desired count를 다시 1로 올린 후, 새 task가 정상적으로 실행되고 ECS service가 안정 상태에 도달했는지 확인하는 것이다.

그래서 마지막에 다음 step을 추가했다.

```yaml
- name: ECS service 안정화 확인
  run: |
    aws ecs wait services-stable \
    --cluster ${{ vars.ECS_CLUSTER }} \
    --services ${{ vars.ECS_SERVICE }}
```

이 step을 추가하면 아래의 상황을 방지할 수 있게 된다.

```
desired-count 1 요청 성공
→ GitHub Actions는 성공 처리
→ ECS가 task 실행
→ 애플리케이션이 곧바로 종료
→ 실제 서비스는 죽었지만 Workflow는 성공처럼 보임
```

<br>

## Dockerfile 보안 피드백 반영: non-root 사용자 실행

Dockerfile에 대해 보안 피드백도 받았다.

```
런타임 컨테이너를 root로 실행하고 있어 보안 리스크가 큽니다.
USER 지정이 없어 root로 동작합니다.
최소 권한 원칙에 맞게 non-root 사용자로 실행해 주세요.
```

기존 Dockerfile은 multi-stage build를 사용하고 있었지만, runtime stage에서 `USER` 지정이 없었다. Dockerfile에서 별도로 사용자를 지정하지 않으면 컨테이너 프로세스는 `root`로 실행될 수 있다.

`root`로 실행해도 애플리케이션은 정상적으로 동작할 수 있다. 하지만 애플리케이션 취약점으로 컨테이너 내부에서 명령 실행이 가능해졌을 때, root 권한으로 실행 주이면 피해 범위가 커진다.

그래서 runtime stage에 애플리케이션 실행 전용 non-root 사용자와 그룹을 추가했다.

```dockerfile
RUN addgroup -S app \
    && adduser -S app -G app -h /app -s /sbin/nologin \
    && chown -R app:app /app

# ...

COPY --from=builder --chown=app:app /app/build/libs/${PROJECT_NAME}-${PROJECT_VERSION}.jar ./

USER app

ENTRYPOINT ["sh", "-c", "exec java ${JVM_OPTS} -jar ${PROJECT_NAME}-${PROJECT_VERSION}.jar"]
```

---

# 팀 Notion 주소

[[SB10-5팀] Sprint Spring 백엔드 중급 팀 프로젝트](https://www.notion.so/jungh20000/SB10-Monew-Team05-342f59816c0280948b6ac9c8f80492eb?source=copy_link)

---

# GitHub Repository 주소

[https://github.com/SB10-Part03-Team05/sb10-monew-team05](https://github.com/SB10-Part03-Team05/sb10-monew-team05)
