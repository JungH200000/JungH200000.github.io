---
title: '[Sprint 성취도 평가] Git을 통한 버전 관리와 협업 + Java 고급 과정 이론 평가'
excerpt: ''

categories:
  - Sprint 성취도 평가
tags:
  - [Codeit Sprint, Codeit Sprint Test]

permalink: /categories/codeit-sprint/sprint-test/sprint-test001/

toc: true
toc_sticky: true

date: 2026-01-23
last_modified_at: 2026-01-23
---

# Git을 통한 버전 관리와 협업 + Java 고급 과정 이론 평가

생성일: 2026년 1월 23일 오후 6:39
수식: Friday

# 문제1.

[SB] [Git을 통한 버전 관리와 협업]

리눅스에서 파일 및 디렉토리를 관리하는 기본 명령어인 mkdir, touch, mv, cp에 대해 각 명령어의 주요 기능과 활용 방법을 비교하여 설명하세요. 각 명령어의 대표적인 옵션과 함께 실제 작업 시나리오에서 어떻게 활용될 수 있는지 구체적인 예시를 들어 서술하세요.

- **답변**
  - 주요 기능과 활용 방법
    `mkdir 폴더_이름` : 새로운 폴더를 생성하는 명령어
    `touch 파일_이름.확장자` : 새로운 파일을 생성하는 명령어
    `mv 옮길_파일/폴더_이름 옮길_위치` 또는 `mv 기존_파일/폴더_이름 바꿀_이름` : 폴더나 파일의 위치나 이름을 변경시키는 명령어
    `cp 복사당할_파일/폴더 복사할_파일/폴더` : 해당 폴더나 파일을 복사하는 명령어
  - 실제 작업 시나리오
  1. `mkdir hello`로 hello 폴더 생성
  2. `cd hello`로 hello 폴더로 이동
  3. `touch hungry.txt`로 hungry 텍스트 파일 생성
  4. `mv hungry.txt very_hungry.txt`로 hungry.txt 파일의 이름을 very_hungry로 변경
  5. `cp very_hungry.txt very_very_hungry.txt`로 very_hungry 파일을 복사 후 very_very_hungry.txt 이름으로 생성

- **해설**

  리눅스에서 파일 및 디렉토리 관리를 위한 기본 명령어는 다음과 같습니다:

  mkdir(make directory)는 새로운 디렉토리를 생성하는 명령어입니다. 주요 옵션으로는 -p(부모 디렉토리가 없을 경우 함께 생성)가 있습니다. 예를 들어, 'mkdir -p projects/web/css'는 projects, web, css 디렉토리를 한 번에 생성합니다.

  touch는 빈 파일을 생성하거나 기존 파일의 타임스탬프를 업데이트하는 명령어입니다. 'touch newfile.txt'는 newfile.txt라는 빈 파일을 생성하며, 이미 파일이 존재할 경우 접근 및 수정 시간만 현재 시간으로 업데이트합니다.

  mv(move)는 파일이나 디렉토리를 이동하거나 이름을 변경하는 명령어입니다. 'mv file.txt directory/'와 같이 사용하면 파일을 지정된 디렉토리로 이동하고, 'mv oldname.txt newname.txt'와 같이 사용하면 파일 이름을 변경합니다. 디렉토리도 동일한 방식으로 이동하거나 이름을 변경할 수 있습니다.

  cp(copy)는 파일이나 디렉토리를 복사하는 명령어입니다. 주요 옵션으로는 -r(디렉토리와 그 내용을 재귀적으로 복사), -i(덮어쓰기 전 확인), -p(파일 속성 유지) 등이 있습니다. 'cp -r source_dir/ destination_dir/'는 디렉토리와 그 내용 전체를 복사합니다.

  실제 작업 시나리오 예시:
  - 프로젝트 구조 생성: 'mkdir -p project/src project/docs'로 프로젝트 기본 구조 생성
  - 파일 생성: 'touch project/src/main.js project/src/style.css'로 빈 소스 파일 생성
  - 파일 이름 변경: 'mv project/src/style.css project/src/main.css'로 CSS 파일 이름 변경
  - 파일 복사: 'cp project/src/main.js project/src/backup_main.js'로 백업 파일 생성
  - 디렉토리 이동: 'mv project/docs project/documentation'으로 docs 디렉토리 이름 변경
    이와 같이 mkdir, touch, mv, cp 명령어를 조합하여 효율적으로 파일 및 디렉토리 구조를 관리할 수 있습니다.

---

# 문제2.

[SB] [Git을 통한 버전 관리와 협업]

git add와 git commit 명령어의 역할과 차이점에 대해 설명해 주세요.

- **답변**

  `git add`는 추적하도록 설정된 파일들의 변경 사항을 스테이징 영역으로 저장

  `git commit`은 스테이징 영역에 있던 변경사항들을 로컬 repository로 올리는 것으로, history에 표시됨. 어떤 작업을 했는지 commit 메세지에 적을 수 있다.

