export interface MobileFlowRecord {
  baseDate: string;
  gridId: string;
  longitude: number;
  latitude: number;
  cityCode: string;
  cityName: string;
  districtCode: string;
  districtName: string;
  dongCode: string;
  dongName: string;
  weekday: string;
  hour: number;
  gender: 'M' | 'F';
  ageGroup: number;
  pedestrianCount: number;
  otherCount: number;
}

export interface ProcessedFlowData {
  timeData: TimeData[];
  weekdayData: WeekdayData[];
  genderData: GenderData[];
  ageData: AgeData[];
}

export interface TimeData {
  hour: number;
  totalCount: number;
  genderBreakdown: { gender: 'M' | 'F'; count: number }[];
  ageBreakdown: { ageGroup: number; count: number }[];
}

export interface WeekdayData {
  weekday: string;
  totalCount: number;
  genderBreakdown: { gender: 'M' | 'F'; count: number }[];
  ageBreakdown: { ageGroup: number; count: number }[];
}

export interface GenderData {
  gender: 'M' | 'F';
  count: number;
  percentage: number;
}

export interface AgeData {
  ageGroup: number;
  ageLabel: string;
  count: number;
}

// 연령대 라벨 매핑
const AGE_GROUP_LABELS: Record<number, string> = {
  1: '10대 이하',
  2: '20대',
  3: '30대', 
  4: '40대',
  5: '50대',
  6: '60대',
  7: '70대 이상'
};

// 요일 순서 정의
const WEEKDAY_ORDER = ['월', '화', '수', '목', '금', '토', '일'];

export function parseMobileFlowCSV(csvText: string): MobileFlowRecord[] {
  const lines = csvText.trim().split('\n');
  
  // 헤더가 두 줄로 되어 있으므로 데이터는 3번째 줄부터
  const dataLines = lines.slice(2);

  return dataLines.map(line => {
    // CSV 파싱: 따옴표로 둘러싸인 필드 내의 쉼표는 무시
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim()); // 마지막 값 추가
    
    // 값이 16개 미만이면 건너뛰기
    if (values.length < 16) {
      console.log('잘못된 라인 (필드 수 부족):', values.length, line.substring(0, 100));
      return null;
    }
    
    const record = {
      baseDate: values[0],
      gridId: values[1].replace(/"/g, ''), // 따옴표 제거
      longitude: parseFloat(values[2]),
      latitude: parseFloat(values[3]),
      cityCode: values[4],
      cityName: values[5],
      districtCode: values[6],
      districtName: values[7],
      dongCode: values[8],
      dongName: values[9],
      weekday: values[10],
      hour: parseInt(values[11]),
      gender: values[12] as 'M' | 'F',
      ageGroup: parseInt(values[13]),
      pedestrianCount: parseInt(values[14]),
      otherCount: parseInt(values[15])
    };
    
    // 디버깅을 위해 첫 번째 서울시 레코드 출력
    if (record.cityName === '서울특별시' && values.indexOf('서울특별시') === 5) {
      console.log('서울시 레코드 샘플:', record);
    }
    
    return record;
  }).filter(Boolean) as MobileFlowRecord[]; // null 값 제거
}

