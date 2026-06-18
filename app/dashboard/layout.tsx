"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const nav = [
  { href: "/dashboard",         label: "Vue d'ensemble", icon: HomeIcon },
  { href: "/dashboard/clients", label: "Clients",        icon: UsersIcon },
  { href: "/dashboard/collaborateurs", label: "Collaborateurs",icon: UsersIcon },
  { href: "/dashboard/generate",label: "Contenu",        icon: PenIcon },
  { href: "/dashboard/generate/calendrier",label: "Calendrier",        icon: PenIcon },
  { href: "/dashboard/kpis",    label: "KPIs",           icon: ChartIcon },
  { href: "/dashboard/aeo",     label: "Campagnes AEO",  icon: SearchIcon },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F6FA] flex">

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-[#E8E9F0]
        flex flex-col transition-transform duration-200
        ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
      `}>
        <div className="h-16 flex items-center px-5 border-b border-[#E8E9F0]">
          <div className="w-7 h-7 rounded-lg bg-[#6C6FFF] flex items-center justify-center mr-2.5">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <span className="text-[#0F0F1A] font-semibold text-sm tracking-tight">AgenceAI</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] font-semibold text-[#9B9CB8] uppercase tracking-widest px-3 mb-2">
            Navigation
          </p>
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${active
                    ? "bg-[#F0F0FF] text-[#6C6FFF]"
                    : "text-[#5C5E7A] hover:bg-[#F5F6FA] hover:text-[#0F0F1A]"
                  }
                `}
              >
                <Icon size={16} active={active} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-[#E8E9F0]">
          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#E5484D] hover:bg-red-50 transition-colors"
          >
            <LogoutIcon />
            Déconnexion
          </button>
        </div>
      </aside>
      {open && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">

        <header className="h-16 bg-white border-b border-[#E8E9F0] flex items-center px-6 gap-4 sticky top-0 z-20">
          <button
            className="lg:hidden text-[#5C5E7A] hover:text-[#0F0F1A]"
            onClick={() => setOpen(!open)}
          >
            <MenuIcon />
          </button>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-[#0F0F1A]">
              {nav.find(n => n.href === pathname || (n.href !== "/dashboard" && pathname.startsWith(n.href)))?.label ?? "Dashboard"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#F0F0FF] flex items-center justify-center">
              <span className="text-[#6C6FFF] text-xs font-bold">M</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function HomeIcon({ size = 16, active = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={active ? "#6C6FFF" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}

function UsersIcon({ size = 16, active = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={active ? "#6C6FFF" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}

function PenIcon({ size = 16, active = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={active ? "#6C6FFF" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9"/>
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
  );
}

function ChartIcon({ size = 16, active = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={active ? "#6C6FFF" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6"  y1="20" x2="6"  y2="14"/>
    </svg>
  );
}

function SearchIcon({ size = 16, active = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={active ? "#6C6FFF" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6"  x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
}
