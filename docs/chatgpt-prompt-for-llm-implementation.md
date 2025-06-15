# ChatGPT를 활용한 LLM 기능 구현 가이드

## 🎯 목표
서울 팝업 상점 대시보드에 LLM 기반 데이터 분석 기능을 추가하여, 사용자가 선택한 구와 업종에 대해 자연어로 인사이트를 제공하는 기능을 구현합니다.

## 📁 프로젝트 구조 이해
```
프로젝트/
├── lib/llm-sample-data.ts          # 샘플 데이터와 타입 정의 (이미 생성됨)
├── components/
│   ├── dashboard-map.tsx           # 지도 컴포넌트 (구 선택)
│   ├── industry-selector-hardcoded.tsx # 업종 선택
│   └── [새로 만들 LLM 컴포넌트들]
└── app/page.tsx                    # 메인 대시보드
```

## 🔧 구현해야 할 컴포넌트들

### 1. LLM 채팅 인터페이스 컴포넌트
### 2. OpenAI API 연동 함수
### 3. 메인 대시보드에 LLM 섹션 추가

---

## 📝 ChatGPT 프롬프트

다음 프롬프트를 ChatGPT에 입력하세요:

---

**당신은 Next.js + TypeScript + Tailwind CSS 전문 개발자입니다. 서울 구별 소비패턴 분석 대시보드에 LLM 기반 데이터 분석 기능을 추가해야 합니다.**

## 프로젝트 컨텍스트
- Next.js 14 + TypeScript + Tailwind CSS 프로젝트
- 서울 25개 구별 업종별 소비 데이터 분석 대시보드
- 사용자가 지도에서 구를 선택하고 업종을 선택하면, 해당 데이터에 대한 LLM 분석을 제공
- OpenAI GPT API 사용 예정

## 기존 데이터 구조 (lib/llm-sample-data.ts에서 가져옴)
```typescript
export interface DistrictIndustryStats {
  district: string;
  totalSales: number;      // 총 매출
  totalTransactions: number; // 총 거래 건수
  totalStores: number;     // 총 가맹점 수
  avgSalesPerStore: number; // 점포당 평균 매출 (핵심 지표)
  avgSalesPerTransaction: number; // 건당 평균 매출
}

export interface SelectedIndustry {
  class1?: string;  // 대분류 (예: "요식/유흥")
  class2?: string;  // 중분류 (예: "제과/커피/패스트푸드")
  class3?: string;  // 소분류 (예: "커피전문점")
}

export interface LLMPromptContext {
  selectedDistrict: string;
  selectedIndustry: SelectedIndustry;
  districtStats: DistrictIndustryStats;
  recommendationCriteria: 'avgSalesPerStore' | 'totalSales' | 'totalTransactions';
  allDistrictStats: IndustryRecommendationData;
  topRecommendedDistricts: string[];
}
```

## 샘플 데이터 사용법
```typescript
import { 
  SAMPLE_COFFEE_DISTRICT_STATS,
  SAMPLE_LLM_CONTEXT,
  LLM_SYSTEM_PROMPT,
  LLM_USER_PROMPT_TEMPLATE,
  formatPromptTemplate,
  createLLMContext
} from '@/lib/llm-sample-data';

// 실제 프롬프트 생성 예시
const formattedPrompt = formatPromptTemplate(LLM_USER_PROMPT_TEMPLATE, SAMPLE_LLM_CONTEXT);
```

## 구현 요청사항

### 1. OpenAI API 연동 함수 (`lib/openai-client.ts`)
- OpenAI API 호출 함수
- 환경변수 OPENAI_API_KEY 사용
- 에러 핸들링 포함
- 스트리밍 응답 지원 (선택사항)

### 2. LLM 채팅 컴포넌트 (`components/llm-chat.tsx`)
- Props: selectedDistrict, selectedIndustry, districtStats, allDistrictStats
- 사용자 질문 입력창
- LLM 응답 표시 영역
- 로딩 상태 표시
- 깔끔한 UI (기존 프로젝트와 일관성 유지)

### 3. 메인 대시보드 통합
- 기존 app/page.tsx에 LLM 섹션 추가
- 구/업종 선택 시 LLM 컴포넌트에 데이터 전달
- 반응형 레이아웃 고려

## 디자인 요구사항
- 기존 프로젝트 스타일과 일관성 유지 (흰색/회색 배경, 깔끔한 UI)
- 채팅 인터페이스는 오른쪽 사이드바 형태로 배치
- 로딩 시 스켈레톤 UI 또는 스피너 표시
- 에러 상태 처리

## 기술 스택
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Radix UI 컴포넌트 (기존 프로젝트에서 사용 중)
- OpenAI API

## 예상 사용 시나리오
1. 사용자가 지도에서 "강남구" 클릭
2. 업종 선택기에서 "커피전문점" 선택
3. LLM 채팅창에 "강남구 커피전문점 창업하면 어떨까?" 질문
4. GPT가 해당 구의 데이터를 분석해서 구체적인 인사이트 제공

## 주의사항
- API 키는 환경변수로 관리
- 클라이언트 사이드에서 API 키 노출 방지 (API 라우트 사용)
- 적절한 에러 핸들링과 사용자 피드백
- 응답 시간이 길 수 있으므로 로딩 상태 필수

**위 요구사항에 맞는 완전한 코드를 생성해주세요. 각 파일별로 구분해서 제공하고, 설치해야 할 패키지가 있다면 npm 명령어도 함께 알려주세요.**

---

## 🔄 ChatGPT 응답 후 해야 할 일

1. **패키지 설치**: ChatGPT가 제안한 npm install 명령어 실행
2. **환경변수 설정**: `.env.local` 파일에 `OPENAI_API_KEY=your_api_key` 추가
3. **파일 생성**: ChatGPT가 제공한 코드를 각각의 파일에 복사
4. **테스트**: 개발 서버 실행 후 기능 테스트

## 🚨 문제 해결 가이드

### API 키 관련 오류
```bash
# .env.local 파일 생성 (프로젝트 루트에)
OPENAI_API_KEY=sk-your-actual-api-key-here
```

### CORS 오류 발생 시
- API 라우트(`app/api/chat/route.ts`) 사용 확인
- 클라이언트에서 직접 OpenAI API 호출하지 않기

### 타입 오류 발생 시
```bash
npm install --save-dev @types/node
```

### 스타일링 문제
- 기존 컴포넌트의 className 패턴 참고
- Tailwind CSS 클래스 사용

## 📞 도움이 필요할 때

1. **ChatGPT에게 추가 질문**: "위 코드에서 [구체적인 문제] 오류가 발생합니다. 어떻게 해결하나요?"
2. **샘플 데이터 활용**: `lib/llm-sample-data.ts`의 샘플 데이터로 먼저 테스트
3. **단계별 구현**: 한 번에 모든 기능을 구현하지 말고, OpenAI 연동 → 기본 UI → 통합 순서로 진행

## 🎯 최종 목표

사용자가 구와 업종을 선택하면, 해당 데이터에 대해 자연어로 질문할 수 있고, GPT가 구체적인 비즈니스 인사이트를 제공하는 완전한 기능을 구현하는 것입니다.

---

**이 가이드를 따라 ChatGPT와 대화하면서 단계별로 구현해보세요! 🚀** 