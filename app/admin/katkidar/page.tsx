"use client";

import { useState, useEffect } from "react";
import { getContributions, updateContributionStatus, deleteContribution, type Contribution } from "@/lib/contribution-store";
import { addMekan, addOlay } from "@/lib/admin-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Check, X, Map as MapIcon, BookOpen, Plus, Trash2 } from "lucide-react";

export default function KatkilarAdminPage() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setContributions(getContributions());
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = (id: string, status: 'approved' | 'rejected') => {
    updateContributionStatus(id, status);
    loadData();
  };

  const handleDelete = (id: string) => {
    if (confirm("Bu katkıyı silmek istediğinize emin misiniz?")) {
      deleteContribution(id);
      loadData();
    }
  };

  const handlePublish = (c: Contribution) => {
    if (c.type === "harita") {
      addMekan({
        id: `katki-${c.id}`,
        title: c.title || "İsimsiz Mekan",
        category: (c.category as any) || "tarihi-yapilar",
        categoryLabel: c.category || "Tarihi Yapılar",
        timePeriod: (c.timePeriod as any) || "1900-1960",
        neighborhood: (c.neighborhood as any) || "Sinanpaşa",
        address: c.address || "",
        coordinates: c.coordinates || [41.0422, 29.0067],
        summary: c.summary || "",
        fullHistory: c.description || c.summary || "",
        images: c.imageUrls || [],
      });
      alert("Mekan eklendi!");
    } else {
      addOlay({
        id: `katki-${c.id}`,
        title: c.eventTitle || "İsimsiz Olay",
        date: c.eventDate || "",
        era: c.era || "Cumhuriyet Dönemi",
        category: (c.eventCategory as any) || "toplumsal",
        categoryLabel: c.eventCategory || "Toplumsal",
        summary: c.eventSummary || "",
        fullText: c.eventDescription || c.eventSummary || "",
        location: c.eventLocation || "",
        tags: c.tags || [],
        image: c.imageUrls?.[0] || ""
      });
      alert("Olay eklendi!");
    }
  };

  const columns: Column<Contribution>[] = [
    {
      key: "type",
      label: "Tür",
      render: (c: Contribution) => (
        <Badge variant="outline" className={c.type === 'harita' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-purple-500/10 text-purple-500 border-purple-500/20'}>
          {c.type === 'harita' ? <MapIcon className="w-3 h-3 mr-1" /> : <BookOpen className="w-3 h-3 mr-1" />}
          {c.type === 'harita' ? 'Harita' : 'Ansiklopedi'}
        </Badge>
      )
    },
    {
      key: "title",
      label: "Başlık",
      render: (c: Contribution) => (
        <div>
          <div className="font-medium">{c.type === 'harita' ? c.title : c.eventTitle}</div>
          <div className="text-xs text-muted-foreground line-clamp-1">{c.type === 'harita' ? c.summary : c.eventSummary}</div>
        </div>
      )
    },
    {
      key: "submitterName",
      label: "Gönderen",
      render: (c: Contribution) => (
        <div>
          <div className="font-medium text-sm">{c.submitterName}</div>
          <div className="text-xs text-muted-foreground">{c.submitterEmail}</div>
        </div>
      )
    },
    {
      key: "submittedAt",
      label: "Tarih",
      render: (c: Contribution) => new Date(c.submittedAt).toLocaleDateString("tr-TR")
    },
    {
      key: "status",
      label: "Durum",
      render: (c: Contribution) => {
        const variants: Record<string, string> = {
          pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
          approved: "bg-green-500/10 text-green-500 border-green-500/20",
          rejected: "bg-red-500/10 text-red-500 border-red-500/20"
        };
        const labels: Record<string, string> = {
          pending: "Bekliyor",
          approved: "Onaylandı",
          rejected: "Reddedildi"
        };
        return <Badge variant="outline" className={variants[c.status]}>{labels[c.status]}</Badge>;
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--a-text)]">Katkı Yönetimi</h1>
          <p className="text-sm text-[var(--a-muted)]">Kullanıcılardan gelen mekan ve olay önerilerini inceleyin.</p>
        </div>
      </div>

      <Card className="bg-[var(--a-card)] border-[var(--a-border)] shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-[var(--a-text)]">Gelen Katkılar</CardTitle>
          <CardDescription className="text-[var(--a-muted)]">
            Toplam {contributions.length} katkı bulundu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable 
            data={contributions}
            columns={columns}
            searchKeys={["submitterName", "submitterEmail", "title", "eventTitle"]}
            actions={(c) => (
              <div className="flex items-center gap-2">
                {c.status === "pending" && (
                  <>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-500/10" onClick={() => handleStatusChange(c.id, "approved")} title="Onayla">
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => handleStatusChange(c.id, "rejected")} title="Reddet">
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
                {c.status === "approved" && (
                  <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => handlePublish(c)}>
                    <Plus className="h-3 w-3" /> Ekle
                  </Button>
                )}
                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(c.id)} title="Sil">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
