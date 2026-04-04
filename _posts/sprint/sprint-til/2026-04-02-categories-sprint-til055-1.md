---
title: '[TIL 55일 차] AWS: 계정 생성부터 ECS, S3, RDS 설정'
excerpt: '4.데이터 베이스 RDS 이해와 실습 ~ 7.EC2 기초와 환경 설정'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til055-1

toc: true
toc_sticky: true

date: 2026-04-02
last_modified_at: 2026-04-02
---

# AWS: 계정 생성부터 ECS, S3, RDS 설정

## <span style="background-color: #FFF9C4">4. **데이터 베이스 RDS 이해**</span>

### 4-01. RDS (Relational Database Service)

클라우드 환경에서 제공되는 관리형 관계형 데이터 베이스 서비스

- 특정
  - 사용자는 직접 DB를 설치/운영하지 않아도 됨
  - 데이터베이스 엔즌(MySQL, PostgreSQL, Oracle 등)을 선택할 수 있음
  - 백업, 보안, 패치, 모니터링 등의 운영 작업이 자동화

#### 1) RDS 이점

- EC2 인스턴스에 데이터베이스 설치

```
------------------
데이터베이스 규모 확장  ⬅️ 직접 관리
------------------
가용성, 내구성 확보     ⬅️ 직접 관리
------------------
데이터 백업             ⬅️ 직접 관리
------------------
데이터베이스 설치/관리  ⬅️ 직접 관리
------------------
운영체제 설치/관리      ⬅️ AWS가 관리
------------------
기반 시설 구축          ⬅️ AWS가 관리
------------------
```

- RDS 사용

```
------------------
데이터베이스 규모 확장  ⬅️ AWS가 관리
------------------
가용성, 내구성 확보     ⬅️ AWS가 관리
------------------
데이터 백업             ⬅️ AWS가 관리
------------------
데이터베이스 설치/관리  ⬅️ AWS가 관리
------------------
운영체제 설치/관리      ⬅️ AWS가 관리
------------------
기반 시설 구축          ⬅️ AWS가 관리
------------------
```

- 사용자는 SQL 쿼리 작성, 데이터 모델링, 성능 최적화 같은 핵심 비즈니스 로직에만 집중하면 된다.

---

## <span style="background-color: #FFF9C4">6. ECS</span>

### 6-01. 컨테이너 오케스트레이션

실제 운영 환경에서 단일 컨테이너만 사용하는 경우는 드물다. 보통 수십~수백 개의 컨테이너를 동시에 실행하고 관리한다.

이때 필요한 것이 컨테이너 오케스트레이션(Container Orchestration)이다.

컨테이너 오케스트레이션은 아래의 기능을 자동으로 수행한다.

- 컨테이너 배치 (어떤 서버에 컨테이너를 올릴지)
- 컨테이너 상태 모니터링 (죽으면 자동으로 재시작)
- 확장/축소 (트래픽에 맞춰 개수를 늘리거나 줄임)
- 네트워크 연결 및 로드밸런싱

대표적인 서비스로는 Kubernetes, Amazon ECS, Docker Swarm 등이 있다.

```bash
# 컨테이너 오케스트레이션이 없는 경우 (직접 서버에 올림)
server1: run container A, B
server2: run container C

# 오케스트레이션 도구를 쓰는 경우 (자동으로 배치)
cluster: run container A, B, C (자동으로 최적 서버 배치)
```

<br>

### 6-02. ECS

AWS에서 제공하는 완전관리형 컨테이너 오케스트레이션 서비스

```bash
# 연결 관계 한눈에 보기 (간단 다이어그램)
[Cluster]
  └─[Service]  ← 확장/축소, 배포, 로드밸런서 연결
      └─[Task] (실행 인스턴스, 1개 이상)
          └─[Containers] (여러 개 가능, web, sidecar, log 등)
```

- **Cluster**
  - 컨테이너를 실행할 수 있는 운영 단지(실행 환경)
  - 컨테이너 관리 X, Service를 관리
- **Service**
  - 세대 수 유지, 교체 공사(배포), 공동시설(ALB) 연결을 담당하는 관리사무소
- **Task Definition**
  - 컨테이너 이미지, CPU/메모리, 포트, 환경 변수, 로그, 볼륨 등 실행 방법을 기술한 템플릿(설계도)
- **Task**
  - Task Definition을 바탕으로 실제 실행 중인 인스턴스 (입주 세대(컨테이너 집합))
  - 하나 이상의 컨테이너를 가짐

<br>

### 6-03. EC2 (Elastic Compute Cloud)

AWS에서 제공하는 가상 서버로, 클라우드 환경에서 애플리케이션을 실행할 수 있는 기본 단위

- 쉽게 생각하면 클라우드 기반 컴퓨터 하나를 빌린다고 보면 됨
- **특징**
  - 필요할 때 즉시 생성 가능(On-Demand)
  - 사용한 만큼만 비용 지불(Pay-as-you-go)
  - 다양한 크기(CPU/메모리/스토리지 조합) 선택 가능
  - 손쉽게 확장/축소 가능 (Auto Scaling 지원)

#### 1) EC2 인스턴스 유형

- General Purpose (범용)
- Compute Optimized (연산 최적화)
- Memory Optimized (메모리 최적화)
- Storage Optimized (스토리지 최적화)
- GPU Instances

#### 2) AMI (Amazon Machine Image)

EC2 인스턴스를 시작할 때 기반이 되는 운영체제(OS) 이미지 + 소프트웨어 설정 묶음

- 종류
  - AWS 제공 기본 AMI (Amazon Linux, Ubuntu 등)
  - Marketplace에서 제공되는 AMI (보안 강화, 상용 소프트웨어 포함)
  - 사용자가 직접 커스터마이징한 AMI (패키지 설치, 설정 완료 상태 저장)

#### 3) 보안 그룹 (Security Group)

EC2 인스턴스에 대한 방화벽 규칙을 설정

- 22번 포트(SSH) : 개발자 원격 접속 허용
- 80번 포트(HTTP) : 웹 서비스 공개
- 443번 포트(HTTPS) : 보안 웹 서비스 공개

#### 4) 키 페어 (Key Pair)

EC2 인스턴스에 접속할 때 사용하는 인증 수단(SSH 비밀키/공개키 쌍)

- 인스턴스를 시작할 때 키 페어를 등록하고, 접속 시 개인 키 파일(`.pem`)을 사

---
