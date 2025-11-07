import React, { useState, useMemo } from "react";
import { Card, CardContent } from "../components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
  LineChart, Line 
} from "recharts";

import { 
  fetchProducts, 
  fetchDistribution, 
  fetchWeekdayDistribution,
  fetchMonthlyTrend
} from "../lib/mockApi";

const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts
  });
};

const useDistributionData = (productCode, dateFrom, dateTo, target) => {
  return useQuery({
    queryKey: ['distribution', productCode, dateFrom, dateTo, target],
    queryFn: fetchDistribution,
    enabled: !!dateFrom && !!dateTo && !!target
  });
};

const useWeekdayData = (productCode, dateFrom, dateTo, target) => {
   return useQuery({
    queryKey: ['weekdayDistribution', productCode, dateFrom, dateTo, target],
    queryFn: fetchWeekdayDistribution,
    enabled: !!dateFrom && !!dateTo && !!target
  });
};

const useMonthlyTrendData = (productCode, dateFrom, dateTo, target) => {
  return useQuery({
    queryKey: ['monthlyTrend', productCode, dateFrom, dateTo, target],
    queryFn: fetchMonthlyTrend,
    enabled: !!dateFrom && !!dateTo && !!target
  });
};


export default function EdaLab(){
  // --- 필터 상태 관리 ---
  const [productCode, setProductCode] = useState(""); // 전체: ""
  const [dateFrom, setDateFrom] = useState("2022-05-01");
  const [dateTo, setDateTo] = useState("2022-05-31");
  const [target, setTarget] = useState("plan"); // 'plan' 또는 'pred'

  // --- API 호출 (캘린더 -> 월별 추이) ---
  const { data: productsData, isLoading: isLoadingProducts } = useProducts();
  const { data: distData, isLoading: isLoadingDist } = useDistributionData(productCode, dateFrom, dateTo, target);
  const { data: weekdayData, isLoading: isLoadingWeekday } = useWeekdayData(productCode, dateFrom, dateTo, target);
  const { data: monthlyTrendData, isLoading: isLoadingMonthlyTrend } = useMonthlyTrendData(productCode, dateFrom, dateTo, target);

  // 히스토그램 데이터 가공
  const histogramData = useMemo(() => {
    if (!distData || !distData.bins) return [];
    return distData.bins.map((bin, index) => ({
      name: bin,
      count: distData.counts[index]
    }));
  }, [distData]);
  
  return (
    <div className="p-4 space-y-3">
      <div className="font-semibold text-xl mb-4">EDA Lab: 데이터 탐색</div>
      
      {/* --- 필터 UI --- */}
      <Card className="rounded-2xl">
        <CardContent className="p-4 flex flex-wrap gap-4">
          <div>
            <label className="text-sm font-medium">제품 선택</label>
            {isLoadingProducts ? <p>로딩중...</p> : (
              <select
                className="w-full p-2 border rounded-md"
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
              >
                <option value="">-- 전체 제품 --</option>
                {productsData?.items?.map(p => (
                  <option key={p.product_code} value={p.product_code}>
                    {p.product_code} ({p.name || '이름 없음'})
                  </option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="text-sm font-medium">데이터 대상</label>
            <select
              className="w-full p-2 border rounded-md"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            >
              <option value="plan">실적 (Plan)</option>
              <option value="pred">예측 (Prediction)</option>
            </select>
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
      
      {/* 2행 2열 그리드 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* 1. 분포 */}
        <Card className="rounded-2xl lg:col-span-2">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">수주량 분포 (히스토그램)</h3>
            <div className="h-64 rounded">
              {isLoadingDist ? <p>차트 로딩중...</p> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={histogramData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={10} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name={target === 'plan' ? '실적 건수' : '예측 건수'} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 2. 요일별 수주량 패턴 */}
        <Card className="rounded-2xl">
          <CardContent className="p-4">
             <h3 className="font-semibold mb-2">요일별 수주량 패턴</h3>
             <div className="h-64 rounded">
              {isLoadingWeekday ? <p>요일별 데이터 로딩중...</p> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weekdayData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="qty" fill="#82ca9d" name={target === 'plan' ? '실적 수량' : '예측 수량'} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 3. 월별 수주량 추이 */}
        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">월별 수주량 추이 (최근 12개월)</h3>
            <div className="h-64 rounded">
              {isLoadingMonthlyTrend ? <p>월별 데이터 로딩중...</p> : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={10} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="qty" stroke="#ffc658" strokeWidth={2} name={target === 'plan' ? '월별 실적' : '월별 예측'} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

