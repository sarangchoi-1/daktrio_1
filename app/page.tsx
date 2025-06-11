"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DashboardMap } from "@/components/dashboard-map"
import { IndustrySelectorHardcoded, type SelectedIndustry } from "@/components/industry-selector-hardcoded"
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

export default function Dashboard() {
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictInfo | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<SelectedIndustry>({});

  const handleDistrictClick = (district: DistrictInfo) => {
    // Find the keyword info for the clicked district
    const keywordInfo = keywordsData.find(
      (item) => item.자치구 === district.name
    );
    setSelectedDistrict({ ...district, ...keywordInfo });
  };

  const handleIndustryChange = (industry: SelectedIndustry) => {
    setSelectedIndustry(industry);
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-black text-white p-4">
        <h1 className="text-xl font-medium">서울 팝업 상점 대시보드</h1>
      </header>

      <main className="container mx-auto p-4 space-y-6">
        {/* 업종 선택 */}
        <IndustrySelectorHardcoded onIndustryChange={handleIndustryChange} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="mb-4 flex gap-2">
              <Button variant="outline" size="sm" className="text-xs rounded-full bg-gray-100 hover:bg-gray-200">
                인기 지역
              </Button>
              <Button variant="outline" size="sm" className="text-xs rounded-full bg-gray-100 hover:bg-gray-200">
                타겟 유저
              </Button>
              <Button variant="outline" size="sm" className="text-xs rounded-full bg-gray-100 hover:bg-gray-200">
                모집
              </Button>
            </div>

            <DashboardMap onDistrictClick={handleDistrictClick} />
          </div>

          <div className="space-y-4">
            <Card className="p-6 bg-gray-100">
              <h3 className="text-center text-gray-500 mb-4">
                {selectedIndustry.class3 && selectedDistrict
                  ? `${selectedDistrict.name} ${selectedIndustry.class3} 소비 데이터`
                  : '시간대별 소비자 그래프'
                }
              </h3>
              <div className="h-32"></div>
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
