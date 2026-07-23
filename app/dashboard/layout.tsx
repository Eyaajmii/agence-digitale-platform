"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  PenSquare,
  CalendarDays,
  BarChart3,
  Search,
  LogOut,
  Menu,
  Radio,
} from "lucide-react";
import NotificationDropdown from "@/components/notification/NotificationDropdown";
import ChatDrawer from "@/components/chat/chatDrawer";
import { auth } from "@/auth";

const nav = [
  { href: "/dashboard", label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/collaborateurs", label: "Collaborateurs", icon: Users },
  { href: "/dashboard/generate", label: "Contenu", icon: PenSquare },
  {
    href: "/dashboard/generate/calendrier",
    label: "Calendrier",
    icon: CalendarDays,
  },
  { href: "/dashboard/kpis", label: "KPIs", icon: BarChart3 },
  { href: "/dashboard/aeo", label: "Campagnes AEO", icon: Search },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  const user = session?.user;
  const userId = session?.user?.id ?? "";

  const displayName = user?.name ? ` ${user.name}` : user?.name ?? "Manager";

  const initials = user?.name
    ? `${user.name[0]}`.toUpperCase()
    : displayName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

  const roleLabel = user?.role ?? "Manager";

  const activeLabel = nav.find(
    (n) =>
      pathname === n.href ||
      (n.href !== "/dashboard" && pathname.startsWith(n.href))
  )?.label;
  const filteredNav = nav.filter((item) => {
    if (roleLabel.toLowerCase() === "collaborateur") {
      return item.href !== "/dashboard/collaborateurs";
    }
    return true;
  });
  return (
    <div className="min-h-screen bg-slate-50 font-[Inter,sans-serif]">
      {" "}
      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 flex flex-col
        transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }
        lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="h-20 px-6 flex items-center border-b border-white/10 relative overflow-hidden">
          {/*<div className="absolute -top-6 -left-10 w-32 h-32 bg-[#FF3D7F]/20 blur-3xl rounded-full" />
          <div className="w-11 h-11 rounded-xl bg-[#FF3D7F] flex items-center justify-center relative">
            <Radio size={20} className="text-[#0D0B14]" strokeWidth={2.5} />
          </div>*/}
          <div className="ml-3 relative">
            <h2 className="font-[Space_Grotesk,sans-serif] font-bold text-white text-lg tracking-tight">
              Lezarts Digital Hub
            </h2>
            <p className="text-xs text-slate-400">Plateforme interne</p>
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 px-4 py-6 overflow-y-auto">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#9C96B5]/60 font-[IBM_Plex_Mono,monospace] px-3 mb-3">
            Navigation
          </p>
          <div className="space-y-1">
            {filteredNav.map(({ href, label, icon: Icon }) => {
              const active =
                pathname === href ||
                (href !== "/dashboard" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium relative
                  ${
                    active
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {/* barre de signal à gauche */}

                  <Icon size={18} strokeWidth={active ? 2.4 : 2} />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold font-[Space_Grotesk,sans-serif]">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">
                {displayName}
              </p>
              <p className="text-[10px] text-[#9C96B5] font-[IBM_Plex_Mono,monospace] uppercase tracking-wider">
                {roleLabel}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-700 text-slate-300
            py-3 text-sm font-medium hover:bg-slate-800 transition "
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </aside>
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}
      {/* CONTENT */}
      <div className="lg:ml-72 flex flex-col min-h-screen">
        {/* HEADER */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-gray-200 h-20 px-6 flex items-center">
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden mr-4 p-2 rounded-lg hover:bg-black/5"
          >
            <Menu size={22} />
          </button>

          <div className="flex-1">
            <h1 className="text-2xl font-[Space_Grotesk,sans-serif] font-bold text-[#1A1720] tracking-tight">
              {activeLabel}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <NotificationDropdown userId={userId} />
            <div className="hidden md:flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right">
                <p className="text-sm font-semibold text-[#1A1720] max-w-[160px] truncate">
                  {displayName}
                </p>
                <p className="text-[10px] text-slate-500 font-[IBM_Plex_Mono,monospace] uppercase tracking-wider">
                  {roleLabel}
                </p>
              </div>
              <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold font-[Space_Grotesk,sans-serif]">
                {initials}
              </div>
            </div>
          </div>
        </header>

        {/* PAGE */}
        <main className="flex-1 p-6 lg:p-8">{children}</main>
        <ChatDrawer />
      </div>
    </div>
  );
}
