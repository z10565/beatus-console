"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function RevenueChart({ data }: { data: { name: string; amount: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
        <YAxis
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `€${v}`}
        />
        <Tooltip
          cursor={{ fill: "rgba(79, 70, 229, 0.08)" }}
          formatter={(value) => [`€${Number(value).toFixed(2)}`, "Revenue"]}
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            background: "white",
            border: "1px solid #e5e7eb",
            padding: "6px 10px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        />
        <Bar dataKey="amount" fill="#4f46e5" radius={[4, 4, 0, 0]} activeBar={{ fill: "#4338ca" }} />
      </BarChart>
    </ResponsiveContainer>
  );
}
