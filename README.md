# vibecoding

AI-Assisted Development Project.

---

## 🚀 개발 전략 및 아키텍처 (Development Strategy & Architecture)

이 프로젝트는 확장성(Scalability), 유지보수성(Maintainability), 그리고 팀 협업의 효율성을 극대화하기 위해 실리콘밸리 표준의 개발 프랙티스를 따릅니다.

### 1. 주요 설계 원칙 (Design Principles)

*   **관심사의 분리 (Separation of Concerns, SoC)**: 
    *   UI(View) 레이어와 비즈니스 로직(ViewModel/Model/API) 레이어를 철저히 분리합니다.
    *   컴포넌트는 렌더링에만 집중하고, 복잡한 로직은 Custom Hooks나 전역 상태 관리 영역으로 위임합니다.
*   **도메인 중심 아키텍처 (Feature-Sliced Design / Domain-Driven)**: 
    *   코드를 기술적 역할(Components, Hooks 등)이 아닌 **비즈니스 도메인(기능)** 단위로 묶어 관리합니다. (응집도 상승, 결합도 감소)
*   **불변성과 단방향 데이터 흐름 (Unidirectional Data Flow)**: 
    *   상태의 변경은 예측 가능해야 하며, 상위에서 하위로 흐르는 데이터 흐름을 유지합니다.
*   **타입 안정성 (Type Safety)**: 
    *   TypeScript를 적극 활용하여 런타임 에러를 방지하고, 명시적인 인터페이스 규격을 통해 문서화 효과를 얻습니다. `any` 타입 사용은 지양합니다.
*   **방어적 프로그래밍**:
    *   네트워크 에러, 런타임 에러 발생 시 앱이 크래시되지 않도록 `Error Boundary` 와 글로벌 에러 핸들러를 구축합니다.

### 2. 브랜치 전략 (Branch & Git Workflow)

*   `main`: 언제든지 배포 가능한 상태를 유지하는 운영용 브랜치
*   `develop`: 다음 출시를 위해 개발 중인 코드가 통합되는 테스트용 브랜치
*   `feature/...`: 새로운 기능 개발 브랜치 (예: `feature/login`, `feature/payment`)
*   모든 코드는 Pull Request(PR)를 통해 리뷰 후 `develop` (또는 `main`)에 병합됩니다.

---

## 📂 폴더 구조 및 네이밍 규칙 (Folder Structure & Convention)

현재 프로젝트는 **기능 기반 모듈화 구조(Feature-Based Structure)**를 사용합니다.

```text
src/
├── app/                  # 앱의 진입점, 글로벌 설정, 라우팅, 전역 프로바이더(Context, QueryClient 등)
├── assets/               # 원본 이미지, 로고, 아이콘, 폰트 등 정적 리소스
├── core/                 # 도메인에 종속되지 않는 핵심 로직 및 설정 (Axios 인스턴스, 에러 핸들러, 로거 등)
├── features/             # (핵심) 도메인별 분리된 모듈 (예: auth, users, products)
│   ├── [feature_name]/
│   │   ├── api/          # 해당 도메인의 API 통신 함수 (queries, mutations)
│   │   ├── components/   # 해당 도메인 전용 UI 컴포넌트
│   │   ├── hooks/        # 해당 도메인의 비즈니스 로직을 담은 Custom Hooks
│   │   ├── store/        # 해당 도메인과 관련된 로컬/전역 상태 (Zustand, Redux 등)
│   │   ├── utils/        # 해당 기능 내에서만 쓰이는 유틸리티
│   │   └── types/        # 기능 명세와 관련된 타입스크립트 인터페이스 (DTO 등)
├── shared/               # 여러 feature에서 공통으로 사용되는 UI 요소 및 유틸리티
│   ├── components/       # 재사용 가능한 UI 컴포넌트 (Button, Modal, Input, Layout 등)
│   ├── hooks/            # 공용 Custom Hooks (useDebounce, useMediaQuery 등)
│   ├── utils/            # 도메인과 무관한 순수 함수 (날짜 포맷팅, 데이터 파싱, 정규식 등)
│   ├── constants/        # 앱 전역 상수 (테마 컬러, 환경 변수 등)
│   └── styles/           # 전역 스타일 설정 (글로벌 CSS, Tailwind config 확장 등)
└── types/                # 전역적으로 사용되는 범용적인 타입 선언 파일 (*.d.ts 등)
```

### 규칙 (Conventions)

1.  **Strict Dependencies**: `features/` 하위의 특정 도메인 모듈(예: `auth`)은 다른 특정 도메인 모듈(예: `products`)의 내부 파일에 직접 접근하지 않습니다. 공통으로 필요한 로직이나 컴포넌트는 `shared/` 로 승격시킵니다.
2.  **Naming Convention**:
    *   폴더명: `kebab-case` (카멜/파스칼 허용 안함)
    *   React 컴포넌트 파일: `PascalCase.tsx`
    *   일반 모듈/함수 파일: `camelCase.ts`
    *   스타일 파일: `[name].module.css` (또는 로직에 따른 네이밍)
3.  **Barrel Export**: 각 기능의 최상위에 `index.ts` 를 두어 외부에 공개할 API(컴포넌트, 훅, 타입 등)만을 노출시키는 캡슐화 패턴을 지향합니다.

---

## 🎬 Remotion Commands

**Install Dependencies**
```console
npm i
```

**Start Next.js App**
```console
npm run dev
```

**Start Remotion Studio (Preview)**
```console
npm run video
```

**Render Video to MP4/WebM**
```console
npm run render
```
