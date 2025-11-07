import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AreaChart, Area, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "../components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import KPI from "../components/common/KPI";
import { useQuery } from "@tanstack/react-query";

// Mock API 임포트
import { 
  fetchProducts, 
  fetchSeries, 
  fetchMetricsSummary 
} from "../lib/mockApi";

// --- API 호출 훅 ---
const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts
  });
};

const useSeries = (productCode, dateFrom, dateTo) => {
  return useQuery({
    queryKey: ['series', productCode, dateFrom, dateTo, 'scheduled'],
    queryFn: fetchSeries, 
    enabled: !!productCode && !!dateFrom && !!dateTo
  });
};

const useMetricsSummary = (productCode, dateFrom, dateTo) => {
  return useQuery({
    queryKey: ['metricsSummary', productCode, dateFrom, dateTo],
    queryFn: fetchMetricsSummary, 
    enabled: !!productCode && !!dateFrom && !!dateTo
  });
};


export default function SkuDetail(){
  const { id } = useParams();
  const navigate = useNavigate();

  // --- 필터 상태 관리 ---
  const [selectedSku, setSelectedSku] = useState(id || "Product_86");
  const [dateFrom, setDateFrom] = useState("2022-05-09");
  const [dateTo, setDateTo] = useState("2022-05-17");

  // --- API 호출 ---
  const { data: productsData, isLoading: isLoadingProducts } = useProducts();
  const { data: seriesData, isLoading: isLoadingSeries } = useSeries(selectedSku, dateFrom, dateTo);
  const { data: metricsData, isLoading: isLoadingMetrics } = useMetricsSummary(selectedSku, dateFrom, dateTo);

  // --- 데이터 가공 ---
  const chartData = useMemo(() => {
    return seriesData?.merged?.map(row => ({
        ts: row.ts,
        plan: row.plan,
        pred: row.pred,
        p10: row.yhat_lo,
        p90: row.yhat_hi
    })) || [];
  }, [seriesData]);
  
  const rawPlanData = seriesData?.plan || [];
  const rawPredData = seriesData?.pred || [];

  const kpi = useMemo(() => {
    if (!metricsData || metricsData.error) return { plan_sum: 0, pred_avg: 0, pred_sum: 0 };
    return {
      plan_sum: metricsData.plan_sum || 0,
      pred_avg: metricsData.pred_avg || 0,
      pred_sum: metricsData.pred_sum || 0,
    };
  }, [metricsData]);

  const handleSkuChange = (code) => {
    setSelectedSku(code);
    navigate(`/sku/${code}`);
  };

  // --- JSX (UI) 렌더링 ---
  return (
    <div className="p-4 space-y-4">
      {/* --- 필터 UI --- */}
      <Card className="rounded-2xl">
        <CardContent className="p-4 flex gap-4">
          <div>
            <label className="text-sm font-medium">제품 선택 (Detail)</label>
            {isLoadingProducts ? <p>제품 로딩중...</p> : (
              <select
                className="w-full p-2 border rounded-md"
                value={selectedSku}
                onChange={(e) => handleSkuChange(e.target.value)}
              >
                <option value="">-- 제품 선택 --</option>
                {productsData?.items?.map(p => (
                  <option key={p.product_code} value={p.product_code}>
                    {p.product_code} ({p.name || '이름 없음'})
                  </option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="text-sm font-medium">시작일</label>
            <input type="date" className="w-full p-2 border rounded-md" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">종료일</label>
            <input type="date" className="w-full p-2 border rounded-md" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
        </CardContent>
      </Card>
      
      {/* --- KPI 카드 --- */}
      {isLoadingMetrics ? <p>KPI 로딩중...</p> : (
        <div className="grid grid-cols-3 gap-4">
          <KPI title="총 실적 수주량 (Plan)" value={`${kpi.plan_sum.toLocaleString()} EA`} />
          <KPI title="총 예상 수주량 (Pred)" value={`${kpi.pred_sum.toLocaleString()} EA`} />
          <KPI title="평균 예상 수주량 (Pred Avg)" value={`${kpi.pred_avg.toFixed(2)} EA`} />
        </div>
      )}

      {/* --- 차트 시각화 --- */}
      <Card className="rounded-2xl"><CardContent className="p-4">
        <div className="font-semibold mb-2">예측 vs 실적 ({selectedSku || '제품 미선택'})</div>
        <div className="h-72">
          {isLoadingSeries ? <p>차트 로딩중...</p> : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="ts" /><YAxis /><Tooltip />
                <Legend />
                
                {/* 예측 구간(P90) */}
                <Area 
                  type="monotone" 
                  dataKey="p90" 
                  stroke="transparent" 
                  fill="#8884d8" 
                  fillOpacity={0.15}
                  name="P90 (예측상한)" 
                />
                
                {/* 예측(P50) */}
                <Line 
                  type="monotone" 
                  dataKey="pred" 
                  stroke="#3B82F6"
                  strokeWidth={2} 
                  name="예측(P50)" 
                />
                
                {/* 실적(Actual) */}
                <Line 
                  type="monotone" 
                  dataKey="plan" 
                  stroke="#111827"
                  strokeDasharray="5 5"
                  name="실적(Actual)" 
                />
                
                {/* 예측 구간(P10)*/}
                <Area 
                  type="monotone" 
                  dataKey="p10" 
                  stroke="transparent" 
                  fill="#8884d8" 
                  fillOpacity={0.15}
                  name="P10 (예측하한)" 
                />
                
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent></Card>

      {/* --- Raw Data 탭 --- */}
      <Tabs defaultValue="raw_plan">
        <TabsList>
          <TabsTrigger value="raw_plan">Raw Plan Data</TabsTrigger>
          <TabsTrigger value="raw_pred">Raw Prediction Data</TabsTrigger>
        </TabsList>
        <TabsContent value="raw_plan">
          {isLoadingSeries ? <p>데이터 로딩중...</p> : <RawDataTable data={rawPlanData} />}
        </TabsContent>
        <TabsContent value="raw_pred">
          {isLoadingSeries ? <p>데이터 로딩중...</p> : <RawDataTable data={rawPredData} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RawDataTable({ data }) {
  if (!data || data.length === 0) return <p>데이터가 없습니다.</p>;
  const headers = Object.keys(data[0] || {});
  return (
    <div className="overflow-auto text-sm h-60 border rounded-md">
      <table className="min-w-full">
        <thead className="sticky top-0 bg-slate-100">
          <tr className="text-left text-slate-500 border-b">
            {headers.map(h => <th key={h} className="py-2 px-3">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b">
              {headers.map(h => <td key={`${i}-${h}`} className="py-2 px-3">{String(row[h])}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

