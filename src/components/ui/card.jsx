import React from "react";
export function Card({ className="", ...props }) {
  return <div className={`bg-white border border-slate-200 rounded-2xl shadow-sm ${className}`} {...props} />;
}
export function CardContent({ className="", ...props }) {
  return <div className={className} {...props} />;
}
