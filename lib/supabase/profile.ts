export async function getProfile() {
    const res = await fetch("/api/profile");
  
    if (!res.ok) {
      throw new Error("Erreur chargement profil");
    }
  
    return res.json();
  }
  
  export async function updateProfile(data: {
    nom: string;
    prenom: string;
    telephone: string;
  }) {
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  
    if (!res.ok) {
      throw new Error("Erreur mise à jour");
    }
  
    return res.json();
  }