import React from "react";
export function Button({ variant="default", className="", ...props }) {
  const base = "inline-flex items-center justify-center px-3 py-2 rounded-2xl text-sm border transition";
  const styles = {
    default: "bg-slate-900 text-white border-slate-900 hover:opacity-90",
    outline: "bg-white text-slate-700 border-slate-300 hover:bg-slate-50",
    secondary: "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200",
    ghost: "bg-transparent text-slate-700 border-transparent hover:bg-slate-100",
  };
  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />;
}
