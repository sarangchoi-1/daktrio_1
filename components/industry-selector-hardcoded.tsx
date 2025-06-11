"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, ChevronRight } from "lucide-react"

export interface SelectedIndustry {
  class1?: string;
  class2?: string;
  class3?: string;
  code?: string;
}

interface IndustrySelectorProps {
  onIndustryChange?: (industry: SelectedIndustry) => void;
}

// 하드코딩된 업종 데이터
const industryData = {
  "요식/유흥": {
    "한식": [
      { code: "ss001", class3: "한식" }
    ],
    "일식/중식/양식": [
      { code: "ss002", class3: "일식" },
      { code: "ss003", class3: "양식" },
      { code: "ss004", class3: "중식" }
    ],
    "제과/커피/패스트푸드": [
      { code: "ss005", class3: "제과점" },
      { code: "ss006", class3: "커피전문점" },
      { code: "ss007", class3: "패스트푸드" }
    ],
    "기타요식": [
      { code: "ss008", class3: "기타요식" }
    ],
    "유흥": [
      { code: "ss009", class3: "노래방" },
      { code: "ss010", class3: "기타유흥업소" },
      { code: "ss011", class3: "유흥주점" }
    ]
  },
  "유통": {
    "백화점": [
      { code: "ss012", class3: "백화점" }
    ],
    "할인점/슈퍼마켓": [
      { code: "ss013", class3: "할인점/슈퍼마켓" },
      { code: "ss014", class3: "슈퍼마켓" },
      { code: "ss015", class3: "생활잡화" }
    ],
    "편의점": [
      { code: "ss016", class3: "편의점" }
    ],
    "기타유통": [
      { code: "ss017", class3: "기타유통" }
    ]
  },
  "음/식료품": {
    "음/식료품": [
      { code: "ss018", class3: "정육점" },
      { code: "ss019", class3: "농수산물" },
      { code: "ss020", class3: "기타음/식료품" }
    ]
  },
  "의류/잡화": {
    "의복/의류": [
      { code: "ss021", class3: "의복/의류" }
    ],
    "패션/잡화": [
      { code: "ss022", class3: "패션/잡화" },
      { code: "ss023", class3: "시계/귀금속" },
      { code: "ss024", class3: "안경" }
    ]
  },
  "스포츠/문화/레저": {
    "스포츠/문화/레저": [
      { code: "ss027", class3: "종합레저시설" },
      { code: "ss028", class3: "영화/공연" },
      { code: "ss029", class3: "스포츠시설" },
      { code: "ss030", class3: "취미/오락" },
      { code: "ss031", class3: "서점" },
      { code: "ss081", class3: "실내골프" },
      { code: "ss082", class3: "헬스" },
      { code: "ss083", class3: "실외골프" },
      { code: "ss084", class3: "스키" }
    ],
    "스포츠/문화/레저용품": [
      { code: "ss032", class3: "스포츠/레저용품" },
      { code: "ss033", class3: "문화용품" },
      { code: "ss034", class3: "화원" }
    ]
  },
  "여행/교통": {
    "숙박": [
      { code: "ss035", class3: "호텔/콘도" },
      { code: "ss036", class3: "모텔/여관/기타숙박" }
    ],
    "여행": [
      { code: "ss037", class3: "여행사" },
      { code: "ss038", class3: "항공" },
      { code: "ss039", class3: "면세점" }
    ],
    "교통": [
      { code: "ss040", class3: "교통" }
    ]
  },
  "미용": {
    "미용서비스": [
      { code: "ss041", class3: "미용실" },
      { code: "ss042", class3: "미용서비스" }
    ],
    "화장품": [
      { code: "ss043", class3: "화장품" }
    ]
  },
  "가정생활/서비스": {
    "서비스": [
      { code: "ss044", class3: "생활서비스" },
      { code: "ss045", class3: "세탁소" },
      { code: "ss046", class3: "업무서비스" }
    ],
    "인테리어": [
      { code: "ss047", class3: "인테리어" }
    ],
    "각종요금": [
      { code: "ss048", class3: "통신" },
      { code: "ss049", class3: "보험" }
    ]
  },
  "교육/학원": {
    "학원": [
      { code: "ss050", class3: "독서실" },
      { code: "ss090", class3: "입시보습학원" },
      { code: "ss091", class3: "외국어학원" },
      { code: "ss092", class3: "예체능학원" },
      { code: "ss093", class3: "취미/전문학원" }
    ],
    "유아교육": [
      { code: "ss052", class3: "유아교육" }
    ],
    "교육용품": [
      { code: "ss053", class3: "교육용품" }
    ]
  },
  "의료": {
    "병원": [
      { code: "ss054", class3: "종합병원" },
      { code: "ss055", class3: "일반병원" },
      { code: "ss056", class3: "치과병원" },
      { code: "ss057", class3: "한의원" }
    ],
    "약국": [
      { code: "ss058", class3: "약국" }
    ],
    "기타의료": [
      { code: "ss059", class3: "기타의료" }
    ]
  },
  "가전/가구": {
    "가전/가구": [
      { code: "ss060", class3: "가전" },
      { code: "ss061", class3: "가구" },
      { code: "ss062", class3: "기타가전/가구" }
    ]
  },
  "자동차": {
    "자동차판매": [
      { code: "ss063", class3: "자동차판매" }
    ],
    "자동차서비스/용품": [
      { code: "ss064", class3: "자동차서비스" },
      { code: "ss065", class3: "자동차용품" }
    ]
  },
  "주유": {
    "주유": [
      { code: "ss066", class3: "주유소" },
      { code: "ss067", class3: "LPG" }
    ]
  },
  "전자상거래": {
    "전자상거래": [
      { code: "ss068", class3: "온라인거래" },
      { code: "ss069", class3: "결제대행(PG)" },
      { code: "ss070", class3: "홈쇼핑" }
    ]
  }
};

