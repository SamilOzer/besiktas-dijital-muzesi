"use client";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { monthlyVisits, categoryStats } from "@/lib/admin-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const CHART_COLOR = "#c5a059";
const BAR_COLOR   = "#4a9ead";

export function VisitsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aylık Ziyaretçi Trendi</CardTitle>
        <CardDescription>Son 8 ayın ziyaretçi ve etkinlik verisi</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={monthlyVisits} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="visitsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={CHART_COLOR} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLOR} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--a-border)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--a-muted)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--a-muted)" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: "var(--a-surface)",
                border: "1px solid var(--a-border)",
                borderRadius: "8px",
                color: "var(--a-text)",
                fontSize: "12px",
              }}
              labelStyle={{ color: "var(--a-text)", fontWeight: 600 }}
            />
            <Area
              type="monotone" dataKey="visits" name="Ziyaretçi"
              stroke={CHART_COLOR} strokeWidth={2}
              fill="url(#visitsGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function CategoryChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mekân Kategorileri</CardTitle>
        <CardDescription>Kategorilere göre kayıtlı mekân sayısı</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={categoryStats} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--a-border)" horizontal={true} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--a-muted)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--a-muted)" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: "var(--a-surface)",
                border: "1px solid var(--a-border)",
                borderRadius: "8px",
                color: "var(--a-text)",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="count" name="Mekân" fill={BAR_COLOR} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
