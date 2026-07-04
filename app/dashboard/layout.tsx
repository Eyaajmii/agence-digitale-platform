"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

import {
  LayoutDashboard,
  Users,
  PenSquare,
  CalendarDays,
  BarChart3,
  Search,
  LogOut,
  Menu,
  Sparkles,
} from "lucide-react";
import NotificationDropdown from "@/components/notification/NotificationDropdown";
import ChatDrawer from "@/components/chat/chatDrawer";
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
  const UserId = "votre-user-uuid-ici"; 

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0A2947] border-r border-[#7BBFD3] flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 `}>
        <div className="h-20 px-6 flex items-center border-b border-slate-800">
          <div className="w-11 h-11 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Sparkles size={20} className="text-white" />
          </div>
          <div className="ml-3">
            <h2 className="font-bold text-white text-lg">AgenceAI</h2>
            <p className="text-xs text-slate-400">Digital Marketing Platform</p>
          </div>
        </div>
        <div className="flex-1 px-4 py-6 overflow-y-auto">
          <p className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold px-3 mb-3">
            Navigation
          </p>
          <div className="space-y-1">
            {nav.map(({ href, label, icon: Icon }) => {
              const active =
                pathname === href ||
                (href !== "/dashboard" && pathname.startsWith(href));
              return (
                <Link key={href} href={href} className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all
                text-sm font-medium ${ active ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white"}`}>
                    <Icon size={18} />
                    {label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
              M
            </div>
            <div>
              <p className="text-sm text-white font-medium">Manager</p>
              <p className="text-xs text-slate-400">Administrateur</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/auth/login",})}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-red-500/10 text-red-400 py-3
            hover:bg-red-500/20 transition">
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </aside>
      {open && (<div onClick={() => setOpen(false)} className="fixed inset-0 bg-black/50 z-40 lg:hidden"/>)}
      {/* CONTENT */}
      <div className="lg:ml-72 flex flex-col min-h-screen">
        {/* HEADER */}
        <header
          className="
        sticky top-0 z-30
        backdrop-blur-xl
        bg-white/70
        border-b border-slate-200
        h-20
        px-6
        flex items-center
      "
        >
          <button
            onClick={() => setOpen(!open)}
            className="
          lg:hidden
          mr-4
          p-2
          rounded-xl
          hover:bg-slate-100
        "
          >
            <Menu size={22} />
          </button>

          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900">
              {
                nav.find(
                  (n) =>
                    pathname === n.href ||
                    (n.href !== "/dashboard" && pathname.startsWith(n.href))
                )?.label
              }
            </h1>

            <p className="text-sm text-slate-500">
              Gestion intelligente de votre agence digitale
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Insertion du composant déroulant */}
            <NotificationDropdown userId={UserId} />
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">Manager</p>

              <p className="text-xs text-slate-500">Connecté</p>
            </div>

            <div className="w-11 h-11 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
              M
            </div>
          </div>
          </div>
        </header>

        {/* PAGE */}
        <main className="flex-1 p-8">{children}</main>
        <ChatDrawer/>
      </div>
    </div>
  );
}
