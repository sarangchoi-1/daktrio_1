"use client"

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

export function DashboardMap() {
  useEffect(() => {
    // Fix default icon issue in Next.js/Leaflet
    (async () => {
      if (typeof window !== "undefined" && L) {
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

  return (
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
  );
}
