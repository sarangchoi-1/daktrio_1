import industryDemographicProfilesRaw from "@/data/industry-demographic-profiles.json";
const industryDemographicProfiles: Record<string, { genders: string[]; ageGroups: number[] }> = industryDemographicProfilesRaw as any;

// 업종별 최적 타겟층 분석
export interface DemographicProfile {
  ageGroup: number; // 0-7
  ageGroupName: string;
  gender: 'MALE' | 'FEMALE';
  population: number;
  ratio: number; // 전체 인구 대비 비율
}

export interface IndustryPerformance {
  industryName: string;
  totalSales: number;
  totalTransactions: number;
  avgSalesPerStore: number;
  storeCount: number;
}

export interface TargetDemographicAnalysis {
  districtName: string;
  selectedIndustry: any;
  industryPerformance: IndustryPerformance | null;
  demographicProfile: DemographicProfile[];
  topTargetGroups: DemographicProfile[];
  recommendations: string[];
}

// 연령대 매핑
const AGE_GROUP_MAPPING: { [key: number]: string } = {
  0: '0-9세',
  1: '10-19세', 
  2: '20-29세',
  3: '30-39세',
  4: '40-49세',
  5: '50-59세',
  6: '60-69세',
  7: '70세 이상'
};

// 구별 파일 매핑
const DISTRICT_FILE_MAPPING: { [key: string]: string } = {
  '강남구': '서울시 강남구 유동인구 수.CSV',
  '강동구': '서울시 강동구 유동인구 수.CSV',
  '강북구': '서울시 강북구 유동인구 수.CSV',
  '강서구': '서울시 강서구 유동인구 수.CSV',
  '관악구': '서울시 관악구 유동인구 수.CSV',
  '광진구': '서울시 광진구 유동인구 수.CSV',
  '구로구': '서울시 구로구 유동인구 수.CSV',
  '금천구': '서울시 금천구 유동인구 수.CSV',
  '노원구': '서울시 노원구 유동인구 수.CSV',
  '도봉구': '서울시 도봉구 유동인구 수.CSV',
  '동대문구': '서울시 동대문구 유동인구 수.CSV',
  '동작구': '서울시 동작구 유동인구 수.CSV',
  '마포구': '서울시 마포구 유동인구 수.CSV',
  '서대문구': '서울시 서대문구 유동인구 수.CSV',
  '서초구': '서울시 서초구 유동인구 수.CSV',
  '성동구': '서울시 성동구 유동인구 수.CSV',
  '성북구': '서울시 성북구 유동인구 수.CSV',
  '송파구': '서울시 송파구 유동인구 수.CSV',
  '양천구': '서울시 양천구 유동인구 수.CSV',
  '영등포구': '서울시 영등포구 유동인구 수.CSV',
  '용산구': '서울시 용산구 유동인구 수.CSV',
  '은평구': '서울시 은평구 유동인구 수.CSV',
  '종로구': '서울시 종로구 유동인구 수.CSV',
  '중구': '서울시 중구 유동인구 수.CSV',
  '중랑구': '서울시 중랑구 유동인구 수.CSV'
};

// 신한카드 데이터 파일 매핑 (실제 파일명 기준)
const SHINHAN_FILE_MAPPING: { [key: string]: string } = {
  '강남구': '신한카드_서울_강남구_202011.csv',
  '강동구': '신한카드_서울_강동구_202012.csv',
  '강북구': '신한카드_서울_강북구_202012.csv',
  '강서구': '신한카드_서울_강서구_202011.csv',
  '관악구': '신한카드_서울_관악구_202009.csv',
  '광진구': '신한카드_서울_광진구_202012.csv',
  '구로구': '신한카드_서울_구로구_202011.csv',
  '금천구': '신한카드_서울_금천구_202010.csv',
  '노원구': '신한카드_서울_노원구_202012.csv',
  '도봉구': '신한카드_서울_도봉구_202011.csv',
  '동대문구': '신한카드_서울_동대문구_202012.csv',
  '동작구': '신한카드_서울_동작구_202012.csv',
  '마포구': '신한카드_서울_마포구_202010.csv',
  '서대문구': '신한카드_서울_서대문구_202012.csv',
  '서초구': '신한카드_서울_서초구_202012.csv',
  '성동구': '신한카드_서울_성동구_202011.csv',
  '성북구': '신한카드_서울_성북구_202009.csv',
  '송파구': '신한카드_서울_송파구_202011.csv',
  '양천구': '신한카드_서울_양천구_202011.csv',
  '영등포구': '신한카드_서울_영등포구_202011.csv',
  '용산구': '신한카드_서울_용산구_202012.csv',
  '은평구': '신한카드_서울_은평구_202010.csv',
  '종로구': '신한카드_서울_종로구_202012.csv',
  '중구': '신한카드_서울_중구_202012.csv',
  '중랑구': '신한카드_서울_중랑구_202010.csv'
};

