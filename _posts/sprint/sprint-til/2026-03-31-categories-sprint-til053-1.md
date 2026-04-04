---
title: '[TIL 53일 차] Docker: 빌드, 배포, 컨테이너 실행하기'
excerpt: '1.컨테이너화가 필요한 이유 ~ 6.Dockerfile과 이미지 빌드 및 배포'

categories:
  - Sprint TIL
tags:
  - [Codeit Sprint, Codeit Sprint TIL]

permalink: /categories/codeit-sprint/sprint-til/sprint-til053-1

toc: true
toc_sticky: true

date: 2026-03-31
last_modified_at: 2026-03-31
---

# Docker: 빌드, 배포, 컨테이너 실행하기

## <span style="background-color: #FFF9C4">1. 컨테이너화가 필요한 이유</span>

### 1-01. 전통적인 배포 방식

CI/CD 도구 없이 수동으로 서버에 직접 애플리케이션을 배포하고 운영하는 방식

#### 1) Spring Boot 애플리케이션 build와 실행

- build
  - Spring Boot 실행용 JAR 파일만 생성

    ```bash
    # Windows PowerShell 예시
    PS D:\springboot\project> .\gradlew bootJar

    # Git Bash 예시
    ./gradlew bootJar
    ```

  - 프로젝트 전체 빌드 수행(bootJar 포함)

    ```bash
    # Windows PowerShell 예시
    PS D:\springboot\project> .\gradlew build

    # Git Bash 예시
    ./gradlew build
    ```

- 실행

```powershell
java -jar build된_파일명.jar
```

#### 2) 애플리케이션 배포 방식

애플리케이션 배포는 크게 수동 배포 방식과 플랫폼/자동화를 활용한 배포 방식으로 나눌 수 있다.

배포 후에는 로그 확인 및 상태 체크가 필수다.

- 전통적 배포 방식 (수동)
  - 가장 기본적인 방식은 로컬 환경에서 애플리케이션을 빌드한 뒤, 생성된 JAR 파일을 서버에 직접 복사하고 실행하는 것
    ```bash
    scp build/libs/app.jar ec2-user@<IP주소>:/home/ec2-user/app/
    ```
  - 서버에 접속한 뒤에는 다음과 같이 직접 애플리케이션을 실행할 수 있다.
    ```bash
    cd /home/ec2-user/app
    nohup java -jar app.jar --spring.profiles.active=server > app.log 2>&1 &
    ```
- 클라우드 배포 방식
  - IaaS, PaaS는 인프라 또는 플랫폼의 형태이고, CI/CD는 배포를 자동화하는 방식
  - 유형
    - PaaS : Heroku, Cloud Foundry, AWS EB
    - IaaS : AWS EC2, Azure, GCP
    - CI/CD : GitHub Actions, CircleCI

#### 3) 문제점

- 환경 의존성 문제
  - 운영 환경과 개발 환경 사이의 격차를 줄이기 어려움
- 설치 과정의 복잡성 및 반복성
  - 모든 의존 구성 요소(JDK, DB, nginx, firewall 등)를 직접 설치 필요
- 서버 자원 활용의 비효율성
  - 단일 서버, 단일 인스턴스 구조 ➡️ 확장성이 떨이짐
  - 트래픽 증가 ➡️ 추가 서버를 직접 구성
  - 로드밸런싱, 무중단 배포가 어려움
- 배포 오류 및 반복 작업 증가
  - 매번 `.jar` 파일을 build하고 scp로 서버에 전송 후, 실행 명령어 입력 ➡️ 비효율적
  - 잘못된 입력 및 누락, 업로드 가능
  - 여러 서버에 배포할 경우 매번 수동 반복
- 자동화 부재로 인한 유지보수 비용 증가
  - CI/CD 도구 없이 배포하면 배포자, 배포 시점 등을 기록으로 남기기 어려움
  - 사람이 직접 운영 적용 ➡️ 버그 유입 가능성 증
  - 운영 상황에 대한 가시성 부족

---

## <span style="background-color: #FFF9C4">2. Docker 시작하기</span>

### 2-01. Docker

