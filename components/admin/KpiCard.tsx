"use client";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: number; // percentage change, positive = up
  color?: string; // icon bg color
}

export default function KpiCard({ title, value, subtitle, icon, trend, color = "#c5a059" }: KpiCardProps) {
  const trendUp   = trend !== undefined && trend > 0;
  const trendDown = trend !== undefined && trend < 0;

  return (
    <Card className="relative overflow-hidden hover:shadow-md transition-shadow">
      {/* Color accent strip */}
      <div className="absolute top-0 left-0 w-1 h-full rounded-l-xl" style={{ background: color }} />

      <CardContent className="pl-6 pr-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider truncate" style={{ color: "var(--a-muted)" }}>
              {title}
            </p>
            <p className="text-3xl font-bold mt-1 leading-none" style={{ color: "var(--a-text)" }}>
              {typeof value === "number" ? value.toLocaleString("tr-TR") : value}
            </p>
            {subtitle && (
              <p className="text-xs mt-1.5" style={{ color: "var(--a-muted)" }}>{subtitle}</p>
            )}
          </div>

          {/* Icon */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${color}20`, color }}
          >
            {icon}
          </div>
        </div>

        {/* Trend */}
        {trend !== undefined && (
          <div className={cn(
            "flex items-center gap-1 mt-3 text-xs font-semibold",
            trendUp && "text-green-600",
            trendDown && "text-red-500",
            !trendUp && !trendDown && "text-gray-400"
          )}>
            {trendUp   && <TrendingUp size={13} />}
            {trendDown && <TrendingDown size={13} />}
            {!trendUp && !trendDown && <Minus size={13} />}
            <span>
              {trend > 0 ? "+" : ""}{trend.toFixed(1)}% geçen aya göre
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
