"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DashboardMap } from "@/components/dashboard-map"
import { IndustrySelectorHardcoded, type SelectedIndustry } from "@/components/industry-selector-hardcoded"
import { MobileFlowChart } from "@/components/mobile-flow-chart"
import { MobileFlowChartSimple } from "@/components/mobile-flow-chart-simple"
import { MobileFlowChartNew } from "@/components/mobile-flow-chart-new"
import { Switch } from "@/components/ui/switch"
import { MapPin } from "lucide-react"
import { type RecommendationCriteria, CRITERIA_LABELS } from "@/lib/district-card-data"
import DistrictConsumptionData from "@/components/district-consumption-data"
import keywordsData from "@/data/자치구별_키워드_top3.json"

interface DistrictInfo {
  name: string;
  code?: string;
  properties?: any;
  자치구?: string;
  키워드1?: string;
  키워드2?: string;
  키워드3?: string;
}

// 하드코딩된 업종을 신한카드 데이터 업종으로 매핑
const INDUSTRY_MAPPING = {
  // 요식/유흥
  "한식": { 대분류: "음식", 중분류: "한식" },
  "일식": { 대분류: "음식", 중분류: "아시아음식", 소분류: "일식" },
  "양식": { 대분류: "음식", 중분류: "양식" },
  "중식": { 대분류: "음식", 중분류: "아시아음식", 소분류: "중식" },
  "제과점": { 대분류: "음식", 중분류: "간식", 소분류: "베이커리" },
  "커피전문점": { 대분류: "음식", 중분류: "음료", 소분류: "커피" },
  "패스트푸드": { 대분류: "음식", 중분류: "패스트푸드" },
  "기타요식": { 대분류: "음식" },
  "노래방": { 대분류: "문화레져", 중분류: "레져", 소분류: "노래방" },
  "유흥주점": { 대분류: "음식", 중분류: "유흥주점" },
  
  // 유통
  "백화점": { 대분류: "종합유통", 중분류: "백화점" },
  "할인점/슈퍼마켓": { 대분류: "종합유통", 중분류: "마트/슈퍼마켓" },
  "슈퍼마켓": { 대분류: "종합유통", 중분류: "마트/슈퍼마켓", 소분류: "슈퍼마켓 일반형" },
  "편의점": { 대분류: "종합유통", 중분류: "편의점" },
  "생활잡화": { 대분류: "일반유통", 중분류: "생활용품" },
  
  // 음/식료품
  "정육점": { 대분류: "음식", 중분류: "농축수산물", 소분류: "축산물" },
  "농수산물": { 대분류: "음식", 중분류: "농축수산물" },
  "기타음/식료품": { 대분류: "음식", 중분류: "식품" },
  
  // 의류/잡화
  "의복/의류": { 대분류: "일반유통", 중분류: "의류" },
  "패션/잡화": { 대분류: "일반유통", 중분류: "의류" },
  "시계/귀금속": { 대분류: "일반유통", 중분류: "의류" },
  
  // 스포츠/문화/레저
  "종합레저시설": { 대분류: "문화레져", 중분류: "레져" },
  "영화/공연": { 대분류: "문화레져", 중분류: "전시/관람/체험", 소분류: "영화관" },
  "스포츠시설": { 대분류: "문화레져", 중분류: "레져", 소분류: "스포츠센터" },
  "취미/오락": { 대분류: "문화레져", 중분류: "오락실/PC방" },
  "서점": { 대분류: "일반유통", 중분류: "서점" },
  "실내골프": { 대분류: "문화레져", 중분류: "레져", 소분류: "실내골프장" },
  "헬스": { 대분류: "문화레져", 중분류: "레져", 소분류: "스포츠센터" },
  "스포츠/레저용품": { 대분류: "문화레져", 중분류: "레져용품" },
  "문화용품": { 대분류: "일반유통", 중분류: "문구용품" },
  "화원": { 대분류: "문화레져", 중분류: "화원" },
  
  // 여행/교통
  "호텔/콘도": { 대분류: "문화레져", 중분류: "숙박" },
  "모텔/여관/기타숙박": { 대분류: "문화레져", 중분류: "숙박", 소분류: "모텔" },
  "여행사": { 대분류: "문화레져", 중분류: "여행사" },
  "항공": { 대분류: "생활서비스", 중분류: "항공" },
  "면세점": { 대분류: "종합유통", 중분류: "면세점" },
  "교통": { 대분류: "생활서비스", 중분류: "대중교통" },
  
  // 미용
  "미용실": { 대분류: "생활서비스", 중분류: "미용/사우나/마사지", 소분류: "미용실" },
  "미용서비스": { 대분류: "생활서비스", 중분류: "미용/사우나/마사지" },
  "화장품": { 대분류: "생활서비스", 중분류: "미용/사우나/마사지", 소분류: "미용제품" },
  
  // 가정생활/서비스
  "생활서비스": { 대분류: "생활서비스" },
  "세탁소": { 대분류: "생활서비스", 중분류: "세탁소" },
  "업무서비스": { 대분류: "전문서비스" },
  "인테리어": { 대분류: "일반유통", 중분류: "건설/건축", 소분류: "인테리어" },
  "통신": { 대분류: "생활서비스", 중분류: "월납/세금", 소분류: "통신요금" },
  
  // 교육/학원
  "독서실": { 대분류: "전문서비스", 중분류: "학원" },
  "입시보습학원": { 대분류: "전문서비스", 중분류: "학원", 소분류: "학원-입시/보습" },
  "외국어학원": { 대분류: "전문서비스", 중분류: "학원", 소분류: "학원-어학" },
  "예체능학원": { 대분류: "전문서비스", 중분류: "학원", 소분류: "학원-예체능" },
  "취미/전문학원": { 대분류: "전문서비스", 중분류: "학원", 소분류: "학원-직업" },
  "유아교육": { 대분류: "문화레져", 중분류: "레져", 소분류: "유아교육/키즈카페" },
  "교육용품": { 대분류: "일반유통", 중분류: "문구용품" },
  
  // 의료
  "종합병원": { 대분류: "전문서비스", 중분류: "개인병원" },
  "일반병원": { 대분류: "전문서비스", 중분류: "개인병원" },
  "치과병원": { 대분류: "전문서비스", 중분류: "개인병원" },
  "한의원": { 대분류: "전문서비스", 중분류: "한의학", 소분류: "병원-한의학과" },
  "약국": { 대분류: "전문서비스", 중분류: "약국" },
  "기타의료": { 대분류: "전문서비스", 중분류: "개인병원" },
  
  // 가전/가구
  "가전": { 대분류: "일반유통", 중분류: "가구" },
  "가구": { 대분류: "일반유통", 중분류: "가구" },
  "기타가전/가구": { 대분류: "일반유통", 중분류: "가구" },
  
  // 자동차
  "자동차판매": { 대분류: "생활서비스", 중분류: "자동차-기타" },
  "자동차서비스": { 대분류: "생활서비스", 중분류: "자동차정비" },
  "자동차용품": { 대분류: "생활서비스", 중분류: "자동차정비" },
  
  // 주유
  "주유소": { 대분류: "생활서비스", 중분류: "연료", 소분류: "주유소" },
  "LPG": { 대분류: "생활서비스", 중분류: "연료", 소분류: "LPG가스" },
  
  // 전자상거래
  "온라인거래": { 대분류: "종합유통", 중분류: "온라인", 소분류: "전자상거래" },
  "결제대행(PG)": { 대분류: "종합유통", 중분류: "온라인" },
  "홈쇼핑": { 대분류: "종합유통", 중분류: "온라인", 소분류: "홈쇼핑" }
};

