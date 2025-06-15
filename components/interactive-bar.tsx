"use client"

import { useState } from "react"
import { formatCount } from "@/lib/mobile-flow-data"

interface InteractiveBarProps {
  x: number;
  y: number;
  width: number;
  height: number;
  payload: any;
  fill: string;
  isHovered: boolean;
  hasHoveredItem: boolean;
  hoveredIndex: number | null;
  currentIndex: number;
  totalBars: number;
  chartWidth: number;
  onHover: () => void;
  onLeave: () => void;
}

export function InteractiveBar({
  x, y, width, height, payload, fill, isHovered, hasHoveredItem, 
  hoveredIndex, currentIndex, totalBars, chartWidth, onHover, onLeave
}: InteractiveBarProps) {
  
  // 원래 크기와 위치 유지, 시각적 효과만 추가
  
  // 성별 데이터 처리
  const genderData = payload?.genderBreakdown || [];
  const totalGenderCount = genderData.reduce((sum: number, item: any) => sum + item.count, 0);
  
  // 연령대 데이터 처리  
  const ageData = payload?.ageBreakdown || [];
  const maxAgeCount = Math.max(...ageData.map((item: any) => item.count), 1);

  return (
    <g>
      {/* 메인 막대 - 원래 크기 유지 */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={isHovered ? "#1e40af" : fill}
        stroke={isHovered ? "#1e40af" : "none"}
        strokeWidth={isHovered ? 3 : 0}
        rx={4}
        ry={4}
        style={{
          transition: "all 0.3s ease",
          cursor: "pointer",
          opacity: hasHoveredItem && !isHovered ? 0.6 : 1,
          filter: isHovered ? "brightness(1.1)" : "none"
        }}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
      />
      
      {/* 호버 시 추가 정보 표시 */}
      {isHovered && (
        <g>
          {/* 배경 */}
          <rect
            x={x - 10}
            y={y - 100}
            width={width + 20}
            height={90}
            fill="white"
            stroke="#d1d5db"
            strokeWidth={1}
            rx={8}
            ry={8}
            opacity={0.95}
            style={{
              filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))"
            }}
          />
          
          {/* 제목 */}
          <text
            x={x + width / 2}
            y={y - 75}
            textAnchor="middle"
            fontSize={12}
            fontWeight="bold"
            fill="#374151"
          >
            {payload?.hourLabel || payload?.weekdayLabel} 상세
          </text>
          
          {/* 성별 분포 - 작은 막대들 */}
          <text
            x={x + 5}
            y={y - 55}
            fontSize={10}
            fill="#6b7280"
          >
            성별:
          </text>
          
          {genderData.map((item: any, index: number) => {
            const genderWidth = totalGenderCount > 0 ? (item.count / totalGenderCount) * (width - 40) : 0;
            const genderX = x + 35 + (index * (width - 40) / 2);
            
            return (
              <g key={`gender-${index}`}>
                <rect
                  x={genderX}
                  y={y - 50}
                  width={genderWidth}
                  height={8}
                  fill={item.gender === 'M' ? '#3b82f6' : '#ec4899'}
                  rx={2}
                />
                <text
                  x={genderX + genderWidth / 2}
                  y={y - 35}
                  textAnchor="middle"
                  fontSize={8}
                  fill="#374151"
                >
                  {item.gender === 'M' ? '남' : '여'}: {formatCount(item.count)}
                </text>
              </g>
            );
          })}
          
          {/* 연령대 분포 - 작은 막대 차트 */}
          <text
            x={x + 5}
            y={y - 20}
            fontSize={10}
            fill="#6b7280"
          >
            연령:
          </text>
          
          {ageData.slice(0, 5).map((item: any, index: number) => {
            const ageHeight = (item.count / maxAgeCount) * 15;
            const ageX = x + 35 + (index * (width - 40) / 5);
            const ageY = y - 15 - ageHeight;
            
            return (
              <g key={`age-${index}`}>
                <rect
                  x={ageX}
                  y={ageY}
                  width={(width - 40) / 5 - 2}
                  height={ageHeight}
                  fill="#f59e0b"
                  rx={1}
                />
                <text
                  x={ageX + (width - 40) / 10}
                  y={y - 2}
                  textAnchor="middle"
                  fontSize={7}
                  fill="#374151"
                >
                  {item.ageGroup}
                </text>
              </g>
            );
          })}
        </g>
      )}
    </g>
  );
} 