// 인구 데이터 로드 및 파싱
async function loadPopulationData(districtName: string): Promise<DemographicProfile[]> {
  const fileName = DISTRICT_FILE_MAPPING[districtName];
  if (!fileName) {
    console.warn(`No population data file found for district: ${districtName}`);
    return [];
  }

  try {
    const response = await fetch(`/data/지리는데이타/${fileName}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch population data for ${districtName}`);
    }
    
    const csvText = await response.text();
    const lines = csvText.trim().split('\n');
    
    // 14시 데이터만 필터링하여 성별/연령대별 집계
    const demographics: { [key: string]: number } = {};
    
    lines.slice(1).forEach(line => {
      const values = line.split(',');
      const timeZone = values[8];
      const gender = values[9];
      const ageGroup = parseInt(values[10]);
      const population = parseFloat(values[11]) + parseFloat(values[12]); // 거주+유동 합계
      
      if (timeZone === '14' && !isNaN(ageGroup) && !isNaN(population)) {
        const key = `${gender}_${ageGroup}`;
        demographics[key] = (demographics[key] || 0) + population;
      }
    });

    // 전체 인구 계산
    const totalPopulation = Object.values(demographics).reduce((sum, pop) => sum + pop, 0);
    
    // DemographicProfile 배열로 변환
    const profiles: DemographicProfile[] = [];
    Object.entries(demographics).forEach(([key, population]) => {
      const [gender, ageGroupStr] = key.split('_');
      const ageGroup = parseInt(ageGroupStr);
      
      profiles.push({
        ageGroup,
        ageGroupName: AGE_GROUP_MAPPING[ageGroup] || `연령대 ${ageGroup}`,
        gender: gender as 'MALE' | 'FEMALE',
        population: Math.round(population),
        ratio: population / totalPopulation
      });
    });

    return profiles.sort((a, b) => b.population - a.population);
  } catch (error) {
    console.error(`Error loading population data for ${districtName}:`, error);
    return [];
  }
}

// 신한카드 업종 성과 데이터 로드
async function loadIndustryPerformance(districtName: string, selectedIndustry: any): Promise<IndustryPerformance | null> {
  const fileName = SHINHAN_FILE_MAPPING[districtName];
  if (!fileName) {
    console.warn(`No Shinhan card data file found for district: ${districtName}`);
    return null;
  }

  try {
    const response = await fetch(`/data/구별/${fileName}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch Shinhan data for ${districtName}`);
    }
    
    const csvText = await response.text();
    const lines = csvText.trim().split('\n');
    
    let totalSales = 0;
    let totalTransactions = 0;
    let storeCount = 0;
    let matchedRecords = 0;

    lines.slice(1).forEach(line => {
      const values = line.split(',');
      if (values.length >= 13) {
        const 대분류 = values[3];
        const 중분류 = values[4];
        const 소분류 = values[5];
        const 매출금액 = parseInt(values[9]) || 0;
        const 매출건수 = parseInt(values[10]) || 0;
        const 가맹점수 = parseInt(values[8]) || 0;

        // 선택된 업종과 매칭
        let isMatch = false;
        if (selectedIndustry.class3 && 소분류.includes(selectedIndustry.class3)) {
          isMatch = true;
        } else if (selectedIndustry.class2 && 중분류.includes(selectedIndustry.class2)) {
          isMatch = true;
        } else if (selectedIndustry.class1 && 대분류.includes(selectedIndustry.class1)) {
          isMatch = true;
        }

        if (isMatch) {
          totalSales += 매출금액;
          totalTransactions += 매출건수;
          storeCount += 가맹점수;
          matchedRecords++;
        }
      }
    });

    if (matchedRecords === 0) {
      return null;
    }

    const industryName = selectedIndustry.class3 || selectedIndustry.class2 || selectedIndustry.class1 || '선택된 업종';

    return {
      industryName,
      totalSales,
      totalTransactions,
      avgSalesPerStore: storeCount > 0 ? totalSales / storeCount : 0,
      storeCount
    };
  } catch (error) {
    console.error(`Error loading industry performance for ${districtName}:`, error);
    return null;
  }
}