export function processFlowData(
  records: MobileFlowRecord[], 
  selectedDistrict?: string
): ProcessedFlowData {
  console.log('processFlowData 시작:');
  console.log('- 전체 레코드 수:', records.length);
  console.log('- 선택된 구:', selectedDistrict);
  
  // 선택된 구로 필터링 (서울시만)
  let filteredRecords = records.filter(record => 
    record.cityName === '서울특별시' &&
    (!selectedDistrict || record.districtName === selectedDistrict)
  );
  
  console.log('- 서울시 전체 레코드 수:', records.filter(r => r.cityName === '서울특별시').length);
  console.log('- 필터링된 레코드 수:', filteredRecords.length);
  
  if (selectedDistrict) {
    const districtsInData = [...new Set(records.filter(r => r.cityName === '서울특별시').map(r => r.districtName))];
    console.log('- 데이터에 있는 서울시 구 목록:', districtsInData);
    console.log('- 선택된 구가 데이터에 존재하는가:', districtsInData.includes(selectedDistrict));
  }

  // 시간대별 데이터 처리
  const timeMap = new Map<number, MobileFlowRecord[]>();
  filteredRecords.forEach(record => {
    if (!timeMap.has(record.hour)) {
      timeMap.set(record.hour, []);
    }
    timeMap.get(record.hour)!.push(record);
  });

  const timeData: TimeData[] = Array.from(timeMap.entries())
    .map(([hour, records]) => {
      const totalCount = records.reduce((sum, r) => sum + r.pedestrianCount + r.otherCount, 0);
      
      // 성별 집계
      const genderMap = new Map<'M' | 'F', number>();
      records.forEach(record => {
        const count = record.pedestrianCount + record.otherCount;
        genderMap.set(record.gender, (genderMap.get(record.gender) || 0) + count);
      });
      
      // 연령대 집계
      const ageMap = new Map<number, number>();
      records.forEach(record => {
        const count = record.pedestrianCount + record.otherCount;
        ageMap.set(record.ageGroup, (ageMap.get(record.ageGroup) || 0) + count);
      });

      return {
        hour,
        totalCount,
        genderBreakdown: Array.from(genderMap.entries()).map(([gender, count]) => ({ gender, count })),
        ageBreakdown: Array.from(ageMap.entries()).map(([ageGroup, count]) => ({ ageGroup, count }))
      };
    })
    .sort((a, b) => a.hour - b.hour);

  // 요일별 데이터 처리
  const weekdayMap = new Map<string, MobileFlowRecord[]>();
  filteredRecords.forEach(record => {
    if (!weekdayMap.has(record.weekday)) {
      weekdayMap.set(record.weekday, []);
    }
    weekdayMap.get(record.weekday)!.push(record);
  });

  const weekdayData: WeekdayData[] = Array.from(weekdayMap.entries())
    .map(([weekday, records]) => {
      const totalCount = records.reduce((sum, r) => sum + r.pedestrianCount + r.otherCount, 0);
      
      // 성별 집계
      const genderMap = new Map<'M' | 'F', number>();
      records.forEach(record => {
        const count = record.pedestrianCount + record.otherCount;
        genderMap.set(record.gender, (genderMap.get(record.gender) || 0) + count);
      });
      
      // 연령대 집계
      const ageMap = new Map<number, number>();
      records.forEach(record => {
        const count = record.pedestrianCount + record.otherCount;
        ageMap.set(record.ageGroup, (ageMap.get(record.ageGroup) || 0) + count);
      });

      return {
        weekday,
        totalCount,
        genderBreakdown: Array.from(genderMap.entries()).map(([gender, count]) => ({ gender, count })),
        ageBreakdown: Array.from(ageMap.entries()).map(([ageGroup, count]) => ({ ageGroup, count }))
      };
    })
    .sort((a, b) => WEEKDAY_ORDER.indexOf(a.weekday) - WEEKDAY_ORDER.indexOf(b.weekday));

  // 전체 성별 데이터
  const totalGenderMap = new Map<'M' | 'F', number>();
  filteredRecords.forEach(record => {
    const count = record.pedestrianCount + record.otherCount;
    totalGenderMap.set(record.gender, (totalGenderMap.get(record.gender) || 0) + count);
  });

  const totalCount = filteredRecords.reduce((sum, r) => sum + r.pedestrianCount + r.otherCount, 0);
  const genderData: GenderData[] = Array.from(totalGenderMap.entries()).map(([gender, count]) => ({
    gender,
    count,
    percentage: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0
  }));

  // 전체 연령대 데이터
  const totalAgeMap = new Map<number, number>();
  filteredRecords.forEach(record => {
    const count = record.pedestrianCount + record.otherCount;
    totalAgeMap.set(record.ageGroup, (totalAgeMap.get(record.ageGroup) || 0) + count);
  });

  const ageData: AgeData[] = Array.from(totalAgeMap.entries()).map(([ageGroup, count]) => ({
    ageGroup,
    ageLabel: AGE_GROUP_LABELS[ageGroup] || `${ageGroup}그룹`,
    count
  })).sort((a, b) => a.ageGroup - b.ageGroup);

  console.log('processFlowData 완료:');
  console.log('- timeData 항목 수:', timeData.length);
  console.log('- weekdayData 항목 수:', weekdayData.length);
  console.log('- timeData 샘플:', timeData.slice(0, 3));
  console.log('- weekdayData 샘플:', weekdayData.slice(0, 3));

  return {
    timeData,
    weekdayData,
    genderData,
    ageData
  };
}

