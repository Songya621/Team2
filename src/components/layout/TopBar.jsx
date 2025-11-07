import React from "react";
import { Database, CalendarClock, Search, Bell, RefreshCw } from "lucide-react";
import Badge from "../common/Badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export default function TopBar({ onRefresh }) {
  return (
    <div className="h-14 px-4 border-b bg-white flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Database className="w-5 h-5"/>
        <div className="font-semibold">사출 수주량 예측 대시보드</div>
        <Badge>모델 v1.2</Badge>
        <Badge>품질 92/100</Badge>
        <Badge intent="warn"><CalendarClock className="w-3 h-3 inline mr-1"/>업데이트 00:05</Badge>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Input placeholder="제품ID/태그 검색" className="pl-8 w-64"/>
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5"/>
        </div>
        <Button variant="outline" onClick={onRefresh}><RefreshCw className="w-4 h-4 mr-1"/>새 예측 적용</Button>
        <Button variant="ghost"><Bell className="w-5 h-5"/></Button>
      </div>
    </div>
  );
}
