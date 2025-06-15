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

    // 데이터 기반 정보 구성 (전체 시장 추정값임을 명시)
    const dataInfo = districtData.map((data, index) => 
      `${index + 1}. ${data.district}: 월중앙값 점포당매출 ${data.avgSalesPerStore.toLocaleString()}원(추정), 월총매출 ${(data.totalSales / 100000000).toFixed(1)}억원(추정), 가맹점수 ${data.totalStores}개`
    ).join('\n');
    
    // 시스템 프롬프트
    const systemPrompt = `
너는 창업자 또는 소상공인을 도와주는 한국어 창업 컨설턴트야.
실제 매출 데이터를 바탕으로 업종별 최적 창업 지역을 추천해줘.

${industryName} 업종의 서울시 구별 실제 월별 매출 데이터 (2020년 9-12월, 점포당 중앙값매출 기준 상위 10개):
${dataInfo}

**중요**: 
- 위 데이터는 신한카드 데이터(시장점유율 17.5%)를 전체 시장으로 추정한 값입니다.
- 점포당 매출은 극단값 영향을 줄이기 위해 중앙값을 사용했습니다.
- 월별 매출 데이터이므로 연간 매출을 추정하려면 대략 12배를 곱하면 됩니다.
- 추정값이므로 상대적 비교에 중점을 두고 분석해주세요.

위 데이터를 근거로 다음 형식으로 답변해줘:
1. 추천 구역 (상위 3-5개): 구체적인 구 이름과 추정 중앙값 매출 데이터 기반 이유
2. 업종 분석: 추정 데이터로 본 해당 업종의 서울시 내 현황
3. 창업 전략: 매출 데이터 분석을 통한 성공 포인트 3가지
4. 주의사항: 추정 데이터 기반 분석의 한계점 포함

답변은 500자 이내로 구체적이고 실용적으로 해줘. 반드시 제공된 추정 중앙값 매출 데이터를 근거로 추천해줘.
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
          content: `${industryName} 업종으로 서울에서 창업하려고 합니다. 실제 매출 데이터를 바탕으로 추천해주세요.`
        }
      ],
      temperature: 0.7,
      max_tokens: 700
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