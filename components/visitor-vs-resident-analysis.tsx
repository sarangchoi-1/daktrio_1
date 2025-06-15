'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp, MapPin } from 'lucide-react';
import { 
  analyzeDistrictPopulation,
  type DistrictPopulationData
} from '@/lib/population-data';

interface VisitorVsResidentProps {
  districtName?: string;
}

export default function VisitorVsResidentAnalysis({ districtName }: VisitorVsResidentProps) {
  const [data, setData] = useState<DistrictPopulationData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPopulationData = async () => {
      if (!districtName) {
        setData(null);
        return;
      }

      setLoading(true);
      try {
        // 새로운 지리는데이타 기반 분석 함수 사용
        const analysisResult = await analyzeDistrictPopulation(districtName);
        setData(analysisResult);
      } catch (error) {
        console.error('인구 데이터 로딩 오류:', error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    loadPopulationData();
  }, [districtName]);

  if (loading) {
    return (
      <Card className="p-6 bg-gray-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4" />
            인구 분석
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center">
            <div className="text-sm text-gray-500">데이터 분석 중...</div>
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
            <Users className="h-4 w-4" />
            거주인구 vs 유동인구 분석
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center text-gray-400 text-sm">
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
          <Users className="h-4 w-4" />
          {districtName} 인구 분석
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 인구 비율 시각화 */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>거주인구</span>
            <span>{(data.residentRatio * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${data.residentRatio * 100}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-xs">
            <span>유동인구</span>
            <span>{(data.visitorRatio * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${data.visitorRatio * 100}%` }}
            ></div>
          </div>
        </div>

        {/* 수치 정보 */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-center p-2 bg-blue-50 rounded">
            <div className="font-semibold text-blue-700">
              {data.residentPopulation.toLocaleString()}
            </div>
            <div className="text-blue-600">거주인구</div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded">
            <div className="font-semibold text-green-700">
              {data.visitorPopulation.toLocaleString()}
            </div>
            <div className="text-green-600">유동인구</div>
          </div>
        </div>

        {/* 시장 특성 */}
        <div className="text-center">
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            data.marketType === 'resident-focused' 
              ? 'bg-blue-100 text-blue-700'
              : data.marketType === 'visitor-focused'
              ? 'bg-green-100 text-green-700'
              : 'bg-purple-100 text-purple-700'
          }`}>
            <TrendingUp className="h-3 w-3" />
            {data.marketType === 'resident-focused' 
              ? '거주인구 중심 시장'
              : data.marketType === 'visitor-focused'
              ? '유동인구 중심 시장'
              : '균형 시장'
            }
          </div>
        </div>

        {/* 추천 사항 */}
        <div className="text-xs text-gray-600 text-center bg-gray-50 p-2 rounded">
          <MapPin className="h-3 w-3 inline mr-1" />
          {data.recommendation}
        </div>
      </CardContent>
    </Card>
  );
} 