export function IndustrySelectorHardcoded({ onIndustryChange }: IndustrySelectorProps) {
  const [selectedIndustry, setSelectedIndustry] = useState<SelectedIndustry>({});

  // 대분류 선택 처리
  const handleClass1Change = (class1: string) => {
    const newSelection: SelectedIndustry = { class1 };
    setSelectedIndustry(newSelection);
    
    if (onIndustryChange) {
      onIndustryChange(newSelection);
    }
  };

  // 중분류 선택 처리
  const handleClass2Change = (class2: string) => {
    const newSelection: SelectedIndustry = { 
      ...selectedIndustry, 
      class2,
      class3: undefined, // 중분류가 바뀌면 소분류 초기화
      code: undefined
    };
    setSelectedIndustry(newSelection);
    
    if (onIndustryChange) {
      onIndustryChange(newSelection);
    }
  };

  // 소분류 선택 처리
  const handleClass3Change = (value: string) => {
    // value는 "code|class3" 형태로 전달됨
    const [code, class3] = value.split('|');
    const newSelection: SelectedIndustry = { 
      ...selectedIndustry, 
      class3, 
      code 
    };
    setSelectedIndustry(newSelection);
    
    if (onIndustryChange) {
      onIndustryChange(newSelection);
    }
  };

  const class1Options = Object.keys(industryData).sort();
  const class2Options = selectedIndustry.class1 
    ? Object.keys(industryData[selectedIndustry.class1 as keyof typeof industryData]).sort()
    : [];
  const class3Options = selectedIndustry.class1 && selectedIndustry.class2
    ? (industryData[selectedIndustry.class1 as keyof typeof industryData] as any)[selectedIndustry.class2] || []
    : [];

  return (
    <>
      <style jsx global>{`
        .select-dropdown {
          z-index: 9999 !important;
        }
        [data-radix-popper-content-wrapper] {
          z-index: 9999 !important;
        }
        .leaflet-container {
          z-index: 1 !important;
        }
      `}</style>
      
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 대분류 선택 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">대분류</label>
              <Select onValueChange={handleClass1Change} value={selectedIndustry.class1 || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="대분류 선택" />
                </SelectTrigger>
                <SelectContent className="select-dropdown">
                  {class1Options.map((class1) => (
                    <SelectItem key={class1} value={class1}>
                      {class1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 중분류 선택 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">중분류</label>
              <Select 
                onValueChange={handleClass2Change} 
                value={selectedIndustry.class2 || ""}
                disabled={!selectedIndustry.class1}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedIndustry.class1 ? "중분류 선택" : "먼저 대분류를 선택하세요"} />
                </SelectTrigger>
                <SelectContent className="select-dropdown">
                  {class2Options.map((class2) => (
                    <SelectItem key={class2} value={class2}>
                      {class2}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 소분류 선택 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">소분류</label>
              <Select 
                onValueChange={handleClass3Change} 
                value={selectedIndustry.code ? `${selectedIndustry.code}|${selectedIndustry.class3}` : ""}
                disabled={!selectedIndustry.class2}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedIndustry.class2 ? "소분류 선택" : "먼저 중분류를 선택하세요"} />
                </SelectTrigger>
                <SelectContent className="select-dropdown">
                  {class3Options.map((option: { code: string; class3: string }) => (
                    <SelectItem key={option.code} value={`${option.code}|${option.class3}`}>
                      {option.class3}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 선택된 업종 표시 */}
          {selectedIndustry.class1 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <Building2 className="h-4 w-4" />
                <span className="font-medium">선택된 업종:</span>
                <div className="flex items-center gap-1">
                  <span>{selectedIndustry.class1}</span>
                  {selectedIndustry.class2 && (
                    <>
                      <ChevronRight className="h-3 w-3" />
                      <span>{selectedIndustry.class2}</span>
                    </>
                  )}
                  {selectedIndustry.class3 && (
                    <>
                      <ChevronRight className="h-3 w-3" />
                      <span className="font-semibold">{selectedIndustry.class3}</span>
                    </>
                  )}
                  {selectedIndustry.code && (
                    <span className="ml-2 text-xs bg-blue-200 px-2 py-1 rounded">
                      {selectedIndustry.code}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
} 