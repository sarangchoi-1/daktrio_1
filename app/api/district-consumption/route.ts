import { NextRequest, NextResponse } from 'next/server';

// 구별 소비 데이터 (샘플 데이터)
const DISTRICT_CONSUMPTION_DATA = {
  "유아교육/키즈카페": [
    {
      district: "강남구",
      totalSales: 15416000000,
      totalTransactions: 125000,
      totalStores: 89,
      avgSalesPerStore: 173191011
    },
    {
      district: "서초구",
      totalSales: 8500000000,
      totalTransactions: 68000,
      totalStores: 52,
      avgSalesPerStore: 163461538
    },
    {
      district: "용산구",
      totalSales: 6200000000,
      totalTransactions: 45000,
      totalStores: 38,
      avgSalesPerStore: 163157895
    },
    {
      district: "마포구",
      totalSales: 12800000000,
      totalTransactions: 95000,
      totalStores: 75,
      avgSalesPerStore: 170666667
    },
    {
      district: "송파구",
      totalSales: 9800000000,
      totalTransactions: 78000,
      totalStores: 58,
      avgSalesPerStore: 169000000
    },
    {
      district: "강서구",
      totalSales: 7200000000,
      totalTransactions: 55000,
      totalStores: 45,
      avgSalesPerStore: 160000000
    },
    {
      district: "노원구",
      totalSales: 5800000000,
      totalTransactions: 42000,
      totalStores: 35,
      avgSalesPerStore: 165714286
    },
    {
      district: "관악구",
      totalSales: 4900000000,
      totalTransactions: 35000,
      totalStores: 28,
      avgSalesPerStore: 175000000
    }
  ],
  "카페": [
    {
      district: "강남구",
      totalSales: 25000000000,
      totalTransactions: 180000,
      totalStores: 150,
      avgSalesPerStore: 166666667
    },
    {
      district: "홍대입구",
      totalSales: 18000000000,
      totalTransactions: 140000,
      totalStores: 120,
      avgSalesPerStore: 150000000
    },
    {
      district: "이태원",
      totalSales: 12000000000,
      totalTransactions: 85000,
      totalStores: 80,
      avgSalesPerStore: 150000000
    }
  ],
  "치킨": [
    {
      district: "강남구",
      totalSales: 18000000000,
      totalTransactions: 220000,
      totalStores: 95,
      avgSalesPerStore: 189473684
    },
    {
      district: "송파구",
      totalSales: 14000000000,
      totalTransactions: 180000,
      totalStores: 78,
      avgSalesPerStore: 179487179
    }
  ]
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { selectedIndustry, recommendationCriteria } = body;

    // 선택된 업종에 따른 데이터 반환
    let industryKey = "유아교육/키즈카페"; // 기본값

    if (selectedIndustry) {
      if (selectedIndustry.소분류) {
        industryKey = selectedIndustry.소분류;
      } else if (selectedIndustry.중분류) {
        industryKey = selectedIndustry.중분류;
      } else if (selectedIndustry.대분류) {
        industryKey = selectedIndustry.대분류;
      }
    }

    // 해당 업종 데이터가 없으면 기본 데이터 사용
    const data = DISTRICT_CONSUMPTION_DATA[industryKey as keyof typeof DISTRICT_CONSUMPTION_DATA] 
      || DISTRICT_CONSUMPTION_DATA["유아교육/키즈카페"];

    return NextResponse.json({
      success: true,
      data: data,
      selectedIndustry: industryKey,
      recommendationCriteria
    });

  } catch (error) {
    console.error('District consumption API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch district consumption data',
        data: []
      },
      { status: 500 }
    );
  }
} 