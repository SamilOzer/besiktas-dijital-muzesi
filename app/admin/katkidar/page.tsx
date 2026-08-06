"use client";

import { useState, useEffect } from "react";
import {
  getContributions,
  updateContributionStatus,
  updateContribution,
  deleteContribution,
  type Contribution,
} from "@/lib/contribution-store";
import { addMekan, addOlay } from "@/lib/admin-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DataTable, Column } from "@/components/admin/DataTable";
import {
  Check,
  X,
  Map as MapIcon,
  BookOpen,
  Plus,
  Trash2,
  Eye,
  Search,
  Filter,
  Save,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import ImageUploadInput from "@/components/ImageUploadInput";

export default function KatkilarAdminPage() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Contribution>>({});

  // Filter states
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const loadData = () => {
    setContributions(getContributions());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered contributions
  const filteredContributions = contributions.filter((c) => {
    const typeOk = typeFilter === "all" || c.type === typeFilter;
    const statusOk = statusFilter === "all" || c.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const titleText = c.type === "harita" ? c.title || "" : c.eventTitle || "";
    const summaryText = c.type === "harita" ? c.summary || "" : c.eventSummary || "";
    const searchOk =
      !q ||
      c.submitterName.toLowerCase().includes(q) ||
      c.submitterEmail.toLowerCase().includes(q) ||
      titleText.toLowerCase().includes(q) ||
      summaryText.toLowerCase().includes(q);

    return typeOk && statusOk && searchOk;
  });

  const handleOpenDetailModal = (c: Contribution) => {
    setSelectedContribution(c);
    setEditForm({ ...c });
    setIsModalOpen(true);
  };

  const handleSaveEdits = () => {
    if (!selectedContribution) return;
    updateContribution(selectedContribution.id, editForm);
    alert("Başvuru bilgileri güncellendi!");
    loadData();
    setIsModalOpen(false);
  };

  const handleStatusChange = (id: string, status: "approved" | "rejected") => {
    updateContributionStatus(id, status);
    loadData();
  };

  const handleDelete = (id: string) => {
    if (confirm("Bu katkıyı silmek istediğinize emin misiniz?")) {
      deleteContribution(id);
      loadData();
      if (selectedContribution?.id === id) setIsModalOpen(false);
    }
  };

  const handlePublish = (c: Contribution) => {
    // Save any pending edits first if editing this item
    const target = editForm.id === c.id ? { ...c, ...editForm } : c;

    if (target.type === "harita") {
      addMekan({
        id: `katki-${target.id}`,
        title: target.title || "İsimsiz Mekan",
        category: (target.category as any) || "tarihi-yapilar",
        categoryLabel: target.category || "Tarihi Yapılar",
        timePeriod: (target.timePeriod as any) || "1900-1960",
        neighborhood: (target.neighborhood as any) || "Sinanpaşa",
        address: target.address || "",
        coordinates: target.coordinates || [41.0422, 29.0067],
        summary: target.summary || "",
        fullHistory: target.description || target.summary || "",
        images: target.imageUrls || [],
      });
      updateContributionStatus(target.id, "approved");
      alert("Mekan veritabanına ve haritaya eklendi!");
    } else {
      addOlay({
        id: `katki-${target.id}`,
        title: target.eventTitle || "İsimsiz Olay",
        date: target.eventDate || "",
        era: target.era || "Cumhuriyet Dönemi",
        category: (target.eventCategory as any) || "toplumsal",
        categoryLabel: target.eventCategory || "Toplumsal",
        summary: target.eventSummary || "",
        fullText: target.eventDescription || target.eventSummary || "",
        location: target.eventLocation || "",
        tags: target.tags || [],
        image: target.imageUrls?.[0] || "",
        images: target.imageUrls || [],
      });
      updateContributionStatus(target.id, "approved");
      alert("Olay veritabanına ve ansiklopediye eklendi!");
    }
    loadData();
    setIsModalOpen(false);
  };

  const columns: Column<Contribution>[] = [
    {
      key: "type",
      label: "Tür",
      render: (c: Contribution) => (
        <Badge
          variant="outline"
          className={
            c.type === "harita"
              ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
              : "bg-purple-500/10 text-purple-500 border-purple-500/20"
          }
        >
          {c.type === "harita" ? <MapIcon className="w-3 h-3 mr-1" /> : <BookOpen className="w-3 h-3 mr-1" />}
          {c.type === "harita" ? "Harita" : "Ansiklopedi"}
        </Badge>
      ),
    },
    {
      key: "title",
      label: "Başlık",
      render: (c: Contribution) => (
        <div className="cursor-pointer" onClick={() => handleOpenDetailModal(c)}>
          <div className="font-medium hover:text-[var(--accent)] transition-colors">
            {c.type === "harita" ? c.title : c.eventTitle}
          </div>
          <div className="text-xs text-muted-foreground line-clamp-1">
            {c.type === "harita" ? c.summary : c.eventSummary}
          </div>
        </div>
      ),
    },
    {
      key: "submitterName",
      label: "Gönderen",
      render: (c: Contribution) => (
        <div>
          <div className="font-medium text-sm">{c.submitterName}</div>
          <div className="text-xs text-muted-foreground">{c.submitterEmail}</div>
        </div>
      ),
    },
    {
      key: "submittedAt",
      label: "Tarih",
      render: (c: Contribution) => new Date(c.submittedAt).toLocaleDateString("tr-TR"),
    },
    {
      key: "status",
      label: "Durum",
      render: (c: Contribution) => {
        const variants: Record<string, string> = {
          pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
          approved: "bg-green-500/10 text-green-500 border-green-500/20",
          rejected: "bg-red-500/10 text-red-500 border-red-500/20",
        };
        const labels: Record<string, string> = {
          pending: "Bekliyor",
          approved: "Onaylandı",
          rejected: "Reddedildi",
        };
        return <Badge variant="outline" className={variants[c.status]}>{labels[c.status]}</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--a-text)]">Katkı Yönetimi</h1>
          <p className="text-sm text-[var(--a-muted)]">Kullanıcılardan gelen mekan ve olay önerilerini inceleyin ve düzenleyin.</p>
        </div>
      </div>

      <Card className="bg-[var(--a-card)] border-[var(--a-border)] shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg text-[var(--a-text)]">Gelen Katkılar</CardTitle>
              <CardDescription className="text-[var(--a-muted)]">
                Toplam {filteredContributions.length} katkı listeleniyor.
              </CardDescription>
            </div>

            {/* ── Filter Bar ── */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Başvuru ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-[#14161d] border border-white/10 rounded-lg text-xs text-white placeholder-white/40 focus:outline-none focus:border-[var(--accent)] w-48"
                />
              </div>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-[#14161d] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white [&>option]:bg-[#14161d] focus:outline-none"
              >
                <option value="all">Tüm Türler</option>
                <option value="harita">Harita (Mekan)</option>
                <option value="ansiklopedi">Ansiklopedi (Olay)</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#14161d] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white [&>option]:bg-[#14161d] focus:outline-none"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="pending">Bekleyenler</option>
                <option value="approved">Onaylananlar</option>
                <option value="rejected">Reddedilenler</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <DataTable
            data={filteredContributions}
            columns={columns}
            searchKeys={["submitterName", "submitterEmail", "title", "eventTitle"]}
            actions={(c) => (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1"
                  onClick={() => handleOpenDetailModal(c)}
                  title="Detay & Düzenle"
                >
                  <Eye className="h-3.5 w-3.5" /> İncele / Düzenle
                </Button>
                {c.status === "pending" && (
                  <>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-500/10"
                      onClick={() => handlePublish(c)}
                      title="Onayla ve Ekle"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      onClick={() => handleStatusChange(c.id, "rejected")}
                      title="Reddet"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(c.id)}
                  title="Sil"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* ── Detail & Editing Modal ── */}
      {selectedContribution && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 bg-[#12141a] border-white/10 text-white overflow-hidden">
            <DialogHeader className="p-6 pb-4 border-b border-white/10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                    <span>Katkı Detayı & Düzenleme</span>
                    <Badge
                      variant="outline"
                      className={
                        selectedContribution.type === "harita"
                          ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                          : "bg-purple-500/10 text-purple-500 border-purple-500/20"
                      }
                    >
                      {selectedContribution.type === "harita" ? "Harita Mekanı" : "Ansiklopedi Olayı"}
                    </Badge>
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Gönderen: <strong>{selectedContribution.submitterName}</strong> ({selectedContribution.submitterEmail}) · Tarih:{" "}
                    {new Date(selectedContribution.submittedAt).toLocaleString("tr-TR")}
                  </p>
                </div>
              </div>
            </DialogHeader>

            {/* Editable Form Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5 text-sm">
              {selectedContribution.type === "harita" ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Mekan Başlığı</label>
                      <input
                        type="text"
                        value={editForm.title || ""}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Kategori</label>
                      <input
                        type="text"
                        value={editForm.category || ""}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Mahalle</label>
                      <input
                        type="text"
                        value={editForm.neighborhood || ""}
                        onChange={(e) => setEditForm({ ...editForm, neighborhood: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Dönem</label>
                      <input
                        type="text"
                        value={editForm.timePeriod || ""}
                        onChange={(e) => setEditForm({ ...editForm, timePeriod: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Açık Adres</label>
                      <input
                        type="text"
                        value={editForm.address || ""}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Enlem (Latitude)</label>
                      <input
                        type="number"
                        step="any"
                        value={editForm.coordinates?.[0] ?? 41.0422}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            coordinates: [parseFloat(e.target.value) || 0, editForm.coordinates?.[1] || 0],
                          })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Boylam (Longitude)</label>
                      <input
                        type="number"
                        step="any"
                        value={editForm.coordinates?.[1] ?? 29.0067}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            coordinates: [editForm.coordinates?.[0] || 0, parseFloat(e.target.value) || 0],
                          })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Olay Başlığı</label>
                      <input
                        type="text"
                        value={editForm.eventTitle || ""}
                        onChange={(e) => setEditForm({ ...editForm, eventTitle: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Kategori</label>
                      <input
                        type="text"
                        value={editForm.eventCategory || ""}
                        onChange={(e) => setEditForm({ ...editForm, eventCategory: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Tarih</label>
                      <input
                        type="text"
                        value={editForm.eventDate || ""}
                        onChange={(e) => setEditForm({ ...editForm, eventDate: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Dönem (Era)</label>
                      <input
                        type="text"
                        value={editForm.era || ""}
                        onChange={(e) => setEditForm({ ...editForm, era: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Mekan İlişkisi</label>
                      <input
                        type="text"
                        value={editForm.eventLocation || ""}
                        onChange={(e) => setEditForm({ ...editForm, eventLocation: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs text-muted-foreground mb-1">Özet</label>
                <textarea
                  rows={2}
                  value={selectedContribution.type === "harita" ? editForm.summary || "" : editForm.eventSummary || ""}
                  onChange={(e) =>
                    setEditForm(
                      selectedContribution.type === "harita"
                        ? { ...editForm, summary: e.target.value }
                        : { ...editForm, eventSummary: e.target.value }
                    )
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1">Detaylı Açıklama</label>
                <textarea
                  rows={4}
                  value={selectedContribution.type === "harita" ? editForm.description || "" : editForm.eventDescription || ""}
                  onChange={(e) =>
                    setEditForm(
                      selectedContribution.type === "harita"
                        ? { ...editForm, description: e.target.value }
                        : { ...editForm, eventDescription: e.target.value }
                    )
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm resize-y"
                />
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1">Görseller</label>
                <ImageUploadInput
                  images={editForm.imageUrls || []}
                  onChange={(imgs) => setEditForm({ ...editForm, imageUrls: imgs })}
                  darkStyle
                />
              </div>
            </div>

            <DialogFooter className="p-6 pt-4 border-t border-white/10 bg-[#0d0e12] flex flex-wrap gap-2 justify-between items-center">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(selectedContribution.id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Sil
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange(selectedContribution.id, "rejected")}
                >
                  <X className="w-4 h-4 mr-1" /> Reddet
                </Button>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={handleSaveEdits}>
                  <Save className="w-4 h-4 mr-1" /> Bilgileri Kaydet
                </Button>
                <Button type="button" variant="default" size="sm" onClick={() => handlePublish(selectedContribution)}>
                  <Check className="w-4 h-4 mr-1" /> Onayla & Siteye Yayınla
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
