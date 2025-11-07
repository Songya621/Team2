const MOCK_PRODUCTS = {
  items: [
    { product_id: 1, product_code: "Product_86", name: "제품_86 (테스트)" },
    { product_id: 2, product_code: "Product_c9", name: "제품_c9 (대형)" },
    { product_id: 3, product_code: "Product_12", name: "제품_12 (소형)" },
    { product_id: 4, product_code: "Product_A4", name: "제품_A4" },
    { product_id: 5, product_code: "Product_B2", name: "제품_B2" },
  ],
};

const MOCK_GLOBAL_KPIS = {
  today_total_prediction: 12560,
  today_avg_spread: 130.5,
  today_risk_sku_count: 8,
  smape_7d: 14.8,
};

const MOCK_GLOBAL_SERIES = {
  items: [
    { ts: "2022-05-09", plan: 11000, pred: 0, p10: 0, p90: 0 },
    { ts: "2022-05-10", plan: 12500, pred: 0, p10: 0, p90: 0 },
    { ts: "2022-05-11", plan: 10500, pred: 10200, p10: 9800, p90: 11000 },
    { ts: "2022-05-12", plan: 9800, pred: 9700, p10: 9000, p90: 10500 },
    { ts: "2022-05-13", plan: 9500, pred: 9600, p10: 9100, p90: 10300 },
    { ts: "2022-05-14", plan: 8800, pred: 9000, p10: 8500, p90: 9800 },
    { ts: "2022-05-15", plan: 8500, pred: 8800, p10: 8200, p90: 9500 },
    { ts: "2022-05-16", plan: 9200, pred: 0, p10: 0, p90: 0 },
    { ts: "2022-05-17", plan: 11200, pred: 0, p10: 0, p90: 0 },
  ],
};

const MOCK_TOP_RISK_SKUS = {
  items: [
    {
      product_code: "Product_c9",
      name: "제품_c9 (대형)",
      avg_spread: 210.5,
      total_pred: 5000,
      total_plan: 4800,
    },
    {
      product_code: "Product_A4",
      name: "제품_A4",
      avg_spread: 180.2,
      total_pred: 3200,
      total_plan: 3300,
    },
    {
      product_code: "Product_12",
      name: "제품_12 (소형)",
      avg_spread: 95.0,
      total_pred: 1500,
      total_plan: 1550,
    },
  ],
};

function getMultiplier(productCode) {
  const code = productCode.split("_")[1] || "1";
  const baseVal = parseInt(
    code.replace(/\D/g, "") || code.charCodeAt(0) % 10 || "1",
    10
  );
  return 1 + (baseVal % 100) / 100;
}
function getMockMetricsSummary(productCode, dateFrom, dateTo) {
  const multiplier = getMultiplier(productCode);
  return {
    product_code: productCode,
    period: { from: dateFrom, to: dateTo },
    plan_sum: Math.floor(multiplier * 1500 + 200),
    pred_sum: Math.floor(multiplier * 1450 + 180),
    pred_avg: Math.floor(multiplier * 150 + 10),
  };
}
function getMockSeries(productCode, dateFrom, dateTo, planType) {
  const multiplier = getMultiplier(productCode);
  const base_plan = [80, 90, 100, 30, 25, 28, 22, 35, 40];
  const base_pred = [0, 0, 105, 40, 30, 30, 25, 0, 0];
  const dates = [
    "2022-05-09",
    "2022-05-10",
    "2022-05-11",
    "2022-05-12",
    "2022-05-13",
    "2022-05-14",
    "2022-05-15",
    "2022-05-16",
    "2022-05-17",
  ];
  const merged = [];
  for (let i = 0; i < dates.length; i++) {
    let plan = Math.floor(
      base_plan[i] * multiplier + (Math.random() - 0.5) * 10
    );
    let pred = Math.floor(
      base_pred[i] * multiplier + (Math.random() - 0.5) * 5
    );
    if (productCode === "Product_86" && dates[i] === "2022-05-11") {
      plan = 2200;
      pred = 66;
    }
    let yhat_lo = 0;
    let yhat_hi = 0;
    if (pred > 0) {
      yhat_lo = Math.max(0, pred * (0.85 - Math.random() * 0.1));
      yhat_hi = pred * (1.15 + Math.random() * 0.1);
    }
    merged.push({
      ts: dates[i],
      plan: Math.max(0, plan),
      pred: Math.max(0, pred),
      yhat_lo: Math.max(0, yhat_lo),
      yhat_hi: Math.max(0, yhat_hi),
    });
  }
  const plan = merged.map((d) => ({ ts: d.ts, qty: d.plan }));
  const pred = merged
    .filter((d) => d.pred > 0)
    .map((d) => ({
      target_ts: d.ts,
      yhat: d.pred,
      yhat_lo: d.yhat_lo,
      yhat_hi: d.yhat_hi,
    }));
  return { plan, pred, merged };
}

