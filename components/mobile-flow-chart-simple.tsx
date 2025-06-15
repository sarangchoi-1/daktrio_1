"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MobileFlowChartSimpleProps {
  selectedDistrict?: string;
}

export function MobileFlowChartSimple({ selectedDistrict }: MobileFlowChartSimpleProps) {
  console.log('간단한 테스트 컴포넌트 렌더링됨!');
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>테스트 - 유동인구 분석</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-4 bg-blue-50 rounded">
          <p>컴포넌트가 정상적으로 렌더링되고 있습니다!</p>
          <p>선택된 구: {selectedDistrict || '없음'}</p>
        </div>
      </CardContent>
    </Card>
  );
} 