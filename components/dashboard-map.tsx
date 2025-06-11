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

export function DashboardMap() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
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
        <Marker position={[37.5665, 126.9780]}>
          <Popup>
            서울 중심부<br />여기에 소비, OD, 관광 데이터 시각화 가능
          </Popup>
        </Marker>
      </MapContainer>
    </>
  );
}
