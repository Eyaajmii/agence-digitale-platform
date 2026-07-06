// src/components/NotificationDropdown.tsx
'use client';

import { useEffect, useState, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Bell, Flame, AlertTriangle, Bot, Layers, Check } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'critical' | 'warning' | 'info' | 'system';
  source?: string;
  is_read: boolean;
  created_at: string;
}

const TYPE_STYLES = {
  critical: {
    icon: Flame,
    iconBg: "bg-[#FF3D7F]/10",
    iconText: "text-[#FF3D7F]",
    dot: "bg-[#FF3D7F]",
    badgeBg: "bg-[#FF3D7F]/10",
    badgeText: "text-[#FF3D7F]",
    label: "Critique",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-amber-50",
    iconText: "text-amber-600",
    dot: "bg-amber-400",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-700",
    label: "Alerte",
  },
  info: {
    icon: Bot,
    iconBg: "bg-[#6C4CFF]/10",
    iconText: "text-[#6C4CFF]",
    dot: "bg-[#6C4CFF]",
    badgeBg: "bg-[#6C4CFF]/10",
    badgeText: "text-[#6C4CFF]",
    label: "IA",
  },
  system: {
    icon: Layers,
    iconBg: "bg-[#1A1720]/5",
    iconText: "text-[#6B6579]",
    dot: "bg-[#9C96B5]",
    badgeBg: "bg-[#1A1720]/5",
    badgeText: "text-[#6B6579]",
    label: "Système",
  },
} as const;

export default function NotificationDropdown({ userId }: { userId: string }) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'Toutes' | 'Alertes KPI' | 'IA' | 'Système'>('Toutes');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (data) setNotifications(data);
    };

    fetchNotifications();

    const channel = supabase
      .channel('realtime-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload: { new: Notification; }) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds);
  };

  const handleToggleRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: !n.is_read } : n));
    const target = notifications.find(n => n.id === id);
    if (target) {
      await supabase.from('notifications').update({ is_read: !target.is_read }).eq('id', id);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'Toutes') return true;
    if (activeTab === 'Alertes KPI') return n.type === 'critical' || n.type === 'warning';
    if (activeTab === 'IA') return n.type === 'info';
    if (activeTab === 'Système') return n.type === 'system';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `Il y a ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    return new Date(dateStr).toLocaleDateString('fr-FR');
  };

  return (
    <div className="relative font-[Inter,sans-serif]" ref={dropdownRef}>
      {/* Bouton cloche */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-xl border border-[#1A1720]/10 bg-white p-2.5 text-[#6B6579] transition hover:bg-[#F4F5F1]"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF3D7F] font-[IBM_Plex_Mono,monospace] text-[10px] font-bold text-white ring-2 ring-white">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF3D7F] opacity-75" />
            <span className="relative">{unreadCount}</span>
          </span>
        )}
      </button>

      {/* Panneau déroulant */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-3 w-[450px] overflow-hidden rounded-2xl border border-[#1A1720]/10 bg-white shadow-xl">
          {/* Entête */}
          <div className="flex items-center justify-between border-b border-[#1A1720]/10 p-5">
            <div className="flex items-center gap-2">
              <span className="font-[Space_Grotesk,sans-serif] text-lg font-bold text-[#1A1720]">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-[#FF3D7F]/10 px-2 py-0.5 font-[IBM_Plex_Mono,monospace] text-xs font-semibold text-[#FF3D7F]">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={handleMarkAllAsRead}
              className="rounded-xl border border-[#1A1720]/10 px-4 py-2 text-sm font-semibold text-[#1A1720] transition hover:bg-[#F4F5F1]"
            >
              Tout marquer lu
            </button>
          </div>

          {/* Onglets */}
          <div className="flex border-b border-[#1A1720]/10 bg-[#F4F5F1]/50 px-2">
            {(['Toutes', 'Alertes KPI', 'IA', 'Système'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 border-b-2 py-3 text-center text-xs font-medium transition-all ${
                  activeTab === tab
                    ? "border-[#FF3D7F] font-semibold text-[#1A1720]"
                    : "border-transparent text-[#9C96B5] hover:text-[#1A1720]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Liste */}
          <div className="max-h-[480px] divide-y divide-[#1A1720]/5 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#9C96B5]">
                Aucune notification dans cette catégorie.
              </div>
            ) : (
              filteredNotifications.map((n) => {
                const style = TYPE_STYLES[n.type];
                const Icon = style.icon;
                return (
                  <div
                    key={n.id}
                    className={`relative flex gap-4 p-5 transition ${
                      !n.is_read ? "bg-[#FF3D7F]/5" : "hover:bg-[#F4F5F1]/60"
                    }`}
                  >
                    {!n.is_read && (
                      <span className={`absolute left-3 top-7 h-1.5 w-1.5 rounded-full ${style.dot}`} />
                    )}

                    <div className="flex-shrink-0">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${style.iconBg} ${style.iconText}`}>
                        <Icon size={20} />
                      </div>
                    </div>

                    <div className="flex-1 space-y-2">
                      <div>
                        <h4 className="font-[Space_Grotesk,sans-serif] text-sm font-bold text-[#1A1720]">
                          {n.title}
                        </h4>
                        <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-[#6B6579]">
                          {n.message}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 font-[IBM_Plex_Mono,monospace] text-[11px] font-medium text-[#9C96B5]">
                        <span>⏱️ {formatTime(n.created_at)}</span>
                        {n.source && (
                          <span className="rounded-md bg-[#1A1720]/5 px-2 py-0.5 font-semibold text-[#6B6579]">
                            {n.source}
                          </span>
                        )}
                        <span className={`rounded-md px-2 py-0.5 font-bold uppercase ${style.badgeBg} ${style.badgeText}`}>
                          {style.label}
                        </span>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => handleToggleRead(n.id)}
                          className="flex items-center gap-1.5 rounded-xl border border-[#1A1720]/10 bg-[#F4F5F1] px-4 py-2 text-xs font-semibold text-[#1A1720] transition hover:bg-white"
                        >
                          <Check size={14} />
                          {n.is_read ? "Marquer non lu" : "Marquer lu"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}