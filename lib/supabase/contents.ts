export async function getContents(
    page = 1,
    limit = 10,
    clientId?: string
  ) {
    const params = new URLSearchParams();
  
    params.set("page", String(page));
    params.set("limit", String(limit));
  
    if (clientId) {
      params.set("clientId", clientId);
    }
  
    const res = await fetch(`/api/generate?${params}`);
  
    if (!res.ok) {
      throw new Error("Erreur récupération contenus");
    }
  
    return res.json();
  }
  export async function getContentById(id: string) {
    const res = await fetch(`/api/generate/${id}`);
  
    if (!res.ok) {
      throw new Error("Erreur récupération contenu");
    }
  
    return res.json();
  }