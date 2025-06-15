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

  // 시간대별 상위 3개 식별 (복사본으로 정렬)
  const timeZoneTop3 = [...timeZoneChartData]
    .sort((a, b) => b.total - a.total)
    .slice(0, 3)
    .map(item => item.timeZone)

  // 요일별 상위 3개 식별 (복사본으로 정렬)
  const dayOfWeekTop3 = [...dayOfWeekChartData]
    .sort((a, b) => b.total - a.total)
    .slice(0, 3)
    .map(item => item.day)

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

  // 연령대별 데이터
  const ageGroupTotals: { [key: string]: number } = {}
  flowData.forEach(record => {
    const ageLabel = AGE_GROUP_MAPPING[record.ageGroup as keyof typeof AGE_GROUP_MAPPING] || `${record.ageGroup}대`
    ageGroupTotals[ageLabel] = (ageGroupTotals[ageLabel] || 0) + record.totalFlow
  })

  const ageGroupData = Object.entries(ageGroupTotals).map(([age, total], index) => ({
    name: age,
    value: Math.round(total),
    fill: COLORS[index % COLORS.length]
  }))

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
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeZoneChartDataWithColors}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timeZone" />
                    <YAxis 
                      label={{ value: '일평균 유동인구 (천 명)', angle: -90, position: 'insideLeft' }}
                      domain={[0, 25]}
                      ticks={[0, 5, 10, 15, 20, 25]}
                    />
                    <Tooltip 
                      formatter={(value, name, props) => [
                        `${props.payload?.totalRaw?.toLocaleString() || value?.toLocaleString()}명`, 
                        '유동인구'
                      ]} 
                    />
                    <Bar dataKey="total">
                      {timeZoneChartDataWithColors.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="day" className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">요일별 일평균 유동인구</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dayOfWeekChartDataWithColors}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis 
                      label={{ value: '일평균 유동인구 (천 명)', angle: -90, position: 'insideLeft' }}
                      domain={[0, 20]}
                      ticks={[0, 5, 10, 15, 20]}
                    />
                    <Tooltip 
                      formatter={(value, name, props) => [
                        `${props.payload?.totalRaw?.toLocaleString() || value?.toLocaleString()}명`, 
                        '유동인구'
                      ]} 
                    />
                    <Bar dataKey="total">
                      {dayOfWeekChartDataWithColors.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="demographics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 성별 분석 */}
              <div>
                <h4 className="text-sm font-medium mb-2">성별 유동인구 비율</h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={genderData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {genderData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value?.toLocaleString(), '유동인구']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 연령대 분석 */}
              <div>
                <h4 className="text-sm font-medium mb-2">연령대별 유동인구</h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ageGroupData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={50} fontSize={10} />
                      <Tooltip formatter={(value) => [value?.toLocaleString(), '유동인구']} />
                      <Bar dataKey="value" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* 성별/연령대 교차 분석 요약 */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h5 className="text-xs font-medium text-gray-700 mb-2">주요 통계</h5>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-600">남성 비율:</span>
                  <span className="ml-1 font-medium">
                    {genderData.length > 0 && totalMale + totalFemale > 0 
                      ? `${((totalMale / (totalMale + totalFemale)) * 100).toFixed(1)}%`
                      : 'N/A'
                    }
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">여성 비율:</span>
                  <span className="ml-1 font-medium">
                    {genderData.length > 0 && totalMale + totalFemale > 0 
                      ? `${((totalFemale / (totalMale + totalFemale)) * 100).toFixed(1)}%`
                      : 'N/A'
                    }
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">총 유동인구:</span>
                  <span className="ml-1 font-medium">{(totalMale + totalFemale).toLocaleString()}명</span>
                </div>
                <div>
                  <span className="text-gray-600">주요 연령대:</span>
                  <span className="ml-1 font-medium">
                    {ageGroupData.length > 0 
                      ? ageGroupData.reduce((max, current) => current.value > max.value ? current : max).name
                      : 'N/A'
                    }
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 