오픈소스 기반의 컨테이너 관리 플랫폼으로, 리눅스 컨테이너(LXC) 기술을 이용해 애플리케이션을 빠르고 일관되게 실행할 수 있도록 도와주는 표준화 도구이다.

- 컨테이너 기술을 손쉽게 사용할 수 있다.
- 복잡한 실행 환경 구성 없이 동일한 환경을 어디서든 재현할 수 있게 해준다.
- **구성 요소**
  - 이미지(Image) : 실행 환경 전체를 코드처럼 패키징한 템플릿
  - 컨테이너(Contaienr) : 이미지 기반으로 실행되는 격리된 프로세스 환경
  - Dockerfile : 이미지를 생성하기 위한 선언형 스크립트
  - Docker CLI / Daemon : 이미지 빌드, 컨테이너 실행, 볼륨 마운트, 네트워크 관리 등
  ```bash
  # 예시: Dockerfile 기반으로 컨테이너 실행하기
  docker build -t my-app .         # Dockerfile로부터 이미지 생성
  docker run -d -p 8080:8080 my-app  # 생성된 이미지로 컨테이너 실행
  ```
- 특징
  - 하나의 이미지만 있으면 Windows, macOS, Linux, 클라우드 어디서든 동일하게 실행
  - OS 부팅이 필요 없어 VM(가상머신) 보다 상대적으로 빠르게 실행됨
  - 컨테이너는 호스트 OS 커널을 공유하기에 VM보다 비교적 RAM과 디스크 사용량이 적음
  - CI/CD 도구들과 결합해 이미지 build ➡️ test ➡️ 배포까지 자동화 가능

#### 1) Docker 컨테이너

운영체제 수준에서 격리된 실행 환경

즉, 컨테이너 내부에서 실행되는 애플리케이션은 마치 독립된 OS 위에서 실행되는 것처럼 작동하지만, 실제로는 호스트 OS의 커널을 공유

- 특징
  - Docker image로 생성됨
  - 독립적인 환경 제공 ➡️ 다른 컨테이너나 호스트와 격리됨
  - 시스템 전체가 아니라 애플리케이션 단위로 패키징
  - 하나의 컨테이너는 하나의 프로세스를 실행
  - 다른 컨테이너와 파일 시스템, 네트워크, 환경 변수를 격리해서 사용
  - 가상머신보다 상대적으로 가볍고 빠르게 실행
- 실행 예시

```bash
# Docker로 Nginx 실행 예시
docker run -d -p 8080:80 nginx
```

Nginx 서버가 새로운 컨테이너 환경에서 실행 ➡️ 서버 설치, 설정, 방화벽 작업 없이 바로 작동

#### 2) Docker Image

컨테이너를 실행하기 위한 정적인 실행 패키지로, 컨테이너의 설계도(blueprint)이다.

클래스와 인스턴스의 관계라고 생각하면 좋다.

- Docker Image 구성
  - 운영체제의 최소 구성 요소(예: Ubuntu minimal 등)
  - 애플리케이션 실행 파일(`.jar`, `.py`, `.exe` 등)
  - 의존 라이브러리, 설정 파일, 환경 변수
  - Dockerfile에 정의된 명령들
  ```bash
  # Dockerfile 예시
  FROM openjdk:17 # base image
  COPY ./build/libs/app.jar /app/app.jar
  ENTRYPOINT ["java", "-jar", "/app/app.jar"]
  ```
- Docker Image의 특징
  - 불변(immutable)
    - 한 번 생성되면 수정 불가 ➡️ 변경된다면 새로운 Image를 만들어야 함
  - 레이어(layer) 구조
    - 효율적인 저장 및 캐시 활용 가능
      | ENTRYPOINT |
      | ---------- |
      | COPY |
      | FROM |

#### 3) 컨테이너화를 통한 해결

**1) 실행 환경 표준화**

실행 환경을 완전히 표준화하여 개발 환경, 테스트 환경, 운영 환경 간의 불일치로 발생하는 문제를 원천적으로 제거할 수 있다.

- 문제
  - 운영체제 불일치, 각종 런타임 버전 불일치 등
