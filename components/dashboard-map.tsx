"use client"

import { useEffect, useState } from "react";
import dynamic from 'next/dynamic';
import { 
  loadAllDistrictData, 
  calculateDistrictStats, 
  categorizeDistricts, 
  getDistrictColor,
  formatKoreanNumber,
  type DistrictCardRecord,
  type IndustryRecommendationData,
  type RecommendationCriteria,
  CRITERIA_LABELS,
  CRITERIA_UNITS
} from "@/lib/district-card-data";

// Dynamic import to prevent SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const GeoJSON = dynamic(
  () => import('react-leaflet').then((mod) => mod.GeoJSON),
  { ssr: false }
);

interface DistrictInfo {
  name: string;
  code?: string;
  properties?: any;
}

interface DashboardMapProps {
  onDistrictClick?: (district: DistrictInfo | null) => void;
  selectedIndustry?: { 대분류?: string; 중분류?: string; 소분류?: string };
  showIndustryColors?: boolean; // 업종별 색칠 모드 토글
  recommendationCriteria?: RecommendationCriteria; // 추천 기준
}

export function DashboardMap({ onDistrictClick, selectedIndustry, showIndustryColors, recommendationCriteria = 'avgSalesPerStore' }: DashboardMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [seoulBoundaries, setSeoulBoundaries] = useState<any>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);
  const [districtData, setDistrictData] = useState<DistrictCardRecord[]>([]);
  const [districtCategories, setDistrictCategories] = useState<{ [category: number]: string[] }>({});
  const [districtStats, setDistrictStats] = useState<IndustryRecommendationData>({});

  // 서울 영역 경계 설정
  const seoulBounds = [
    [37.4, 126.7], // 남서쪽 좌표
    [37.8, 127.3]  // 북동쪽 좌표
  ];

  useEffect(() => {
    setIsClient(true);
    
    // 서울시 구별 경계 데이터 로드 (구별 데이터만)
    const loadSeoulBoundaries = async () => {
      // 구별 경계 데이터 소스들
      const dataSources = [
        // southkorea 2015년 구별 데이터 (municipalities)
        'https://raw.githubusercontent.com/southkorea/seoul-maps/master/juso/2015/json/seoul_municipalities_geo_simple.json',
        // southkorea 2013년 구별 데이터 (municipalities)  
        'https://raw.githubusercontent.com/southkorea/seoul-maps/master/kostat/2013/json/seoul_municipalities_geo_simple.json',
      ];

      for (const source of dataSources) {
        try {
          console.log(`서울시 구별 경계 데이터 로드 시도: ${source}`);
          const response = await fetch(source);
          if (response.ok) {
            const data = await response.json();
            console.log('서울시 구별 경계 데이터 로드 성공:', data);
            setSeoulBoundaries(data);
            break;
          }
        } catch (error) {
          console.warn(`데이터 소스 실패: ${source}`, error);
          continue;
        }
      }
    };

    // 신한카드 구별 데이터 로드
    const loadDistrictCardData = async () => {
      try {
        console.log('구별 신한카드 데이터 로드 시작...');
        const data = await loadAllDistrictData();
        console.log('구별 신한카드 데이터 로드 완료:', data.length, '개 레코드');
        setDistrictData(data);
      } catch (error) {
        console.error('구별 신한카드 데이터 로드 실패:', error);
      }
    };

    loadSeoulBoundaries();
    loadDistrictCardData();
    
    // Fix default icon issue in Next.js/Leaflet
    (async () => {
      if (typeof window !== "undefined") {
        const L = (await import("leaflet")).default;
        const iconRetinaUrl = (await import("leaflet/dist/images/marker-icon-2x.png")).default;
        const iconUrl = (await import("leaflet/dist/images/marker-icon.png")).default;
        const shadowUrl = (await import("leaflet/dist/images/marker-shadow.png")).default;
        
        L.Icon.Default.mergeOptions({
          iconRetinaUrl,
          iconUrl,
          shadowUrl,
        });
      }
    })();
  }, []);

  // 업종 선택이나 추천 기준이 변경될 때마다 구별 통계 재계산
  useEffect(() => {
    if (districtData.length > 0 && selectedIndustry) {
      console.log('업종 선택 변경:', selectedIndustry);
      console.log('추천 기준:', recommendationCriteria);
      const stats = calculateDistrictStats(districtData, selectedIndustry);
      const categories = categorizeDistricts(stats, recommendationCriteria);
      
      console.log('구별 통계:', stats);
      console.log('구별 카테고리:', categories);
      
      setDistrictStats(stats);
      setDistrictCategories(categories);
    }
  }, [districtData, selectedIndustry, recommendationCriteria]);

  // 구별 스타일 함수
  const districtStyle = (feature?: any) => {
    const districtName = getDistrictName(feature);
    const isSelected = selectedDistrict === districtName;
    const isHovered = hoveredDistrict === districtName;
    
    // 색상 결정 로직
    let fillColor = '#e5e7eb'; // 기본 회색
    
    // hover 시에는 선택 여부에 관계없이 빨간색으로 칠하기
    if (isHovered) {
      fillColor = '#dc2626'; // hover 색상은 모든 구에 적용
    } else if (showIndustryColors && selectedIndustry && Object.keys(selectedIndustry).length > 0) {
      // 선택된 구도 원래 업종별 색상 유지
      fillColor = getDistrictColor(districtName, districtCategories, isHovered);
    }
    
    return {
      fillColor: fillColor,
      weight: isSelected ? 3 : 2,
      opacity: 1,
      color: isSelected ? '#dc2626' : '#000000', // 선택된 구는 빨간색 테두리, 나머지는 검은색
      dashArray: '',
      fillOpacity: fillColor === '#e5e7eb' ? 0 : (isSelected ? 0.8 : 0.6) // 선택된 구는 더 진하게, 나머지는 0.6
    };
  };

  // 구 이름 추출 함수
  const getDistrictName = (feature?: any) => {
    if (!feature?.properties) return '알 수 없음';
    
    return feature.properties.name || 
           feature.properties.NAME || 
           feature.properties.adm_nm ||
           feature.properties.SIG_KOR_NM ||
           feature.properties.sigungu ||
           '알 수 없음';
  };

  // 구별 클릭/호버 이벤트
  const onEachDistrict = (feature: any, layer: any) => {
    const districtName = getDistrictName(feature);
    const stats = districtStats[districtName];
    
    // 툴팁 내용 구성 - hover 시에는 구 이름만 표시
    let tooltipContent = districtName;
    
    layer.bindTooltip(tooltipContent, {
      permanent: false,
      direction: 'center',
      className: 'district-tooltip'
    });
    
    layer.on({
      mouseover: function (e: any) {
        setHoveredDistrict(districtName);
      },
      mouseout: function (e: any) {
        setHoveredDistrict(null);
      },
      click: function (e: any) {
        const districtInfo: DistrictInfo = {
          name: districtName,
          properties: feature.properties
        };
        
        // 이미 선택된 구를 다시 클릭하면 선택 해제
        if (selectedDistrict === districtName) {
          setSelectedDistrict(null);
          console.log('구 선택 해제:', districtName);
          
          // 부모 컴포넌트에 선택 해제 알림
          if (onDistrictClick) {
            onDistrictClick(null);
          }
        } else {
          setSelectedDistrict(districtName);
          
          // 부모 컴포넌트에 클릭된 구 정보 전달
          if (onDistrictClick) {
            onDistrictClick(districtInfo);
          }
          
          console.log('선택된 구:', districtInfo);
          console.log('선택된 구 통계:', stats);
        }
      }
    });
  };

  if (!isClient) {
    return (
      <div 
        style={{ height: 600, width: "100%", borderRadius: "0.5rem" }}
        className="bg-gray-50 flex items-center justify-center border"
      >
        <p className="text-gray-600">지도를 로딩중입니다...</p>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        .district-tooltip {
          background: white !important;
          border: 1px solid #ccc !important;
          border-radius: 4px !important;
          padding: 6px 10px !important;
          font-size: 12px !important;
          font-weight: 500 !important;
          color: #333 !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
          max-width: 200px !important;
          line-height: 1.4 !important;
        }
        .leaflet-container {
          background: #f9fafb !important;
          z-index: 1 !important;
        }
        .leaflet-control-zoom {
          border: 1px solid #d1d5db !important;
          border-radius: 6px !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
          z-index: 2 !important;
        }
        .leaflet-control-zoom a {
          background-color: white !important;
          border-bottom: 1px solid #e5e7eb !important;
          color: #374151 !important;
        }
        .leaflet-control-zoom a:hover {
          background-color: #f3f4f6 !important;
        }
      `}</style>
      
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      
      <MapContainer
        center={[37.5665, 126.9780]} // Seoul coordinates
        zoom={11}
        minZoom={10}
        maxZoom={14}
        maxBounds={seoulBounds as any}
        style={{ height: 600, width: "100%", borderRadius: "0.5rem" }}
        className="bg-gray-50 border"
        scrollWheelZoom={true}
        zoomControl={true}
      >
        {/* 매우 낮은 투명도의 배경 지도 */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
          opacity={0.15}
        />
        
        {/* 서울시 구별 경계만 표시 */}
        {seoulBoundaries && (
          <GeoJSON
            data={seoulBoundaries}
            style={districtStyle}
            onEachFeature={onEachDistrict}
            key={`${selectedDistrict}-${hoveredDistrict}-${JSON.stringify(selectedIndustry)}-${showIndustryColors}-${recommendationCriteria}`} // 상태 변경 시 리렌더링
          />
        )}
      </MapContainer>
    </>
  );
}
