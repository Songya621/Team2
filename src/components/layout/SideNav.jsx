import React from "react";
import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function SideNav() {
  const { pathname } = useLocation();
  const items = [
    { to: "/", label: "Overview" },
    { to: "/explorer", label: "Forecast Explorer" },
    { to: "/sku/Product_86", label: "SKU Detail" },
    { to: "/eda", label: "EDA Lab" },
  ];
  return (
    <div className="w-60 border-r h-[calc(100vh-56px)] p-3 bg-white">
      <div className="text-xs text-slate-500 px-2 mb-2">메뉴</div>
      {items.map(it => {
        const active = pathname === it.to || (it.to.startsWith("/sku") && pathname.startsWith("/sku"));
        return (
          <Link key={it.to} to={it.to} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left mb-1 hover:bg-slate-50 ${active?"bg-slate-100 font-medium":""}`}>
            <span>{it.label}</span><ChevronRight className="w-4 h-4"/>
          </Link>
        );
      })}
    </div>
  );
}
