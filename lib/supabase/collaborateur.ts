import { createBrowserClient } from "@supabase/ssr";
import type { Collaborateur, ProfileWithEmail, CollaborateurFormData } from "@/types/users";
import { getSession } from "next-auth/react";

function db() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

async function fetchEmailById(userId: string): Promise<string> {
  try {
    const res = await fetch(`/api/collaborateur/email?userId=${userId}`);
    if (!res.ok) return "";
    const { email } = await res.json();
    return email ?? "";
  } catch {
    return "";
  }
}

// ─── Lecture liste ────────────────────────────────────────────
export async function getCollaborateurs(): Promise<Collaborateur[]> {
  const supabase = db();

  const { data, error } = await supabase.from("collaborateurs").select(`
    id,
    manager_id,
    profiles (
      id,
      nom,
      prenom,
      telephone,
      role,
      created_at
    )
  `);

  if (error) throw new Error(error.message);

  const collabs = data ?? [];

  const withEmails = await Promise.all(
    collabs.map(async (c) => {
      const email = await fetchEmailById(c.id);
      return {
        ...c,
        profiles: { ...c.profiles, email },
      } as unknown as Collaborateur;
    })
  );

  return withEmails;
}

// ─── Lecture par id ───────────────────────────────────────────
export async function getCollabById(id: string): Promise<Collaborateur> {
  const supabase = db();

  const { data, error } = await supabase
    .from("collaborateurs")
    .select(`
      id,
      manager_id,
      profiles (
        id,
        nom,
        prenom,
        telephone,
        role,
        created_at
      )
    `)
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);

  const email = await fetchEmailById(id);
  return {
    ...data,
    profiles: { ...data.profiles, email },
  } as unknown as Collaborateur;
}

// ─── Création ─────────────────────────────────────────────────
export async function addCollaborateur(
  form: CollaborateurFormData
): Promise<Collaborateur> {
  const supabase = db();
  const session = await getSession();
  if (!session?.user) throw new Error("Utilisateur non connecté");
  const managerId = (session.user as { id?: string }).id ?? session.user.email;

  // 1. Inviter via auth.admin (service_role côté serveur)
  const inviteRes = await fetch("/api/collaborateur/invite", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: form.email }),
  });

  if (!inviteRes.ok) {
    const { error } = await inviteRes.json();
    throw new Error(error ?? "Erreur lors de l'invitation");
  }

  const { userId } = await inviteRes.json();

  // 2. Créer le profil avec le même id que auth.users
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .insert([{
      id: userId,
      nom: form.nom,
      prenom: form.prenom,
      telephone: form.telephone,
      role: "Collaborateur",
    }])
    .select()
    .single();

  if (profileError) throw new Error(profileError.message);

  // 3. Créer le collaborateur
  const { data: collaborateur, error: collabError } = await supabase
    .from("collaborateurs")
    .insert([{
      id: profile.id,
      manager_id: managerId,
    }])
    .select(`
      id,
      manager_id,
      profiles (
        id,
        nom,
        prenom,
        telephone,
        role,
        created_at
      )
    `)
    .single();

  if (collabError) throw new Error(collabError.message);

  return {
    ...collaborateur,
    profiles: { ...collaborateur.profiles, email: form.email },
  } as unknown as Collaborateur;
}

// ─── Mise à jour ──────────────────────────────────────────────
export async function updateCollaborateur(
  id: string,
  form: CollaborateurFormData
): Promise<ProfileWithEmail> {
  const supabase = db();

  const { data, error } = await supabase
    .from("profiles")
    .update({
      nom: form.nom,
      prenom: form.prenom,
      telephone: form.telephone,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  const email = await fetchEmailById(id);
  return { ...data, email } as ProfileWithEmail;
}

// ─── Suppression ──────────────────────────────────────────────
export async function deleteCollaborateur(id: string): Promise<void> {
  const supabase = db();

  await supabase.from("collaborateurs").delete().eq("id", id);

  const { error } = await supabase.from("profiles").delete().eq("id", id);
  if (error) throw new Error(error.message);

  await fetch("/api/collaborateur/delete-auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: id }),
  });
}