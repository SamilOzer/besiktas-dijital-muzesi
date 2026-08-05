"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, MapPin, BookOpen, Users, Settings,
  ChevronLeft, ChevronRight, Landmark, MessageSquare, Mail
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const NAV_ITEMS = [
  { href: "/admin",            label: "Dashboard",      icon: LayoutDashboard, exact: true },
  { href: "/admin/mekanlar",   label: "Mekânlar",        icon: MapPin },
  { href: "/admin/ansiklopedi",label: "Ansiklopedi",     icon: BookOpen },
  { href: "/admin/katkidar",   label: "Katkılar",        icon: MessageSquare },
  { href: "/admin/mesajlar",   label: "Mesajlar",        icon: Mail },
  { href: "/admin/kullanicilar",label: "Kullanıcılar",   icon: Users },
  { href: "/admin/ayarlar",    label: "Ayarlar",         icon: Settings },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex flex-col h-full border-r transition-all duration-300 flex-shrink-0",
          "border-[var(--a-border)] bg-[var(--a-sidebar)]"
        )}
        style={{ width: collapsed ? "64px" : "240px" }}
      >
        {/* ─── Brand ─── */}
        <div className={cn(
          "flex items-center gap-3 px-4 py-5 border-b border-white/10",
          collapsed && "justify-center px-2"
        )}>
          <div className="w-8 h-8 rounded-lg bg-[#c5a059] flex items-center justify-center flex-shrink-0">
            <Landmark size={16} className="text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white leading-tight truncate">Beşiktaş</p>
              <p className="text-[10px] text-white/50 truncate">Dijital Müze Admin</p>
            </div>
          )}
        </div>

        {/* ─── Nav ─── */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Tooltip key={href}>
                <TooltipTrigger asChild>
                  <Link
                    href={href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                      collapsed ? "justify-center" : "",
                      isActive
                        ? "bg-white/15 text-white"
                        : "text-white/60 hover:text-white hover:bg-white/8"
                    )}
                    id={`sidebar-${label.toLowerCase()}`}
                  >
                    <Icon size={18} className="flex-shrink-0" />
                    {!collapsed && <span className="truncate">{label}</span>}
                    {isActive && !collapsed && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#c5a059]" />
                    )}
                  </Link>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" className="bg-[var(--a-primary)] text-white text-xs">
                    {label}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </nav>

        {/* ─── Collapse Button ─── */}
        <div className="px-2 pb-4">
          <button
            onClick={onToggle}
            id="sidebar-collapse-btn"
            className="flex items-center justify-center w-full py-2 rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-all"
            aria-label={collapsed ? "Genişlet" : "Daralt"}
          >
            {collapsed ? <ChevronRight size={16} /> : (
              <span className="flex items-center gap-2 text-xs">
                <ChevronLeft size={14} />
                Daralt
              </span>
            )}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
