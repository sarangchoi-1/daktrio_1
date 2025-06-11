"use client"

import { useEffect, useState } from "react";
import dynamic from 'next/dynamic';

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
  onDistrictClick?: (district: DistrictInfo) => void;
}

export function DashboardMap({ onDistrictClick }: DashboardMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [seoulBoundaries, setSeoulBoundaries] = useState<any>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

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

    loadSeoulBoundaries();
    
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

  // 구별 스타일 함수
  const districtStyle = (feature?: any) => {
    const districtName = getDistrictName(feature);
    const isSelected = selectedDistrict === districtName;
    
    return {
      fillColor: isSelected ? '#3B82F6' : 'transparent',
      weight: 2,
      opacity: 1,
      color: '#6B7280',
      dashArray: '',
      fillOpacity: isSelected ? 0.3 : 0
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
    
    layer.bindTooltip(districtName, {
      permanent: false,
      direction: 'center',
      className: 'district-tooltip'
    });
    
    layer.on({
      mouseover: function (e: any) {
        const layer = e.target;
        if (selectedDistrict !== districtName) {
          layer.setStyle({
            fillColor: '#3B82F6',
            fillOpacity: 0.2,
            weight: 3,
            color: '#1D4ED8'
          });
        }
      },
      mouseout: function (e: any) {
        const layer = e.target;
        if (selectedDistrict !== districtName) {
          layer.setStyle(districtStyle(feature));
        }
      },
      click: function (e: any) {
        const districtInfo: DistrictInfo = {
          name: districtName,
          properties: feature.properties
        };
        
        setSelectedDistrict(districtName);
        
        // 부모 컴포넌트에 클릭된 구 정보 전달
        if (onDistrictClick) {
          onDistrictClick(districtInfo);
        }
        
        console.log('선택된 구:', districtInfo);
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
          padding: 4px 8px !important;
          font-size: 12px !important;
          font-weight: 500 !important;
          color: #333 !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
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
            key={selectedDistrict} // 선택된 구가 변경될 때 리렌더링
          />
        )}
      </MapContainer>
    </>
  );
}
