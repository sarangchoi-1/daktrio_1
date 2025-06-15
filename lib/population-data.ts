// 지리는데이타 폴더의 유동인구 데이터 처리
export interface PopulationRecord {
  INDEX_KEY: string;
  CRTR_YMD: string; // 기준년월일
  CRTR_WEEK: string;
  DWK_NM: string; // 요일명
  CTPV_CD: string;
  CTPV_NM: string;
  SGG_CD: string; // 시군구코드
  SGG_NM: string; // 시군구명
  TMZN_CD: string; // 시간대코드 (0-23)
  SEX_DV: string; // 성별 (MALE/FEMALE)
  AGRDE_CLS: string; // 연령대 (0-7)
  REVISN_AMBLT_PUL_CNT: number; // 거주인구수
  REVISN_NMBLT_PUL_CNT: number; // 유동인구수
}

export interface DistrictPopulationData {
  districtName: string;
  residentPopulation: number;
  visitorPopulation: number;
  totalPopulation: number;
  residentRatio: number;
  visitorRatio: number;
  marketType: 'resident-focused' | 'visitor-focused' | 'balanced';
  recommendation: string;
}

// 성별/연령대별 분석을 위한 인터페이스
export interface DemographicBreakdown {
  gender: 'MALE' | 'FEMALE';
  ageGroup: number; // 0-7
  ageGroupName: string;
  residentPopulation: number;
  visitorPopulation: number;
  totalPopulation: number;
  residentRatio: number;
  visitorRatio: number;
}

export interface DetailedPopulationAnalysis {
  districtName: string;
  overall: DistrictPopulationData;
  byGender: {
    MALE: { residentPopulation: number; visitorPopulation: number; residentRatio: number };
    FEMALE: { residentPopulation: number; visitorPopulation: number; residentRatio: number };
  };
  byAgeGroup: DemographicBreakdown[];
  insights: string[];
}

// 연령대 코드를 이름으로 매핑
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

// 구별 한글명을 영문 파일명으로 매핑
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

// CSV 파싱 함수
function parseCSV(csvText: string): PopulationRecord[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return {
      INDEX_KEY: values[0] || '',
      CRTR_YMD: values[1] || '',
      CRTR_WEEK: values[2] || '',
      DWK_NM: values[3] || '',
      CTPV_CD: values[4] || '',
      CTPV_NM: values[5] || '',
      SGG_CD: values[6] || '',
      SGG_NM: values[7] || '',
      TMZN_CD: values[8] || '',
      SEX_DV: values[9] || '',
      AGRDE_CLS: values[10] || '',
      REVISN_AMBLT_PUL_CNT: parseFloat(values[11]) || 0,
      REVISN_NMBLT_PUL_CNT: parseFloat(values[12]) || 0
    };
  });
}

