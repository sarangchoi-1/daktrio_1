export interface IndustryCode {
  code: string;
  class1: string; // 대분류
  class2: string; // 중분류
  class3: string; // 소분류
}

export interface IndustryHierarchy {
  [class1: string]: {
    [class2: string]: {
      code: string;
      class3: string;
    }[];
  };
}

// CSV 데이터를 파싱하여 업종 코드 배열로 변환
export function parseIndustryCSV(csvText: string): IndustryCode[] {
  const lines = csvText.trim().split('\n');
  const header = lines[0];
  
  // 헤더를 제거하고 데이터만 처리
  const dataLines = lines.slice(1);
  
  return dataLines.map(line => {
    // CSV 파싱 (따옴표 처리)
    const matches = line.match(/"([^"]+)"/g);
    if (!matches || matches.length < 4) {
      throw new Error(`Invalid CSV line: ${line}`);
    }
    
    const [code, class1, class2, class3] = matches.map(match => 
      match.slice(1, -1) // 따옴표 제거
    );
    
    return {
      code,
      class1,
      class2,
      class3
    };
  });
}

// 업종 코드 배열을 계층적 구조로 변환
export function buildIndustryHierarchy(industryCodes: IndustryCode[]): IndustryHierarchy {
  const hierarchy: IndustryHierarchy = {};
  
  industryCodes.forEach(item => {
    if (!hierarchy[item.class1]) {
      hierarchy[item.class1] = {};
    }
    
    if (!hierarchy[item.class1][item.class2]) {
      hierarchy[item.class1][item.class2] = [];
    }
    
    hierarchy[item.class1][item.class2].push({
      code: item.code,
      class3: item.class3
    });
  });
  
  return hierarchy;
}

// 대분류 목록 추출
export function getClass1Options(hierarchy: IndustryHierarchy): string[] {
  return Object.keys(hierarchy).sort();
}

// 선택된 대분류에 대한 중분류 목록 추출
export function getClass2Options(hierarchy: IndustryHierarchy, class1: string): string[] {
  if (!hierarchy[class1]) return [];
  return Object.keys(hierarchy[class1]).sort();
}

// 선택된 대분류, 중분류에 대한 소분류 목록 추출
export function getClass3Options(
  hierarchy: IndustryHierarchy, 
  class1: string, 
  class2: string
): { code: string; class3: string }[] {
  if (!hierarchy[class1] || !hierarchy[class1][class2]) return [];
  return hierarchy[class1][class2];
}

// CSV 파일을 로드하고 파싱하는 함수
export async function loadIndustryData(): Promise<IndustryHierarchy> {
  try {
    // 변환된 UTF-8 파일을 로드
    const response = await fetch('/data/카드소비_업종코드_utf8.csv');
    if (!response.ok) {
      throw new Error('Failed to load industry data');
    }
    
    const csvText = await response.text();
    const industryCodes = parseIndustryCSV(csvText);
    return buildIndustryHierarchy(industryCodes);
  } catch (error) {
    console.error('Error loading industry data:', error);
    return {};
  }
} 