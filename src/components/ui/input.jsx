import React from "react";
export function Input({ className="", ...props }) {
  return <input className={`border border-slate-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300 ${className}`} {...props} />;
}
