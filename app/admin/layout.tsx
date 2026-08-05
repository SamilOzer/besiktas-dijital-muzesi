"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminNavbar from "@/components/admin/AdminNavbar";
import { parseSessionToken } from "@/lib/admin-auth";
import type { AdminUser } from "@/lib/admin-auth";

const PAGE_TITLES: Record<string, string> = {
  "/admin":              "Dashboard",
  "/admin/mekanlar":     "Mekân Yönetimi",
  "/admin/ansiklopedi":  "Ansiklopedi Yönetimi",
  "/admin/katkidar":     "Katkı Yönetimi",
  "/admin/mesajlar":     "İletişim Mesajları",
  "/admin/kullanicilar": "Kullanıcı Yönetimi",
  "/admin/ayarlar":      "Ayarlar",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme]         = useState<"light" | "dark">("light");
  const [user, setUser]           = useState<AdminUser | null>(null);

  useEffect(() => {
    // Read session from cookie (client-side for display only)
    const cookies = document.cookie.split(";").map(c => c.trim());
    const sessionCookie = cookies.find(c => c.startsWith("admin_session="));
    if (sessionCookie) {
      const token = sessionCookie.split("=")[1];
      const parsed = parseSessionToken(token);
      if (parsed) setUser(parsed);
    }
    // Restore saved theme
    const saved = localStorage.getItem("admin-theme") as "light" | "dark" | null;
    if (saved) setTheme(saved);
  }, []);

  const handleThemeToggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("admin-theme", next);
  };

  // Login page has its own layout
  if (pathname === "/admin/login") return <>{children}</>;

  const pageTitle = PAGE_TITLES[pathname] ?? "Admin Panel";

  const displayUser = user ?? {
    name: "Admin",
    email: "admin@besiktas.bel.tr",
    avatar: "AK",
  };

  return (
    <div
      className={`admin-root ${theme === "dark" ? "admin-dark" : "admin-light"} flex h-screen overflow-hidden`}
      style={{ background: "var(--a-bg)" }}
      data-admin="true"
    >
      {/* Sidebar */}
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AdminNavbar
          pageTitle={pageTitle}
          theme={theme}
          onThemeToggle={handleThemeToggle}
          user={displayUser}
        />

        {/* Scrollable content */}
        <main
          className="flex-1 overflow-y-auto p-6"
          style={{ background: "var(--a-bg)" }}
          id="admin-main-content"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
