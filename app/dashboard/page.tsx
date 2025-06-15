"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardMap } from "@/components/dashboard-map"
import { IndustrySelectorHardcoded, type SelectedIndustry } from "@/components/industry-selector-hardcoded"
import { MobileFlowChart } from "@/components/mobile-flow-chart"
import { BarChart, Users, TrendingUp, Eye, Building2 } from "lucide-react"

interface DistrictInfo {
  name: string;
  code?: string;
  properties?: any;
}

export default function DashboardPage() {
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictInfo | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<SelectedIndustry>({});

  const handleDistrictClick = (district: DistrictInfo | null) => {
    setSelectedDistrict(district);
  };

  const handleIndustryChange = (industry: SelectedIndustry) => {
    setSelectedIndustry(industry);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">서울시 데이터 대시보드</h1>
            <p className="text-gray-600 mt-1">소비, OD, 관광 데이터 시각화</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <BarChart className="mr-2 h-4 w-4" />
            전체 분석 보기
          </Button>
        </div>

        {/* 업종 선택 */}
        <IndustrySelectorHardcoded onIndustryChange={handleIndustryChange} />

        {/* 메인 콘텐츠 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 지도 카드 */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                서울시 구별 지도
                {selectedDistrict && (
                  <span className="text-sm font-normal text-blue-600 ml-2">
                    - {selectedDistrict.name} 선택됨
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                구를 클릭하여 해당 지역의 상세 데이터를 확인하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DashboardMap onDistrictClick={handleDistrictClick} />
            </CardContent>
          </Card>

          {/* 선택된 구 정보 카드 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {selectedDistrict ? `${selectedDistrict.name} 분석` : '구 선택'}
              </CardTitle>
              <CardDescription>
                {selectedDistrict 
                  ? '선택된 구의 데이터 분석 정보'
                  : '지도에서 구를 클릭하여 분석을 시작하세요'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDistrict ? (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">기본 정보</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">구 이름:</span> {selectedDistrict.name}</p>
                      {selectedDistrict.properties && Object.keys(selectedDistrict.properties).length > 0 && (
                        <p><span className="font-medium">속성 정보:</span> {Object.keys(selectedDistrict.properties).length}개 항목</p>
                      )}
                    </div>
                  </div>

                  {/* 선택된 업종 정보 표시 */}
                  {selectedIndustry.class1 && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h3 className="font-semibold text-green-900 mb-2">선택된 업종</h3>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">대분류:</span> {selectedIndustry.class1}</p>
                        {selectedIndustry.class2 && (
                          <p><span className="font-medium">중분류:</span> {selectedIndustry.class2}</p>
                        )}
                        {selectedIndustry.class3 && (
                          <p><span className="font-medium">소분류:</span> {selectedIndustry.class3}</p>
                        )}
                        {selectedIndustry.code && (
                          <p><span className="font-medium">업종코드:</span> {selectedIndustry.code}</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* 간단한 요약 통계 */}
                  <div className="space-y-3">
                    <div className="h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500 text-sm">
                        {selectedIndustry.class3 && selectedDistrict
                          ? `${selectedDistrict.name} ${selectedIndustry.class3} 소비 데이터 (준비중)`
                          : '소비 데이터 차트 (준비중)'
                        }
                      </p>
                    </div>
                    <div className="h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500 text-sm">OD 데이터 차트 (준비중)</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <Users className="h-12 w-12 mb-4 opacity-50" />
                  <p className="text-center">
                    지도에서 서울시의 구를<br />
                    클릭하여 해당 지역의<br />
                    상세 분석을 시작하세요
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 유동인구 분석 */}
        <MobileFlowChart selectedDistrict={selectedDistrict?.name} />

        {/* 하단 통계 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 분석 구역</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">25개구</div>
              <p className="text-xs text-muted-foreground">
                서울특별시 전체 구역
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">데이터 유형</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3종류</div>
              <p className="text-xs text-muted-foreground">
                소비 · OD · 관광 데이터
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">선택된 구역</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {selectedDistrict ? selectedDistrict.name : '없음'}
              </div>
              <p className="text-xs text-muted-foreground">
                현재 분석 중인 구역
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">선택된 업종</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {selectedIndustry.class3 || selectedIndustry.class2 || selectedIndustry.class1 || '없음'}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedIndustry.code || '창업 희망 업종'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
