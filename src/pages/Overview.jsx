import React, { useMemo } from "react";
import { AreaChart, Area, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer } from "recharts";
import { Filter } from "lucide-react"; 
import { Card, CardContent } from "../components/ui/card";
import KPI from "../components/common/KPI";
import Badge from "../components/common/Badge";
import { useQuery } from "@tanstack/react-query";
import { 
  fetchGlobalKpis, 
  fetchGlobalSeries, 
  fetchTopRiskSkus 
} from "../lib/mockApi"; 

const useGlobalKpis = () => {
  return useQuery({
    queryKey: ['globalKpis'],
    queryFn: fetchGlobalKpis // 'fetch(...)' -> 'fetchGlobalKpis'
  });
};

const useGlobalSeries = () => {
  return useQuery({
    queryKey: ['globalSeries'],
    queryFn: fetchGlobalSeries // 'fetch(...)' -> 'fetchGlobalSeries'
  });
};

const useTopRiskSkus = () => {
  return useQuery({
    queryKey: ['topRiskSkus'],
    queryFn: fetchTopRiskSkus // 'fetch(...)' -> 'fetchTopRiskSkus'
  });
};


export default function Overview() {
  const { data: kpiData, isLoading: isLoadingKpis } = useGlobalKpis();
  const { data: seriesData, isLoading: isLoadingSeries } = useGlobalSeries();
  const { data: riskData, isLoading: isLoadingRisk } = useTopRiskSkus();
  const kpis = useMemo(() => {
    if (!kpiData) return { total: 0, spread: 0, riskCount: 0, smape: 0 };
    return {
      total: kpiData.today_total_prediction || 0,
      spread: kpiData.today_avg_spread || 0,
      riskCount: kpiData.today_risk_sku_count || 0,
      smape: kpiData.smape_7d || 0
    };
  }, [kpiData]);

  const chartData = seriesData?.items || [];
  const riskRows = riskData?.items || [];

  return (
    <div className="p-4 space-y-4">
      {isLoadingKpis ? <p>KPI 로딩중...</p> : (
        <div className="grid grid-cols-4 gap-4">
          <KPI title="오늘 총 예상 수주량(P50)" value={`${kpis.total.toLocaleString()} EA`} />
          <KPI title="평균 불확실성 폭(Spread)" value={`${kpis.spread.toFixed(2)} EA`} />
          <KPI title="위험 SKU 수" value={`${kpis.riskCount} EA`} />
          <KPI title="7일 평균 sMAPE" value={`${kpis.smape.toFixed(2)} %`} />
        </div>
      )}

      <Card className="rounded-2xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold">주간 총수주량 – 실제 vs 예측</div>
            <div className="flex items-center gap-2 text-sm text-slate-500"><Filter className="w-4 h-4"/> 전체 SKU</div>
          </div>
          {isLoadingSeries ? <p>차트 로딩중...</p> : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ts" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="p90" stroke="#94a3b8" fill="#94a3b833" name="P90 (예측상한)" />
                  <Line type="monotone" dataKey="pred" stroke="#0ea5e9" name="예측(P50)" />
                  <Line type="monotone" dataKey="plan" stroke="#111827" name="실적(Actual)" />
                  <Area type="monotone" dataKey="p10" stroke="#94a3b8" fill="#94a3b833" name="P10 (예측하한)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="rounded-2xl">
        <CardContent className="p-4">
          <div className="font-semibold mb-3">Top Risk SKU (스프레드 기반)</div>
          <div className="overflow-auto">
            {isLoadingRisk ? <p>테이블 로딩중...</p> : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b">
                    <th className="py-2 pr-4">SKU</th>
                    <th className="py-2 pr-4">이름</th>
                    <th className="py-2 pr-4">평균 Spread</th>
                    <th className="py-2 pr-4">총 예측</th>
                    <th className="py-2 pr-4">총 실적</th>
                    <th className="py-2 pr-4">배지</th>
                  </tr>
                </thead>
                <tbody>
                  {riskRows.map(r => (
                    <tr key={r.product_code} className="border-b hover:bg-slate-50">
                      <td className="py-2 pr-4 font-medium">{r.product_code}</td>
                      <td className="py-2 pr-4">{r.name}</td>
                      <td className="py-2 pr-4 tabular-nums">{r.avg_spread?.toFixed(2)}</td>
                      <td className="py-2 pr-4 tabular-nums">{r.total_pred?.toLocaleString()}</td>
                      <td className="py-2 pr-4 tabular-nums">{r.total_plan?.toLocaleString()}</td>
                      <td className="py-2 pr-4"><Badge intent="warn">변동큼</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

