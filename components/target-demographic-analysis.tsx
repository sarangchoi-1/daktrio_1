'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Users, TrendingUp, Info, BarChart3 } from 'lucide-react';
import { 
  analyzeTargetDemographics,
  type TargetDemographicAnalysis
} from '@/lib/target-demographic-analysis';

interface TargetDemographicAnalysisProps {
  districtName?: string;
  selectedIndustry?: any;
}

export default function TargetDemographicAnalysisComponent({ 
  districtName, 
  selectedIndustry 
}: TargetDemographicAnalysisProps) {
  const [data, setData] = useState<TargetDemographicAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadAnalysis = async () => {
      if (!districtName || !selectedIndustry || Object.keys(selectedIndustry).length === 0) {
        setData(null);
        return;
      }

      setLoading(true);
      try {
        const analysisResult = await analyzeTargetDemographics(districtName, selectedIndustry);
        setData(analysisResult);
      } catch (error) {
        console.error('타겟 분석 로딩 오류:', error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    loadAnalysis();
  }, [districtName, selectedIndustry]);

  if (loading) {
    return (
      <Card className="p-6 bg-gray-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4" />
            타겟 고객층 분석
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-sm text-gray-500">분석 중...</div>
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
            <Target className="h-4 w-4" />
            타겟 고객층 분석
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
            {!districtName ? '지도에서 구를 클릭해주세요' : 
             !selectedIndustry || Object.keys(selectedIndustry).length === 0 ? '업종을 선택해주세요' :
             '데이터를 불러올 수 없습니다'}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gray-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Target className="h-4 w-4" />
          {districtName} 타겟 고객층 분석
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 업종 성과 정보 */}
        {data.industryPerformance && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-xs font-medium text-blue-800 mb-2">
              {data.industryPerformance.industryName} 성과
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-blue-600">총 매출</div>
                <div className="font-semibold text-blue-800">
                  {(data.industryPerformance.totalSales / 1000000).toFixed(0)}백만원
                </div>
              </div>
              <div>
                <div className="text-blue-600">점포 수</div>
                <div className="font-semibold text-blue-800">
                  {data.industryPerformance.storeCount}개
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 인사이트 */}
        {data.insights.length > 0 && (
          <div className="bg-yellow-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">지역 특성</span>
            </div>
            <ul className="text-xs text-yellow-700 space-y-1">
              {data.insights.map((insight, index) => (
                <li key={index}>• {insight}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 주요 타겟 그룹 */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            주요 타겟 그룹 TOP 3
          </h4>
          <div className="space-y-2">
            {data.topTargetGroups.map((group, index) => (
              <div key={index} className="bg-white p-3 rounded border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">
                    #{index + 1} {group.ageGroupName} {group.gender === 'MALE' ? '남성' : '여성'}
                  </span>
                  <span className="text-xs text-gray-600">
                    {(group.ratio * 100).toFixed(1)}%
                  </span>
                </div>
                
                {/* 비율 바 */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      index === 0 ? 'bg-blue-500' : 
                      index === 1 ? 'bg-green-500' : 'bg-purple-500'
                    }`}
                    style={{ width: `${group.ratio * 100}%` }}
                  ></div>
                </div>
                
                <div className="text-xs text-gray-500">
                  인구: {group.population.toLocaleString()}명
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 추천 사항 */}
        {data.recommendations.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              마케팅 추천
            </h4>
            <div className="space-y-2">
              {data.recommendations.map((recommendation, index) => (
                <div key={index} className="bg-green-50 p-2 rounded text-xs text-green-700">
                  • {recommendation}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 전체 인구 분포 요약 */}
        <div className="bg-gray-50 p-3 rounded">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-gray-600" />
            <span className="text-xs font-medium text-gray-700">인구 분포 요약</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="text-gray-600">남성 비율</div>
              <div className="font-semibold text-gray-800">
                {(data.demographicProfile
                  .filter(d => d.gender === 'MALE')
                  .reduce((sum, d) => sum + d.ratio, 0) * 100
                ).toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-gray-600">여성 비율</div>
              <div className="font-semibold text-gray-800">
                {(data.demographicProfile
                  .filter(d => d.gender === 'FEMALE')
                  .reduce((sum, d) => sum + d.ratio, 0) * 100
                ).toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-gray-600">20-40대 비율</div>
              <div className="font-semibold text-gray-800">
                {(data.demographicProfile
                  .filter(d => d.ageGroup >= 2 && d.ageGroup <= 4)
                  .reduce((sum, d) => sum + d.ratio, 0) * 100
                ).toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-gray-600">50대 이상 비율</div>
              <div className="font-semibold text-gray-800">
                {(data.demographicProfile
                  .filter(d => d.ageGroup >= 5)
                  .reduce((sum, d) => sum + d.ratio, 0) * 100
                ).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 