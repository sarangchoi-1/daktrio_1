import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 서버 사이드용 데이터 로딩 함수
async function loadAllDistrictDataServer() {
  const fs = await import('fs');
  const path = await import('path');
  const { parseDistrictCardCSV } = await import('@/lib/district-card-data');
  
  const allRecords: any[] = [];
  
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

  for (const [district, yearMonth] of Object.entries(districtYearMonths)) {
    try {
      // 파일 경로 설정 (public 폴더 기준)
      const filePath = path.join(process.cwd(), 'public', 'data', '구별', `신한카드_서울_${district}_${yearMonth}.csv`);
      
      if (fs.existsSync(filePath)) {
        const csvText = fs.readFileSync(filePath, 'utf-8');
        const records = parseDistrictCardCSV(csvText);
        allRecords.push(...records);
        console.log(`Successfully loaded data for ${district} (${yearMonth}): ${records.length} records`);
      } else {
        console.warn(`File not found: ${filePath}`);
      }
    } catch (error) {
      console.warn(`Failed to load data for ${district}:`, error);
    }
  }
  
  console.log(`Total loaded records: ${allRecords.length}`);
  return allRecords;
}

// 업종별 구별 데이터를 가져오는 함수
async function getIndustryDistrictData(selectedIndustry: any) {
  try {
    const { calculateDistrictStats } = await import('@/lib/district-card-data');
    
    // selectedIndustry 객체가 비어있으면 null 반환
    if (!selectedIndustry || Object.keys(selectedIndustry).length === 0) {
      return null;
    }

    // 서버 사이드 데이터 로드
    const allData = await loadAllDistrictDataServer();
    
    // 업종별 구별 통계 계산
    const districtStats = calculateDistrictStats(allData, selectedIndustry);
    
    // 상위 10개 구만 선별하여 반환
    const sortedDistricts = Object.entries(districtStats)
      .sort(([,a], [,b]) => b.avgSalesPerStore - a.avgSalesPerStore)
      .slice(0, 10)
      .map(([district, stats]) => ({
        district,
        totalSales: Math.round(stats.totalSales),
        totalTransactions: Math.round(stats.totalTransactions),
        totalStores: Math.round(stats.totalStores),
        avgSalesPerStore: Math.round(stats.avgSalesPerStore)
      }));

    return sortedDistricts;
  } catch (error) {
    console.error('데이터 로딩 오류:', error);
    return null;
  }
}

// 유동인구 데이터를 가져오는 함수
async function getMobileFlowData(topDistricts: string[]) {
  try {
    const { loadDistrictMobileFlowData } = await import('@/lib/mobile-flow-data');
    
    const mobilFlowAnalysis: any = {};
    
    for (const district of topDistricts) {
      try {
        const data = await loadDistrictMobileFlowData(district);
        
        if (data.length > 0) {
          // 성별/연령대별 집계
          const demographics = data.reduce((acc: any, record: any) => {
            const gender = record.gender === 'MALE' ? '남성' : '여성';
            const ageGroup = getAgeGroupName(record.ageGroup.toString());
            const key = `${gender}_${ageGroup}`;
            
            if (!acc[key]) acc[key] = 0;
            acc[key] += record.totalFlow;
            
            return acc;
          }, {});
          
          // 시간대별 집계
          const hourlyData = data.reduce((acc: any, record: any) => {
            const hour = record.timeZone;
            if (!acc[hour]) acc[hour] = 0;
            acc[hour] += record.totalFlow;
            return acc;
          }, {});
          
          // 요일별 집계
          const weekdayData = data.reduce((acc: any, record: any) => {
            const weekday = record.dayName;
            if (!acc[weekday]) acc[weekday] = 0;
            acc[weekday] += record.totalFlow;
            return acc;
          }, {});
          
          mobilFlowAnalysis[district] = {
            demographics,
            hourlyData,
            weekdayData,
            totalFlow: Object.values(demographics).reduce((a: any, b: any) => a + b, 0)
          };
        }
      } catch (error) {
        console.warn(`Failed to load mobile flow data for ${district}:`, error);
      }
    }
    
    return mobilFlowAnalysis;
  } catch (error) {
    console.error('Mobile flow data loading error:', error);
    return {};
  }
}

// 연령대 코드를 이름으로 변환하는 함수
function getAgeGroupName(code: string): string {
  const mapping: { [key: string]: string } = {
    '1': '10대이하',
    '2': '20대',
    '3': '30대', 
    '4': '40대',
    '5': '50대',
    '6': '60대',
    '7': '70대이상'
  };
  return mapping[code] || '기타';
}

