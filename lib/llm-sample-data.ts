// LLM 개발을 위한 샘플 데이터와 타입 정의

// ===== 기존 프로젝트 타입들 =====
export interface DistrictCardRecord {
  district: string;        // 구 이름 (시군구명)
  기준년월: string;
  업종대분류: string;
  업종중분류: string;
  업종소분류: string;
  신규가맹점수: number;
  폐업가맹점수: number;
  매출가맹점수: number;
  카드매출금액: number;
  카드매출건수: number;
  점당매출금액: number;
  건당매출금액: number;
}

export interface DistrictIndustryStats {
  district: string;
  totalSales: number;      // 월 총 매출
  totalTransactions: number; // 월 총 거래 건수
  totalStores: number;     // 총 가맹점 수
  avgSalesPerStore: number; // 월 점포당 평균 매출 (핵심 지표)
  avgSalesPerTransaction: number; // 월 건당 평균 매출
}

export interface IndustryRecommendationData {
  [district: string]: DistrictIndustryStats;
}

export type RecommendationCriteria = 'avgSalesPerStore' | 'totalSales' | 'totalTransactions';

export interface SelectedIndustry {
  class1?: string;  // 대분류
  class2?: string;  // 중분류  
  class3?: string;  // 소분류
}

// ===== LLM 관련 새로운 타입들 =====
export interface LLMPromptContext {
  selectedDistrict: string;
  selectedIndustry: SelectedIndustry;
  districtStats: DistrictIndustryStats;
  recommendationCriteria: RecommendationCriteria;
  allDistrictStats: IndustryRecommendationData;
  topRecommendedDistricts: string[];
}

export interface LLMResponse {
  insights: string[];
  recommendations: string[];
  comparisons: string[];
  businessTips: string[];
}

// ===== 커피전문점 업종 샘플 데이터 =====
export const SAMPLE_INDUSTRY_SELECTION: SelectedIndustry = {
  class1: "요식/유흥",
  class2: "제과/커피/패스트푸드", 
  class3: "커피전문점"
};

// 커피전문점 업종의 구별 통계 샘플 데이터
export const SAMPLE_COFFEE_DISTRICT_STATS: IndustryRecommendationData = {
  "강남구": {
    district: "강남구",
    totalSales: 15420000000,      // 154억 2천만원
    totalTransactions: 2850000,   // 285만건
    totalStores: 1250,           // 1,250개 매장
    avgSalesPerStore: 12336000,   // 점포당 1,233만원
    avgSalesPerTransaction: 5410  // 건당 5,410원
  },
  "서초구": {
    district: "서초구", 
    totalSales: 12800000000,      // 128억원
    totalTransactions: 2400000,   // 240만건
    totalStores: 980,            // 980개 매장
    avgSalesPerStore: 13061224,   // 점포당 1,306만원
    avgSalesPerTransaction: 5333  // 건당 5,333원
  },
  "송파구": {
    district: "송파구",
    totalSales: 11200000000,      // 112억원
    totalTransactions: 2100000,   // 210만건
    totalStores: 890,            // 890개 매장
    avgSalesPerStore: 12584270,   // 점포당 1,258만원
    avgSalesPerTransaction: 5333  // 건당 5,333원
  },
  "마포구": {
    district: "마포구",
    totalSales: 9800000000,       // 98억원
    totalTransactions: 1950000,   // 195만건
    totalStores: 820,            // 820개 매장
    avgSalesPerStore: 11951220,   // 점포당 1,195만원
    avgSalesPerTransaction: 5026  // 건당 5,026원
  },
  "종로구": {
    district: "종로구",
    totalSales: 8500000000,       // 85억원
    totalTransactions: 1680000,   // 168만건
    totalStores: 720,            // 720개 매장
    avgSalesPerStore: 11805556,   // 점포당 1,180만원
    avgSalesPerTransaction: 5060  // 건당 5,060원
  },
  "용산구": {
    district: "용산구",
    totalSales: 7200000000,       // 72억원
    totalTransactions: 1420000,   // 142만건
    totalStores: 620,            // 620개 매장
    avgSalesPerStore: 11612903,   // 점포당 1,161만원
    avgSalesPerTransaction: 5070  // 건당 5,070원
  },
  "영등포구": {
    district: "영등포구",
    totalSales: 6800000000,       // 68억원
    totalTransactions: 1350000,   // 135만건
    totalStores: 580,            // 580개 매장
    avgSalesPerStore: 11724138,   // 점포당 1,172만원
    avgSalesPerTransaction: 5037  // 건당 5,037원
  },
  "성동구": {
    district: "성동구",
    totalSales: 5900000000,       // 59억원
    totalTransactions: 1180000,   // 118만건
    totalStores: 520,            // 520개 매장
    avgSalesPerStore: 11346154,   // 점포당 1,134만원
    avgSalesPerTransaction: 5000  // 건당 5,000원
  },
  "광진구": {
    district: "광진구",
    totalSales: 5200000000,       // 52억원
    totalTransactions: 1050000,   // 105만건
    totalStores: 480,            // 480개 매장
    avgSalesPerStore: 10833333,   // 점포당 1,083만원
    avgSalesPerTransaction: 4952  // 건당 4,952원
  },
  "서대문구": {
    district: "서대문구",
    totalSales: 4800000000,       // 48억원
    totalTransactions: 980000,    // 98만건
    totalStores: 450,            // 450개 매장
    avgSalesPerStore: 10666667,   // 점포당 1,066만원
    avgSalesPerTransaction: 4898  // 건당 4,898원
  }
};

