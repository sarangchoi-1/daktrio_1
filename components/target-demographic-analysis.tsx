'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Users, TrendingUp, Info, BarChart3 } from 'lucide-react';
import { 
  analyzeTargetDemographics,
  type TargetDemographicAnalysis
} from '@/lib/target-demographic-analysis';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface TargetDemographicAnalysisProps {
  districtName?: string;
  selectedIndustry?: any;
}

// Custom tooltip for the pie chart
const CustomPieTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
  if (active && payload && payload.length && payload[0].payload.ageGroupName !== '기타') {
    const group = payload[0].payload;
    return (
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '12px 16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        fontSize: '15px',
        color: '#22223b',
        fontWeight: 500,
        minWidth: 120
      }}>
        <div>
          <span style={{ color: payload[0].color, fontWeight: 700 }}>
            {group.ageGroupName} {group.gender === 'MALE' ? '남성' : group.gender === 'FEMALE' ? '여성' : ''}
          </span>
        </div>
        <div style={{ marginTop: 4 }}>
          비율: <span style={{ fontWeight: 700 }}>{(group.ratio * 100).toFixed(1)}%</span>
        </div>
        <div style={{ fontSize: '18px', color: '#22223b', fontWeight: 700, marginTop: 8 }}>
          인구: {group.population?.toLocaleString() ?? '-'}명
        </div>
      </div>
    );
  }
  return null;
};

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

  // Sort topGroups by ratio descending, 기타 always last
  const sortedTopGroups = [...data.topTargetGroups].sort((a, b) => b.ratio - a.ratio);
  const 기타비율 = 1 - sortedTopGroups.reduce((sum, g) => sum + g.ratio, 0);
  const pieData = 기타비율 > 0.001
    ? [
        ...sortedTopGroups,
        { ageGroupName: '기타', gender: '', ratio: 기타비율 }
      ]
    : sortedTopGroups;
  const COLORS = ['#3b82f6', '#22c55e', '#a21caf', '#d1d5db']; // last color for 기타

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
        {/* [지역 특성] section removed */}

        {/* 주요 타겟 그룹 */}
        <div>
          <h4 className="text-sm font-bold mb-3 flex items-center gap-2 bg-gray-200 px-3 py-2 rounded">
            <Users className="h-4 w-4" />
            주요 타겟 그룹 TOP 3
          </h4>
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="ratio"
                  nameKey="ageGroupName"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  startAngle={90}
                  endAngle={-270}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <ul className="mt-2 text-xs text-gray-700 space-y-1">
              {pieData.filter(group => group.ageGroupName !== '기타').map((group, idx) => (
                <li key={idx}>
                  <span
                    className="inline-block w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  ></span>
                  {group.ageGroupName} {group.gender === 'MALE' ? '남성' : '여성'} ({(group.ratio * 100).toFixed(1)}%)
                </li>
              ))}
            </ul>
          </div>
        </div>

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