// src/components/NotificationDropdown.tsx
'use client';

import { useEffect, useState, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr"
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

export default function NotificationDropdown({ userId }: { userId: string }) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'Toutes' | 'Alertes KPI' | 'IA' | 'Système'>('Toutes');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le menu si on clique à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Charger les données initiales et brancher Supabase Realtime
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

  // Actions de l'interface
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

  // Filtrer selon l'onglet actif
  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'Toutes') return true;
    if (activeTab === 'Alertes KPI') return n.type === 'critical' || n.type === 'warning';
    if (activeTab === 'IA') return n.type === 'info';
    if (activeTab === 'Système') return n.type === 'system';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Calcul du temps relatif simplifié
  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `Il y a ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    return new Date(dateStr).toLocaleDateString('fr-FR');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bouton de la Cloche */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition bg-white text-slate-600"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Conteneur du Panneau Déroulant */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-[450px] bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden text-slate-800">
          
          {/* Entête */}
          <div className="p-5 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-red-50 text-red-500 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {unreadCount}
                </span>
              )}
            </div>
            <button 
              onClick={handleMarkAllAsRead}
              className="text-sm font-semibold text-slate-900 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 transition"
            >
              Tout marquer lu
            </button>
          </div>

          {/* Onglets de navigation */}
          <div className="flex px-2 border-b border-slate-100 bg-slate-50/50">
            {(['Toutes', 'Alertes KPI', 'IA', 'Système'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 text-center py-3 text-xs font-medium border-b-2 transition-all ${
                  activeTab === tab 
                    ? "border-orange-500 text-slate-900 font-semibold" 
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Liste des Notifications */}
          <div className="max-h-[480px] overflow-y-auto divide-y divide-slate-50">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">
                Aucune notification dans cette catégorie.
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`p-5 relative transition flex gap-4 ${!n.is_read ? 'bg-orange-50/20' : 'hover:bg-slate-50/60'}`}
                >
                  {/* Indicateur de non-lu (Point rouge/orange) */}
                  {!n.is_read && (
                    <span className={`absolute left-3 top-7 w-2 h-2 rounded-full ${
                      n.type === 'critical' ? 'bg-red-500' : 'bg-orange-400'
                    }`} />
                  )}

                  {/* Icône Dynamique selon Type */}
                  <div className="flex-shrink-0">
                    {n.type === 'critical' && (
                      <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                        <Flame size={20} />
                      </div>
                    )}
                    {n.type === 'warning' && (
                      <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                        <AlertTriangle size={20} />
                      </div>
                    )}
                    {n.type === 'info' && (
                      <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600">
                        <Bot size={20} />
                      </div>
                    )}
                    {n.type === 'system' && (
                      <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                        <Layers size={20} />
                      </div>
                    )}
                  </div>

                  {/* Contenu textuel */}
                  <div className="flex-1 space-y-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{n.title}</h4>
                      <p className="text-slate-600 text-xs mt-1 leading-relaxed whitespace-pre-line">
                        {n.message}
                      </p>
                    </div>

                    {/* Meta Données & Badges */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                      <span>⏱️ {formatTime(n.created_at)}</span>
                      {n.source && (
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                          {n.source}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-md font-bold uppercase ${
                        n.type === 'critical' ? 'bg-red-50 text-red-500' :
                        n.type === 'warning' ? 'bg-amber-50 text-amber-600' :
                        n.type === 'info' ? 'bg-violet-50 text-violet-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {n.type === 'critical' ? 'Critique' : n.type === 'warning' ? 'Alerte' : n.type === 'info' ? 'IA' : 'Système'}
                      </span>
                    </div>

                    {/* Boutons d'actions contextuels */}
                    <div className="flex gap-2 pt-1">
                      <button 
                        onClick={() => handleToggleRead(n.id)}
                        className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 border border-slate-200 rounded-xl hover:bg-white bg-slate-50 transition"
                      >
                        <Check size={14} />
                        {n.is_read ? "Marquer non lu" : "Marquer lu"}
                      </button>
                    </div>
                </div>
                </div>
            )))}
            </div>
            </div>
      )}
      </div>
  )}
                  