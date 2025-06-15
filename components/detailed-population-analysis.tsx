'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp, BarChart3, Info } from 'lucide-react';
import { 
  analyzeDistrictPopulationDetailed,
  type DetailedPopulationAnalysis
} from '@/lib/population-data';

interface DetailedPopulationAnalysisProps {
  districtName?: string;
}

export default function DetailedPopulationAnalysisComponent({ districtName }: DetailedPopulationAnalysisProps) {
  const [data, setData] = useState<DetailedPopulationAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadDetailedData = async () => {
      if (!districtName) {
        setData(null);
        return;
      }

      setLoading(true);
      try {
        const analysisResult = await analyzeDistrictPopulationDetailed(districtName);
        setData(analysisResult);
      } catch (error) {
        console.error('상세 인구 데이터 로딩 오류:', error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    loadDetailedData();
  }, [districtName]);

  if (loading) {
    return (
      <Card className="p-6 bg-gray-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <BarChart3 className="h-4 w-4" />
            상세 인구 분석
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-sm text-gray-500">상세 분석 중...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="p-6 bg-gray-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <BarChart3 className="h-4 w-4" />
            상세 인구 분석
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
            지도에서 구를 클릭해주세요
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gray-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <BarChart3 className="h-4 w-4" />
          {districtName} 상세 인구 분석
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 인사이트 */}
        {data.insights.length > 0 && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">주요 인사이트</span>
            </div>
            <ul className="text-xs text-blue-700 space-y-1">
              {data.insights.map((insight, index) => (
                <li key={index}>• {insight}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 성별 분석 */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            성별 분석
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 p-3 rounded">
              <div className="text-xs text-blue-600 mb-1">남성</div>
              <div className="text-sm font-semibold text-blue-800">
                거주 {(data.byGender.MALE.residentRatio * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-blue-600">
                거주: {data.byGender.MALE.residentPopulation.toLocaleString()}명
              </div>
              <div className="text-xs text-blue-600">
                유동: {data.byGender.MALE.visitorPopulation.toLocaleString()}명
              </div>
            </div>
            <div className="bg-pink-50 p-3 rounded">
              <div className="text-xs text-pink-600 mb-1">여성</div>
              <div className="text-sm font-semibold text-pink-800">
                거주 {(data.byGender.FEMALE.residentRatio * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-pink-600">
                거주: {data.byGender.FEMALE.residentPopulation.toLocaleString()}명
              </div>
              <div className="text-xs text-pink-600">
                유동: {data.byGender.FEMALE.visitorPopulation.toLocaleString()}명
              </div>
            </div>
          </div>
        </div>

        {/* 연령대별 분석 */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            연령대별 분석
          </h4>
          <div className="space-y-2">
            {data.byAgeGroup.map((ageData, index) => (
              <div key={index} className="bg-white p-2 rounded border">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium">
                    {ageData.ageGroupName} ({ageData.gender === 'MALE' ? '남성' : '여성'})
                  </span>
                  <span className="text-xs text-gray-600">
                    거주 {(ageData.residentRatio * 100).toFixed(1)}%
                  </span>
                </div>
                
                {/* 거주인구 바 */}
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      ageData.gender === 'MALE' ? 'bg-blue-500' : 'bg-pink-500'
                    }`}
                    style={{ width: `${ageData.residentRatio * 100}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>거주: {ageData.residentPopulation.toLocaleString()}</span>
                  <span>유동: {ageData.visitorPopulation.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 요약 통계 */}
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-xs text-gray-600 mb-2">전체 요약</div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-sm font-semibold text-gray-800">
                {data.overall.totalPopulation.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600">총 인구</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-blue-700">
                {(data.overall.residentRatio * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-600">거주 비율</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-green-700">
                {(data.overall.visitorRatio * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-600">유동 비율</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 