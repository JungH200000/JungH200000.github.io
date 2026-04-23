---
title: '[Sprint 백엔드 초급 프로젝트 9일차] AWS ECS 수동 배포 시작'
excerpt: ''

categories:
  - Sprint 백엔드 중급 프로젝트
tags:
  - [Codeit Sprint, Codeit Sprint 백엔드 중급 프로젝트]

permalink: /categories/codeit-sprint/sprint-intermediate-project/sprint-intermediate-project009

toc: true
toc_sticky: true

date: 2026-04-23
last_modified_at: 2026-04-23
---

# AWS ECS 수동 배포 시작

GitHub Actions 자동 배포를 하기 전에 RDS, ECS, IAM, S3 환경 변수 파일까지 직접 설정하고 연결해 봤다.

## IAM 권한 설정

AWS 설정할 대 가장 먼저 고민한 건 어떤 권한을 어디까지 줄 것인지였다. 처음에는 익숙하게 하나의 IAM 사용자에게 `FullAccess` 같은 넓은 권한을 주고 빠르게 진행할 수 있었지만 이번에는 역할을 나눠 보려고 했다.

내가 만든 사용자에게 아래의 권한을 추가했다.

- `AmazonS3ReadOnlyAccess`
- `IAMUserChangePassword`
- `monew-ecs-policy` 고객 관리형
- `monew-public-ecr` 인라인 정책

### ECS 배포용 사용자 정책

ECS에 새 task 정의를 등록하고, service에 반영하는 권한이다.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ECSDeploy",
      "Effect": "Allow",
      "Action": [
        "ecs:DescribeTaskDefinition",
        "ecs:RegisterTaskDefinition",
        "ecs:UpdateService",
        "ecs:DescribeServices"
      ],
      "Resource": ["*"]
    },
    {
      "Sid": "PassSameRoleToEcs",
      "Effect": "Allow",
      "Action": ["iam:PassRole"],
      "Resource": ["arn:aws:iam::***:role/ecsTaskExecutionRole"]
    }
  ]
}
```

핵심은 `iam:PassRole`이다. ECS service나 task 정의를 등록할 때, ECS가 대신 사용할 역할을 넘겨줄 수 있어야 하기 때문이다. 즉, S3에서 `env` 파일을 읽거나 CloudWatch 로그를 보내는 주체는 ECS 역할이기 때문에 그 역할을 ECS에 연결할 수 있는 권한이 필요했다.

### Publish ECR push 권한

저장용량과 비용 때문에 private ECR이 아닌 public ECR을 사용했다. 그래서 이미지 push를 위해 아래 인라인 정책도 추가했다.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublishEcrAuth",
      "Effect": "Allow",
      "Action": ["ecr-public:GetAuthorizationToken", "sts:GetServiceBearerToken"],
      "Resource": "*"
    },
    {
      "Sid": "PublishEcrPush",
      "Effect": "Allow",
      "Action": [
        "ecr-public:BatchCheckLayerAvailability",
        "ecr-public:InitiateLayerUpload",
        "ecr-public:UploadLayerPart",
        "ecr-public:CompleteLayerUpload",
        "ecr-public:PutImage",
        "ecr-public:DescribeRepositories",
        "ecr-public:DescribeImages"
      ],
      "Resource": "*"
    }
  ]
}
```

이 권한을 붙이기 전에 `GetAuthorizationToken` 권한이 없어 로그인 자체가 실패했고, Docker 쪽에서는 `password is empty`라는 메시지가 출력되었다.

나중에 확인해보니 비밀번호가 빈 값이 아니라 권한이 없어서 토큰 자체를 못 받아왔다는 의미였다.

### ECS가 실제로 사용할 역할 구성

ECS 실행 역할인 `ecsTaskExecutionRole`에 아래 두 종류의 권한을 추가했다.

- `AmazonECSTaskExecutionRolePolicy`
- `ecsTaskExecutionRole-S3EnvFileAccess` 고객 인라인

`AmazonECSTaskExecutionRolePolicy`는 기본적으로 ECS가 이미지를 가져오고, CloudWatch Logs로 로그를 보내는 데 필요한 권한을 포함한다.