- 해결
  - Docker Image를 사용하면 애플리케이션을 구동하는 데 필요한 OS, 라이브러리, 언어 런타임, 환경 설정 등을 모두 포함한 표준화된 실행 환경을 만듦

**2) 배포 자동화**

컨테이너 Image의 가장 큰 장점은 CI/CD 파이프라인과 뛰어난 연동성

애플리케이션 build부터 배포까지 전 과정 자동화 ➡️ 배포 속도와 신뢰성 높임

**3) 자원 활용의 효율화**

컨테이너는 가상 머신과 달리 호스트 OS의 커널을 공유하기 때문에 상대적으로 가볍고 빠르며, 수십 개의 서비스를 하나의 서버에서 동시에 실행 가

<br>

### 2-02. DockerHub

Docker에서 운영하는 공식 이미지 저장소(Registry)

GitHub가 소스코드를 공유하고 협업하는 플랫폼이라면, DockerHub는 컨테이너 이미지를 공유하고 배포하는 플랫폼

- 기능
  - 이미지를 Pull/Push할 수 있는 저장소 제공
  - 자동 build 기능 (GitHub 연동)
  - 이미지 버전 관리 및 태그(tag) 관리 기능
  - 팀 및 조직 단위 협업 기능
  ```bash
  # DockerHub에서 nginx 이미지 받아 실행하기
  docker pull nginx                # 이미지 다운로드
  docker run -d -p 80:80 nginx     # 컨테이너 실행
  ```
- Docker 저장소
  - Docker 이미지를 저장하고, 관리하며, 공유할 수 있는 공간
  - 종류
    - Docker Hub (Docker에서 제공하는 공식 저장소)
    - Private Registry
    - Public Registry
- 공식 이미지(Official Image)
  - Docker에서 직접 build하고 보안 검증을 마친 이미지
  ```bash
  # 'nginx'는 실제로는 'library/nginx'로 간주됩니다
  docker pull nginx
  ```
- 사용자 이미지(User Image)
  - 사용자가 자신의 DockerHub 계정으로 push한 이미지
  ```bash
  # 사용자 이미지 예시
  docker pull john123/my-spring-app:1.0.2
  ```

<br>

### 2-03. Docker Desktop

개발자가 로컬 환경에서 Docker 컨테이너 실행하고 관리할 수 있도록 도와주는 데스크탑 애플리케이션

- Docker CLI와 GUI 도구를 함께 제공
- Windows/macOS 환경에서 Linux 기반 컨테이너 실행 지원
- Kubernetes, Volume, Network 등 다양한 기능 내장
- 컨테이너 리소스 제한, 로그, 이미지 관리 등 인터페이스 제공

설치 : https://www.docker.com/

- 설치 확인 및 기본 동작 테스트

```bash
docker --version       # 설치된 버전 확인
docker info            # 시스템 정보 및 상태 확인
docker run hello-world # 컨테이너 동작 테스트(`hello-world` 이미지는 테스트용 컨테이너)
```

<br>

### 2-04. Docker 공식 문서

https://docs.docker.com/

| 문서 섹션   | 활용 예시             | 설명                                           |
| ----------- | --------------------- | ---------------------------------------------- |
| Get Started | 도커 입문 시 튜토리얼 | 간단한 이미지 빌드 → 실행 → 공유까지 학습 가능 |
| Reference   | 상세 매뉴얼           | 모든 명령어의 공식 정의, 플래그, 예제 포함     |

