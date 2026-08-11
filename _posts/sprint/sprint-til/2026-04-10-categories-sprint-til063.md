---
layout: single-editorial
title: '[TIL 63일 차] Sprint Mission8 - CD 구축'
excerpt: '3-02. GitHub Actions를 활용한 CI/CD 파이프라인 구축'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til063

toc: true
toc_sticky: true

date: 2026-04-10
last_modified_at: 2026-04-10
---

# 오늘의 성취

## 1. 개발 진행 상황

- GitHub Actions를 활용한 CI/CD 파이프라인 구축
  - Docker 이미지 build 및 push 자동화
  - ECS 서비스 업데이트 자동화

## 2. 문제

### GitHub Actions로 ECS 배포 중 IAM 권한 오류

GitHub Actions를 이용해 `release` branch에 push하면

1. Docker 이미지를 Public ECR에 push하고
2. 기존 ECS 태스크 정의를 기반으로 새 이미지를 반영한 뒤
3. ECS 서비스를 업데이트하는 CD 파이프라인을 구현했다.

그런데 ECS 배포 단계에서 여러 권한 오류가 순차적으로 발생했다.

#### 오류 1

```shell
An error occurred (AccessDeniedException) when calling the DescribeTaskDefinition operation:
User: arn:aws:iam::<ACCOUNT_ID>:user/<IAM_USER>
is not authorized to perform: ecs:DescribeTaskDefinition on resource: *
because no identity-based policy allows the ecs:DescribeTaskDefinition action
```

GitHub Actions에서 기존 ECS 태스크 정의를 내려받기 위해 아래 명령어를 사용했는데,

```bash
aws ecs describe-task-definition \
  --task-definition <TASK_DEFINITION_NAME> \
  --query taskDefinition > task-definition.json
```

GitHub Actions에서 사용한 IAM 사용자에게 `ecs:DescribeTaskDefinition` 권한이 없어서 태스크 정의 조회 자체가 실패했다.

#### 오류 1 해결

IAM 사용자에게 ECS 관련 권한을 추가했다.

```json
{
  "Effect": "Allow",
  "Action": ["ecs:DescribeTaskDefinition", "ecs:RegisterTaskDefinition", "ecs:UpdateService"],
  "Resource": "*"
}
```

#### 오류 2

```shell
User: arn:aws:iam::<ACCOUNT_ID>:user/<IAM_USER>
is not authorized to perform: iam:PassRole
on resource: arn:aws:iam::<ACCOUNT_ID>:role/ecsTaskExecutionRole
because no identity-based policy allows the iam:PassRole action
```

기존 태스크 정의를 수정해 새 revision으로 등록하는 과정에서 ECS 태스크 정의에 포함된 `executionRoleArn` 또는 `taskRoleArn`을 AWS가 함께 사용하려고 한다.

이때 GitHub Actions에서 사용하는 IAM 사용자에게 해당 Role을 ECS에 넘길 수 있는 `iam:PassRole` 권한이 필요했다.

#### 오류 2 해결

IAM 사용자에게 `iam:PassRole` 권한을 추가했다.

```json
{
  "Effect": "Allow",
  "Action": "iam:PassRole",
  "Resource": "arn:aws:iam::<ACCOUNT_ID>:role/ecsTaskExecutionRole"
}
```

#### 오류 3

```shell
User: arn:aws:iam::<ACCOUNT_ID>:user/<IAM_USER>
is not authorized to perform: ecs:DescribeServices
on resource: arn:aws:ecs:<REGION>:<ACCOUNT_ID>:service/<CLUSTER_NAME>/<SERVICE_NAME>
because no identity-based policy allows the ecs:DescribeServices action
```

배포 과정에서 ECS 서비스 상태를 조회하거나
`wait-for-service-stability: true` 옵션으로 안정화 상태를 기다릴 때
`ecs:DescribeServices` 권한이 필요했다.

