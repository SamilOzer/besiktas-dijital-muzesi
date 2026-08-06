"use client";
import { useEffect, useState } from "react";
import { MapPin, BookOpen, FileText, MessageSquare, Clock } from "lucide-react";
import KpiCard from "@/components/admin/KpiCard";
import { VisitsChart, CategoryChart } from "@/components/admin/StatsChart";
import { getMekanlar, getOlaylar, fetchMekanlar, fetchOlaylar } from "@/lib/admin-store";
import { getContributions, Contribution } from "@/lib/contribution-store";
import { getContactMessages, ContactMessage } from "@/lib/contact-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const [mekanCount, setMekanCount] = useState(0);
  const [olayCount, setOlayCount] = useState(0);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  useEffect(() => {
    let isMounted = true;
    const loadDashboardData = async () => {
      const mekanData = await fetchMekanlar();
      const olayData = await fetchOlaylar();
      const contribData = getContributions();
      const msgData = getContactMessages();

      if (isMounted) {
        setMekanCount(mekanData.length);
        setOlayCount(olayData.length);
        setContributions(contribData);
        setMessages(msgData);
      }
    };

    loadDashboardData();

    const handleUpdate = () => loadDashboardData();
    window.addEventListener("besiktas_data_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("besiktas_data_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const pendingContribs = contributions.filter((c) => c.status === "pending");
  const unreadMsgs = messages.filter((m) => m.status === "unread");

  // Real Dynamic Activity Stream from system stores
  const activities = [
    ...contributions.map((c) => ({
      id: c.id,
      action: c.status === "pending" ? "Yeni Katkı Başvurusu" : c.status === "approved" ? "Katkı Onaylandı" : "Katkı Reddedildi",
      detail: `${c.submitterName} — ${c.title || c.eventTitle || "İçerik Katkısı"}`,
      time: c.submittedAt ? new Date(c.submittedAt).toLocaleDateString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Yakın zamanda",
      badgeText: c.status === "pending" ? "Bekliyor" : c.status === "approved" ? "Yayınlandı" : "Reddedildi",
      badgeVariant: c.status === "pending" ? ("destructive" as const) : c.status === "approved" ? ("default" as const) : ("outline" as const),
    })),
    ...messages.map((m) => ({
      id: m.id,
      action: "İletişim Mesajı",
      detail: `${m.name}: "${m.message.slice(0, 50)}..."`,
      time: m.submittedAt ? new Date(m.submittedAt).toLocaleDateString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Yakın zamanda",
      badgeText: m.status === "unread" ? "Okunmadı" : "Okundu",
      badgeVariant: m.status === "unread" ? ("secondary" as const) : ("outline" as const),
    })),
  ].slice(0, 6);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold" style={{ color: "var(--a-text)" }}>
          Hoş geldiniz 👋
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--a-muted)" }}>
          Beşiktaş Dijital Müzesi yönetim paneline genel bakış. Tüm veriler canlı sistem depolarından çekilmektedir.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Toplam Mekân"
          value={mekanCount}
          subtitle="Kültür haritasında aktif kayıtlı"
          icon={<MapPin size={18} />}
          color="#4a9ead"
        />
        <KpiCard
          title="Tarihi Olay"
          value={olayCount}
          subtitle="Ansiklopedi rehber kayıtları"
          icon={<BookOpen size={18} />}
          color="#c5a059"
        />
        <KpiCard
          title="Bekleyen Katkı"
          value={pendingContribs.length}
          subtitle={`${contributions.length} toplam başvurudan`}
          icon={<FileText size={18} />}
          color="#e85d3a"
        />
        <KpiCard
          title="Okunmayan Mesaj"
          value={unreadMsgs.length}
          subtitle={`${messages.length} toplam iletişim mesajından`}
          icon={<MessageSquare size={18} />}
          color="#9b6fd0"
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

      {/* Real Live Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle style={{ color: "var(--a-text)" }}>Son Sistem Aktiviteleri</CardTitle>
            <CardDescription className="text-xs">Katkıda bulun formları ve canlı iletişim mesajları akışı</CardDescription>
          </div>
          <Badge variant="outline" className="gap-1 text-xs">
            <Clock size={11} /> Canlı Akış
          </Badge>
        </CardHeader>
        <CardContent>
          {activities.length > 0 ? (
            <div className="space-y-3">
              {activities.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-2 border-b last:border-0" style={{ borderColor: "var(--a-border)" }}>
                  <Badge variant={item.badgeVariant} className="flex-shrink-0 text-[10px]">
                    {item.badgeText}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--a-text)" }}>{item.action}</p>
                    <p className="text-xs truncate" style={{ color: "var(--a-muted)" }}>{item.detail}</p>
                  </div>
                  <span className="text-xs flex-shrink-0 font-mono text-[var(--a-muted)]">{item.time}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--a-muted)] py-4 text-center">Henüz kaydedilmiş aktivite bulunmamaktadır.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
