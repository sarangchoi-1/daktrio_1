'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Loader2 } from 'lucide-react';

interface LLMAnalysisProps {
  selectedIndustry?: any;
}

interface AnalysisResult {
  analysis: string;
  industry: string;
}

export default function LLMAnalysis({ selectedIndustry }: LLMAnalysisProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!selectedIndustry || Object.keys(selectedIndustry).length === 0) {
      setError('업종을 선택해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/llm-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedIndustry
        }),
      });

      if (!response.ok) {
        throw new Error('분석 요청에 실패했습니다.');
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI 창업 분석
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <Button 
            onClick={handleAnalyze}
            disabled={loading || !selectedIndustry || Object.keys(selectedIndustry).length === 0}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                분석 중...
              </>
            ) : (
              '창업 분석 시작'
            )}
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {analysis && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">
                {analysis.industry} 업종 창업 분석 결과
              </h4>
              <p className="text-sm text-blue-800 leading-relaxed whitespace-pre-wrap">
                {analysis.analysis}
              </p>
            </div>
          </div>
        )}

        {(!selectedIndustry || Object.keys(selectedIndustry).length === 0) && (
          <div className="text-center text-gray-500 text-sm py-8">
            업종을 선택하면 AI 창업 분석을 받을 수 있습니다
          </div>
        )}
      </CardContent>
    </Card>
  );
} 