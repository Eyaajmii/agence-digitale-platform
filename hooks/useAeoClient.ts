"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

export type ClientOption = { id: string; nom: string };

export function useAeoClient() {
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [loadingClients, setLoadingClients] = useState<boolean>(true);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    supabase
      .from("clients")
      .select("id, nom")
      .order("nom")
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setClients(data);
          setSelectedClient(data[0].id); // client par défaut = le premier
        }
        setLoadingClients(false);
      });
  }, []);

  const handleClientChange = (id: string) => {
    setSelectedClient(id);
  };

  return { clients, selectedClient, loadingClients, handleClientChange };
}