기존 서비스 중지 후 새 서비스가 올라오는 과정에서 서비스 상태를 확인하지 못해 workflow가 실패했다.

#### 오류 3 해결

IAM 사용자에 `ecs:DescribeServices` 권한을 추가했다.

```json
{
  "Effect": "Allow",
  "Action": ["ecs:DescribeTaskDefinition", "ecs:RegisterTaskDefinition", "ecs:UpdateService", "ecs:DescribeServices"],
  "Resource": "*"
}
```

---

# 프로젝트 요구 사항

`//...`

## 3. 심화 요구사항

`//...`

### 3-02. GitHub Actions를 활용한 CI/CD 파이프라인 구축

`//...`

- [x] **CD**(지속적 배포)를 위한 워크플로우를 설정하세요.
  - [x] `.github/workflows/deploy.yml` 파일을 생성하세요.
  - [x] `release` 브랜치에 코드가 푸시되면 실행되도록 설정하세요.
  - [x] AWS 정보 설정
    - [x] GitHub 레포지토리 설정을 통해 시크릿을 추가하세요.
      - `AWS_ACCESS_KEY`: IAM 사용자의 액세스 키
      - `AWS_SECRET_KEY`: IAM 사용자의 시크릿 키
    - [x] GitHub 레포지토리 설정을 통해 변수를 추가하세요.
      - `AWS_REGION`: AWS 리전(`ap-northeast-2`)
      - `ECR_REPOSITORY_URI`: ECR 레포지토리 URI
      - `ECS_CLUSTER`: ECS 클러스터 이름(`discodeit-cluster`)
      - `ECS_SERVICE`: ECS 서비스 이름(`discodeit-service`)
      - `ECS_TASK_DEFINITION`: ECS 태스크 정의 이름(`discodeit-task`)
  - [x] Docker 이미지 빌드 및 푸시
    - [x] Docker 이미지를 빌드하고 푸시하는 Job을 정의하세요.
    - [x] AWS CLI를 설정하는 Step을 추가하세요.
      - Pubilc ECR에 배포해야하므로 리전은 `us-east-1`으로 설정해야합니다.
    - [x] ECR 로그인 Step을 추가하세요.
      - Public ECR에 로그인해야합니다.
    - [x] Docker 이미지 빌드 및 푸시하는 과정을 Step으로 추가하세요.
      - 단, 빌드 시간 단축을 위해 멀티 플랫폼 옵션은 제외합니다.
      - GitHub Actions의 런타임 OS와 우리가 배포할 ECS는 모두 `x86_64`입니다.
    - [x] 이미지 태그는 `latest`와 GitHub 커밋 해시를 사용하도록 설정하세요.
  - [x] ECS 서비스 업데이트
    - [x] ECS 서비스를 업데이트하는 Job을 정의하세요.
    - [x] AWS CLI를 설정하는 Step을 추가하세요.
      - 우리의 ECS 클러스터에 접근해야하므로 리전은 `AWS_REGION`으로 설정해야합니다.
    - [x] 태스크 정의를 업데이트하는 Step을 추가하세요.
      - 기존의 태스크 정의를 기반으로 새 이미지를 사용하도록 업데이트하세요.
    - [x] 프리티어 리소스를 고려해 AWS CLI를 사용해 기존에 구동 중인 서비스를 중단하는 Step을 추가하세요.
      - `aws ecs update-service --desired-count` 옵션을 활용하세요.
    - [x] 새로 등록한 태스크 정의를 사용하도록 ECS 서비스를 업데이트하는 Step을 추가하세요.
  - [x] AWS 콘솔을 통해 새로 등록된 태스크 정의로 배포되었는지 확인하세요.

`//...`

---

# GitHub Repository 주소

[https://github.com/JungH200000/10-sprint-mission/tree/sprint8](https://github.com/JungH200000/10-sprint-mission/tree/sprint8)

---
