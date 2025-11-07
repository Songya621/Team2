const BASE = "";

export async function health() {
  const r = await fetch(`${BASE}/api/v1/health`);
  if (!r.ok) throw new Error(`health failed ${r.status}`);
  return r.json();
}

// 아래 엔드포인트도 모두 /api → /api/v1 로 맞추기
export async function getProduct(code) {
  const r = await fetch(`${BASE}/api/v1/products/${encodeURIComponent(code)}`);
  if (!r.ok) throw new Error(`getProduct failed ${r.status}`);
  return r.json();
}

export async function listPredictions({ product_code, date_from, date_to }) {
  const qs = new URLSearchParams({ product_code, date_from, date_to });
  const r = await fetch(`${BASE}/api/v1/predictions?${qs.toString()}`);
  if (!r.ok) throw new Error(`listPredictions failed ${r.status}`);
  const j = await r.json();
  return j.items ?? [];
}

export async function listPlan({
  product_code,
  date_from,
  date_to,
  plan_type,
}) {
  const qs = new URLSearchParams({ product_code, date_from, date_to });
  if (plan_type) qs.set("plan_type", plan_type);
  const r = await fetch(`${BASE}/api/v1/plan?${qs.toString()}`);
  if (!r.ok) throw new Error(`listPlan failed ${r.status}`);
  const j = await r.json();
  return j.items ?? [];
}