// 추천 구 카테고리 (월 점포당 평균 매출 기준)
export const SAMPLE_COFFEE_RECOMMENDATIONS = {
  1: ["서초구", "송파구", "강남구"],        // 1등급 (가장 높은 수익성)
  2: ["마포구", "종로구", "용산구"],        // 2등급 (중간 수익성)
  3: ["영등포구", "성동구", "광진구", "서대문구"] // 3등급 (기본 수익성)
};

// LLM 프롬프트 컨텍스트 샘플
export const SAMPLE_LLM_CONTEXT: LLMPromptContext = {
  selectedDistrict: "강남구",
  selectedIndustry: SAMPLE_INDUSTRY_SELECTION,
  districtStats: SAMPLE_COFFEE_DISTRICT_STATS["강남구"],
  recommendationCriteria: "avgSalesPerStore",
  allDistrictStats: SAMPLE_COFFEE_DISTRICT_STATS,
  topRecommendedDistricts: ["서초구", "송파구", "강남구"]
};

// ===== LLM 프롬프트 템플릿 =====
export const LLM_SYSTEM_PROMPT = `
당신은 서울시 25개 구별 소비패턴 데이터 분석 전문 AI입니다.
사용자가 선택한 구와 업종에 대해 구체적이고 실용적인 인사이트를 제공합니다.

## 역할과 전문성
- 서울 각 구의 상권 특성과 소비패턴 분석 전문가
- 업종별 매출 데이터와 시장 동향 해석 능력
- 창업 및 사업 확장을 위한 실무적 조언 제공

## 응답 가이드라인
1. 핵심 인사이트 3가지 이내로 요약
2. 구체적인 수치 데이터 활용
3. 다른 구와의 비교 분석 포함
4. 실행 가능한 비즈니스 시사점 제시
5. 친근하고 이해하기 쉬운 언어 사용

## 데이터 해석 기준
- totalSales: 월 총 매출액 (원)
- totalTransactions: 월 총 거래 건수 (건)
- totalStores: 총 가맹점 수 (개)
- avgSalesPerStore: 월 점포당 평균 매출 (원) - 수익성 핵심 지표
- avgSalesPerTransaction: 월 건당 평균 매출 (원) - 객단가 지표
`;

export const LLM_USER_PROMPT_TEMPLATE = `
## 분석 요청
선택된 구: {selectedDistrict}
선택된 업종: {industryName}
분석 기준: {criteriaName}

## 해당 구 데이터
- 월 총 매출: {totalSales:,}원
- 월 총 거래건수: {totalTransactions:,}건  
- 가맹점 수: {totalStores:,}개
- 월 점포당 평균 매출: {avgSalesPerStore:,}원
- 월 건당 평균 매출: {avgSalesPerTransaction:,}원

## 상위 추천 구역
{topDistricts}

위 데이터를 바탕으로 다음 내용을 분석해주세요:
1. 선택한 구의 해당 업종 특징과 강점
2. 상위 추천 구역과의 비교 분석
3. 창업/사업 확장 시 고려사항과 추천사항
`;

