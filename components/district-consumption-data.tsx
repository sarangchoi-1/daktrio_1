'use client';

import { useState, useEffect } from 'react';
import { formatKoreanNumber, type DistrictCardRecord } from '@/lib/district-card-data';

interface DistrictConsumptionDataProps {
  districtName: string;
  selectedIndustry: any;
  recommendationCriteria: 'avgSalesPerStore' | 'totalSales' | 'totalTransactions';
}

interface DistrictStats {
  totalSales: number;
  totalStores: number;
  totalTransactions: number;
  avgSalesPerStore: number;
}

const CRITERIA_LABELS = {
  avgSalesPerStore: '점포당 평균 매출',
  totalSales: '총 매출',
  totalTransactions: '총 거래 건수'
};

const CRITERIA_UNITS = {
  avgSalesPerStore: '원',
  totalSales: '원',
  totalTransactions: '건'
};

export default function DistrictConsumptionData({ 
  districtName, 
  selectedIndustry, 
  recommendationCriteria 
}: DistrictConsumptionDataProps) {
  const [stats, setStats] = useState<DistrictStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [industryName, setIndustryName] = useState<string>('');

  useEffect(() => {
    const loadDistrictStats = async () => {
      if (!districtName || !selectedIndustry || Object.keys(selectedIndustry).length === 0) {
        return;
      }

      setLoading(true);
      try {
        // 구별 데이터 로드
        const { loadDistrictData } = await import('@/lib/district-card-data');
        const data = await loadDistrictData(districtName);
        
        if (data && data.length > 0) {
          // 필터링된 데이터 계산
          let filteredData = data;
          
          if (selectedIndustry.대분류) {
            filteredData = filteredData.filter((item: DistrictCardRecord) => item.업종대분류 === selectedIndustry.대분류);
          }
          if (selectedIndustry.중분류) {
            filteredData = filteredData.filter((item: DistrictCardRecord) => item.업종중분류 === selectedIndustry.중분류);
          }
          if (selectedIndustry.소분류) {
            filteredData = filteredData.filter((item: DistrictCardRecord) => item.업종소분류 === selectedIndustry.소분류);
          }

          // 통계 계산
          const totalSales = filteredData.reduce((sum: number, item: DistrictCardRecord) => sum + (item.카드매출금액 || 0), 0);
          const totalStores = filteredData.reduce((sum: number, item: DistrictCardRecord) => sum + (item.매출가맹점수 || 0), 0);
          const totalTransactions = filteredData.reduce((sum: number, item: DistrictCardRecord) => sum + (item.카드매출건수 || 0), 0);
          const avgSalesPerStore = totalStores > 0 ? totalSales / totalStores : 0;

          setStats({
            totalSales,
            totalStores,
            totalTransactions,
            avgSalesPerStore
          });

          // 업종명 설정
          const name = selectedIndustry.소분류 || selectedIndustry.중분류 || selectedIndustry.대분류 || '선택된 업종';
          setIndustryName(name);
        }
      } catch (error) {
        console.error('구별 통계 로딩 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDistrictStats();
  }, [districtName, selectedIndustry]);

  if (loading) {
    return (
      <div className="h-32 flex items-center justify-center">
        <div className="text-sm text-gray-500">데이터 로딩 중...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="h-32 flex items-center justify-center">
        <div className="text-sm text-gray-400">데이터를 찾을 수 없습니다</div>
      </div>
    );
  }

  const criteriaValue = stats[recommendationCriteria];
  const criteriaLabel = CRITERIA_LABELS[recommendationCriteria];
  const criteriaUnit = CRITERIA_UNITS[recommendationCriteria];

  return (
    <div className="space-y-3 text-sm">
      <div className="text-center">
        <div className="text-xs text-gray-500 mb-1">{industryName}</div>
        <div className="text-lg font-semibold text-blue-600">
          {formatKoreanNumber(criteriaValue)}{criteriaUnit}
        </div>
        <div className="text-xs text-gray-400">{criteriaLabel}</div>
      </div>
      
      <div className="space-y-2 pt-2 border-t border-gray-200">
        <div className="flex justify-between">
          <span className="text-gray-600">총 매출</span>
          <span className="font-medium">{formatKoreanNumber(stats.totalSales)}원</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">가맹점 수</span>
          <span className="font-medium">{stats.totalStores.toLocaleString()}개</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">총 거래건수</span>
          <span className="font-medium">{formatKoreanNumber(stats.totalTransactions)}건</span>
        </div>
      </div>
    </div>
  );
} 