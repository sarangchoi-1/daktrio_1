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
  totalSales: number;      // 월 총 매출 (전체 시장 추정)
  totalTransactions: number; // 월 총 거래 건수 (전체 시장 추정)
  totalStores: number;     // 총 가맹점 수
  avgSalesPerStore: number; // 월 점포당 중앙값 매출 (전체 시장 추정, 핵심 지표)
  avgSalesPerTransaction: number; // 월 건당 중앙값 매출 (전체 시장 추정)
}

export interface IndustryRecommendationData {
  [district: string]: DistrictIndustryStats;
}

// CSV 파싱 함수
export function parseDistrictCardCSV(csvText: string): DistrictCardRecord[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    
    return {
      district: values[1] || '',  // 시군구명만 사용 (구 이름)
      기준년월: values[2] || '',
      업종대분류: values[3] || '',
      업종중분류: values[4] || '',
      업종소분류: values[5] || '',
      신규가맹점수: parseInt(values[6]) || 0,
      폐업가맹점수: parseInt(values[7]) || 0,
      매출가맹점수: parseInt(values[8]) || 0,
      카드매출금액: parseInt(values[9]) || 0,
      카드매출건수: parseInt(values[10]) || 0,
      점당매출금액: parseInt(values[11]) || 0,
      건당매출금액: parseInt(values[12]) || 0
    };
  });
}

// 모든 구별 데이터를 로드하고 통합하는 함수
export async function loadAllDistrictData(): Promise<DistrictCardRecord[]> {
  const districts = [
    '강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구',
    '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구',
    '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'
  ];
  
  // 각 구별로 존재하는 년월 패턴
  const districtYearMonths: { [key: string]: string } = {
    '관악구': '202009',
    '성북구': '202009',
    '금천구': '202010', 
    '마포구': '202010',
    '은평구': '202010',
    '중랑구': '202010',
    '강남구': '202011',
    '강서구': '202011',
    '구로구': '202011',
    '도봉구': '202011',
    '성동구': '202011',
    '송파구': '202011',
    '양천구': '202011',
    '영등포구': '202011',
    '강동구': '202012',
    '강북구': '202012',
    '광진구': '202012',
    '노원구': '202012',
    '동대문구': '202012',
    '동작구': '202012',
    '서대문구': '202012',
    '서초구': '202012',
    '용산구': '202012',
    '종로구': '202012',
    '중구': '202012'
  };
  
  const allRecords: DistrictCardRecord[] = [];
  
  for (const district of districts) {
    try {
      const yearMonth = districtYearMonths[district];
      if (!yearMonth) {
        console.warn(`No year-month mapping found for ${district}`);
        continue;
      }
      
      // 파일명 패턴: 신한카드_서울_{구명}_{YYYYMM}.csv
      const response = await fetch(`/data/구별/신한카드_서울_${district}_${yearMonth}.csv`);
      if (response.ok) {
        const csvText = await response.text();
        const records = parseDistrictCardCSV(csvText);
        allRecords.push(...records);
        console.log(`Successfully loaded data for ${district} (${yearMonth}): ${records.length} records`);
      } else {
        console.warn(`Failed to load data for ${district} (${yearMonth}): ${response.status}`);
      }
    } catch (error) {
      console.warn(`Failed to load data for ${district}:`, error);
    }
  }
  
  console.log(`Total loaded records: ${allRecords.length}`);
  return allRecords;
}

// 특정 구의 데이터만 로드하는 함수
export async function loadDistrictData(district: string): Promise<DistrictCardRecord[]> {
  // 각 구별로 존재하는 년월 패턴
  const districtYearMonths: { [key: string]: string } = {
    '관악구': '202009',
    '성북구': '202009',
    '금천구': '202010', 
    '마포구': '202010',
    '은평구': '202010',
    '중랑구': '202010',
    '강남구': '202011',
    '강서구': '202011',
    '구로구': '202011',
    '도봉구': '202011',
    '성동구': '202011',
    '송파구': '202011',
    '양천구': '202011',
    '영등포구': '202011',
    '강동구': '202012',
    '강북구': '202012',
    '광진구': '202012',
    '노원구': '202012',
    '동대문구': '202012',
    '동작구': '202012',
    '서대문구': '202012',
    '서초구': '202012',
    '용산구': '202012',
    '종로구': '202012',
    '중구': '202012'
  };

  try {
    const yearMonth = districtYearMonths[district];
    if (!yearMonth) {
      console.warn(`No year-month mapping found for ${district}`);
      return [];
    }
    
    // 파일명 패턴: 신한카드_서울_{구명}_{YYYYMM}.csv
    const response = await fetch(`/data/구별/신한카드_서울_${district}_${yearMonth}.csv`);
    if (response.ok) {
      const csvText = await response.text();
      const records = parseDistrictCardCSV(csvText);
      console.log(`Successfully loaded data for ${district} (${yearMonth}): ${records.length} records`);
      return records;
    } else {
      console.warn(`Failed to load data for ${district} (${yearMonth}): ${response.status}`);
      return [];
    }
  } catch (error) {
    console.warn(`Failed to load data for ${district}:`, error);
    return [];
  }
}

// 신한카드 시장점유율 (한국신용평가원 기준)
const SHINHAN_CARD_MARKET_SHARE = 0.175; // 17.5%

// 중앙값 계산 함수
function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  } else {
    return sorted[mid];
  }
}