여기에 추가로 S3에 저장한 env 파일을 읽기 위한 권한과 추후 뉴스 기사 백업/복구, 로그 적재까지 고려한 S3 권한을 더했다.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ReadEnvFile",
      "Effect": "Allow",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::***-ap-northeast-2-an/***"
    },
    {
      "Sid": "GetEnvBucketLocation",
      "Effect": "Allow",
      "Action": "s3:GetBucketLocation",
      "Resource": "arn:aws:s3:::***-ap-northeast-2-an"
    },
    {
      "Sid": "BackupAndLogBucketList",
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::***-ap-northeast-2-an"
    },
    {
      "Sid": "ArticleBackupAndRestoreToS3",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::***-ap-northeast-2-an/***/*"
    },
    {
      "Sid": "AppLogStoreToS3",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::***-ap-northeast-2-an/***/*"
    }
  ]
}
```

중요한 것은 S3 `env` 파일을 컨테이너에 넣는게 아니라 ECS가 S3에서 읽어서 환경 변수로 주입한다는 점이다.

## AWS RDS PostgreSQL, ECS Cluster, Task 설정

- PostgreSQL용 RDS를 생성했고
- 배포 방식은 ECS on EC2로 선택했다.
- task 정의할 때는 S3에 저장된 `env` 파일을 환경변수 파일로 선택되게 설정했다.

## Service 생성 후 Task 실행

service를 생성하고 task를 실행했는데 처음에는 정상 작동되지 않았다. CloudWatch 로그를 보니 애플리케이션이 시작 도중 아래와 같이 실패하고 있었다.

- `batchDataSourceInitializer` 실패
- `Failed to determine DatabaseDriver`
- `Could not get Connection for extracting meta-data`
- `org.postgresql.util.PSQLException: The connection attempt failed.`

처음에는 메모리 부족인가 의심했지만 `org.postgresql.util.PSQLException: The connection attempt failed.` 이 문장을 보고 PostgreSQL 연결 실패가 원인이라는 것을 알았다.

## Troubleshooting: RDS 보안 그룹 인바운드 규칙

문제를 추적하면서 제일 먼저 본 건 아래 3가지 였다.

- `application-prod.yaml`이 제대로 읽히는지
- 데이터베이스 URL이 제대로 들어가는지
- PostgreSQL 드라이버와 HikariDataSource가 생성되었는지

로그상으로는 드라이버와 DataSource까지는 이미 생성 시도를 하고 있어서 원인은 환경 변수 미주입이 아니라 네트워크 연결 실패라고 판단했다.

가장 유력한 원인을 RDS 보안 그룹 인바운드 규칙으로 꼽았다.

RDS는 PostgreSQL 5432 포트로 들어오는 요청을 허용해야 하는데, 이 규칙이 제대로 열려 있지 않았다. 그래서 ECS EC2 인스턴스에서 RDS로 접속하려는 요청이 실패하고 있었던 것이다.

해결 방법은 아래처럼 간단했다.

- Type: PostgreSQL
- Port: 5432
- Source: ECS 클러스터가 사용하는 보안 그룹

즉, 0.0.0.0/0 같이 넓게 허용하는 것이 아니라 ECS 클러스터 보안 그룹을 source로 지정해서 RDS가 그 인스턴스에서 오는 요청만 받게 설정했다.

이 설정을 추가한 뒤에 task가 정상적으로 실행되기 시작했다.

## 포트 설정 수정

그런데 DB 연결이 해결된 뒤로 로그도 모두 정상적으로 출력되었는데 화면이 제대로 출력되지 않았다. 네트워크 바인딩을 확인해보니

- 호스트 포트: 80
- 컨테이너 포트: 80

으로 매핑되어 있는데, 앱에는 기본적으로 `server.port: ${PORT:8080}` 설정을 사용하고 있고, 내가 작성했던 `env` 파일에는 `PORT` 관련 설정이 없었던 것이다.

그래서 `PORT=80` 값을 S3 `env` 파일에 추가했다.

---

# 팀 Notion 주소

[[SB10-5팀] Sprint Spring 백엔드 중급 팀 프로젝트](https://www.notion.so/jungh20000/SB10-Monew-Team05-342f59816c0280948b6ac9c8f80492eb?source=copy_link)

---

# GitHub Repository 주소

[https://github.com/SB10-Part03-Team05/sb10-monew-team05](https://github.com/SB10-Part03-Team05/sb10-monew-team05)
