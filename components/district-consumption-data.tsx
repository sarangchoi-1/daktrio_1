'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

interface DistrictConsumptionDataProps {
  districtName?: string;
  selectedIndustry: any;
  recommendationCriteria: string;
  onDistrictSelect?: (districtName: string) => void; // 지도 연동을 위한 콜백
}

interface DistrictData {
  district: string;
  totalSales: number;
  totalTransactions: number;
  totalStores: number;
  avgSalesPerStore: number;
  yearMonth?: string;
}

interface BubbleChartData {
  district: string;
  x: number; // 총 매출 (억원)
  y: number; // 점포당 매출 (만원)
  z: number; // 가맹점수 (버블 크기용)
  totalSales: number;
  totalTransactions: number;
  totalStores: number;
  avgSalesPerStore: number;
  yearMonth: string;
}

// 구별 색상 팔레트
const DISTRICT_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  '#14B8A6', '#F43F5E', '#8B5A2B', '#64748B', '#DC2626',
  '#059669', '#7C3AED', '#DB2777', '#0891B2', '#65A30D',
  '#EA580C', '#4F46E5', '#0D9488', '#BE185D', '#0369A1'
];

// 월 정보 매핑
const MONTH_INFO: { [key: string]: string } = {
  '관악구': '2020.09', '성북구': '2020.09',
  '금천구': '2020.10', '마포구': '2020.10', '은평구': '2020.10', '중랑구': '2020.10',
  '강남구': '2020.11', '강서구': '2020.11', '구로구': '2020.11', '도봉구': '2020.11',
  '성동구': '2020.11', '송파구': '2020.11', '양천구': '2020.11', '영등포구': '2020.11',
  '강동구': '2020.12', '강북구': '2020.12', '광진구': '2020.12', '노원구': '2020.12',
  '동대문구': '2020.12', '동작구': '2020.12', '서대문구': '2020.12', '서초구': '2020.12',
  '용산구': '2020.12', '종로구': '2020.12', '중구': '2020.12'
};