// 특정 업종에 대한 구별 통계 계산
export function calculateDistrictStats(
  records: DistrictCardRecord[],
  selectedIndustry: { 대분류?: string; 중분류?: string; 소분류?: string }
): IndustryRecommendationData {
  // 업종 필터링
  const filteredRecords = records.filter(record => {
    let matches = true;
    
    if (selectedIndustry.대분류) {
      matches = matches && record.업종대분류 === selectedIndustry.대분류;
    }
    if (selectedIndustry.중분류) {
      matches = matches && record.업종중분류 === selectedIndustry.중분류;
    }
    if (selectedIndustry.소분류) {
      matches = matches && record.업종소분류 === selectedIndustry.소분류;
    }
    
    return matches;
  });
  
  // 구별로 그룹핑하여 통계 계산
  const districtStats: IndustryRecommendationData = {};
  const districtRecords: { [district: string]: DistrictCardRecord[] } = {};
  
  filteredRecords.forEach(record => {
    const district = record.district;
    
    if (!districtStats[district]) {
      districtStats[district] = {
        district,
        totalSales: 0,
        totalTransactions: 0,
        totalStores: 0,
        avgSalesPerStore: 0,
        avgSalesPerTransaction: 0
      };
      districtRecords[district] = [];
    }
    
    const stats = districtStats[district];
    // 신한카드 데이터를 전체 시장으로 추정 (17.5% → 100%)
    stats.totalSales += record.카드매출금액 / SHINHAN_CARD_MARKET_SHARE;
    stats.totalTransactions += record.카드매출건수 / SHINHAN_CARD_MARKET_SHARE;
    stats.totalStores += record.매출가맹점수; // 가맹점 수는 그대로 (전체 가맹점 수)
    
    // 구별 레코드 저장 (중앙값 계산용)
    districtRecords[district].push(record);
  });
  
  // 중앙값으로 점포당/건당 매출 계산
  Object.keys(districtStats).forEach(district => {
    const records = districtRecords[district];
    const stats = districtStats[district];
    
    if (records && records.length > 0) {
      // 점당매출금액들을 전체 시장으로 추정하여 중앙값 계산
      const salesPerStoreValues = records.map(record => 
        (record.점당매출금액 || 0) / SHINHAN_CARD_MARKET_SHARE
      );
      const salesPerTransactionValues = records.map(record => 
        (record.건당매출금액 || 0) / SHINHAN_CARD_MARKET_SHARE
      );
      
      stats.avgSalesPerStore = calculateMedian(salesPerStoreValues);
      stats.avgSalesPerTransaction = calculateMedian(salesPerTransactionValues);
    }
  });
  
  return districtStats;
}

// 추천 구 선정 기준 타입
export type RecommendationCriteria = 'avgSalesPerStore' | 'totalSales' | 'totalTransactions';

// 점포당 평균 매출 기준으로 구를 3단계로 분류 (상위 10개만)
export function categorizeDistricts(
  districtStats: IndustryRecommendationData,
  criteria: RecommendationCriteria = 'avgSalesPerStore'
): { [category: number]: string[] } {
  const districts = Object.keys(districtStats);
  
  // 선택된 기준에 따라 정렬
  const sortedDistricts = districts.sort((a, b) => {
    switch (criteria) {
      case 'avgSalesPerStore':
        return districtStats[b].avgSalesPerStore - districtStats[a].avgSalesPerStore;
      case 'totalSales':
        return districtStats[b].totalSales - districtStats[a].totalSales;
      case 'totalTransactions':
        return districtStats[b].totalTransactions - districtStats[a].totalTransactions;
      default:
        return districtStats[b].avgSalesPerStore - districtStats[a].avgSalesPerStore;
    }
  });
  
  // 상위 10개만 3단계로 분류: 3개, 3개, 4개
  const categories: { [category: number]: string[] } = {};
  
  // 상위 3개 (1등급 - 가장 진한 파란색)
  categories[1] = sortedDistricts.slice(0, 3);
  
  // 4-6위 (2등급 - 중간 파란색)
  categories[2] = sortedDistricts.slice(3, 6);
  
  // 7-10위 (3등급 - 연한 파란색)
  categories[3] = sortedDistricts.slice(6, 10);
  
  // 나머지는 분류하지 않음 (회색 표시)
  
  return categories;
}

// 색상 매핑 (3단계 + 기본)
export const DISTRICT_COLORS = {
  1: '#1e3a8a', // 더 진한 파란색 (상위 3개)
  2: '#3b82f6', // 중간 파란색 (4-6위)
  3: '#bfdbfe', // 더 연한 하늘색 (7-10위)
  hover: '#dc2626', // 빨간색 (hover)
  default: '#e5e7eb' // 기본 회색 (나머지 또는 데이터 없음)
};

// 구 이름으로 색상 가져오기
export function getDistrictColor(
  district: string, 
  categories: { [category: number]: string[] },
  isHovered: boolean = false
): string {
  if (isHovered) {
    return DISTRICT_COLORS.hover;
  }
  
  for (const [category, districts] of Object.entries(categories)) {
    if (districts.includes(district)) {
      return DISTRICT_COLORS[parseInt(category) as keyof typeof DISTRICT_COLORS];
    }
  }
  
  return DISTRICT_COLORS.default;
}

// 숫자 포맷팅 함수
export function formatKoreanNumber(num: number): string {
  if (num >= 100000000) { // 1억 이상
    return `${(num / 100000000).toFixed(1)}억`;
  } else if (num >= 10000) { // 1만 이상
    return `${(num / 10000).toFixed(1)}만`;
  }
  return num.toLocaleString();
}

// 기준별 한국어 라벨
export const CRITERIA_LABELS = {
  avgSalesPerStore: '점포당 매출 중앙값',
  totalSales: '총매출',
  totalTransactions: '총 거래건수'
};

// 기준별 단위
export const CRITERIA_UNITS = {
  avgSalesPerStore: '원',
  totalSales: '원', 
  totalTransactions: '건'
}; 