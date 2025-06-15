"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { Separator } from "@/components/ui/separator"
import { ArrowRight, TrendingUp, Users, Clock, Calendar, Target } from 'lucide-react'
import { 
  loadAllDistrictData, 
  calculateDistrictStats, 
  type DistrictCardRecord,
  type IndustryRecommendationData 
} from "@/lib/district-card-data"
import keywordsData from "@/data/자치구별_키워드_top3.json"

interface DistrictComparisonProps {
  selectedIndustry: { 대분류?: string; 중분류?: string; 소분류?: string };
}

interface ComparisonData {
  district: string;
  totalSales: number;
  avgSalesPerStore: number;
  totalStores: number;
  totalTransactions: number;
  keywords: string[];
  rank: number;
}

const SEOUL_DISTRICTS = [
  '강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구',
  '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구',
  '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'
];

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];

export default function DistrictComparison({ selectedIndustry }: DistrictComparisonProps) {
  const [district1, setDistrict1] = useState<string>('');
  const [district2, setDistrict2] = useState<string>('');
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [districtStats, setDistrictStats] = useState<IndustryRecommendationData>({});
  const [loading, setLoading] = useState(false);

  // 업종 선택 시 데이터 로드
  useEffect(() => {
    if (selectedIndustry && Object.keys(selectedIndustry).length > 0) {
      loadComparisonData();
    }
  }, [selectedIndustry]);

  const loadComparisonData = async () => {
    setLoading(true);
    try {
      const data = await loadAllDistrictData();
      const stats = calculateDistrictStats(data, selectedIndustry);
      setDistrictStats(stats);
      
      // 구별 데이터 생성
      const districts = Object.keys(stats);
      const sortedDistricts = districts.sort((a, b) => 
        stats[b].avgSalesPerStore - stats[a].avgSalesPerStore
      );
      
      const comparisonList: ComparisonData[] = sortedDistricts.map((district, index) => {
        const keywordInfo = keywordsData.find(item => item.자치구 === district);
        return {
          district,
          totalSales: stats[district].totalSales,
          avgSalesPerStore: stats[district].avgSalesPerStore,
          totalStores: stats[district].totalStores,
          totalTransactions: stats[district].totalTransactions,
          keywords: keywordInfo ? [keywordInfo.키워드1, keywordInfo.키워드2, keywordInfo.키워드3] : [],
          rank: index + 1
        };
      });
      
      setComparisonData(comparisonList);
    } catch (error) {
      console.error('비교 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIndividualChartData = () => {
    if (!district1 || !district2) return [];
    
    const data1 = comparisonData.find(d => d.district === district1);
    const data2 = comparisonData.find(d => d.district === district2);
    
    if (!data1 || !data2) return [];
    
    return [
      {
        title: '총 매출',
        unit: '억원',
        data: [
          { name: district1, value: Math.round(data1.totalSales / 100000000 * 10) / 10 },
          { name: district2, value: Math.round(data2.totalSales / 100000000 * 10) / 10 }
        ]
      },
      {
        title: '점포당 매출',
        unit: '십만원',
        data: [
          { name: district1, value: Math.round(data1.avgSalesPerStore / 100000) },
          { name: district2, value: Math.round(data2.avgSalesPerStore / 100000) }
        ]
      },
      {
        title: '가맹점 수',
        unit: '개',
        data: [
          { name: district1, value: data1.totalStores },
          { name: district2, value: data2.totalStores }
        ]
      },
      {
        title: '거래건수',
        unit: '천건',
        data: [
          { name: district1, value: Math.round(data1.totalTransactions / 1000) },
          { name: district2, value: Math.round(data2.totalTransactions / 1000) }
        ]
      }
    ];
  };

  const getComparisonChartData = () => {
    if (!district1 || !district2) return [];
    
    const data1 = comparisonData.find(d => d.district === district1);
    const data2 = comparisonData.find(d => d.district === district2);
    
    if (!data1 || !data2) return [];
    
    return [
      {
        metric: '총매출',
        unit: '(억원)',
        [district1]: Math.round(data1.totalSales / 100000000 * 10) / 10, // 억원 단위로 변환 (소수점 1자리)
        [district2]: Math.round(data2.totalSales / 100000000 * 10) / 10
      },
      {
        metric: '점포당매출',
        unit: '(십만원)',
        [district1]: Math.round(data1.avgSalesPerStore / 100000), // 십만원 단위로 변환
        [district2]: Math.round(data2.avgSalesPerStore / 100000)
      },
      {
        metric: '가맹점수',
        unit: '(개)',
        [district1]: data1.totalStores,
        [district2]: data2.totalStores
      },
      {
        metric: '거래건수',
        unit: '(천건)',
        [district1]: Math.round(data1.totalTransactions / 1000), // 천 단위로 변환
        [district2]: Math.round(data2.totalTransactions / 1000)
      }
    ];
  };

  const getRankComparison = () => {
    if (!district1 || !district2) return null;
    
    const data1 = comparisonData.find(d => d.district === district1);
    const data2 = comparisonData.find(d => d.district === district2);
    
    if (!data1 || !data2) return null;
    
    return { data1, data2 };
  };

  // 추천 순위별로 정렬된 구 목록 가져오기
  const getSortedDistricts = () => {
    if (comparisonData.length === 0) {
      return SEOUL_DISTRICTS; // 데이터가 없으면 기본 순서
    }
    return comparisonData.map(data => data.district);
  };

  const sortedDistricts = getSortedDistricts();

  const chartData = getComparisonChartData();
  const individualCharts = getIndividualChartData();
  const rankComparison = getRankComparison();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="text-gray-500">데이터를 로딩중입니다...</div>
      </div>
    );
  }

  if (!selectedIndustry || Object.keys(selectedIndustry).length === 0) {
    return (
      <Card className="p-20">
        <div className="text-center text-gray-500">
          <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">업종을 선택해주세요</h3>
          <p className="text-sm">구별 비교를 위해 먼저 업종을 선택해주세요.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 구 선택 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            구별 비교 - {selectedIndustry.소분류 || selectedIndustry.중분류 || selectedIndustry.대분류}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div>
              <label className="text-sm font-medium mb-2 block">첫 번째 구</label>
              <Select value={district1} onValueChange={setDistrict1}>
                <SelectTrigger>
                  <SelectValue placeholder="구를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {sortedDistricts.map(district => (
                    <SelectItem key={district} value={district} disabled={district === district2}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-center">
              <div className="flex items-center gap-2 text-gray-400">
                <ArrowRight className="h-4 w-4" />
                <span className="text-sm">VS</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">두 번째 구</label>
              <Select value={district2} onValueChange={setDistrict2}>
                <SelectTrigger>
                  <SelectValue placeholder="구를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {sortedDistricts.map(district => (
                    <SelectItem key={district} value={district} disabled={district === district1}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 비교 결과 */}
      {district1 && district2 && individualCharts.length > 0 && (
        <>
          {/* 순위 및 기본 정보 비교 */}
          {rankComparison && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[rankComparison.data1, rankComparison.data2].map((data, index) => (
                <Card key={data.district} className={index === 0 ? "border-blue-200" : "border-green-200"}>
                  <CardHeader className={index === 0 ? "bg-blue-50" : "bg-green-50"}>
                    <CardTitle className="flex items-center justify-between">
                      <span>{data.district}</span>
                      <Badge variant={data.rank <= 3 ? "default" : data.rank <= 10 ? "secondary" : "outline"}>
                        {data.rank}위
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">총 매출</div>
                        <div className="font-semibold">{data.totalSales.toLocaleString()}억원</div>
                      </div>
                      <div>
                        <div className="text-gray-600">점포당 매출</div>
                        <div className="font-semibold">{data.avgSalesPerStore.toLocaleString()}만원</div>
                      </div>
                      <div>
                        <div className="text-gray-600">가맹점 수</div>
                        <div className="font-semibold">{data.totalStores.toLocaleString()}개</div>
                      </div>
                      <div>
                        <div className="text-gray-600">거래건수</div>
                        <div className="font-semibold">{Math.round(data.totalTransactions / 1000).toLocaleString()}천건</div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <div className="text-sm text-gray-600 mb-2">지역 특성 키워드</div>
                      <div className="flex gap-1 flex-wrap">
                        {data.keywords.map((keyword, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            #{keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* 시장 규모 비교 차트 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                시장 규모 비교
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {individualCharts.map((chart, index) => (
                  <div key={chart.title} className="space-y-2">
                    <h4 className="text-sm font-medium text-center">{chart.title} ({chart.unit})</h4>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chart.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value: any) => [
                              `${value?.toLocaleString()}${chart.unit}`, 
                              chart.title
                            ]}
                          />
                          <Bar 
                            dataKey="value" 
                            fill={chart.data.findIndex(d => d.name === district1) === 0 ? "#3B82F6" : "#059669"}
                          >
                            {chart.data.map((entry, idx) => (
                              <Cell 
                                key={`cell-${idx}`} 
                                fill={entry.name === district1 ? "#3B82F6" : "#059669"} 
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 승부 결과 요약 */}
          <Card>
            <CardHeader>
              <CardTitle>비교 결과 요약</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: '총 매출', key: 'totalSales', unit: '억원', transform: (val: number) => Math.round(val / 100000000 * 10) / 10 },
                  { label: '점포당 매출', key: 'avgSalesPerStore', unit: '십만원', transform: (val: number) => Math.round(val / 100000) },
                  { label: '가맹점 수', key: 'totalStores', unit: '개', transform: (val: number) => val },
                  { label: '총 거래건수', key: 'totalTransactions', unit: '천건', transform: (val: number) => Math.round(val / 1000) }
                ].map(({ label, key, unit, transform }) => {
                  const data1 = rankComparison?.data1;
                  const data2 = rankComparison?.data2;
                  if (!data1 || !data2) return null;
                  
                  const value1 = data1[key as keyof ComparisonData] as number;
                  const value2 = data2[key as keyof ComparisonData] as number;
                  const transformedValue1 = transform(value1);
                  const transformedValue2 = transform(value2);
                  const winner = value1 > value2 ? district1 : district2;
                  const isDistrict1Winner = winner === district1;
                  
                  return (
                    <div key={key} className="text-center p-4 border rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">{label}</div>
                      <div className={`font-bold text-lg ${isDistrict1Winner ? 'text-blue-600' : 'text-green-600'}`}>
                        {winner} 승
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {isDistrict1Winner ? 
                          `${transformedValue1.toLocaleString()} > ${transformedValue2.toLocaleString()}${unit}` :
                          `${transformedValue2.toLocaleString()} > ${transformedValue1.toLocaleString()}${unit}`
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* 구가 선택되지 않은 경우 */}
      {(!district1 || !district2) && (
        <Card className="p-20">
          <div className="text-center text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">구를 선택해주세요</h3>
            <p className="text-sm">비교할 두 개의 구를 선택하면 상세한 비교 분석을 확인할 수 있습니다.</p>
          </div>
        </Card>
      )}
    </div>
  );
} 