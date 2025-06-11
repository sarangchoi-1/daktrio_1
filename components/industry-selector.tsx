"use client"

import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, ChevronRight } from "lucide-react"
import { 
  loadIndustryData, 
  getClass1Options, 
  getClass2Options, 
  getClass3Options,
  type IndustryHierarchy 
} from "@/lib/industry-data"

export interface SelectedIndustry {
  class1?: string;
  class2?: string;
  class3?: string;
  code?: string;
}

interface IndustrySelectorProps {
  onIndustryChange?: (industry: SelectedIndustry) => void;
}

export function IndustrySelector({ onIndustryChange }: IndustrySelectorProps) {
  const [industryData, setIndustryData] = useState<IndustryHierarchy>({});
  const [selectedIndustry, setSelectedIndustry] = useState<SelectedIndustry>({});
  const [isLoading, setIsLoading] = useState(true);

  // 업종 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await loadIndustryData();
        setIndustryData(data);
      } catch (error) {
        console.error('Failed to load industry data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-gray-500">업종 데이터 로딩중...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const class1Options = getClass1Options(industryData);
  const class2Options = selectedIndustry.class1 
    ? getClass2Options(industryData, selectedIndustry.class1) 
    : [];
  const class3Options = selectedIndustry.class1 && selectedIndustry.class2
    ? getClass3Options(industryData, selectedIndustry.class1, selectedIndustry.class2)
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          창업 희망 업종 선택
        </CardTitle>
        <CardDescription>
          대분류 → 중분류 → 소분류 순서로 원하는 업종을 선택하세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 대분류 선택 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">대분류</label>
            <Select onValueChange={handleClass1Change} value={selectedIndustry.class1 || ""}>
              <SelectTrigger>
                <SelectValue placeholder="대분류 선택" />
              </SelectTrigger>
              <SelectContent>
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
              <SelectContent>
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
              <SelectContent>
                {class3Options.map((option) => (
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
  );
} 