[docker builder](https://docs.docker.com/reference/cli/docker/builder/)

[docker compose](https://docs.docker.com/reference/cli/docker/compose/)

[docker exec](https://docs.docker.com/reference/cli/docker/container/exec/)

[docker run](https://docs.docker.com/reference/cli/docker/container/run/)

---

## <span style="background-color: #FFF9C4">3. Docker 이미지 명령어</span>

### 3-01. Docker 이미지를 다루는 기본적인 명령어

#### 1) `docker pull` : 이미지 다운로드 명령어

Docker 이미지를 원격 저장소(DockerHub 등)로부터 로컬 환경으로 다운로드할 때 사용

```bash
docker pull nginx
```

- DockerHub의 공식 `nginx` 이미지에서 기본 태그(`latest`) 버전을 다운로드
- 다운로드 하면 로컬 Docker 이미지 목록에 저장되어 `docker run`으로 사용 가능

```bash
docker pull nginx:1.25 # nginx의 1.25 버전 이미지
```

- 태그(tag)는 이미지의 특정 버전을 의미

#### 2) `docker images` : 이미지 목록 조회

로컬 환경에 다운로드된 모든 Docker 이미지 목록을 확인할 때 사용

```bash
docker images
```

| IMAGE        | ID       | DISK USAGE | CONTENT SIZE | EXTRA |
| ------------ | -------- | ---------- | ------------ | ----- |
| nginx:latest | abcd1234 | 240MB      | 65.8MB       | U     |
| postgres:15  | efgh5678 | 633MB      | 164MB        | U     |

- IMAGE : 이미지 이름 + 태그
- ID : 이미지 고유 ID (해시값)
- DISK USAGE : 실제로 디스크에서 차지하는 총 용량 (캐시/레이어 포함)
- CONTENT SIZE : 이미지 자체의 순수 크기
- EXTRA : 이미지 상태 정보

**특정 이름 필터링**

```bash
docker images python
```

**특정 태그로 필터링 (정규 표현식-like)**

```bash
docker images --filter reference='python:3.10*'
# `python` 이미지 태그 중 `3.10`으로 시작하는 것만 출력
```

- `reference=` 옵션은 `"REPOSITORY:TAG"` 형식 기준으로 필터링

**Dangling 이미지만 필터링**

`dangling` 이미지란, **태그가 없거나 사용되지 않는 중간 이미지**를 의미

- 보통 `docker build` 도중 실패하거나 중간 단계에서 생성된 이미지

```bash
# 태그가 없는 임시 이미지 목록(`none:none`)만 출력
docker images --filter "dangling=true"
```

**JSON 형태로 출력**

모든 항목을 JSON 형태로 출력하여 자동화 스크립트나 로그 파이프라인에 활용

```bash
docker images --format '{{json .}}'
```

#### 3) `docker rmi` : 이미지 삭제

로컬에 저장된 Docker 이미지를 삭제하는 명령어

```bash
# 이미지 ID로 삭제
docker rmi abc1234

# REPOSITORY:TAG 형식으로 삭제
docker rmi nginx:latest
```

```bash
# 여러 개 삭제 가능
docker rmi nginx:latest python:3.10
```

**강제 삭제(`f` 옵션)**

해당 이미지를 사용하는 컨테이너가 존재하다라도 강제로 삭

```bash
docker rmi -f nginx
```

#### **4) Dangling 이미지 제거**

```bash
# 사용되지 않는 이미지 정리
docker image prune
```

- 삭제 확정 시 `y` 또는 `-force` 필요

---

## <span style="background-color: #FFF9C4">4. Docker 컨테이너 명령어</span>

### 4-01. Docker 컨테이너 명령어

#### 1) `docker run` : 컨테이너 실행

이미지로부터 새로운 컨테이너를 만들고 실행

- 앱 설치 파일(이미지)를 기반으로 실제 실행 프로그램(컨테이너)를 띄우는 것과 동일

```bash
# 가장 기본적인 예제
# hello-world 이미지를 실행하여 Docker가 정상 동작하는지 테스트
docker run hello-world
```

```bash
# 백그라운드에서 실행하고, 이름을 지정하는 예제
docker run -d --name my-container nginx
# -d : 백그라운드 실행(detached)
# --name : 컨테이너 이름 지정
# nginx : 실행할 이미지 이름
```

```bash
# p 옵션을 사용하면 포트를 열어 외부에서 접속 가능 예) p 8080:80
docker run -d -p 8080:80 nginx
```

#### 2) `docker ps` : 컨테이너 상태 확인

현재 실행 중인 컨테이너 목록을 보여준다.

```bash
# 실행 중인 컨테이너 목록
docker ps

# 모든 컨테이너 보기(중지된 것도 포함)
docker ps -a
```

#### 3) `docker start` / `stop`/ `restart`

- `start` : 중지된 컨테이너를 다시 실행
- `stop` : 실행 중인 컨테이너를 중지
- `restart` : 실행 중인 컨테이너를 재시작

```bash
# 컨테이너 시작
docker start my-container

# 컨테이너 중지
docker stop my-container

# 컨테이너 재시작
docker restart my-container
```

#### 4) `docker exec` : 컨테이너 내부 명령 실행

실행 중인 컨테이너 안에서 명령을 실행할 수 있게 해주는 명령

```bash
docker run -d --name exec-lab ubuntu:24.04 sleep infinity

# exec-lab 컨테이너 내부 터미널 접속
docker exec -it exec-lab bash
# -i : 대화형 모드
# -t : 터미널 모드
# bash : 컨테이너 내부의 bash 터미널로 진입
```

- `sleep infinity` : 우분투와 같은 운영체제 컨테이너가 실행 직후 할 일이 없어 바로 종료되는 것을 방지하기 위해, 무한히 대기 상태를 유지하며 실행 상태를 살려두도록 하는 리눅스 명령어

#### 5) `docker logs` : 컨테이너 로그 확인

컨테이너가 출력한 로그를 확인하는 명령어

```bash
# 로그 전체 보기
docker logs my-container

# f 옵션을 사용하면 로그를 실시간으로 확인
docker logs -f my-container
```

#### 6) `docker rm` : 컨테이너 삭제

컨테이너를 삭제하는 명령어

- 중지된 컨테이너만 삭제할 수 있다.

```bash
# 중지된 컨테이너 삭제
docker rm my-container

# 실행 중인 컨테이너 강제 삭제
docker rm -f my-container
```

---

## <span style="background-color: #FFF9C4">5. Docker의 네트워크와 볼륨</span>

### 5-01. Docker 네트워크

Docker에서 네트워크(Network)는 컨테이너들이 서로 통신하거나, 컨테이너와 외부(인터넷, 로컬 PC)가 통신할 수 있도록 해주는 가상의 연결망

- 컨테이너는 기본적으로 격리된 환경에서 실행되기 때문에 네트워크 설정 없이는 서로 또는 외부 통신이 불가능하다.
- 연결에 네트워크 드라이버(Network Driver) 방식을 사용

#### 1) 네트워크 종류

- **bridge** (기본)
  - Docker가 가상 bridge(스위치)를 만들고, 모든 컨테이너를 연결 시킴
  - 외부 접근은 포트 매핑이 필요.
  - **구조**
    ```groovy
    [컨테이너 A]   \
                     → [Bridge Network] → (포트매핑) → Host → 외부
    [컨테이너 B]   /
    ```
- **host**
  - 컨테이너가 호스트 PC의 네트워크를 그대로 사용 ➡️ 호스트와 IP가 동일
    ```groovy
    [컨테이너] → Host Network (IP, 포트 공유) → 외부
    ```
- **none**
  - 네트워크 없음 ➡️ 외부, 내부 모두 통신 불가
    ```groovy
    [컨테이너] (네트워크 연결 없음)
    ```

#### 2) 네트워크 목록과 상세 정보 확인 명령어

```bash
# 네트워크 목록 보기
docker network ls

# 특정 네트워크 상세 정보
docker network inspect bridge
```

#### 3) 컨테이너 간 통신

- 사용자 정의 네트워크 생성

```bash
# my-net이라는 브릿지 네트워크 생성
docker network create my-net
```

- 동일 네트워크에 컨테이너 실

```bash
# 컨테이너 1
docker run -d --name container-a --network my-net nginx

# 컨테이너 2
docker run -d --name container-b --network my-net alpine sleep 1000
```

- 네트워크를 통한 통신 확인

```bash
# container-b에서 container-a에 ping
 docker exec -it container-b ping container-a
```

#### 4) 포트 바인딩

호스트의 포트를 컨테이너의 포트에 연결하여 외부에서 접근 가능하게 하는 방법

```bash
# 호스트 8080 → 컨테이너 80 포트 연결
# `-p 호스트_포트:컨테이너_포트`
docker run -d --name web -p 8080:80 nginx
```

- 바인딩 확인

```bash
docker ps
# PORTS 컬럼에서 바인딩 정보 확인 가능
```

<br>

### 5-02. Docker 볼륨

컨테이너의 데이터를 영구적으로 저장하고, 컨테이너 간의 데이터를 공유하기 위한 저장소

- 컨테이너가 삭제되어도 볼륨에 저장된 데이터는 유지된다.
- **필요성**
  - 컨테이너 내부에 데이터를 저장하면 컨테이너 삭제 시 데이터도 함께 삭제된다. 이를 방지하기 위해 볼륨을 사용해 Docker가 관리하는 호스트 디렉터리에 데이터를 저장한다.

---

## <span style="background-color: #FFF9C4">6. Dockerfile과 이미지 build 및 배포</span>

### 6-01. Dockerfile

Docker 이미지를 만들기 위한 명령어 모음

- 일종의 “레시피” 역할을 하며, 작성한 명령어 순서대로 레이어를 생성
- 각 명령은 레이어를 만들고, build 시 캐시가 재사용됨
  - 빈번하게 바뀌는 파일(COPY 소스 등)은 아래쪽에 두면 build가 빨라짐

#### 1) Dockerfile 기본 명령어

- `FROM` : 기반이 되는 베이스 이미지를 지정
- `RUN` : 이미지 build 시 실행할 명령어
- `COPY` : 호스트의 파일/디렉터리를 이미지로 복사
- `WORKDIR` : 작업 디렉터리 지정
- `CMD` : 컨테이너 실행 시 기본 명령 지정
- `ENTRYPOINT` : 실행 진입점 설정 (CMD와 병행 가능)
- `EXPOSE` : 컨테이너가 사용하는 포트 명시
- `ENV` : 환경변수 설정

### 2) 레이어(Layer)

Docker 이미지는 여러 읽기 전용 레이어로 구성됨

Dockerfile의 각 명령어가 하나의 레이어를 형성

레이어는 캐시가 되어, 변경되지 않은 부분은 재사

#### 3) 간단한 Dockerfile 예시

```docker
# 1) 베이스 이미지 선택 (OpenJDK 17)
FROM eclipse-temurin:17-jdk

# 2) 작업 디렉토리 설정
WORKDIR /app

# 3) 애플리케이션 파일 복사
COPY build/libs/my-app-0.0.1-SNAPSHOT.jar app.jar

# 4) 포트 노출 (Spring Boot 기본 포트)
EXPOSE 8080

# 5) 컨테이너 실행 시 명령어 지정
ENTRYPOINT ["java", "-jar", "app.jar"]

------------------
Layer 5   ENTRYPOINT
------------------
Layer 4   EXPOSE
------------------
Layer 3   COPY
------------------
Layer 2   WORKDIR
------------------
Layer 1   FROM
------------------
```

#### 4) 멀티 스테이지 build

Dockerfile을 여러 개의 단계(stage)로 나눠서 build하는 방식

- 목적
  - build tool 제거
  - 실행 환경 경량화
  - 캐시 재사용
- 구조

```docker
(빌드 단계)          (실행 단계)
Gradle + JDK       JRE + app.jar
소스 코드            빌드 산출물만 복사
의존성 다운로드        실행 스크립트
```

- Gradle 기반 Dockerfile 예시

```docker
# ====== build args는 반드시 FROM보다 위에 선언 ======
# 도커 빌드 시 사용할 빌드/런타임 이미지 이름을 변수로 지정
# ARG는 선언된 이후부터만 유효하므로 반드시 FROM보다 위에 있어야 함
ARG BUILDER_IMAGE=gradle:7.6.0-jdk17
ARG RUNTIME_IMAGE=amazoncorretto:17.0.7-alpine

# ============ (1) Builder ============
# 빌더 스테이지 시작: 지정한 Gradle + JDK 환경을 사용
FROM ${BUILDER_IMAGE} AS builder

# 루트 권한으로 변경 (권한 설정/폴더 생성 작업을 위해)
USER root
# 애플리케이션 작업 디렉토리 설정
WORKDIR /app
# Gradle 캐시 디렉토리 경로를 환경 변수로 설정 (빌드 속도 향상)
ENV GRADLE_USER_HOME=/home/gradle/.gradle
# Gradle 캐시 디렉토리와 앱 디렉토리 소유자를 gradle 유저로 변경
RUN mkdir -p $GRADLE_USER_HOME && chown -R gradle:gradle /home/gradle /app
# gradle 유저로 변경 (보안 및 권한 문제 방지)
USER gradle

# Gradle Wrapper 스크립트 복사 (빌드 실행에 필요)
COPY --chown=gradle:gradle gradlew ./
# gradle 폴더 복사 (wrapper 설정 및 실행 환경)
COPY --chown=gradle:gradle gradle ./gradle
# Gradle 설정 파일 복사 (빌드 스크립트)
COPY --chown=gradle:gradle build.gradle settings.gradle ./
# gradlew 실행 권한 부여
RUN chmod +x ./gradlew
# 의존성만 먼저 다운로드하여 캐시 활용 (코드 변경 없이 재사용 가능)
RUN ./gradlew --no-daemon --refresh-dependencies dependencies || true

# 실제 소스코드 복사 (이 시점 이후 변경 시 빌드 다시 수행됨)
COPY --chown=gradle:gradle src ./src
# 애플리케이션 빌드 (테스트 제외, 속도 향상)
RUN ./gradlew clean build --no-daemon --no-parallel -x test

# ============ (2) Runtime ============
# 런타임 스테이지: 빌드 결과 실행에 필요한 최소한의 경량 이미지 사용
FROM ${RUNTIME_IMAGE}
# 앱 실행 디렉토리 지정
WORKDIR /app

# 빌드 스테이지에서 생성한 JAR 파일만 복사
COPY --from=builder /app/build/libs/*.jar app.jar
# 애플리케이션이 사용하는 포트 노출
EXPOSE 8080
# Spring Boot 프로필을 운영(prod)으로 설정
ENV SPRING_PROFILES_ACTIVE=prod
# 컨테이너 시작 시 JAR 실행
ENTRYPOINT ["java","-jar","app.jar"]

```

<br>

### 6-02. 이미지 build 및 배포

#### 1) `docker buildx build`

기존 `docker build`를 확장한 명령어로, 멀티 아키텍처 빌드와 고급 빌드 옵션을 제공한다. 이를 통해 x86, ARM 등 다양한 플랫폼용 이미지를 한 번에 build할 수 있다.

- 사용 예시

```powershell
# 현재 디렉토리(.)에 있는 Dockerfile로 이미지 빌드

docker buildx build `
  --platform linux/amd64,linux/arm64 `
  -t username/my-app:1.0.0 `
  --push `
  .

docker buildx build --platform linux/amd64,linux/arm64 -t username/my-app:1.0.0 --push .
```

- `--platform` : build할 플랫폼 지정 (쉼표로 구분)
- `-t` : 이미지 이름과 태그 지정
- `--push` : build 완료 후 자동으로 레지스트리에 push
- `--load` : build한 미지를 로컬 Docker 엔진에 로드

#### 2) 이미지 태깅(Tagging)

태그(tag)는 이미지의 버전과 용도를 구분하는 식별자로, 같은 이미지에 여러 태그를 지정할 수 있어 개발/운영 환경을 쉽게 나눌 수 있다.

- `latest`는 가급적 개발/테스트 용도로만 사용할 것

- 태그 형식과 예시

```bash
<레지스트리>/<계정명>/<이미지명>:<태그>
```

```bash
docker tag my-app:latest username/my-app:1.0.0
```

- 레지스트리 : 기본값은 DockerHub
  - 예시 : `docker.io`
- 계정명 : DockerHub 사용자명
  - 예시 : `username`
- 이미지명 : 애플리케이션 이름
  - 예시 : `my-app`
- 태그 : 버전 정보
  - 예시 : `1.0.0`

#### 3) DockerHub 배포

- DockerHub 로그인

```bash
docker login
# 사용자명, 비밀번호 입력
```

- push 명령

```bash
docker push username/my-app:1.0.0
```

- push 과정
  1. DockerHub 계정 생성 및 로그인
  2. 로컬에서 이미지 빌드 및 태그 지정
  3. `docker push`로 업로드
  4. DockerHub 웹에서 이미지 확인 가능

---