export default function DistrictConsumptionData({
  districtName,
  selectedIndustry,
  recommendationCriteria,
  onDistrictSelect
}: DistrictConsumptionDataProps) {
  const [data, setData] = useState<DistrictData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictData | null>(null);
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);

  useEffect(() => {
    if (selectedIndustry && Object.keys(selectedIndustry).length > 0) {
      fetchData();
    } else {
      setData([]);
      setSelectedDistrict(null);
    }
    // 업종이나 추천 기준이 변경될 때 선택된 구 해제
    setSelectedDistrict(null);
  }, [selectedIndustry, recommendationCriteria]);

  useEffect(() => {
    // districtName이 변경되면 해당 구를 자동 선택하거나 해제
    if (districtName && data.length > 0) {
      const district = data.find(d => d.district === districtName);
      if (district) {
        setSelectedDistrict(district);
      }
    } else {
      // districtName이 없거나 빈 문자열이면 선택 해제
      setSelectedDistrict(null);
    }
  }, [districtName, data]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/district-consumption', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedIndustry,
          recommendationCriteria
        }),
      });

      if (!response.ok) {
        throw new Error('데이터를 가져오는데 실패했습니다.');
      }

      const result = await response.json();
      setData(result.data || []);
      
      // 첫 번째 구를 기본 선택하는 부분 제거
      // if (result.data && result.data.length > 0) {
      //   setSelectedDistrict(result.data[0]);
      // }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 버블차트 데이터 변환
  const bubbleData: BubbleChartData[] = (() => {
    // 현재 업종의 가맹점 수 범위 계산
    const storeCounts = data.map(item => item.totalStores);
    const minStores = Math.min(...storeCounts);
    const maxStores = Math.max(...storeCounts);
    const storeRange = maxStores - minStores;
    
    // 버블 크기 범위 설정 (최소 8, 최대 25)
    const minBubbleSize = 8;
    const maxBubbleSize = 25;
    const bubbleSizeRange = maxBubbleSize - minBubbleSize;
    
    return data.map((item, index) => {
      // 정규화된 크기 계산 (0~1 범위)
      const normalizedSize = storeRange > 0 ? (item.totalStores - minStores) / storeRange : 0.5;
      // 최종 버블 크기 계산
      const bubbleSize = minBubbleSize + (normalizedSize * bubbleSizeRange);
      
      return {
        district: item.district,
        x: Math.round(item.totalSales / 100000000 * 10) / 10, // 억원 단위
        y: Math.round(item.avgSalesPerStore / 10000), // 만원 단위
        z: bubbleSize, // 동적으로 계산된 버블 크기
        totalSales: item.totalSales,
        totalTransactions: item.totalTransactions,
        totalStores: item.totalStores,
        avgSalesPerStore: item.avgSalesPerStore,
        yearMonth: MONTH_INFO[item.district] || '2020.?'
      };
    });
  })();

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.district}</p>
          <p className="text-sm text-gray-600">데이터 기준: {data.yearMonth}</p>
          <p className="text-sm">총 매출: <span className="font-medium">{data.x}억원</span></p>
          <p className="text-sm">점포당 매출: <span className="font-medium">{data.y}만원</span></p>
          <p className="text-sm">가맹점 수: <span className="font-medium">{data.totalStores.toLocaleString()}개</span></p>
          <p className="text-xs text-gray-500 mt-1">클릭하여 상세 정보 보기</p>
        </div>
      );
    }
    return null;
  };

  // 버블 클릭 핸들러
  const handleBubbleClick = (data: any) => {
    const districtData = bubbleData.find(item => item.district === data.district);
    if (districtData) {
      // 이미 선택된 구를 다시 클릭하면 선택 해제
      if (selectedDistrict?.district === data.district) {
        setSelectedDistrict(null);
        if (onDistrictSelect) {
          onDistrictSelect(''); // 빈 문자열로 선택 해제
        }
      } else {
        const newSelected = {
          district: districtData.district,
          totalSales: districtData.totalSales,
          totalTransactions: districtData.totalTransactions,
          totalStores: districtData.totalStores,
          avgSalesPerStore: districtData.avgSalesPerStore
        };
        setSelectedDistrict(newSelected);
        
        // 지도에 선택된 구 전달
        if (onDistrictSelect) {
          onDistrictSelect(districtData.district);
        }
      }
    }
  };

  // 버블 마우스 오버 핸들러
  const handleBubbleMouseEnter = (data: any) => {
    setHoveredDistrict(data.district);
  };

  const handleBubbleMouseLeave = () => {
    setHoveredDistrict(null);
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">데이터를 불러오는 중...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="py-8">
          <div className="text-center text-red-600">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!selectedIndustry || Object.keys(selectedIndustry).length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="py-8">
          <div className="text-center text-gray-500">
            <p>업종을 선택해주세요</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* 버블차트 */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">
            구별 시장 분석 - {selectedIndustry.소분류 || selectedIndustry.중분류 || selectedIndustry.대분류}
          </CardTitle>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• X축: 총 매출 (시장 크기) • Y축: 점포당 매출 (수익성) • 버블 크기: 가맹점 수 (경쟁도)</p>
            <p>• 버블을 클릭하면 해당 구의 상세 정보를 확인할 수 있습니다</p>
          </div>
        </CardHeader>
        <CardContent>
          <div 
            className="relative w-full h-96 border rounded bg-gray-50"
            style={{ overflow: 'visible' }}
            onClick={(e) => {
              // 배경 클릭 시 선택 해제 (버블이 아닌 빈 공간 클릭)
              if (e.target === e.currentTarget) {
                setSelectedDistrict(null);
                if (onDistrictSelect) {
                  onDistrictSelect('');
                }
              }
            }}
          >
            {/* 축 라벨 */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-2 text-sm text-gray-600" style={{ zIndex: 1 }}>
              총 매출 (억원)
            </div>
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -rotate-90 ml-4 text-sm text-gray-600" style={{ zIndex: 1 }}>
              점포당 매출 (만원)
            </div>
            
            {/* 그리드 라인 */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {/* 세로 그리드 */}
              {[0, 1, 2, 3, 4].map(i => (
                <line
                  key={`v-${i}`}
                  x1={`${20 + i * 15}%`}
                  y1="10%"
                  x2={`${20 + i * 15}%`}
                  y2="85%"
                  stroke="#e5e7eb"
                  strokeDasharray="2,2"
                />
              ))}
              {/* 가로 그리드 */}
              {[0, 1, 2, 3, 4].map(i => (
                <line
                  key={`h-${i}`}
                  x1="20%"
                  y1={`${85 - i * 15}%`}
                  x2="95%"
                  y2={`${85 - i * 15}%`}
                  stroke="#e5e7eb"
                  strokeDasharray="2,2"
                />
              ))}
            </svg>
            
            {/* 버블들 */}
            {bubbleData.length > 0 && (() => {
              const xMin = Math.min(...bubbleData.map(d => d.x));
              const xMax = Math.max(...bubbleData.map(d => d.x));
              const yMin = Math.min(...bubbleData.map(d => d.y));
              const yMax = Math.max(...bubbleData.map(d => d.y));
              
              // 추천 기준에 따라 데이터 정렬하여 상위 3개 구하기
              let sortedData = [...bubbleData];
              if (recommendationCriteria === 'avgSalesPerStore') {
                sortedData.sort((a, b) => b.avgSalesPerStore - a.avgSalesPerStore);
              } else if (recommendationCriteria === 'totalSales') {
                sortedData.sort((a, b) => b.totalSales - a.totalSales);
              } else if (recommendationCriteria === 'totalTransactions') {
                sortedData.sort((a, b) => b.totalTransactions - a.totalTransactions);
              }
              const top3Districts = new Set(sortedData.slice(0, 3).map(d => d.district));
              
              return bubbleData.map((entry, index) => {
                const isSelected = selectedDistrict?.district === entry.district;
                const isHovered = hoveredDistrict === entry.district;
                const isOtherSelected = selectedDistrict && selectedDistrict.district !== entry.district;
                const isOtherHovered = hoveredDistrict && hoveredDistrict !== entry.district;
                const isTop3 = top3Districts.has(entry.district);
                
                // 위치 계산 (20%~95% 범위에서)
                const xPos = 20 + ((entry.x - xMin) / (xMax - xMin || 1)) * 75;
                const yPos = 85 - ((entry.y - yMin) / (yMax - yMin || 1)) * 75;
                
                // 색상 결정: 상위 3개는 파란색, 나머지는 회색
                const bubbleColor = isTop3 ? '#3B82F6' : '#9CA3AF';
                
                // 정보 박스 위치 결정 (화면 너비를 고려)
                const bubbleRightEdge = xPos + entry.z;
                const showInfoOnLeft = bubbleRightEdge > 70; // 70% 이상이면 왼쪽에 표시
                
                return (
                  <div
                    key={`bubble-${index}`}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200"
                    style={{
                      left: `${xPos}%`,
                      top: `${yPos}%`,
                      width: `${entry.z * 2}px`,
                      height: `${entry.z * 2}px`,
                      backgroundColor: bubbleColor,
                      opacity: isSelected || isHovered 
                        ? 0.9 
                        : (isOtherSelected || isOtherHovered) 
                          ? 0.3 
                          : 0.7,
                      borderRadius: '50%',
                      border: isSelected ? '2px solid #333' : 'none',
                    }}
                    onClick={(e) => {
                      e.stopPropagation(); // 이벤트 버블링 방지
                      handleBubbleClick(entry);
                    }}
                    onMouseEnter={() => handleBubbleMouseEnter(entry)}
                    onMouseLeave={handleBubbleMouseLeave}
                    title={`${entry.district}: 총매출 ${entry.x}억원, 점포당매출 ${entry.y}만원, 가맹점수 ${entry.totalStores}개`}
                  >
                    {/* 상위 3개 구에만 이름 라벨 표시 - 버블 옆에 */}
                    {isTop3 && (
                      <div 
                        className="absolute text-xs font-medium text-gray-800 pointer-events-none whitespace-nowrap"
                        style={{
                          left: `${entry.z * 2 + 8}px`,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          opacity: 1,
                          zIndex: 10
                        }}
                      >
                        {entry.district.endsWith('구') ? entry.district.slice(0, -1) : entry.district}
                      </div>
                                          )}
                      
                      {/* 선택된 구의 상세 정보 - 버블 근처에 작은 카드로 */}
                      {isSelected && (
                        <div 
                          className="absolute bg-white border border-gray-300 rounded-lg shadow-lg p-3 pointer-events-none"
                          style={{
                            left: showInfoOnLeft ? `${-216}px` : `${entry.z * 2 + 16}px`,
                            top: `-40px`,
                            minWidth: '200px',
                            zIndex: 999999 // 최상위 레이어
                          }}
                        >
                          <div className="text-sm font-semibold text-gray-800 mb-2">
                            {entry.district} 소비 데이터
                          </div>
                          <div className="text-xs text-gray-600 mb-2">
                            데이터 기준: {entry.yearMonth}
                          </div>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-600">총 매출:</span>
                              <span className="font-medium">{entry.x}억원</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">점포당 매출:</span>
                              <span className="font-medium">{entry.y}만원</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">가맹점 수:</span>
                              <span className="font-medium">{entry.totalStores.toLocaleString()}개</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">거래건수:</span>
                              <span className="font-medium">{Math.round(entry.totalTransactions / 10000).toLocaleString()}만건</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                );
              });
            })()}
            

            
            {/* 선택된 구의 참조선 */}
            {selectedDistrict && (() => {
              const selectedBubble = bubbleData.find(d => d.district === selectedDistrict.district);
              if (selectedBubble && bubbleData.length > 0) {
                const xMin = Math.min(...bubbleData.map(d => d.x));
                const xMax = Math.max(...bubbleData.map(d => d.x));
                const yMin = Math.min(...bubbleData.map(d => d.y));
                const yMax = Math.max(...bubbleData.map(d => d.y));
                
                const xPos = 20 + ((selectedBubble.x - xMin) / (xMax - xMin || 1)) * 75;
                const yPos = 85 - ((selectedBubble.y - yMin) / (yMax - yMin || 1)) * 75;
                
                return (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {/* 세로 참조선 */}
                    <line
                      x1={`${xPos}%`}
                      y1="10%"
                      x2={`${xPos}%`}
                      y2="85%"
                      stroke="#666"
                      strokeDasharray="4,4"
                      strokeOpacity={0.6}
                    />
                    {/* 가로 참조선 */}
                    <line
                      x1="20%"
                      y1={`${yPos}%`}
                      x2="95%"
                      y2={`${yPos}%`}
                      stroke="#666"
                      strokeDasharray="4,4"
                      strokeOpacity={0.6}
                    />
                  </svg>
                );
              }
              return null;
            })()}
            
            {/* 축 눈금 라벨 */}
            {bubbleData.length > 0 && (() => {
              const xMin = Math.min(...bubbleData.map(d => d.x));
              const xMax = Math.max(...bubbleData.map(d => d.x));
              const yMin = Math.min(...bubbleData.map(d => d.y));
              const yMax = Math.max(...bubbleData.map(d => d.y));
              
              return (
                <>
                  {/* X축 눈금 */}
                  {[0, 1, 2, 3, 4].map(i => (
                    <div
                      key={`x-label-${i}`}
                      className="absolute text-xs text-gray-600"
                      style={{
                        left: `${20 + i * 18.75}%`,
                        bottom: '8px',
                        transform: 'translateX(-50%)'
                      }}
                    >
                      {(xMin + (xMax - xMin) * i / 4).toFixed(1)}
                    </div>
                  ))}
                  {/* Y축 눈금 */}
                  {[0, 1, 2, 3, 4].map(i => (
                    <div
                      key={`y-label-${i}`}
                      className="absolute text-xs text-gray-600"
                      style={{
                        left: '8px',
                        top: `${85 - i * 18.75}%`,
                        transform: 'translateY(50%)'
                      }}
                    >
                      {Math.round(yMin + (yMax - yMin) * i / 4)}
                    </div>
                  ))}
                </>
              );
            })()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 