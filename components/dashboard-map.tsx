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

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

const GeoJSON = dynamic(
  () => import('react-leaflet').then((mod) => mod.GeoJSON),
  { ssr: false }
);

export function DashboardMap() {
  const [isClient, setIsClient] = useState(false);
  const [seoulBoundaries, setSeoulBoundaries] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    
    // 서울시 구별 경계 데이터 로드 (최신 데이터 우선 시도)
    const loadSeoulBoundaries = async () => {
      // 시도할 데이터 소스들 (최신순)
      const dataSources = [
        // 2021년 업데이트된 상세한 서울 구별 데이터
        'https://raw.githubusercontent.com/raqoon886/Local_HangJeongDong/master/hangjeongdong_서울특별시.geojson',
        // 백업: southkorea 2015년 데이터
        'https://raw.githubusercontent.com/southkorea/seoul-maps/master/juso/2015/json/seoul_municipalities_geo_simple.json',
        // 백업: southkorea 2013년 데이터
        'https://raw.githubusercontent.com/southkorea/seoul-maps/master/kostat/2013/json/seoul_municipalities_geo_simple.json'
      ];

      for (const source of dataSources) {
        try {
          console.log(`서울시 경계 데이터 로드 시도: ${source}`);
          const response = await fetch(source);
          if (response.ok) {
            const data = await response.json();
            console.log('서울시 경계 데이터 로드 성공:', data);
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
    return {
      fillColor: 'rgba(65, 105, 225, 0.15)',
      weight: 2,
      opacity: 0.8,
      color: '#4169E1',
      dashArray: '',
      fillOpacity: 0.15
    };
  };

  // 구별 클릭/호버 이벤트
  const onEachDistrict = (feature: any, layer: any) => {
    // 다양한 속성명 시도
    const districtName = feature.properties.name || 
                        feature.properties.NAME || 
                        feature.properties.adm_nm ||
                        feature.properties.SIG_KOR_NM ||
                        feature.properties.sigungu ||
                        '알 수 없음';
    
    layer.bindPopup(
      `<div style="text-align: center;">
        <h3 style="margin: 0; color: #333;">${districtName}</h3>
        <p style="margin: 5px 0; font-size: 12px; color: #666;">서울특별시</p>
      </div>`
    );
    
    layer.on({
      mouseover: function (e: any) {
        const layer = e.target;
        layer.setStyle({
          weight: 3,
          color: '#FF6B6B',
          fillOpacity: 0.3
        });
      },
      mouseout: function (e: any) {
        const layer = e.target;
        layer.setStyle(districtStyle(feature));
      }
    });
  };

  if (!isClient) {
    return (
      <div 
        style={{ height: 400, width: "100%", borderRadius: "0.5rem" }}
        className="bg-gray-300 flex items-center justify-center"
      >
        <p className="text-gray-600">지도를 로딩중입니다...</p>
      </div>
    );
  }

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <MapContainer
        center={[37.5665, 126.9780]} // Seoul coordinates
        zoom={11}
        style={{ height: 400, width: "100%", borderRadius: "0.5rem" }}
        className="bg-gray-300"
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
        />
        
        {/* 서울시 구별 경계 표시 */}
        {seoulBoundaries && (
          <GeoJSON
            data={seoulBoundaries}
            style={districtStyle}
            onEachFeature={onEachDistrict}
          />
        )}
        
        <Marker position={[37.5665, 126.9780]}>
          <Popup>
            서울 중심부<br />여기에 소비, OD, 관광 데이터 시각화 가능
          </Popup>
        </Marker>
      </MapContainer>
    </>
  );
}
