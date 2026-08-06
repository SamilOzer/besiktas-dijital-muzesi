"use client";

import { useState, useEffect } from "react";
import {
  getContactMessages,
  updateMessageStatus,
  deleteContactMessage,
  type ContactMessage,
} from "@/lib/contact-store";
import { DataTable, Column } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Mail, MailOpen, Trash2, Eye } from "lucide-react";

export default function MesajlarAdminPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [activeMessage, setActiveMessage] = useState<ContactMessage | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const loadData = () => {
    setMessages(getContactMessages());
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredMessages = messages.filter((m) => {
    return statusFilter === "all" || m.status === statusFilter;
  });

  const handleView = (msg: ContactMessage) => {
    setActiveMessage(msg);
    if (msg.status === "unread") {
      updateMessageStatus(msg.id, "read");
      loadData();
    }
  };

  const handleToggleStatus = (id: string, currentStatus: "unread" | "read") => {
    const nextStatus = currentStatus === "unread" ? "read" : "unread";
    updateMessageStatus(id, nextStatus);
    loadData();
  };

  const handleDelete = (id: string) => {
    if (confirm("Bu mesajı silmek istediğinize emin misiniz?")) {
      deleteContactMessage(id);
      if (activeMessage?.id === id) setActiveMessage(null);
      loadData();
    }
  };

  const columns: Column<ContactMessage>[] = [
    {
      key: "status",
      label: "Durum",
      render: (m) => (
        <Badge
          variant="outline"
          className={
            m.status === "unread"
              ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
              : "bg-gray-500/10 text-gray-400 border-gray-500/20"
          }
        >
          {m.status === "unread" ? (
            <Mail className="w-3 h-3 mr-1" />
          ) : (
            <MailOpen className="w-3 h-3 mr-1" />
          )}
          {m.status === "unread" ? "Okunmadı" : "Okundu"}
        </Badge>
      ),
    },
    {
      key: "name",
      label: "Gönderen",
      render: (m) => (
        <div>
          <div className="font-medium text-[var(--a-text)]">{m.name}</div>
          <div className="text-xs text-[var(--a-muted)]">{m.email}</div>
        </div>
      ),
    },
    {
      key: "message",
      label: "Mesaj Özet",
      render: (m) => (
        <div className="max-w-[300px] truncate text-xs text-[var(--a-muted)]">
          {m.message}
        </div>
      ),
    },
    {
      key: "submittedAt",
      label: "Tarih",
      render: (m) => new Date(m.submittedAt).toLocaleString("tr-TR"),
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--a-text)]">
            İletişim Mesajları
          </h1>
          <p className="text-sm text-[var(--a-muted)]">
            Siteden gönderilen tüm iletişim formlarını yönetin.
          </p>
        </div>
      </div>

      <Card className="bg-[var(--a-surface)] border-[var(--a-border)] shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg text-[var(--a-text)]">Gelen Mesajlar</CardTitle>
              <CardDescription className="text-[var(--a-muted)]">
                Toplam {filteredMessages.length} mesaj ({messages.filter((m) => m.status === "unread").length} okunmamış)
              </CardDescription>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#14161d] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white [&>option]:bg-[#14161d] focus:outline-none"
            >
              <option value="all">Tüm Mesajlar</option>
              <option value="unread">Okunmayanlar</option>
              <option value="read">Okunanlar</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredMessages}
            columns={columns}
            searchKeys={["name", "email", "message"]}
            actions={(m) => (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1"
                  onClick={() => handleView(m)}
                >
                  <Eye className="h-3.5 w-3.5" /> Görüntüle
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(m.id)}
                  title="Sil"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* View Message Dialog */}
      {activeMessage && (
        <Dialog open={!!activeMessage} onOpenChange={(open) => !open && setActiveMessage(null)}>
          <DialogContent className="max-w-md bg-[var(--a-surface)] border-[var(--a-border)] text-[var(--a-text)]">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Mesaj Detayı</DialogTitle>
              <DialogDescription className="text-xs text-[var(--a-muted)]">
                {new Date(activeMessage.submittedAt).toLocaleString("tr-TR")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div>
                <label className="text-xs font-semibold uppercase text-[var(--a-muted)] tracking-wider">
                  Gönderen
                </label>
                <p className="text-sm font-medium">{activeMessage.name}</p>
                <a
                  href={`mailto:${activeMessage.email}`}
                  className="text-xs text-[var(--a-primary)] hover:underline"
                >
                  {activeMessage.email}
                </a>
              </div>

              <div className="border-t border-[var(--a-border)] pt-3">
                <label className="text-xs font-semibold uppercase text-[var(--a-muted)] tracking-wider mb-1 block">
                  Mesaj İçeriği
                </label>
                <div className="bg-[var(--a-bg)] p-4 rounded-lg text-sm text-[var(--a-text)] leading-relaxed whitespace-pre-line border border-[var(--a-border)]">
                  {activeMessage.message}
                </div>
              </div>
            </div>

            <DialogFooter className="flex justify-between items-center sm:justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleStatus(activeMessage.id, activeMessage.status)}
              >
                {activeMessage.status === "unread" ? "Okundu İşaretle" : "Okunmadı İşaretle"}
              </Button>
              <Button onClick={() => setActiveMessage(null)}>Kapat</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