// 업종별 타겟 그룹 추천 로직
function generateTargetRecommendations(
  demographics: DemographicProfile[], 
  industryPerformance: IndustryPerformance | null,
  industryName: string,
  selectedIndustry?: any
): { topTargetGroups: DemographicProfile[]; recommendations: string[]; } {
  let topTargetGroups: DemographicProfile[] = [];
  // Try to use demographic profile for 소분류 if available
  let profile: { genders: string[]; ageGroups: number[] } | undefined = undefined;
  const industryKey = selectedIndustry?.class3 || selectedIndustry?.class2 || selectedIndustry?.class1;
  if (
    industryKey &&
    typeof industryKey === 'string' &&
    industryDemographicProfiles.hasOwnProperty(industryKey)
  ) {
    profile = industryDemographicProfiles[industryKey];
  }
  if (profile) {
    // Filter demographics by profile
    const filtered = demographics.filter(d => profile!.genders.includes(d.gender) && profile!.ageGroups.includes(d.ageGroup));
    topTargetGroups = filtered.slice(0, 3);
    // Fallback if not enough
    if (topTargetGroups.length < 3) {
      topTargetGroups = [...filtered, ...demographics].slice(0, 3);
    }
  } else {
    // Fallback: top 3 by population
    topTargetGroups = demographics.slice(0, 3);
  }
  
  const recommendations: string[] = [];

  // 업종별 맞춤 추천
  if (industryName.includes('커피') || industryName.includes('카페')) {
    const youngAdults = demographics.filter(d => d.ageGroup >= 2 && d.ageGroup <= 4);
    if (youngAdults.length > 0) {
      recommendations.push('20-40대 타겟 카페 메뉴 및 인테리어 추천');
    }
  } else if (industryName.includes('화장품') || industryName.includes('미용')) {
    const females = demographics.filter(d => d.gender === 'FEMALE');
    if (females.length > 0) {
      recommendations.push('여성 고객 중심의 제품 라인업 구성');
    }
  } else if (industryName.includes('스포츠') || industryName.includes('헬스')) {
    const males = demographics.filter(d => d.gender === 'MALE' && d.ageGroup >= 2 && d.ageGroup <= 5);
    if (males.length > 0) {
      recommendations.push('20-50대 남성 타겟 운동 프로그램 개발');
    }
  }

  // 일반적인 추천
  if (topTargetGroups.length > 0) {
    const topGroup = topTargetGroups[0];
    recommendations.push(`주요 타겟: ${topGroup.ageGroupName} ${topGroup.gender === 'MALE' ? '남성' : '여성'} (${(topGroup.ratio * 100).toFixed(1)}%)`);
  }

  console.log('Selected industry:', selectedIndustry.class3);
  console.log('Profile used:', profile);
  console.log('Filtered demographics:', demographics);
  console.log('Top target groups:', topTargetGroups);

  return { topTargetGroups, recommendations };
}

// 메인 분석 함수
export async function analyzeTargetDemographics(
  districtName: string, 
  selectedIndustry: any
): Promise<TargetDemographicAnalysis | null> {
  try {
    console.log(`Analyzing target demographics for ${districtName}...`);
    
    // 인구 데이터 로드
    const demographicProfile = await loadPopulationData(districtName);
    if (demographicProfile.length === 0) {
      console.warn(`No demographic data found for ${districtName}`);
      return null;
    }

    // 업종 성과 데이터 로드
    const industryPerformance = await loadIndustryPerformance(districtName, selectedIndustry);
    
    // 추천 생성
    const industryName = selectedIndustry.class3 || selectedIndustry.class2 || selectedIndustry.class1 || '선택된 업종';
    const { topTargetGroups, recommendations } = generateTargetRecommendations(
      demographicProfile, 
      industryPerformance,
      industryName,
      selectedIndustry
    );

    console.log(`Target demographic analysis completed for ${districtName}`);

    console.log('selectedIndustry object:', selectedIndustry);

    return {
      districtName,
      selectedIndustry,
      industryPerformance,
      demographicProfile,
      topTargetGroups,
      recommendations
    };
  } catch (error) {
    console.error(`Error analyzing target demographics for ${districtName}:`, error);
    return null;
  }
} 