// 7. EDA Lab: 분포 (히스토그램)
function getMockDistribution(productCode, target) {
  const multiplier = productCode ? getMultiplier(productCode) : 1;
  const targetMultiplier = target === "pred" ? 0.8 : 1.1;

  const baseCounts = [1500, 820, 310, 120, 50, 15];

  return {
    bins: ["0-50", "50-100", "100-150", "150-200", "200-250", "250+"],
    counts: baseCounts
      .map((c) =>
        Math.floor(
          c * multiplier * targetMultiplier + (Math.random() - 0.5) * 50
        )
      )
      .map((c) => Math.max(0, c)),
  };
}

// 8. EDA Lab: 요일별 패턴
function getMockWeekdayDistribution(productCode, target) {
  const multiplier = productCode ? getMultiplier(productCode) : 1;
  const targetMultiplier = target === "pred" ? 0.9 : 1.0;

  const baseQty = [
    1800, // 월 (1)
    1200, // 화 (2)
    1000, // 수 (3)
    1100, // 목 (4)
    1500, // 금 (5)
    300, // 토 (6)
    200, // 일 (0)
  ];

  return [
    { name: "월", qty: Math.floor(baseQty[0] * multiplier * targetMultiplier) },
    { name: "화", qty: Math.floor(baseQty[1] * multiplier * targetMultiplier) },
    { name: "수", qty: Math.floor(baseQty[2] * multiplier * targetMultiplier) },
    { name: "목", qty: Math.floor(baseQty[3] * multiplier * targetMultiplier) },
    { name: "금", qty: Math.floor(baseQty[4] * multiplier * targetMultiplier) },
    { name: "토", qty: Math.floor(baseQty[5] * multiplier * targetMultiplier) },
    { name: "일", qty: Math.floor(baseQty[6] * multiplier * targetMultiplier) },
  ];
}

// 9. EDA Lab: 월별 수주량 추이
function getMockMonthlyTrend(productCode, target) {
  const multiplier = productCode ? getMultiplier(productCode) : 1;
  const targetMultiplier = target === "pred" ? 0.9 : 1.0;

  const baseTrend = [
    8000, 8200, 8500, 9000, 9200, 9500, 9800, 10200, 10500, 11000, 10800, 11500,
  ];
  const months = [
    "2021-06",
    "2021-07",
    "2021-08",
    "2021-09",
    "2021-10",
    "2021-11",
    "2021-12",
    "2022-01",
    "2022-02",
    "2022-03",
    "2022-04",
    "2022-05",
  ];

  return months.map((month, index) => ({
    name: month,
    qty: Math.floor(
      baseTrend[index] * multiplier * targetMultiplier +
        (Math.random() - 0.5) * 200
    ),
  }));
}

// --- [Mock API] ---
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const fetchGlobalKpis = async () => {
  await delay(500);
  return MOCK_GLOBAL_KPIS;
};
export const fetchGlobalSeries = async () => {
  await delay(1000);
  return MOCK_GLOBAL_SERIES;
};
export const fetchTopRiskSkus = async () => {
  await delay(1200);
  return MOCK_TOP_RISK_SKUS;
};
export const fetchProducts = async () => {
  await delay(300);
  return MOCK_PRODUCTS;
};

export const fetchMetricsSummary = async ({ queryKey }) => {
  const [_key, productCode, dateFrom, dateTo] = queryKey;
  await delay(500);
  return getMockMetricsSummary(productCode, dateFrom, dateTo);
};

export const fetchSeries = async ({ queryKey }) => {
  const [_key, productCode, dateFrom, dateTo, planType] = queryKey;
  await delay(800);
  return getMockSeries(productCode, dateFrom, dateTo, planType);
};

export const fetchSeriesForExplorer = (
  productCode,
  dateFrom,
  dateTo,
  planType
) => {
  return async () => {
    await delay(800 + Math.random() * 500);
    return getMockSeries(productCode, dateFrom, dateTo, planType);
  };
};

export const fetchDistribution = async ({ queryKey }) => {
  const [_key, productCode, dateFrom, dateTo, target] = queryKey;
  await delay(700);
  return getMockDistribution(productCode, target);
};

// [FIX] 캘린더 히트맵 관련 API 삭제
// export const fetchCalendar = ... (삭제)

export const fetchWeekdayDistribution = async ({ queryKey }) => {
  const [_key, productCode, dateFrom, dateTo, target] = queryKey;
  await delay(600);
  return getMockWeekdayDistribution(productCode, target);
};

export const fetchMonthlyTrend = async ({ queryKey }) => {
  const [_key, productCode, dateFrom, dateTo, target] = queryKey;
  await delay(900);
  return getMockMonthlyTrend(productCode, target);
};
