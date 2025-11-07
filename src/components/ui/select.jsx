import React from "react";
export function Select({ children, ...props }) {
  return <select className="border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white" {...props}>{children}</select>;
}
export const SelectTrigger = ({ children, className="", ...p }) => <div className={`inline-block ${className}`}>{children}</div>;
export const SelectContent = ({ children }) => <>{children}</>;
export const SelectItem = ({ children, value }) => <option value={value}>{children}</option>;
export const SelectValue = ({ placeholder }) => <span className="text-slate-500">{placeholder}</span>;