function mapIndustryToShinhanData(selectedIndustry: SelectedIndustry) {
  // 가장 구체적인 레벨(소분류)부터 확인
  const industryName = selectedIndustry.class3 || selectedIndustry.class2 || selectedIndustry.class1;
  
  if (!industryName) {
    return {}; // 업종이 선택되지 않음
  }
  
  const mapping = INDUSTRY_MAPPING[industryName as keyof typeof INDUSTRY_MAPPING];
  if (mapping) {
    console.log(`업종 매핑: ${industryName} → `, mapping);
    return mapping;
  }
  
  console.warn(`매핑되지 않은 업종: ${industryName}`);
  return {};
}

export default function Dashboard() {
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictInfo | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<SelectedIndustry>({});
  const [showIndustryColors, setShowIndustryColors] = useState(true);
  const [recommendationCriteria, setRecommendationCriteria] = useState<RecommendationCriteria>('avgSalesPerStore');

  const handleDistrictClick = (district: DistrictInfo | null) => {
    if (district) {
      // Find the keyword info for the clicked district
      const keywordInfo = keywordsData.find(
        (item) => item.자치구 === district.name
      );
      setSelectedDistrict({ ...district, ...keywordInfo });
    } else {
      setSelectedDistrict(null);
    }
  };

  const handleIndustryChange = (industry: SelectedIndustry) => {
    console.log('업종 선택 변경:', industry);
    setSelectedIndustry(industry);
  };

  // 선택된 업종을 신한카드 데이터 형식으로 변환
  const mappedIndustry = mapIndustryToShinhanData(selectedIndustry);

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-black text-white p-4">
        <h1 className="text-xl font-medium">서울 팝업 상점 대시보드</h1>
      </header>

      <main className="container mx-auto p-4 space-y-6">
        {/* 업종 선택 */}
        <IndustrySelectorHardcoded onIndustryChange={handleIndustryChange} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 왼쪽: 유동인구 분석 차트 */}
          <div className="lg:col-span-1">
            <MobileFlowChartNew selectedDistrict={selectedDistrict?.name} />
          </div>

          {/* 가운데: 지도 */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex gap-2">
                <Button 
                  variant={recommendationCriteria === 'avgSalesPerStore' ? 'default' : 'outline'} 
                  size="sm" 
                  className="text-xs rounded-full"
                  onClick={() => setRecommendationCriteria('avgSalesPerStore')}
                >
                  {CRITERIA_LABELS.avgSalesPerStore}
                </Button>
                <Button 
                  variant={recommendationCriteria === 'totalSales' ? 'default' : 'outline'} 
                  size="sm" 
                  className="text-xs rounded-full"
                  onClick={() => setRecommendationCriteria('totalSales')}
                >
                  {CRITERIA_LABELS.totalSales}
                </Button>
                <Button 
                  variant={recommendationCriteria === 'totalTransactions' ? 'default' : 'outline'} 
                  size="sm" 
                  className="text-xs rounded-full"
                  onClick={() => setRecommendationCriteria('totalTransactions')}
                >
                  {CRITERIA_LABELS.totalTransactions}
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">업종별 추천 지역</span>
                <Switch 
                  checked={showIndustryColors} 
                  onCheckedChange={setShowIndustryColors}
                  disabled={Object.keys(mappedIndustry).length === 0}
                />
              </div>
            </div>

            <DashboardMap 
              onDistrictClick={handleDistrictClick} 
              selectedIndustry={mappedIndustry}
              showIndustryColors={showIndustryColors}
              recommendationCriteria={recommendationCriteria}
            />
            
            {/* 범례 */}
            {showIndustryColors && Object.keys(mappedIndustry).length > 0 && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  추천 지역 범례 ({CRITERIA_LABELS[recommendationCriteria]})
                </h4>
                <div className="flex gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded border border-black" style={{ backgroundColor: '#1e3a8a' }}></div>
                    <span>상위 3개 구</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded border border-black" style={{ backgroundColor: '#3b82f6' }}></div>
                    <span>4-6위</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded border border-black" style={{ backgroundColor: '#bfdbfe' }}></div>
                    <span>7-10위</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded border border-black" style={{ backgroundColor: 'transparent' }}></div>
                    <span>기타 지역</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 오른쪽: 기존 카드들 */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-6 bg-gray-100">
              <h3 className="text-center text-gray-500 mb-4">
                {selectedDistrict
                  ? `${selectedDistrict.name} 소비 데이터`
                  : '시간대별 소비자 그래프'
                }
              </h3>
              {selectedDistrict && Object.keys(mappedIndustry).length > 0 ? (
                <DistrictConsumptionData 
                  districtName={selectedDistrict.name}
                  selectedIndustry={mappedIndustry}
                  recommendationCriteria={recommendationCriteria}
                />
              ) : (
                <div className="h-32 flex items-center justify-center text-gray-400 text-sm">
                  {Object.keys(mappedIndustry).length === 0 
                    ? '업종을 선택해주세요'
                    : '지도에서 구를 클릭해주세요'
                  }
                </div>
              )}
            </Card>

            <Card className="p-6 bg-gray-100">
              <h3 className="text-center text-gray-500 mb-4">
                {selectedDistrict 
                  ? `${selectedDistrict.name} 방문객수 시간 추이`
                  : '방문객수 시간 추이'
                }
              </h3>
              <div className="h-32"></div>
            </Card>

            <Card className="p-6 bg-green-50">
              <h3 className="text-center text-gray-700 mb-4">
                {selectedDistrict
                  ? `${selectedDistrict.name} Top 3 키워드`
                  : 'Top 3 키워드'
                }
              </h3>
              {selectedDistrict && (
                <div className="flex gap-2 justify-center">
                  <span>{selectedDistrict.키워드1}</span>
                  <span>{selectedDistrict.키워드2}</span>
                  <span>{selectedDistrict.키워드3}</span>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
