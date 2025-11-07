import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "../ui/card";

export default function KPI({ title, value, delta, help }) {
  const icon = delta == null ? null : delta > 0 ? <TrendingUp className="w-4 h-4 text-emerald-600"/> : delta < 0 ? <TrendingDown className="w-4 h-4 text-rose-600"/> : <Minus className="w-4 h-4 text-slate-500"/>;
  const deltaText = delta == null ? null : <span className={`text-sm ${delta>0?"text-emerald-600":delta<0?"text-rose-600":"text-slate-500"}`}>{delta>0?`+${delta}%`:`${delta}%`}</span>;
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="p-4">
        <div className="text-sm text-slate-500">{title}</div>
        <div className="mt-1 flex items-center gap-2">
          <div className="text-2xl font-semibold tabular-nums">{value}</div>
          {icon}{deltaText}
        </div>
        {help && <div className="text-xs text-slate-400 mt-1">{help}</div>}
      </CardContent>
    </Card>
  );
}
