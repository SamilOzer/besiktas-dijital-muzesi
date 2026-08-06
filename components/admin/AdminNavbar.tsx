"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Sun, Moon, LogOut, User, ChevronDown, MapPin, Mail, CheckCircle2, ArrowRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getContributions } from "@/lib/contribution-store";
import { getContactMessages } from "@/lib/contact-store";

interface AdminNavbarProps {
  pageTitle: string;
  theme: "light" | "dark";
  onThemeToggle: () => void;
  user: { name: string; email: string; avatar: string };
}

interface NotificationItem {
  id: string;
  type: "contribution" | "message";
  title: string;
  subtitle: string;
  date: string;
  link: string;
}

export default function AdminNavbar({ pageTitle, theme, onThemeToggle, user }: AdminNavbarProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const loadNotifications = () => {
    try {
      const pendingContribs = getContributions().filter((c) => c.status === "pending");
      const unreadMsgs = getContactMessages().filter((m) => m.status === "unread");

      const items: NotificationItem[] = [
        ...pendingContribs.map((c) => ({
          id: `c-${c.id}`,
          type: "contribution" as const,
          title: `Yeni Katkı: ${c.type === "harita" ? c.title || "Mekan" : c.eventTitle || "Olay"}`,
          subtitle: `${c.submitterName} tarafından gönderildi`,
          date: c.submittedAt,
          link: "/admin/katkidar",
        })),
        ...unreadMsgs.map((m) => ({
          id: `m-${m.id}`,
          type: "message" as const,
          title: `Yeni Mesaj: ${m.name}`,
          subtitle: m.message.length > 35 ? m.message.slice(0, 35) + "..." : m.message,
          date: m.submittedAt,
          link: "/admin/mesajlar",
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setNotifications(items);
    } catch (e) {
      console.error("Error loading notifications:", e);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const hasUnread = notifications.length > 0;

  return (
    <header
      className="flex items-center justify-between px-6 h-14 border-b flex-shrink-0"
      style={{ borderColor: "var(--a-border)", background: "var(--a-surface)" }}
    >
      {/* Page title */}
      <h1 className="text-base font-semibold" style={{ color: "var(--a-text)" }}>
        {pageTitle}
      </h1>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={onThemeToggle}
          id="theme-toggle"
          className="p-2 rounded-lg transition-colors hover:bg-[var(--a-border)]"
          aria-label="Tema değiştir"
        >
          {theme === "light" ? (
            <Moon size={16} style={{ color: "var(--a-muted)" }} />
          ) : (
            <Sun size={16} style={{ color: "var(--a-muted)" }} />
          )}
        </button>

        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="relative p-2 rounded-lg transition-colors hover:bg-[var(--a-border)]"
              aria-label="Bildirimler"
              id="notifications-btn"
            >
              <Bell size={16} style={{ color: "var(--a-muted)" }} />
              {hasUnread && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
                  {notifications.length}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-80 p-0 bg-[#12141a] border-white/10 text-white shadow-2xl rounded-2xl overflow-hidden z-[10000]"
          >
            <DropdownMenuLabel className="p-4 bg-[#181a22] border-b border-white/10 flex items-center justify-between">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                <Bell size={14} className="text-[var(--accent)]" /> Bildirimler
              </span>
              {hasUnread && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-semibold border border-red-500/30">
                  {notifications.length} Bekleyen
                </span>
              )}
            </DropdownMenuLabel>

            <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
              {notifications.length > 0 ? (
                notifications.map((item) => (
                  <DropdownMenuItem
                    key={item.id}
                    onClick={() => router.push(item.link)}
                    className="p-3.5 hover:bg-white/5 cursor-pointer transition-colors focus:bg-white/5 flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-[var(--accent)]/15 border border-[var(--accent)]/30 flex items-center justify-center shrink-0 mt-0.5">
                      {item.type === "contribution" ? (
                        <MapPin size={14} className="text-[var(--accent)]" />
                      ) : (
                        <Mail size={14} className="text-blue-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{item.title}</p>
                      <p className="text-[11px] text-neutral-400 truncate mt-0.5">{item.subtitle}</p>
                      <p className="text-[10px] text-neutral-500 mt-1">
                        {new Date(item.date).toLocaleDateString("tr-TR", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-neutral-400 flex flex-col items-center gap-2">
                  <CheckCircle2 size={24} className="text-green-500/60 mb-1" />
                  <span>Yeni bildirim bulunmuyor.</span>
                </div>
              )}
            </div>

            <DropdownMenuSeparator className="bg-white/10" />

            <div className="p-2 bg-[#181a22] flex gap-2">
              <button
                onClick={() => router.push("/admin/katkidar")}
                className="flex-1 py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-neutral-300 font-medium flex items-center justify-center gap-1 transition-colors"
              >
                Katkılar <ArrowRight size={12} />
              </button>
              <button
                onClick={() => router.push("/admin/mesajlar")}
                className="flex-1 py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-neutral-300 font-medium flex items-center justify-center gap-1 transition-colors"
              >
                Mesajlar <ArrowRight size={12} />
              </button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Divider */}
        <div className="w-px h-6 mx-1" style={{ background: "var(--a-border)" }} />

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors hover:bg-[var(--a-border)]"
              id="profile-menu-btn"
            >
              <div className="w-7 h-7 rounded-full bg-[#c5a059] flex items-center justify-center text-white text-xs font-bold">
                {user.avatar}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold leading-tight" style={{ color: "var(--a-text)" }}>
                  {user.name}
                </p>
                <p className="text-[10px]" style={{ color: "var(--a-muted)" }}>
                  Admin
                </p>
              </div>
              <ChevronDown size={12} style={{ color: "var(--a-muted)" }} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <div>
                <p className="font-semibold text-sm" style={{ color: "var(--a-text)" }}>
                  {user.name}
                </p>
                <p className="text-[11px] font-normal" style={{ color: "var(--a-muted)" }}>
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/admin/ayarlar")} id="profile-settings-link">
              <User size={13} className="mr-2" />
              Profil Ayarları
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600" id="logout-btn">
              <LogOut size={13} className="mr-2" />
              Çıkış Yap
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
