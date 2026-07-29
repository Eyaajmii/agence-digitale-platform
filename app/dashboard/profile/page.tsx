"use client";

import { useEffect, useState } from "react";
import { User, Phone, Save } from "lucide-react";
import { getProfile, updateProfile } from "@/lib/supabase/profile";

type Profile = {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  role: string;
  poste: string;
  ville: string;
  pays: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [manager, setManager] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getProfile();

        setProfile(data.profile);
        setManager(data.manager);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!profile) return;

    setSaving(true);
    setSuccess(false);

    try {
      await updateProfile({
        nom: profile.nom,
        prenom: profile.prenom,
        telephone: profile.telephone,
        poste: profile.poste,
        ville: profile.ville,
        pays: profile.pays,

        nom_agence: manager?.nom_agence,
        adresse_agence: manager?.adresse_agence,
        email_agence: manager?.email_agence,
        fax_agence: manager?.fax_agence,
      });

      setSuccess(true);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600">
        Impossible de charger le profil.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-[Space_Grotesk,sans-serif] text-3xl font-bold text-slate-900">
          Mon profil
        </h1>

        <p className="mt-2 text-slate-500">
          Gérez vos informations personnelles.
        </p>
      </div>

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Profil mis à jour avec succès.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {/* Header card */}
          <div className="border-b border-slate-200 bg-slate-50 px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100">
                <User className="h-8 w-8 text-blue-700" />
              </div>

              <div>
                <h2 className="font-[Space_Grotesk,sans-serif] text-xl font-bold text-slate-900">
                  {profile.prenom} {profile.nom}
                </h2>

                <p className="text-sm text-slate-500 capitalize">
                  {profile.role}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="grid gap-6 p-8 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Nom
              </label>

              <input
                type="text"
                value={profile.nom ?? ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    nom: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Prénom
              </label>

              <input
                type="text"
                value={profile.prenom ?? ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    prenom: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Téléphone
              </label>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  value={profile.telephone ?? ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      telephone: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Poste
              </label>

              <input
                type="text"
                value={profile.poste ?? ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    poste: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Ville
              </label>

              <input
                type="text"
                value={profile.ville ?? ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    ville: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Pays
              </label>

              <input
                type="text"
                value={profile.pays ?? ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    pays: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Rôle
              </label>

              <input
                disabled
                value={profile.role}
                className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500"
              />
            </div>
          </div>
          {profile.role === "manager" && manager && (
            <div className="border-t border-slate-200 p-8">
              <h3 className="mb-6 text-lg font-semibold text-slate-900">
                Informations de l'agence
              </h3>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Nom de l'agence
                  </label>

                  <input
                    type="text"
                    value={manager.nom_agence ?? ""}
                    onChange={(e) =>
                      setManager({
                        ...manager,
                        nom_agence: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Email agence
                  </label>

                  <input
                    type="email"
                    value={manager.email_agence ?? ""}
                    onChange={(e) =>
                      setManager({
                        ...manager,
                        email_agence: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Adresse agence
                  </label>

                  <input
                    type="text"
                    value={manager.adresse_agence ?? ""}
                    onChange={(e) =>
                      setManager({
                        ...manager,
                        adresse_agence: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Fax
                  </label>

                  <input
                    type="text"
                    value={manager.fax_agence ?? ""}
                    onChange={(e) =>
                      setManager({
                        ...manager,
                        fax_agence: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>
          )}
          {/* Footer */}
          <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-8 py-5">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              <Save size={16} />

              {saving ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