// 특정 구의 인구 데이터 로드
async function loadDistrictPopulationData(districtName: string): Promise<PopulationRecord[]> {
  const fileName = DISTRICT_FILE_MAPPING[districtName];
  if (!fileName) {
    console.warn(`No data file found for district: ${districtName}`);
    return [];
  }

  try {
    const response = await fetch(`/data/지리는데이타/${fileName}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch data for ${districtName}: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    return parseCSV(csvText);
  } catch (error) {
    console.error(`Error loading population data for ${districtName}:`, error);
    return [];
  }
}

// 인구 데이터 집계 (특정 시간대 기준)
function aggregatePopulationData(records: PopulationRecord[], targetHour: number = 14): {
  residentPopulation: number;
  visitorPopulation: number;
} {
  // 특정 시간대 데이터만 필터링 (중복 방지)
  const filteredRecords = records.filter(record => 
    parseInt(record.TMZN_CD) === targetHour
  );

  const residentPopulation = filteredRecords.reduce((sum, record) => 
    sum + record.REVISN_AMBLT_PUL_CNT, 0
  );
  
  const visitorPopulation = filteredRecords.reduce((sum, record) => 
    sum + record.REVISN_NMBLT_PUL_CNT, 0
  );

  return {
    residentPopulation,
    visitorPopulation
  };
}

// 성별/연령대별 상세 분석
function analyzeDemographics(records: PopulationRecord[], targetHour: number = 14): {
  byGender: {
    MALE: { residentPopulation: number; visitorPopulation: number; residentRatio: number };
    FEMALE: { residentPopulation: number; visitorPopulation: number; residentRatio: number };
  };
  byAgeGroup: DemographicBreakdown[];
  insights: string[];
} {
  const filteredRecords = records.filter(record => 
    parseInt(record.TMZN_CD) === targetHour
  );

  // 성별 집계
  const genderStats: { [key: string]: { resident: number; visitor: number } } = {
    MALE: { resident: 0, visitor: 0 },
    FEMALE: { resident: 0, visitor: 0 }
  };

  // 연령대별 집계
  const ageGroupStats: { [key: string]: { resident: number; visitor: number } } = {};

  filteredRecords.forEach(record => {
    const gender = record.SEX_DV;
    const ageGroup = parseInt(record.AGRDE_CLS);
    const ageKey = `${gender}_${ageGroup}`;

    // 성별 집계
    if (genderStats[gender]) {
      genderStats[gender].resident += record.REVISN_AMBLT_PUL_CNT;
      genderStats[gender].visitor += record.REVISN_NMBLT_PUL_CNT;
    }

    // 연령대별 집계
    if (!ageGroupStats[ageKey]) {
      ageGroupStats[ageKey] = { resident: 0, visitor: 0 };
    }
    ageGroupStats[ageKey].resident += record.REVISN_AMBLT_PUL_CNT;
    ageGroupStats[ageKey].visitor += record.REVISN_NMBLT_PUL_CNT;
  });

  // 성별 비율 계산
  const byGender: { [key: string]: { residentPopulation: number; visitorPopulation: number; residentRatio: number } } = {};
  Object.keys(genderStats).forEach(gender => {
    const total = genderStats[gender].resident + genderStats[gender].visitor;
    byGender[gender] = {
      residentPopulation: Math.round(genderStats[gender].resident),
      visitorPopulation: Math.round(genderStats[gender].visitor),
      residentRatio: total > 0 ? genderStats[gender].resident / total : 0
    };
  });

  // 연령대별 분석
  const byAgeGroup: DemographicBreakdown[] = [];
  Object.keys(ageGroupStats).forEach(key => {
    const [gender, ageGroupStr] = key.split('_');
    const ageGroup = parseInt(ageGroupStr);
    const stats = ageGroupStats[key];
    const total = stats.resident + stats.visitor;

    if (total > 0) {
      byAgeGroup.push({
        gender: gender as 'MALE' | 'FEMALE',
        ageGroup,
        ageGroupName: AGE_GROUP_MAPPING[ageGroup] || `연령대 ${ageGroup}`,
        residentPopulation: Math.round(stats.resident),
        visitorPopulation: Math.round(stats.visitor),
        totalPopulation: Math.round(total),
        residentRatio: stats.resident / total,
        visitorRatio: stats.visitor / total
      });
    }
  });

  // 인사이트 생성
  const insights: string[] = [];
  
  // 성별 인사이트
  const maleResidentRatio = byGender.MALE?.residentRatio || 0;
  const femaleResidentRatio = byGender.FEMALE?.residentRatio || 0;
  
  if (Math.abs(maleResidentRatio - femaleResidentRatio) > 0.1) {
    if (maleResidentRatio > femaleResidentRatio) {
      insights.push(`남성이 여성보다 거주 비율이 ${((maleResidentRatio - femaleResidentRatio) * 100).toFixed(1)}%p 높음`);
    } else {
      insights.push(`여성이 남성보다 거주 비율이 ${((femaleResidentRatio - maleResidentRatio) * 100).toFixed(1)}%p 높음`);
    }
  }

  // 연령대 인사이트
  const sortedByVisitorRatio = byAgeGroup.sort((a, b) => b.visitorRatio - a.visitorRatio);
  if (sortedByVisitorRatio.length > 0) {
    const topVisitorAge = sortedByVisitorRatio[0];
    if (topVisitorAge.visitorRatio > 0.3) {
      insights.push(`${topVisitorAge.ageGroupName}에서 유동인구 비율이 가장 높음 (${(topVisitorAge.visitorRatio * 100).toFixed(1)}%)`);
    }
  }

  return {
    byGender: byGender as {
      MALE: { residentPopulation: number; visitorPopulation: number; residentRatio: number };
      FEMALE: { residentPopulation: number; visitorPopulation: number; residentRatio: number };
    },
    byAgeGroup: byAgeGroup.sort((a, b) => a.ageGroup - b.ageGroup),
    insights
  };
}

// 시장 유형 결정
function determineMarketType(residentRatio: number): {
  marketType: 'resident-focused' | 'visitor-focused' | 'balanced';
  recommendation: string;
} {
  if (residentRatio >= 0.65) {
    return {
      marketType: 'resident-focused',
      recommendation: '생활밀착형 업종 (편의점, 마트, 카페, 동네 음식점 등)'
    };
  } else if (residentRatio <= 0.35) {
    return {
      marketType: 'visitor-focused',
      recommendation: '방문객 타겟 업종 (관광 상품, 특색 음식점, 쇼핑몰 등)'
    };
  } else {
    return {
      marketType: 'balanced',
      recommendation: '복합 타겟 업종 (다양한 연령대와 목적을 고려한 업종)'
    };
  }
}

// 메인 분석 함수
export async function analyzeDistrictPopulation(districtName: string): Promise<DistrictPopulationData | null> {
  try {
    console.log(`Loading population data for ${districtName}...`);
    
    const records = await loadDistrictPopulationData(districtName);
    if (records.length === 0) {
      console.warn(`No population records found for ${districtName}`);
      return null;
    }

    console.log(`Loaded ${records.length} records for ${districtName}`);

    // 오후 2시 기준으로 데이터 집계 (가장 활발한 시간대)
    const { residentPopulation, visitorPopulation } = aggregatePopulationData(records, 14);
    
    const totalPopulation = residentPopulation + visitorPopulation;
    
    if (totalPopulation === 0) {
      console.warn(`No population data found for ${districtName} at hour 14`);
      return null;
    }

    const residentRatio = residentPopulation / totalPopulation;
    const visitorRatio = visitorPopulation / totalPopulation;

    const { marketType, recommendation } = determineMarketType(residentRatio);

    console.log(`${districtName} analysis:`, {
      residentPopulation: Math.round(residentPopulation),
      visitorPopulation: Math.round(visitorPopulation),
      totalPopulation: Math.round(totalPopulation),
      residentRatio: Math.round(residentRatio * 100) + '%',
      marketType
    });

    return {
      districtName,
      residentPopulation: Math.round(residentPopulation),
      visitorPopulation: Math.round(visitorPopulation),
      totalPopulation: Math.round(totalPopulation),
      residentRatio,
      visitorRatio,
      marketType,
      recommendation
    };
  } catch (error) {
    console.error(`Error analyzing population for ${districtName}:`, error);
    return null;
  }
}

// 상세 인구 분석 함수 (성별/연령대별 포함)
export async function analyzeDistrictPopulationDetailed(districtName: string): Promise<DetailedPopulationAnalysis | null> {
  try {
    console.log(`Loading detailed population data for ${districtName}...`);
    
    const records = await loadDistrictPopulationData(districtName);
    if (records.length === 0) {
      console.warn(`No population records found for ${districtName}`);
      return null;
    }

    // 전체 분석
    const overall = await analyzeDistrictPopulation(districtName);
    if (!overall) return null;

    // 성별/연령대별 분석
    const demographics = analyzeDemographics(records, 14);

    return {
      districtName,
      overall,
      byGender: demographics.byGender,
      byAgeGroup: demographics.byAgeGroup,
      insights: demographics.insights
    };
  } catch (error) {
    console.error(`Error analyzing detailed population for ${districtName}:`, error);
    return null;
  }
} 