export function formatCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

// 새로운 구별 유동인구 데이터 인터페이스
export interface DistrictMobileFlowRecord {
  indexKey: string;
  date: string;        // CRTR_YMD
  week: number;        // CRTR_WEEK
  dayName: string;     // DWK_NM
  district: string;    // SGG_NM
  timeZone: number;    // TMZN_CD (0-23)
  gender: 'MALE' | 'FEMALE';  // SEX_DV
  ageGroup: number;    // AGRDE_CLS (0-7)
  residentFlow: number;     // REVISN_AMBLT_PUL_CNT (상주인구)
  nonResidentFlow: number;  // REVISN_NMBLT_PUL_CNT (비상주인구)
  totalFlow: number;        // 총 유동인구
}

// 연령대 매핑
export const AGE_GROUP_MAPPING = {
  0: '10대 이하',
  1: '10대',
  2: '20대',
  3: '30대', 
  4: '40대',
  5: '50대',
  6: '60대',
  7: '70대 이상'
};

// CSV 파싱 함수
export function parseDistrictMobileFlowCSV(csvText: string): DistrictMobileFlowRecord[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    
    const residentFlow = parseFloat(values[11]) || 0;
    const nonResidentFlow = parseFloat(values[12]) || 0;
    
    return {
      indexKey: values[0] || '',
      date: values[1] || '',
      week: parseInt(values[2]) || 0,
      dayName: values[3] || '',
      district: values[7] || '',
      timeZone: parseInt(values[8]) || 0,
      gender: (values[9] === 'MALE' ? 'MALE' : 'FEMALE') as 'MALE' | 'FEMALE',
      ageGroup: parseInt(values[10]) || 0,
      residentFlow,
      nonResidentFlow,
      totalFlow: residentFlow + nonResidentFlow
    };
  });
}

// 특정 구의 유동인구 데이터 로드
export async function loadDistrictMobileFlowData(district: string): Promise<DistrictMobileFlowRecord[]> {
  try {
    const response = await fetch(`/data/지리는데이타/서울시 ${district} 유동인구 수.CSV`);
    if (!response.ok) {
      console.warn(`Failed to load mobile flow data for ${district}: ${response.status}`);
      return [];
    }
    
    const csvText = await response.text();
    const records = parseDistrictMobileFlowCSV(csvText);
    
    console.log(`Successfully loaded mobile flow data for ${district}: ${records.length} records`);
    return records;
  } catch (error) {
    console.warn(`Failed to load mobile flow data for ${district}:`, error);
    return [];
  }
}

// 시간대별 집계 (전체, 성별, 연령대별) - 하루 평균으로 계산
export function aggregateByTimeZone(records: DistrictMobileFlowRecord[]) {
  const timeZoneData: { [timeZone: number]: {
    total: number;
    male: number;
    female: number;
    ageGroups: { [ageGroup: number]: number };
    count: number; // 해당 시간대 데이터 개수
  }} = {};

  records.forEach(record => {
    const tz = record.timeZone;
    
    if (!timeZoneData[tz]) {
      timeZoneData[tz] = {
        total: 0,
        male: 0,
        female: 0,
        ageGroups: {},
        count: 0
      };
    }

    timeZoneData[tz].total += record.totalFlow;
    timeZoneData[tz].count += 1;
    
    if (record.gender === 'MALE') {
      timeZoneData[tz].male += record.totalFlow;
    } else {
      timeZoneData[tz].female += record.totalFlow;
    }
    
    if (!timeZoneData[tz].ageGroups[record.ageGroup]) {
      timeZoneData[tz].ageGroups[record.ageGroup] = 0;
    }
    timeZoneData[tz].ageGroups[record.ageGroup] += record.totalFlow;
  });

  // 평균 계산
  Object.keys(timeZoneData).forEach(tz => {
    const timeZone = parseInt(tz);
    const data = timeZoneData[timeZone];
    const count = data.count;
    if (count > 0) {
      data.total = data.total / count;
      data.male = data.male / count;
      data.female = data.female / count;
      Object.keys(data.ageGroups).forEach(age => {
        const ageGroup = parseInt(age);
        data.ageGroups[ageGroup] = data.ageGroups[ageGroup] / count;
      });
    }
  });

  return timeZoneData;
}

