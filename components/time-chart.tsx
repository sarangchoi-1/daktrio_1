"use client"

import { useEffect, useRef } from "react"

interface TimeChartProps {
  title: string
  className?: string
}

export function TimeChart({ title, className = "" }: TimeChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Chart initialization would go here in a real implementation
    // This is just a placeholder for demonstration
    if (chartRef.current) {
      chartRef.current.innerHTML = "차트 데이터 로딩 중..."
    }
  }, [])

  return (
    <div className={`p-6 rounded-lg ${className}`}>
      <h3 className="text-center text-gray-500 mb-4">{title}</h3>
      <div ref={chartRef} className="h-32 flex items-center justify-center text-sm text-gray-400">
        차트 데이터 로딩 중...
      </div>
    </div>
  )
}