export async function POST(request: NextRequest) {
  try {
    const { selectedIndustry } = await request.json();

    if (!selectedIndustry || Object.keys(selectedIndustry).length === 0) {
      return NextResponse.json({ error: '업종 정보가 필요합니다.' }, { status: 400 });
    }

    // 업종별 실제 데이터 가져오기
    const districtData = await getIndustryDistrictData(selectedIndustry);
    
    if (!districtData || districtData.length === 0) {
      const industryName = selectedIndustry.소분류 || selectedIndustry.중분류 || selectedIndustry.대분류 || '선택된 업종';
      return NextResponse.json({ 
        analysis: `${industryName} 업종에 대한 데이터를 찾을 수 없습니다. 다른 업종을 선택해주세요.`,
        industry: industryName 
      });
    }

    // 업종명 추출
    const industryName = selectedIndustry.소분류 || selectedIndustry.중분류 || selectedIndustry.대분류 || '선택된 업종';

    // 총 매출 기준 상위 3개 구 추출
    const topSalesDistricts = [...districtData]
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 3)
      .map(d => d.district);

    // 점포당 매출 기준 상위 3개 구 추출
    const topAvgSalesDistricts = [...districtData]
      .sort((a, b) => b.avgSalesPerStore - a.avgSalesPerStore)
      .slice(0, 3)
      .map(d => d.district);
      
    // 유동인구 데이터를 가져올 구 목록 (중복 제거)
    const districtsForFlowData = [...new Set([...topSalesDistricts, ...topAvgSalesDistricts])];
    
    // 유동인구 데이터 가져오기
    const mobileFlowData = await getMobileFlowData(districtsForFlowData);

    // 데이터 기반 정보 구성 (전체 데이터 제공)
    const dataInfo = districtData.map((data, index) => 
      `${index + 1}. ${data.district}: 월총매출 ${(data.totalSales / 100000000).toFixed(1)}억원, 총거래건수 ${(data.totalTransactions / 10000).toFixed(1)}만건, 가맹점수 ${data.totalStores}개 → 점포당매출 ${data.avgSalesPerStore.toLocaleString()}원`
    ).join('\n');
    
    // 유동인구 정보 구성
    const mobileFlowInfo = districtsForFlowData.map(district => {
      const flowData = mobileFlowData[district];
      if (!flowData) return `${district}: 유동인구 데이터 없음`;
      
      // 주요 인구통계 분석
      const demographics = Object.entries(flowData.demographics)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 3)
        .map(([key, count]) => `${key}: ${(count as number).toLocaleString()}명`)
        .join(', ');
      
      // 피크 시간대 분석
      const peakHours = Object.entries(flowData.hourlyData)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 2)
        .map(([hour, count]) => `${hour}시: ${(count as number).toLocaleString()}명`)
        .join(', ');
      
      return `${district}: 총 유동인구 ${flowData.totalFlow.toLocaleString()}명, 주요 고객층(${demographics}), 피크 시간(${peakHours})`;
    }).join('\n');
    
    // 시스템 프롬프트
    const systemPrompt = `
너는 자영업자들을 위한 데이터 해석 전문 컨설턴트야. 
매출 데이터와 유동인구 데이터를 종합하여 시장 상황을 명확하게 해석해줘.

${industryName} 업종의 서울시 구별 실제 월별 매출 데이터 (2020년 9-12월, 점포당 중앙값매출 기준 상위 10개):
${dataInfo}

상위 3개 구의 유동인구 데이터:
${mobileFlowInfo}

**핵심 분석 관점**:
1. **다각도 추천**: 총 매출(시장 규모)과 점포당 매출(수익성) 두 가지 관점에서 각각 상위 3개 구를 추천하고 분석.
2. **점포당 매출 해석**: 
   - 높은 총매출 + 낮은 점포당 매출 = "대형 시장이지만 경쟁 포화상태"
   - 높은 총매출 + 높은 점포당 매출 = "수익성과 시장규모 모두 우수한 프리미엄 시장"
   - 적은 가맹점수 + 높은 점포당 매출 = "틈새시장 기회"
3. **유동인구 연결 분석**: 유동인구 패턴으로 매출 특성의 원인 해석

다음 구조로 분석해줘:

1. 종합 추천 요약
- 시장 규모가 가장 큰 Top 3: ${topSalesDistricts.join(', ')}
- 수익성이 가장 좋은 Top 3: ${topAvgSalesDistricts.join(', ')}

2. 시장 규모 중심 분석 (총 매출 Top 3)
- 이 구역들을 추천하는 이유 (큰 시장, 높은 잠재 고객 수)
- 각 구역의 경쟁 상황 (가맹점 수 언급) 및 유동인구 특성 연결 분석

3. 수익성 중심 분석 (점포당 매출 Top 3)
- 각 추천 구역별 주요 고객층과 업종 적합성
- 이 구역들을 추천하는 이유 (높은 수익성, 효율적인 운영 가능성)
- 왜 점포당 매출이 높은지 유동인구 특성(예: 특정 연령/성별의 높은 구매력)과 연결하여 분석

4. 전략적 창업 조언
- '시장 규모'를 우선한다면 어떤 전략이 필요한지
- '수익성'을 우선한다면 어떤 전략이 필요한지
- 두 가지 모두를 고려한 최적의 타협점이나 제3의 대안 제시

답변은 900자 내외로 데이터를 근거로 한 구체적이고 실무적인 해석을 제공해줘.
각 목표별로 명확한 구역 추천과 그 이유를 제시해줘.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user", 
          content: `${industryName} 업종으로 서울에서 창업하려고 합니다. 매출 데이터와 유동인구 데이터를 종합하여 분석해주세요.`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const analysis = completion.choices[0]?.message?.content || '분석 결과를 생성할 수 없습니다.';

    return NextResponse.json({ 
      analysis,
      industry: industryName 
    });

  } catch (error) {
    console.error('LLM 분석 오류:', error);
    return NextResponse.json(
      { error: 'LLM 분석 중 오류가 발생했습니다.' }, 
      { status: 500 }
    );
  }
} 