// 요일별 집계 - 하루 평균으로 계산
export function aggregateByDayOfWeek(records: DistrictMobileFlowRecord[]) {
  const dayMapping = {
    '월': 1, '화': 2, '수': 3, '목': 4, '금': 5, '토': 6, '일': 7
  };

  const dayData: { [day: string]: {
    total: number;
    male: number;
    female: number;
    ageGroups: { [ageGroup: number]: number };
    count: number; // 해당 요일 데이터 개수
  }} = {};

  records.forEach(record => {
    const day = record.dayName;
    
    if (!dayData[day]) {
      dayData[day] = {
        total: 0,
        male: 0,
        female: 0,
        ageGroups: {},
        count: 0
      };
    }

    dayData[day].total += record.totalFlow;
    dayData[day].count += 1;
    
    if (record.gender === 'MALE') {
      dayData[day].male += record.totalFlow;
    } else {
      dayData[day].female += record.totalFlow;
    }
    
    if (!dayData[day].ageGroups[record.ageGroup]) {
      dayData[day].ageGroups[record.ageGroup] = 0;
    }
    dayData[day].ageGroups[record.ageGroup] += record.totalFlow;
  });

  // 평균 계산
  Object.keys(dayData).forEach(day => {
    const data = dayData[day];
    const count = data.count;
    if (count > 0) {
      data.total = data.total / count;
      data.male = data.male / count;
      data.female = data.female / count;
      Object.keys(data.ageGroups).forEach(age => {
        data.ageGroups[parseInt(age)] = data.ageGroups[parseInt(age)] / count;
      });
    }
  });

  return dayData;
}

// 차트 데이터 변환 (시간대별)
export function transformToTimeZoneChartData(aggregatedData: ReturnType<typeof aggregateByTimeZone>) {
  return Object.entries(aggregatedData)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([timeZone, data]) => ({
      timeZone: `${timeZone}시`,
      total: Math.round(data.total / 1000 * 100) / 100, // 천 명 단위로 변환, 소수점 2자리
      totalRaw: Math.round(data.total), // 원본 값도 저장
      male: Math.round(data.male),
      female: Math.round(data.female),
      ...Object.fromEntries(
        Object.entries(data.ageGroups).map(([age, count]) => [
          AGE_GROUP_MAPPING[parseInt(age) as keyof typeof AGE_GROUP_MAPPING] || `${age}대`,
          Math.round(count)
        ])
      )
    }));
}

// 차트 데이터 변환 (요일별)
export function transformToDayOfWeekChartData(aggregatedData: ReturnType<typeof aggregateByDayOfWeek>) {
  const dayOrder = ['월', '화', '수', '목', '금', '토', '일'];
  
  return dayOrder
    .filter(day => aggregatedData[day])
    .map(day => ({
      day,
      total: Math.round(aggregatedData[day].total / 1000 * 100) / 100, // 천 명 단위로 변환, 소수점 2자리
      totalRaw: Math.round(aggregatedData[day].total), // 원본 값도 저장
      male: Math.round(aggregatedData[day].male),
      female: Math.round(aggregatedData[day].female),
      ...Object.fromEntries(
        Object.entries(aggregatedData[day].ageGroups).map(([age, count]) => [
          AGE_GROUP_MAPPING[parseInt(age) as keyof typeof AGE_GROUP_MAPPING] || `${age}대`,
          Math.round(count)
        ])
      )
    }));
} 