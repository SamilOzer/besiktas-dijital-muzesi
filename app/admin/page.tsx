"use client";
import { MapPin, BookOpen, Users, TrendingUp } from "lucide-react";
import KpiCard from "@/components/admin/KpiCard";
import { VisitsChart, CategoryChart } from "@/components/admin/StatsChart";
import { getKpiStats, monthlyVisits } from "@/lib/admin-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const stats = getKpiStats();
  const visitsTrend = ((stats.thisMonthVisits - stats.lastMonthVisits) / stats.lastMonthVisits) * 100;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold" style={{ color: "var(--a-text)" }}>
          Hoş geldiniz 👋
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--a-muted)" }}>
          Beşiktaş Dijital Müzesi yönetim paneline genel bakış.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Toplam Mekân"
          value={stats.totalMekanlar}
          subtitle="Kültür haritasında kayıtlı"
          icon={<MapPin size={18} />}
          color="#4a9ead"
        />
        <KpiCard
          title="Tarihi Olay"
          value={stats.totalOlaylar}
          subtitle="Ansiklopedi kayıtları"
          icon={<BookOpen size={18} />}
          color="#c5a059"
        />
        <KpiCard
          title="Aktif Kullanıcı"
          value={stats.activeUsers}
          subtitle={`${stats.totalUsers} toplam kullanıcıdan`}
          icon={<Users size={18} />}
          color="#9b6fd0"
        />
        <KpiCard
          title="Bu Ay Ziyaret"
          value={stats.thisMonthVisits.toLocaleString("tr-TR")}
          subtitle="Ağustos 2026"
          icon={<TrendingUp size={18} />}
          trend={visitsTrend}
          color="#5a9a6b"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <VisitsChart />
        </div>
        <div>
          <CategoryChart />
        </div>
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle style={{ color: "var(--a-text)" }}>Son Aktivite</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { action: "Yeni mekân eklendi",          detail: "Ihlamur Kasrı güncellendi",   time: "2 dk önce",  type: "success" as const },
              { action: "Ansiklopedi olayı düzenlendi", detail: "Barbaros Hayreddin Paşa",     time: "1 sa önce",  type: "default" as const },
              { action: "Kullanıcı rolü değiştirildi", detail: "Zeynep Arslan → editor",      time: "3 sa önce",  type: "secondary" as const },
              { action: "Yeni kayıt",                  detail: "Akaretler Sıraevleri fotoğraf güncellendi", time: "Dün", type: "default" as const },
              { action: "Oturum açıldı",               detail: "admin@besiktas.bel.tr",       time: "Dün",        type: "secondary" as const },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0" style={{ borderColor: "var(--a-border)" }}>
                <Badge variant={item.type} className="flex-shrink-0 text-[10px]">
                  {item.type === "success" ? "Eklendi" : item.type === "default" ? "Güncellendi" : "Sistem"}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--a-text)" }}>{item.action}</p>
                  <p className="text-xs truncate" style={{ color: "var(--a-muted)" }}>{item.detail}</p>
                </div>
                <span className="text-xs flex-shrink-0" style={{ color: "var(--a-muted)" }}>{item.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
