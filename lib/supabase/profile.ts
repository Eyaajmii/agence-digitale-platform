import type { UpdateProfileInput } from "@/types/users";

export async function getProfile() {
  const res = await fetch("/api/profile", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Erreur chargement profil");
  }

  return res.json();
}

export async function updateProfile(data: UpdateProfileInput) {
  const res = await fetch("/api/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.error || "Erreur mise à jour");
  }

  return result;
}