// ===== 샘플 LLM 응답 =====
export const SAMPLE_LLM_RESPONSE: LLMResponse = {
  insights: [
    "강남구는 커피전문점 업종에서 서울 최고 수준의 시장 규모를 보유하고 있습니다. 월 총 매출 154억원으로 압도적 1위를 기록했습니다.",
    "월 점포당 평균 매출 1,233만원으로 서초구(1,306만원) 다음으로 높은 수익성을 보여, 높은 임대료에도 불구하고 충분한 수익성을 확보할 수 있는 지역입니다.",
    "월 건당 평균 매출 5,410원으로 서울 평균보다 높아, 고객들의 구매력과 프리미엄 커피에 대한 수요가 높은 것으로 분석됩니다."
  ],
  recommendations: [
    "강남구는 이미 포화된 시장이므로, 차별화된 컨셉이나 프리미엄 브랜드로 접근하는 것이 유리합니다.",
    "서초구나 송파구도 비슷한 수익성을 보이면서 상대적으로 경쟁이 덜 치열할 수 있어 대안으로 고려해볼 만합니다.",
    "1,250개의 기존 매장이 있어 입지 선정이 매우 중요하며, 오피스 밀집 지역이나 대형 상권 근처가 유리할 것입니다."
  ],
  comparisons: [
    "서초구 대비: 월 총 매출은 20% 높지만 월 점포당 매출은 6% 낮아, 시장 규모는 크지만 경쟁도 더 치열합니다.",
    "송파구 대비: 월 총 매출 38% 높고, 월 점포당 매출도 2% 높아 전반적으로 우위에 있습니다.",
    "마포구 대비: 월 총 매출 57% 높고, 월 점포당 매출 3% 높아 확실한 프리미엄 시장임을 보여줍니다."
  ],
  businessTips: [
    "높은 임대료를 감안하여 최소 월 1,500만원 이상의 매출 목표를 설정하세요.",
    "오전 출근시간과 오후 3-4시 사이 직장인 수요를 겨냥한 메뉴 구성을 추천합니다.",
    "배달/테이크아웃 비중을 높여 좁은 매장 면적의 한계를 극복하는 전략이 필요합니다."
  ]
};

// ===== 유틸리티 함수들 =====
export function formatPromptTemplate(
  template: string, 
  context: LLMPromptContext
): string {
  const industryName = context.selectedIndustry.class3 || 
                      context.selectedIndustry.class2 || 
                      context.selectedIndustry.class1 || '선택된 업종';
  
  const criteriaNames = {
    avgSalesPerStore: '월 점포당 평균 매출',
    totalSales: '월 총 매출',
    totalTransactions: '월 총 거래 건수'
  };

  return template
    .replace('{selectedDistrict}', context.selectedDistrict)
    .replace('{industryName}', industryName)
    .replace('{criteriaName}', criteriaNames[context.recommendationCriteria])
    .replace('{totalSales:,}', context.districtStats.totalSales.toLocaleString())
    .replace('{totalTransactions:,}', context.districtStats.totalTransactions.toLocaleString())
    .replace('{totalStores:,}', context.districtStats.totalStores.toLocaleString())
    .replace('{avgSalesPerStore:,}', Math.round(context.districtStats.avgSalesPerStore).toLocaleString())
    .replace('{avgSalesPerTransaction:,}', Math.round(context.districtStats.avgSalesPerTransaction).toLocaleString())
    .replace('{topDistricts}', context.topRecommendedDistricts.join(', '));
}

export function createLLMContext(
  selectedDistrict: string,
  selectedIndustry: SelectedIndustry,
  allDistrictStats: IndustryRecommendationData,
  recommendationCriteria: RecommendationCriteria = 'avgSalesPerStore'
): LLMPromptContext {
  const districtStats = allDistrictStats[selectedDistrict];
  
  // 상위 3개 추천 구역 추출
  const sortedDistricts = Object.keys(allDistrictStats)
    .sort((a, b) => {
      switch (recommendationCriteria) {
        case 'avgSalesPerStore':
          return allDistrictStats[b].avgSalesPerStore - allDistrictStats[a].avgSalesPerStore;
        case 'totalSales':
          return allDistrictStats[b].totalSales - allDistrictStats[a].totalSales;
        case 'totalTransactions':
          return allDistrictStats[b].totalTransactions - allDistrictStats[a].totalTransactions;
        default:
          return allDistrictStats[b].avgSalesPerStore - allDistrictStats[a].avgSalesPerStore;
      }
    })
    .slice(0, 3);

  return {
    selectedDistrict,
    selectedIndustry,
    districtStats,
    recommendationCriteria,
    allDistrictStats,
    topRecommendedDistricts: sortedDistricts
  };
} 