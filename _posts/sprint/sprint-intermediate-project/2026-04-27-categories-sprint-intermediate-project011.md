---
title: '[Sprint 백엔드 중급 프로젝트 11일차] 뉴스 기사 백업 배치 구현'
excerpt: ''

categories:
  - Sprint 백엔드 중급 프로젝트
tags:
  - [Codeit Sprint, Codeit Sprint 백엔드 중급 프로젝트]

permalink: /categories/codeit-sprint/sprint-intermediate-project/sprint-intermediate-project011

toc: true
toc_sticky: true

date: 2026-04-27
last_modified_at: 2026-04-27
---

# 뉴스 기사 백업 배치 구현

뉴스 기사 데이터를 날짜 단위로 S3에 백업하는 Spring Batch 로직을 구현했다.

<br>

## 작업 배경

MoNew 프로젝트 요구사항에는 뉴스 기사 데이터 백업 기능이 있다.

요구사항은 다음과 같다.

- 기사 수집 배치 작업에 따른 데이터 유실에 대비해 뉴스 기사 데이터를 백업한다.
- 백업은 날짜 단위로 수행한다.
- 백업 저장소는 AWS S3를 사용한다.
- 백업 작업은 배치로 수행한다.

<br>

## Spring Batch

처음 Spring Batch를 구현하면서 "한 번에 데이터를 보내는 기능인가?"라고 생각했다.

하지만 구현하면서 정리한 개념은 조금 달랐다.

Spring Batch는 단순히 데이터를 한 번에 보내는 도구라기보다, 정해진 작업을 안정적으로 실행하고, 실행 이력을 관리하는 프레임워크에 가깝다.

이번 백업 작업에서는 다음 흐름으로 정리했다.

```
Scheduler
→ BatchRunner
→ Spring Batch Job
→ Step
→ Tasklet
→ ArticleBackupService
→ S3ArticleBackupStorage
```

배치 작업 자체는 Job과 Step으로 구성하고, 실제 백업 작업은 Tasklet에서 수행하도록 했다.

처음부터 ItemReader, ItemProcessor, ItemWriter를 사용하는 chunk 방식으로 구현할 수도 있지만, 이번 백업은 "하루치 기사 조회 후 S3 업로드"인 비교적 간단한 작업이었기 때문에 Tasklet 방식으로 시작했다.

<br>

## 최종 패키지 구조

```
domain/article
  scheduler/backup
    ArticleBackupScheduler.java → 정해진 시간에 백업 실행 요청
    ArticleBackupBatchRunner.java → JobLauncher로 Spring Batch Job 실행
    ArticleBackupBatchConfig.java → Spring Batch Job, Step Bean 설정
    ArticleBackupJob.java → Tasklet으로 실행되며 ArticleBackupService 호출

  service
    ArticleBackupService.java → 백업 대상 날짜 계산, DB 조회, DTO 변환, S3 저장 요청

  dto/backup
    ArticleBackupDto.java

  mapper
    ArticleBackupMapper.java

infra/storage/s3
  S3ArticleBackupFileStorage.java → 백업 데이터를 JSON으로 변환해 S3에 업로드
```

- `ArticleBackupScheduler` : "언제 백업을 실행할지"만 담당
- `ArticleBackupBatchRunner` : Scheduler가 넘겨준 `backupDate`를 Spring Batch JobParameter로 만들고, JobLauncher를 통해 배치 Job을 실행
  - 매번 다른 실행으로 인식되도록 `.addLong("runId", System.currentTimeMillis())`를 추가
  - 여러 개의 배치 `Job`이 존재할 수 있어 `@Qualifier("articleBackupBatchJob") Job articleBackupBatchJob`처럼 명확히 지정
  - 배치 실패 상태 확인

    ```java
    JobExecution execution = jobLauncher.run(articleBackupBatchJob, jobParameters);

    if (execution.getStatus() != BatchStatus.COMPLETED) {
      throw new IllegalStateException(
          "Article backup batch failed. jobExecutionId="
              + execution.getId() + ", status=" + execution.getStatus()
      );
    }
    ```

- `ArticleBackupBatchConfig` : Spring Batch의 Job과 Step을 Bean으로 등록하는 설정 클래스
  - `@Component`가 아니라 `@Configuration`과 `@Bean`을 사용한 이유는 이 클래스가 직접 작업을 수행하는 클래스가 아니라, Job과 Step을 조립하는 설정 클래스이기 때문
  - 정리하자면
    - `@Component` → 내가 만든 작업 클래스를 Bean으로 등록할 때 사용
    - `@Configuration` + `@Bean` → 외부 라이브러리 객체나 Builder로 만든 객체를 Bean으로 등록할 때 사용
