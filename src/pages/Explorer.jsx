import React, { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "../components/ui/card";
import { useQuery, useQueries } from "@tanstack/react-query";

import { 
  fetchProducts, 
  fetchSeriesForExplorer
} from "../lib/mockApi";

// --- API 호출 훅 ---
const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts
  });
};

const useMultipleSeries = (productCodes = [], dateFrom, dateTo) => {
  const queries = productCodes.map(code => {
    return {
      queryKey: ['series', code, dateFrom, dateTo],
      queryFn: fetchSeriesForExplorer(code, dateFrom, dateTo, 'scheduled'),
      enabled: !!code && !!dateFrom && !!dateTo
    };
  });
  return useQueries({ queries });
};

const mergeChartData = (seriesResults, selectedCodes) => {
  const dataMap = new Map(); 
  
  seriesResults.forEach((result, index) => {
    if (!result.data || !result.data.merged) return;
    const code = selectedCodes[index]; 
    
    result.data.merged.forEach(row => {
      const entry = dataMap.get(row.ts) || { ts: row.ts };
      entry[`${code}_plan`] = row.plan;
      entry[`${code}_pred`] = row.pred;
      entry[`${code}_p10`] = row.yhat_lo;
      entry[`${code}_p90`] = row.yhat_hi;
      dataMap.set(row.ts, entry);
    });
  });
  return Array.from(dataMap.values()).sort((a, b) => a.ts.localeCompare(b.ts));
};
// --- API 호출 훅 끝 ---

//  1. 요청하신 새 색상 팔레트로 COLOR_PAIRS 교체
// (보라/초록, 핑크/오렌지, 레드/블루)
const COLOR_PAIRS = [
  { pred: "#8884d8", plan: "#82ca9d" }, // 제품 1
  { pred: "#FFC0CB", plan: "#FFA500" }, // 제품 2
  { pred: "#FF0000", plan: "#0088FE" }, // 제품 3
  { pred: "#E040FB", plan: "#00C49F" }, // 제품 4
];

export default function Explorer(){
  // --- 필터 상태 관리 ---
  const [selectedCodes, setSelectedCodes] = useState(["Product_86"]);
  const [dateFrom, setDateFrom] = useState("2022-05-09");
  const [dateTo, setDateTo] = useState("2022-05-17");
  
  //  2. 보기 모드(View Mode)를 위한 State 추가
  const [viewMode, setViewMode] = useState("both"); // 'both', 'pred', 'plan'

  // --- API 호출 ---
  const { data: productsData, isLoading: isLoadingProducts } = useProducts();
  const seriesResults = useMultipleSeries(selectedCodes, dateFrom, dateTo);

  // --- 데이터 가공 ---
  const chartData = useMemo(() => mergeChartData(seriesResults, selectedCodes), [seriesResults, selectedCodes]);
  const isLoadingChart = seriesResults.some(q => q.isLoading);

  const handleSelectProduct = (code) => {
    setSelectedCodes(prev => {
      if (prev.includes(code)) {
        return prev.filter(c => c !== code);
      } else {
        return [...prev, code];
      }
    });
  };

  return (
    <div className="p-4 grid grid-cols-12 gap-4">
      {/* --- 필터 UI --- */}
      <div className="col-span-3 space-y-3">
        <Card className="rounded-2xl"><CardContent className="p-4 space-y-3">
          <div className="font-semibold mb-1">필터</div>
          <div>
            <label className="text-sm font-medium">시작일</label>
            <input type="date" className="w-full p-2 border rounded-md" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">종료일</label>
            <input type="date" className="w-full p-2 border rounded-md" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <div className="font-semibold mb-1">보기 모드</div>
          <div className="flex flex-col text-sm">
            <label>
              <input 
                type="radio" 
                name="viewMode" 
                value="both" 
                checked={viewMode === 'both'} 
                onChange={(e) => setViewMode(e.target.value)}
              />
              예측 vs 실적 (비교)
            </label>
            <label>
              <input 
                type="radio" 
                name="viewMode" 
                value="pred" 
                checked={viewMode === 'pred'} 
                onChange={(e) => setViewMode(e.target.value)}
              />
              예측만 보기
            </label>
            <label>
              <input 
                type="radio" 
                name="viewMode" 
                value="plan" 
                checked={viewMode === 'plan'} 
                onChange={(e) => setViewMode(e.target.value)}
              />
              실적만 보기
            </label>
          </div>

          <div className="font-semibold mb-1">제품 (다중 선택 가능)</div>
          <div className="max-h-60 overflow-y-auto border rounded-md p-2">
            {isLoadingProducts ? <p>로딩중...</p> : productsData?.items?.map(p => (
              <div key={p.product_code} className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id={`chk-${p.product_code}`}
                  checked={selectedCodes.includes(p.product_code)}
                  onChange={() => handleSelectProduct(p.product_code)}
                />
                <label htmlFor={`chk-${p.product_code}`}>{p.product_code} ({p.name})</label>
              </div>
            ))}
          </div>
        </CardContent></Card>
      </div>

      <div className="col-span-9 space-y-3">
        <Card className="rounded-2xl"><CardContent className="p-4">
          <div className="font-semibold mb-2">SKU 비교 – 예측(Pred) vs 실적(Plan)</div>
          <div className="h-[calc(100vh-200px)]">
            {isLoadingChart ? <p>차트 로딩중...</p> : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="ts"/><YAxis/><Tooltip/>
                  <Legend/>
                  
                  {/* '예측' 라인 (실선) */}
                  {(viewMode === 'both' || viewMode === 'pred') && selectedCodes.map((code, i) => {
                    const color = COLOR_PAIRS[i % COLOR_PAIRS.length].pred;
                    return (
                      <Line 
                        key={`pred-${code}`} 
                        type="monotone" 
                        dataKey={`${code}_pred`} 
                        name={`${code} (예측)`} 
                        stroke={color}
                        strokeWidth={2}
                      />
                    );
                  })}
                  
                  {/* '실적' 라인 (점선) */}
                  {(viewMode === 'both' || viewMode === 'plan') && selectedCodes.map((code, i) => {
                    const color = COLOR_PAIRS[i % COLOR_PAIRS.length].plan;
                    return (
                      <Line 
                        key={`plan-${code}`} 
                        type="monotone" 
                        dataKey={`${code}_plan`} 
                        name={`${code} (실적)`} 
                        stroke={color}
                        strokeDasharray="5 5"
                      />
                    );
                  })}
                  
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent></Card>
      </div>
    </div>
  );
}