- **해설**

  git add는 변경된 파일을 스테이징 영역에 추가하는 명령어입니다. 이는 파일을 Git이 추적할 수 있는 상태로 만들어주며, `git add [파일명]` 또는 `git add .` 형식으로 사용할 수 있습니다. 스테이징 영역에 올라간 파일들은 아직 최종 저장된 상태가 아니며, commit 명령어를 통해 최종 저장이 이루어집니다.

  git commit은 스테이징된 변경 사항을 저장소에 영구적으로 기록하는 명령어입니다. `git commit -m "커밋 메시지"` 형식으로 사용되며, 이 시점에서 스테이징 영역에 있던 파일들의 변경사항이 실제로 저장됩니다.

  두 명령어의 관계는 다음과 같습니다:

  git add를 통해 변경사항을 임시로 스테이징 영역에 올려두고, git commit을 통해 이러한 변경사항들을 하나의 의미 있는 변경 단위로 묶어 저장하는 것입니다.

  커밋 메시지는 변경 사항을 설명하는 중요한 요소입니다. 따라서 커밋 메시지는 간결하면서도 변경사항의 핵심적인 내용을 담고 있어야 하며, 이는 나중에 히스토리를 확인할 때 변경사항을 쉽게 이해할 수 있게 해줍니다.

---

# 문제3.

[SB] [Git을 통한 버전 관리와 협업]

Git의 주요 브랜치 전략에 대해 main, develop, feature, release, hotfix 브랜치를 중심으로 각각의 역할과 용도를 설명해 주세요.

- **답변**

  main : 배포하는 branch

  develop : 개발을 진행하는 branch

  release : 최종 release 테스트 하는 branch

  feature : 기능 개발하는 branch로, 기능 개발 후 develop branch로 병합

  hotfix : 버그 수정 branch

- **해설**

  main 브랜치는 항상 배포 가능한 상태를 유지하는 주요 브랜치입니다. 이 브랜치는 안정적이고 검증된 코드만을 포함하며, 실제 서비스에 배포되는 코드의 기준이 됩니다.

  develop 브랜치는 개발 단계에서 사용되는 브랜치로, 새로운 기능이나 버그 수정이 통합되는 곳입니다. 이 브랜치는 다음 릴리스를 위한 개발 작업이 진행되는 공간으로, feature 브랜치들이 처음으로 병합되는 지점입니다.

  feature 브랜치는 새로운 기능을 개발할 때 사용하는 브랜치입니다. develop 브랜치로부터 분기되어 독립적으로 새로운 기능을 개발하고, 개발이 완료되면 다시 develop 브랜치로 병합됩니다. 예를 들어, 'feature/login'이나 'feature/payment' 같은 이름으로 브랜치를 생성하여 사용합니다.

  release 브랜치는 배포 준비가 완료된 기능을 안정화하기 위해 사용하는 브랜치입니다. develop 브랜치에서 분기되어 생성되며, 여기서는 버그 수정과 배포 준비를 위한 미세 조정만 수행됩니다. 테스트가 완료되면 main 브랜치와 develop 브랜치 모두에 병합됩니다. 예를 들어, 'release/v1.0'과 같은 이름으로 사용됩니다.

  hotfix 브랜치는 배포된 버전에서 발생한 긴급한 버그를 수정할 때 사용됩니다. main 브랜치에서 직접 분기하여 생성하며, 버그 수정이 완료되면 main 브랜치와 develop 브랜치 모두에 병합됩니다. 예를 들어, 서비스 운영 중 심각한 보안 취약점이 발견되었을 때 'hotfix/security-patch' 같은 이름으로 브랜치를 만들어 신속하게 대응할 수 있습니다.

  이러한 브랜치 전략을 통해 안정적인 개발과 배포가 가능해지며, 팀 구성원들이 효율적으로 협업할 수 있습니다. 각 브랜치는 명확한 목적과 역할을 가지고 있어 체계적인 개발 프로세스를 구축할 수 있게 해줍니다.

---

# 문제4.

[SB] [Java 고급 과정]

객체지향 프로그래밍의 주요 특징인 추상화, 캡슐화, 상속, 다형성을 각각 설명하고, 실제 예시를 들어 설명해 주세요.

- **답변**
  - 상속

    코드 재활용을 위해 상위 클래스의 필드, 메서드 등을 하위 클래스가 물려받아 사용하는 것

    예시: `public class User extends BaseEntity {...}`

  - 추상화

    공통된 것을 뽑아서 상위 클래스로 만드는 것

    예시: `interface`, `abstract`

  - 캡슐화

    외부에서 내부를 접근 불가능하게 하는 것

    예시: `Getter`, `Setter`

  - 다형성

    예시: `ChannelService channelService = new JCFChannelService();` (`ChannelService`는 인터페이스, `JCFChannelService`는 `ChannelService`의 구현체)