- `ArticleBackupJob` : 이름은 Job이지만 실제 역할은 Tasklet
  1. `JobParameters`에서 `backupDate`를 꺼낸다.
  2. `ArticleBackupService.backup(backupDate)`를 호출한다.
  3. 작업이 끝나면 `RepeatStatus.FINISHED`를 반환한다.
- `ArticleBackupService` : 백업의 핵심 비즈니스 로직
  - 한국 시간 기준 날짜를 `Instant`로 변환
  - JPA 엔티티 직접 직렬화 문제
    - 처음에는 DB에서 조회한 `Article` entity 리스트를 그대로 JSON으로 변환해서 S3에 저장하는 방식을 생각
    - JPA entity를 그대로 백업 파일로 직렬화하는 것은 위험 → 백업 전용 DTO 구현
      1. 연관관계 때문에 순환 참조가 발생할 수 있음
      2. Lazy Loading 프록시가 JSON에 섞일 수 있음
      3. JPA 내부 상태가 외부 백업 포맷에 노출
      4. entity 구조가 바뀌면 백업 파일 구조도 같이 변경됨
- `S3ArticleBackupFileStorage` : DTO 리스트를 JSON으로 변환하고 S3에 업로드

<br>

## Docker non-root 사용자 전환과 로그 권한 문제

AWS ECS 배포를 준비하면서 `Dockerfile`을 수정했다.

기존에는 컨테이너가 root 사용자로 실행되고 있었지만, 보안상 좋지 않기 때문에 별도의 app 사용자와 그룹을 만들고 해당 사용자로 애플리케이션을 실행하도록 변경했다.

```dockerfile
RUN addgroup -S app \
    && adduser -S app -G app -h /app -s /sbin/nologin \
    && mkdir -p /app/.logs \
    && chown -R app:app /app

USER app
```

그런데 로컬에서 다음 오류가 발생했다.

```shell
RollingFileAppender[FILE] - openFile(.logs/application.log,true) call failed.
java.io.FileNotFoundException: .logs/application.log (Permission denied)
```

원인은 `Dockerfile` 변경 자체가 아니었다.

이전까지는 root 사용자로 컨테이너를 실행했기 때문에 `.logs/application.log` 파일이 root 소유로 생성되어 있었다. 그런데 새 `Dockerfile`에서는 app 사용자로 애플리케이션을 실행하므로 기존 root 소유 로그 파일에 쓸 수 없었다.

로컬에서는 기존 `.logs` 폴더를 삭제하고 다시 생성하면 해결할 수 있다.

<br>

## Retry와 Backoff 고민

S3 업로드는 네트워크나 AWS 일시 장애의 영향을 받을 수 있다. 그래서 무조건 즉시 실패 처리하기보다 몇 번의 재시도를 할 수 있게 구현했다.

예를 들어 아래처럼 `@Retryable`을 사용할 수 있다.

```java
@Retryable(
    retryFor = {
        ArticleFileSaveFailedException.class,
        AwsServerConnectFailedException.class
    },
    maxAttempts = 3,
    backoff = @Backoff(delay = 1000, multiplier = 2) # 재시도 사이의 대기 시간
)
```

위 애너테이션은 아래처럼 동작한다.

- 1번째 시도 : 실패 시 1초 대기
- 2번째 시도 : 실패 시 2초 대기
- 3번째 시도 : 실패하면 최종 예외 발생

다만 모든 예외를 retry 대상으로 넣으면 안 된다. 예를 들어 JSON 직렬화 실패, 잘못된 파라미터, DTO 구조 문제는 재시도해도 해결되지 않는다. 이런 예외는 즉시 실패 처리하는 것이 맞다. Retry는 S3 일시 장애나 네트워크 연결 문제처럼 시간이 지나면 해결될 수 있는 예외에만 적용하는 것이 적절하다.

---

# 팀 Notion 주소

[[SB10-5팀] Sprint Spring 백엔드 중급 팀 프로젝트](https://www.notion.so/jungh20000/SB10-Monew-Team05-342f59816c0280948b6ac9c8f80492eb?source=copy_link)

---

# GitHub Repository 주소

[https://github.com/SB10-Part03-Team05/sb10-monew-team05](https://github.com/SB10-Part03-Team05/sb10-monew-team05)
