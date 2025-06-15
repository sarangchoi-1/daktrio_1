"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { 
  loadDistrictMobileFlowData, 
  aggregateByTimeZone, 
  aggregateByDayOfWeek,
  transformToTimeZoneChartData,
  transformToDayOfWeekChartData,
  AGE_GROUP_MAPPING,
  type DistrictMobileFlowRecord
} from "@/lib/mobile-flow-data"

interface MobileFlowChartNewProps {
  selectedDistrict?: string | null
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb']

export function MobileFlowChartNew({ selectedDistrict }: MobileFlowChartNewProps) {
  const [flowData, setFlowData] = useState<DistrictMobileFlowRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("time")

  useEffect(() => {
    if (selectedDistrict) {
      loadFlowData(selectedDistrict)
    } else {
      setFlowData([])
    }
  }, [selectedDistrict])

  const loadFlowData = async (district: string) => {
    setIsLoading(true)
    try {
      const data = await loadDistrictMobileFlowData(district)
      setFlowData(data)
    } catch (error) {
      console.error("Failed to load flow data:", error)
      setFlowData([])
    } finally {
      setIsLoading(false)
    }
  }

  // 시간대별 데이터 처리
  const timeZoneAggregated = aggregateByTimeZone(flowData)
  const timeZoneChartData = transformToTimeZoneChartData(timeZoneAggregated)

  // 요일별 데이터 처리  
  const dayOfWeekAggregated = aggregateByDayOfWeek(flowData)
  const dayOfWeekChartData = transformToDayOfWeekChartData(dayOfWeekAggregated)

  // 시간대별 상위 3개 식별 및 연속성 처리
  const timeZoneTop3Hours = [...timeZoneChartData]
    .sort((a, b) => b.total - a.total)
    .slice(0, 3)
    .map(item => parseInt(item.timeZone.replace('시', '')))
    .sort((a, b) => a - b) // 시간 순으로 정렬

  // 연속된 시간대를 범위로 표시하는 함수
  const formatTimeRanges = (hours: number[]): string => {
    if (hours.length === 0) return '';
    
    const ranges: string[] = [];
    let start = hours[0];
    let end = hours[0];
    
    for (let i = 1; i < hours.length; i++) {
      if (hours[i] === end + 1) {
        end = hours[i];
      } else {
        if (start === end) {
          ranges.push(`${start}시`);
        } else {
          ranges.push(`${start}시~${end}시`);
        }
        start = hours[i];
        end = hours[i];
      }
    }
    
    // 마지막 범위 추가
    if (start === end) {
      ranges.push(`${start}시`);
    } else {
      ranges.push(`${start}시~${end}시`);
    }
    
    return ranges.join(', ');
  };

  // 요일별 상위 3개 식별 (월~일 순서로 정렬)
  const dayOrder = ['월', '화', '수', '목', '금', '토', '일'];
  const dayOfWeekTop3Days = [...dayOfWeekChartData]
    .sort((a, b) => b.total - a.total)
    .slice(0, 3)
    .map(item => item.day)
    .sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b)); // 월~일 순서로 정렬

  const timeZoneTop3 = [...timeZoneChartData]
    .sort((a, b) => b.total - a.total)
    .slice(0, 3)
    .map(item => item.timeZone)

  const dayOfWeekTop3 = dayOfWeekTop3Days;

  // 시간대별 차트 데이터에 색상 정보 추가 (원본 순서 유지)
  const timeZoneChartDataWithColors = timeZoneChartData.map(item => ({
    ...item,
    fill: timeZoneTop3.includes(item.timeZone) ? '#fbbf24' : '#9ca3af' // 노란색 vs 회색
  }))

  // 요일별 차트 데이터에 색상 정보 추가 (원본 순서 유지)
  const dayOfWeekChartDataWithColors = dayOfWeekChartData.map(item => ({
    ...item,
    fill: dayOfWeekTop3.includes(item.day) ? '#fbbf24' : '#9ca3af' // 노란색 vs 회색
  }))

  // 성별 비율 데이터
  const totalMale = flowData.reduce((sum, record) => 
    sum + (record.gender === 'MALE' ? record.totalFlow : 0), 0)
  const totalFemale = flowData.reduce((sum, record) => 
    sum + (record.gender === 'FEMALE' ? record.totalFlow : 0), 0)
  
  const genderData = [
    { name: '남성', value: Math.round(totalMale), fill: '#8884d8' },
    { name: '여성', value: Math.round(totalFemale), fill: '#82ca9d' }
  ]

  // 연령대별 성별 데이터 (10대 이하 제외)
  const ageGenderTotals: { [key: string]: { male: number; female: number } } = {}
  flowData.forEach(record => {
    const ageLabel = AGE_GROUP_MAPPING[record.ageGroup as keyof typeof AGE_GROUP_MAPPING] || `${record.ageGroup}대`
    
    // 모든 연령대 로그 출력
    console.log('원본 ageGroup:', record.ageGroup, '→ 변환된 ageLabel:', ageLabel)
    
    // 10대 이하와 70대 이상 제외
    if (ageLabel === '10대 이하' || ageLabel === '70대 이상' ||
        ageLabel.includes('유아') || ageLabel.includes('영유아') || 
        ageLabel === '0대' || ageLabel === '5대') {
      console.log('제외된 연령대:', ageLabel, '(원본:', record.ageGroup, ')')
      return
    }
    
    console.log('포함된 연령대:', ageLabel, '(원본:', record.ageGroup, ')')
    
    if (!ageGenderTotals[ageLabel]) {
      ageGenderTotals[ageLabel] = { male: 0, female: 0 }
    }
    if (record.gender === 'MALE') {
      ageGenderTotals[ageLabel].male += record.totalFlow
    } else if (record.gender === 'FEMALE') {
      ageGenderTotals[ageLabel].female += record.totalFlow
    }
  })

  // 연령대 순서 정의 (10대~60대만)
  const ageOrder = ['10대', '20대', '30대', '40대', '50대', '60대']
  
  const ageGroupData = Object.entries(ageGenderTotals).map(([age, totals]) => ({
    name: age,
    male: Math.round(totals.male),
    female: Math.round(totals.female),
    total: Math.round(totals.male + totals.female)
  })).filter(item => {
    // 10대 이하와 70대 이상 한 번 더 필터링
    const shouldKeep = item.name !== '10대 이하' && item.name !== '70대 이상'
    console.log('필터링 체크:', item.name, '유지:', shouldKeep)
    return shouldKeep
  }).sort((a, b) => {
    const indexA = ageOrder.indexOf(a.name)
    const indexB = ageOrder.indexOf(b.name)
    // 정의된 순서에 있으면 그 순서대로, 없으면 뒤로
    if (indexA === -1 && indexB === -1) return a.name.localeCompare(b.name)
    if (indexA === -1) return 1
    if (indexB === -1) return -1
    return indexA - indexB
  })

  // 디버깅용 로그
  console.log('ageGenderTotals:', ageGenderTotals)
  console.log('연령대별 데이터:', ageGroupData)
  console.log('연령대별 데이터 길이:', ageGroupData.length)
  console.log('flowData 샘플:', flowData.slice(0, 5))
  console.log('flowData에서 연령대 샘플:', flowData.slice(0, 10).map(d => ({ ageGroup: d.ageGroup, gender: d.gender, totalFlow: d.totalFlow })))
  
  // 테스트용 간단한 데이터
  const testData = [
    { name: '20대', male: 1000000, female: 800000 },
    { name: '30대', male: 1200000, female: 900000 },
    { name: '40대', male: 800000, female: 700000 }
  ]

  if (!selectedDistrict) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">📱 구별 유동인구 분석</CardTitle>
          <CardDescription>지도에서 구를 선택하면 해당 구의 유동인구 데이터를 확인할 수 있습니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            구를 선택해주세요
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">📱 {selectedDistrict} 유동인구</CardTitle>
          <CardDescription>데이터를 로딩중입니다...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (flowData.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">📱 {selectedDistrict} 유동인구</CardTitle>
          <CardDescription>데이터를 찾을 수 없습니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            해당 구의 유동인구 데이터가 없습니다
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">📱 {selectedDistrict} 유동인구</CardTitle>
        <CardDescription>
          총 {flowData.length.toLocaleString()}개 데이터 포인트
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="time">시간대별</TabsTrigger>
            <TabsTrigger value="day">요일별</TabsTrigger>
            <TabsTrigger value="demographics">성별/연령대</TabsTrigger>
          </TabsList>
          
          <TabsContent value="time" className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">시간대별 일평균 유동인구</h4>
              <div className="text-xs text-gray-600 mb-3">
                <div>• 가로축: 시간대 (0시~23시)</div>
                <div>• 세로축: 일평균 유동인구 (천 명)</div>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={timeZoneChartDataWithColors}
                    margin={{ top: 15, right: 15, left: 0, bottom: 15 }}
                    barCategoryGap="1%"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timeZone" 
                      fontSize={10}
                      interval={2}
                      tickFormatter={(value) => value.replace('시', '')}
                    />
                    <YAxis 
                      fontSize={10}
                      width={20}
                      domain={[0, 25]}
                      ticks={[0, 5, 10, 15, 20, 25]}
                    />
                    <Tooltip 
                      formatter={(value, name, props) => [
                        `${props.payload?.totalRaw?.toLocaleString() || value?.toLocaleString()}명`, 
                        '유동인구'
                      ]} 
                    />
                    <Bar dataKey="total" maxBarSize={30}>
                      {timeZoneChartDataWithColors.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* 시간별 인사이트 멘트 */}
              {timeZoneTop3.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-800 font-medium">
                    💡 {formatTimeRanges(timeZoneTop3Hours)}에 인구가 가장 많아요!
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="day" className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">요일별 일평균 유동인구</h4>
              <div className="text-xs text-gray-600 mb-3">
                <div>• 가로축: 요일 (월~일)</div>
                <div>• 세로축: 일평균 유동인구 (천 명)</div>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={dayOfWeekChartDataWithColors}
                    margin={{ top: 15, right: 15, left: 0, bottom: 15 }}
                    barCategoryGap="8%"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="day" 
                      fontSize={11}
                    />
                    <YAxis 
                      fontSize={10}
                      width={20}
                      domain={[0, 20]}
                      ticks={[0, 5, 10, 15, 20]}
                    />
                    <Tooltip 
                      formatter={(value, name, props) => [
                        `${props.payload?.totalRaw?.toLocaleString() || value?.toLocaleString()}명`, 
                        '유동인구'
                      ]} 
                    />
                    <Bar dataKey="total" maxBarSize={60}>
                      {dayOfWeekChartDataWithColors.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* 요일별 인사이트 멘트 */}
              {dayOfWeekTop3.length > 0 && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-800 font-medium">
                    💡 {dayOfWeekTop3Days.join(', ')}요일에 인구가 가장 많아요!
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="demographics" className="space-y-4">
            {/* 연령대별 성별 분석 */}
            <div>
              <h4 className="text-sm font-medium mb-2">연령대별 유동인구 (성별)</h4>
              <div className="text-xs text-gray-600 mb-3">
                <div>• 가로축: 연령대</div>
                <div>• 세로축: 유동인구 (백만 명)</div>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={ageGroupData} 
                    margin={{ top: 15, right: 15, left: 5, bottom: 15 }}
                    barCategoryGap="15%"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name"
                      fontSize={10}
                      interval={0}
                    />
                    <YAxis 
                      fontSize={10}
                      width={20}
                      domain={[0, 18000000]}
                      ticks={[0, 3000000, 6000000, 9000000, 12000000, 15000000, 18000000]}
                      tickFormatter={(value) => `${(value / 1000000).toFixed(1)}`}
                    />
                    <Tooltip 
                      formatter={(value, name) => [
                        `${(Number(value) / 1000000).toFixed(2)}M명`, 
                        name === 'male' ? '남성' : name === 'female' ? '여성' : name
                      ]} 
                    />
                    <Bar dataKey="male" fill="#2563eb" name="남성" maxBarSize={40} />
                    <Bar dataKey="female" fill="#dc2626" name="여성" maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* 성별/연령대 인사이트 */}
            {ageGroupData.length > 0 && (
              <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                <div className="text-sm text-purple-800 font-medium">
                  💡 {(() => {
                    // 모든 연령대-성별 조합을 배열로 만들기
                    const allCombinations = ageGroupData.flatMap(item => [
                      { age: item.name, gender: '남성', count: item.male },
                      { age: item.name, gender: '여성', count: item.female }
                    ]);
                    
                    // 상위 3개 추출
                    const top3 = allCombinations
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 3);
                    
                    if (top3.length === 0) return '데이터가 없습니다.';
                    
                    const descriptions = top3.map((item, index) => 
                      `${index + 1}위: ${item.age} ${item.gender}`
                    );
                    
                    return descriptions.join(', ') + ' 순으로 유동인구가 많아요!';
                  })()}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 