- **해설**
  1. 추상화: 복잡한 시스템에서 핵심적인 부분만을 추출하여 단순화하는 것입니다. 예시: 자동차 클래스를 설계할 때, 운전에 필요한 '가속', '감속', '정지' 같은 핵심 기능만 추출하고, 엔진의 내부 동작과 같은 세부적인 내용은 추상화합니다.

  2. 캡슐화: 데이터와 이를 처리하는 메서드를 하나의 단위로 묶고, 외부 접근을 제한하는 것입니다. 예시: 은행 계좌 클래스에서 잔액(balance) 변수를 private으로 선언하고, 입금(deposit)과 출금(withdraw) 메서드를 통해서만 접근하도록 하여 데이터의 무결성을 보장합니다.

  3. 상속: 기존 클래스의 특성을 다른 클래스가 물려받아 재사용하거나 확장하는 것입니다. 예시: Animal 클래스를 만들고, Dog, Cat 클래스가 이를 상속받아 기본 특성(먹기, 자기)은 재사용하면서 각자의 특성(짖기, 야옹하기)을 추가할 수 있습니다.

  4. 다형성: 동일한 인터페이스를 통해 서로 다른 객체가 다른 방식으로 동작하는 능력입니다. 예시: Animal 클래스의 makeSound() 메서드를 Dog에서는 "멍멍", Cat에서는 "야옹"으로 다르게 구현하여, 같은 메서드 호출로 다른 동작을 수행할 수 있습니다.

     이러한 특징들은 코드의 재사용성을 높이고, 유지보수를 용이하게 하며, 프로그램의 구조를 더 명확하게 만듭니다. 추상화와 캡슐화는 복잡성을 관리하고, 상속과 다형성은 코드의 재사용성과 확장성을 제공합니다.

---

# 문제5.

[SB] [Java 고급 과정]

자바 컬렉션 프레임워크의 List, Set, Map 인터페이스의 특징과 주요 구현 클래스들의 차이점을 실제 사용 사례를 중심으로 설명해 주세요.

- **답변**
  - List

    데이터를 일렬로 저장하며, 순서가 존재하고, 중복된 데이터가 저장될 수 있다.
    ArrayList, LinkedList 등이 존재.

    예시: `List<Message> messageList = new ArrayList<>();`

  - Set

    key에 데이터를 저장하므로, 중복된 값이 입력될 수 없다. value에는 더미 객체가 저장된다.

    내부적으로 HashMap을 사용한다.

    HashSet 등이 존재

    예시: `Set<User> joinMemberList = new HashSet<>();`

  - Map

    key-value 쌍으로 데이터를 저장하며, key에는 중복된 값이 올 수 없다.

    내부적으로 해시 테이블을 사용한다.

    HashMap 등이 존재

    예시: `Map<UUID, User>data = new HashMap<>();`

- **해설**
  - 인터페이스의 특징
    - List: 순서가 있는 데이터의 집합으로, 중복을 허용합니다.
    - Set: 순서가 없는 데이터의 집합으로, 중복을 허용하지 않습니다.
    - Map: 키-값 쌍으로 데이터를 저장하며, 키는 중복될 수 없습니다.
  - 주요 구현 클래스들의 특징
    - List
      - ArrayList: 배열 기반으로 구현되어 인덱스를 통한 접근이 빠르지만, 중간 삽입/삭제가 느림
      - LinkedList: 노드 기반으로 구현되어 중간 삽입/삭제가 빠르지만, 인덱스 접근이 느림
    - Set
      - HashSet: 해시 알고리즘을 사용하여 빠른 검색을 제공하나, 순서를 보장하지 않음
      - TreeSet: 이진 트리를 사용하여 데이터를 정렬된 상태로 유지하나, 상대적으로 느린 검색 속도
    - Map
      - HashMap: 해시 테이블을 사용하여 빠른 검색을 제공하며, null 키와 값을 허용
      - TreeMap: 키를 기준으로 정렬된 상태를 유지하며, 정렬이 필요한 경우에 사용
  - 실제 사용 사례
    - 데이터 조회가 빈번한 경우: ArrayList나 HashMap 사용 예) 게시판 글 목록 관리에는 ArrayList가 적합
    - 데이터 삽입/삭제가 빈번한 경우: LinkedList 사용 예) 작업 대기열 구현에는 LinkedList가 적합
    - 중복 제거가 필요한 경우: HashSet 사용 예) 방문자 IP 주소 관리에는 HashSet이 적합
    - 정렬된 데이터 관리가 필요한 경우: TreeSet이나 TreeMap 사용 예) 학생 성적 관리에는 학번을 키로 하는 TreeMap이 적합
