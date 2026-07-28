"use client";

import { getClients } from "@/lib/supabase/client";
import { useState, useEffect } from "react";

export type ClientOption = { id: string; nom: string };

export function useAeoClient() {
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [loadingClients, setLoadingClients] = useState<boolean>(true);

  useEffect(() => {
    getClients(1, 100) 
      .then(({ data }) => {
        if (data && data.length > 0) {
          setClients(data);
          setSelectedClient(data[0].id);
        }
        setLoadingClients(false);

      })
      .catch((err) => console.error("Erreur chargement clients:", err));
  }, []);

  const handleClientChange = (id: string) => {
    setSelectedClient(id);
  };

  return { clients, selectedClient, loadingClients, handleClientChange };
}