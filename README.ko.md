# narae.js

narae.js는 node.js 플랫폼에서 제어반전(IoC)를 목적으로 하는 [bean.ts](https://github.com/jc-lab/bean.ts) 기반의 node.js 오픈소스 프레임워크이다.


# 이름

"나래"는 "날개"를 뜻하는 순 우리말의 문학적 표현이다. 불필요한 개발을 줄여 비즈니스 로직에 더욱 집중할 수 있도록 하여 개발에 날개를 달아 준다.

# 특징

## 의존성 주입

= **DI (Dependency Injection)**

bean.ts를 통해 의존성 주입을 지원한다.

## 제어반전

= **IoC (Inversion of Control)**

*아직 완전한 IoC라고 하기엔 부족한 점이 많다.*

기존의 express기반의 소프트웨어에서는 사용자가 직접 router를 구현해 주어야 하며, handler에서 오류 발생시 500에러 등이 발생하지 않고 Response를 주지 못하는 상황 등이 발생하였다.
narae.js에서는 사용자가 Router를 생성할 필요 없이 @RequestMapping 어노테이션을 통해 쉽게 handler를 구현할 수 있다.
또한 혹시 모를 오류 발생상황을 위해 handler내에서 발생하는 오류를 catch하여 처리한다.

## 관점 지향 프로그래밍

= **AOP (Aspect Oriented Programming)**

다음과 같은 AOP를 지원합니다.
* `@Slf` 어노테이션을 통해 손쉽게 logger를 사용할 수 있습니다.
* `@Transactional` 어노테이션을 통해 트랜잭션 영역을 지정해 자동으로 commit/rollback을 할 수 있습니다.

# 라이센스

[Apache License 2.0](LICENSE) 을 따른다.

