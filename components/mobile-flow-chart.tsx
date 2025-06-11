"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { parseMobileFlowCSV, processFlowData, formatCount, type MobileFlowRecord, type ProcessedFlowData } from "@/lib/mobile-flow-data"
import { Clock, Calendar, Users, TrendingUp } from "lucide-react"

interface MobileFlowChartProps {
  selectedDistrict?: string;
}

interface HoverData {
  type: 'time' | 'weekday';
  value: string | number;
  genderData: { gender: 'M' | 'F'; count: number }[];
  ageData: { ageGroup: number; ageLabel: string; count: number }[];
}

// 커스텀 툴팁 컴포넌트
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const genderData = data.genderBreakdown || [];
    const ageData = data.ageBreakdown || [];
    
    // 연령대 라벨 매핑
    const ageLabels: Record<number, string> = {
      1: '10대 이하', 2: '20대', 3: '30대', 4: '40대',
      5: '50대', 6: '60대', 7: '70대 이상'
    };

    return (
      <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg max-w-xs">
        <p className="font-bold text-gray-800 mb-2 text-sm">{label} 상세</p>
        <p className="text-blue-600 font-semibold mb-2 text-sm">
          총 유동인구: {formatCount(data.count)}
        </p>
        
        {/* 성별 분포 */}
        <div className="mb-2">
          <p className="text-xs font-medium text-gray-700 mb-1">성별 분포:</p>
          {genderData.map((item: any, index: number) => (
            <div key={index} className="flex items-center gap-1 text-xs">
              <div className={`w-2 h-2 rounded ${item.gender === 'M' ? 'bg-blue-500' : 'bg-pink-500'}`}></div>
              <span>{item.gender === 'M' ? '남성' : '여성'}: {formatCount(item.count)}</span>
            </div>
          ))}
        </div>

        {/* 연령대 분포 */}
        <div>
          <p className="text-xs font-medium text-gray-700 mb-1">연령대 분포:</p>
          {ageData.slice(0, 3).map((item: any, index: number) => (
            <div key={index} className="flex items-center gap-1 text-xs">
              <div className="w-2 h-2 rounded bg-orange-500"></div>
              <span>{ageLabels[item.ageGroup]}: {formatCount(item.count)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function MobileFlowChart({ selectedDistrict }: MobileFlowChartProps) {
  console.log('MobileFlowChart 컴포넌트 렌더링 시작, selectedDistrict:', selectedDistrict);
  
  const [flowData, setFlowData] = useState<ProcessedFlowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoverData, setHoverData] = useState<HoverData | null>(null);
  const [activeTab, setActiveTab] = useState<'time' | 'weekday'>('time');
  
  // 타이머 관리를 위한 ref
  const clearTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // 호버된 막대 인덱스 추적
  const [hoveredTimeIndex, setHoveredTimeIndex] = useState<number | null>(null);
  const [hoveredWeekdayIndex, setHoveredWeekdayIndex] = useState<number | null>(null);

  useEffect(() => {
    loadFlowData();
  }, [selectedDistrict]);

  const loadFlowData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('데이터 로딩 시작...');
      const response = await fetch('/data/유플러스_유동인구.csv');
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`데이터 파일을 불러올 수 없습니다 (${response.status})`);
      }
      
      const csvText = await response.text();
      console.log('CSV 텍스트 길이:', csvText.length);
      console.log('CSV 첫 100자:', csvText.substring(0, 100));
      
      const records = parseMobileFlowCSV(csvText);
      console.log('파싱된 레코드 수:', records.length);
      console.log('첫 번째 레코드:', records[0]);
      
      const processed = processFlowData(records, selectedDistrict);
      console.log('처리된 데이터:', processed);
      
      setFlowData(processed);
    } catch (err) {
      console.error('데이터 로딩 오류:', err);
      setError(err instanceof Error ? err.message : '데이터 로딩에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeBarHover = (hourData: any) => {
    console.log('handleTimeBarHover 직접 호출:', hourData);
    
    // 기존 타이머가 있다면 취소
    if (clearTimeoutRef.current) {
      clearTimeout(clearTimeoutRef.current);
      clearTimeoutRef.current = null;
    }
    
    if (!hourData) {
      console.log('hourData가 없음');
      return;
    }

    // 기본값 설정 - 데이터가 없는 경우 빈 배열로 초기화
    const genderBreakdown = hourData.genderBreakdown || [];
    const ageBreakdown = hourData.ageBreakdown || [];

    console.log('성별/연령 데이터:', { genderBreakdown, ageBreakdown });

    // 연령대 데이터 변환
    const ageData = ageBreakdown.map((item: any) => {
      const ageLabels: Record<number, string> = {
        1: '10대 이하', 2: '20대', 3: '30대', 4: '40대',
        5: '50대', 6: '60대', 7: '70대 이상'
      };
      return {
        ageGroup: item.ageGroup,
        ageLabel: ageLabels[item.ageGroup] || `${item.ageGroup}그룹`,
        count: item.count
      };
    });

    const newHoverData = {
      type: 'time' as const,
      value: hourData.hour,
      genderData: genderBreakdown,
      ageData
    };

    console.log('새로운 호버 데이터:', newHoverData);
    setHoverData(newHoverData);
  };

  const handleWeekdayBarHover = (weekdayData: any) => {
    console.log('handleWeekdayBarHover 직접 호출:', weekdayData);
    
    // 기존 타이머가 있다면 취소
    if (clearTimeoutRef.current) {
      clearTimeout(clearTimeoutRef.current);
      clearTimeoutRef.current = null;
    }
    
    if (!weekdayData) {
      console.log('weekdayData가 없음');
      return;
    }

    // 기본값 설정 - 데이터가 없는 경우 빈 배열로 초기화
    const genderBreakdown = weekdayData.genderBreakdown || [];
    const ageBreakdown = weekdayData.ageBreakdown || [];

    // 연령대 데이터 변환
    const ageData = ageBreakdown.map((item: any) => {
      const ageLabels: Record<number, string> = {
        1: '10대 이하', 2: '20대', 3: '30대', 4: '40대',
        5: '50대', 6: '60대', 7: '70대 이상'
      };
      return {
        ageGroup: item.ageGroup,
        ageLabel: ageLabels[item.ageGroup] || `${item.ageGroup}그룹`,
        count: item.count
      };
    });

    const newHoverData = {
      type: 'weekday' as const,
      value: weekdayData.weekday,
      genderData: genderBreakdown,
      ageData
    };

    console.log('새로운 요일 호버 데이터:', newHoverData);
    setHoverData(newHoverData);
  };

  const clearHover = () => {
    console.log('clearHover 호출됨');
    setHoverData(null);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            유동인구 분석 (로딩 중...)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">데이터를 불러오는 중...</p>
              <p className="text-sm text-gray-500 mt-2">선택된 구: {selectedDistrict || '전체'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            유동인구 분석 (오류 발생)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-red-600">
              <p className="font-bold">오류: {error}</p>
              <p className="text-sm mt-2">선택된 구: {selectedDistrict || '전체'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!flowData) return null;

  // 차트 데이터 포맷팅
  const timeChartData = flowData.timeData.map(item => ({
    ...item,
    hourLabel: `${item.hour}시`,
    count: item.totalCount
  }));

  const weekdayChartData = flowData.weekdayData.map(item => ({
    ...item,
    weekdayLabel: item.weekday,
    count: item.totalCount
  }));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-4 w-4" />
          유동인구 분석
          {selectedDistrict && (
            <span className="text-xs font-normal text-blue-600 ml-2">
              - {selectedDistrict}
            </span>
          )}
        </CardTitle>
        <CardDescription className="text-xs">
          시간대별 및 요일별 유동인구 현황
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'time' | 'weekday')}>
            <TabsList className="grid w-full grid-cols-2 h-8">
              <TabsTrigger value="time" className="flex items-center gap-1 text-xs">
                <Clock className="h-3 w-3" />
                시간대별
              </TabsTrigger>
              <TabsTrigger value="weekday" className="flex items-center gap-1 text-xs">
                <Calendar className="h-3 w-3" />
                요일별
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="time" className="mt-4">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={timeChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hourLabel" fontSize={10} />
                  <YAxis tickFormatter={formatCount} fontSize={10} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="count" 
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="weekday" className="mt-4">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weekdayChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="weekdayLabel" fontSize={10} />
                  <YAxis tickFormatter={formatCount} fontSize={10} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="count" 
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>

          {/* 전체 통계 - 세로 배치로 변경 */}
          <div className="space-y-2 mt-3">
            <Card className="p-2">
              <div className="text-center">
                <div className="text-sm font-bold text-blue-600">
                  {formatCount(flowData.timeData.reduce((sum, item) => sum + item.totalCount, 0))}
                </div>
                <div className="text-xs text-gray-600">총 유동인구</div>
              </div>
            </Card>
            <Card className="p-2">
              <div className="text-center">
                <div className="text-sm font-bold text-orange-600">
                  {hoverData ? `${hoverData.value}${hoverData.type === 'time' ? '시' : '요일'}` : '선택 대기'}
                </div>
                <div className="text-xs text-gray-600">선택된 항목</div>
              </div>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 