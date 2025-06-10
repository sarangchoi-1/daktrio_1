"use client"

import { useEffect, useRef } from "react"

export function DashboardMap() {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Map initialization would go here in a real implementation
    // This is just a placeholder for demonstration
    if (mapRef.current) {
      mapRef.current.innerHTML = "서울 지도 데이터 로딩 중..."
    }
  }, [])

  return (
    <div
      ref={mapRef}
      className="bg-gray-300 rounded-lg flex items-center justify-center h-[300px] md:h-[400px] text-center p-4 text-gray-600"
    >
      서울 지도 자리입니다 (소비 + OD + 관광)
    </div>
  )
}
