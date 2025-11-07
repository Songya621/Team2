// http://172.30.1.7/api/v1
// http://192.168.2.143/api/v1

import React from "react";
import { Routes, Route } from "react-router-dom";
import TopBar from "./components/layout/TopBar";
import SideNav from "./components/layout/SideNav";
import Overview from "./pages/Overview";
import Explorer from "./pages/Explorer";
import EdaLab from "./pages/EdaLab";
import SkuDetail from "./pages/SkuDetail";

export default function App() {
  return (
    <div className="h-screen w-screen bg-slate-50 text-slate-900">
      <TopBar onRefresh={() => {}} />
      <div className="flex">
        <SideNav />
        <div className="flex-1 h-[calc(100vh-56px)] overflow-auto">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/explorer" element={<Explorer />} />
            <Route path="/sku/:id" element={<SkuDetail />} />
            <Route path="/eda" element={<EdaLab />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
