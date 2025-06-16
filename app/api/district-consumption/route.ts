import { NextRequest, NextResponse } from 'next/server';

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
      const filePath = path.join(process.cwd(), 'data', '구별', `신한카드_서울_${district}_${yearMonth}.csv`);
      
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

    // Load all data
    const allData = await loadAllDistrictDataServer();

    // Debug: Log a sample of the loaded data
    console.log("First 5 rows of allData:", allData.slice(0, 5));

    // 업종별 구별 통계 계산
    const districtStats = calculateDistrictStats(allData, selectedIndustry);
    
    // 모든 구를 점포당 매출 기준으로 정렬하여 반환
    const sortedDistricts = Object.entries(districtStats)
      .sort(([,a], [,b]) => b.avgSalesPerStore - a.avgSalesPerStore)
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
    const { selectedIndustry, recommendationCriteria } = await request.json();

    // Debug: Log the incoming payload
    console.log("API received selectedIndustry:", selectedIndustry);

    if (!selectedIndustry || Object.keys(selectedIndustry).length === 0) {
      return NextResponse.json({ error: '업종 정보가 필요합니다.' }, { status: 400 });
    }

    // 업종별 실제 데이터 가져오기
    const districtData = await getIndustryDistrictData(selectedIndustry);

    // Debug: Log the result of filtering
    console.log("API returning districtData:", districtData?.slice(0, 5)); // show first 5 for brevity

    if (!districtData || districtData.length === 0) {
      return NextResponse.json({ 
        data: [],
        message: '해당 업종에 대한 데이터를 찾을 수 없습니다.' 
      });
    }

    return NextResponse.json({ 
      data: districtData,
      total: districtData.length
    });

  } catch (error) {
    console.error('구별 소비 데이터 API 오류:', error);
    return NextResponse.json(
      { error: '데이터 조회 중 오류가 발생했습니다.' }, 
      { status: 500 }
    );
  }
} 