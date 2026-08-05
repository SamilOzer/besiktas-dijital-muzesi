"use client";
import { useRouter } from "next/navigation";
import { Bell, Sun, Moon, LogOut, User, ChevronDown } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminNavbarProps {
  pageTitle: string;
  theme: "light" | "dark";
  onThemeToggle: () => void;
  user: { name: string; email: string; avatar: string };
}

export default function AdminNavbar({ pageTitle, theme, onThemeToggle, user }: AdminNavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

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
          {theme === "light"
            ? <Moon size={16} style={{ color: "var(--a-muted)" }} />
            : <Sun size={16} style={{ color: "var(--a-muted)" }} />
          }
        </button>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg transition-colors hover:bg-[var(--a-border)]"
          aria-label="Bildirimler"
          id="notifications-btn"
        >
          <Bell size={16} style={{ color: "var(--a-muted)" }} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
        </button>

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
                <p className="text-[10px]" style={{ color: "var(--a-muted)" }}>Admin</p>
              </div>
              <ChevronDown size={12} style={{ color: "var(--a-muted)" }} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <div>
                <p className="font-semibold text-sm" style={{ color: "var(--a-text)" }}>{user.name}</p>
                <p className="text-[11px] font-normal" style={{ color: "var(--a-muted)" }}>{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/admin/ayarlar")} id="profile-settings-link">
              <User size={13} className="mr-2" />
              Profil Ayarları
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 focus:text-red-600"
              id="logout-btn"
            >
              <LogOut size={13} className="mr-2" />
              Çıkış Yap
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
