import React from "react";
export default function Badge({ children, intent="default" }) {
  const color = intent === "warn"
    ? "bg-yellow-100 text-yellow-800 border-yellow-300"
    : intent === "danger"
    ? "bg-red-100 text-red-800 border-red-300"
    : "bg-slate-100 text-slate-700 border-slate-300";
  return <span className={`px-2 py-0.5 rounded-full text-xs border ${color}`}>{children}</span>;
}
