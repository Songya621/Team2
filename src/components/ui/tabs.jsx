import React, { createContext, useContext, useState } from "react";
const Ctx = createContext(null);

export function Tabs({ defaultValue, children }) {
  const [value, setValue] = useState(defaultValue);
  return <Ctx.Provider value={{ value, setValue }}>{children}</Ctx.Provider>;
}
export function TabsList({ children }) {
  return <div className="inline-flex gap-1 bg-slate-100 p-1 rounded-xl">{children}</div>;
}
export function TabsTrigger({ value, children }) {
  const ctx = useContext(Ctx);
  const active = ctx.value === value;
  return (
    <button onClick={()=>ctx.setValue(value)} className={`px-3 py-1.5 rounded-lg text-sm ${active?"bg-white shadow border":"text-slate-600"}`}>
      {children}
    </button>
  );
}
export function TabsContent({ value, children }) {
  const ctx = useContext(Ctx);
  if (ctx.value !== value) return null;
  return <div className="mt-3">{children}</div>;
}
