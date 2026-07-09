export const metadata = {
    title: "Politique de confidentialité",
    description: "Politique de confidentialité de l'application",
  };
  
  export default function PrivacyPolicyPage() {
    return (
      <main className="max-w-3xl mx-auto px-6 py-12 text-gray-800">
        <h1 className="text-3xl font-bold mb-2">Politique de confidentialité</h1>
        <p className="text-sm text-gray-500 mb-8">
          Dernière mise à jour : 9 juillet 2026
        </p>
  
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
          <p>
            Cette politique de confidentialité décrit comment lezarts.digital
            (« nous ») collecte, utilise et protège les données lorsque vous
            utilisez notre plateforme de gestion de campagnes marketing digitales
            (« le Service »).
          </p>
        </section>
  
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            2. Données que nous collectons
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Informations de compte : nom, adresse e-mail, photo de profil (via
              connexion Google)
            </li>
            <li>
              Données publicitaires et analytiques : lorsque vous ou vos clients
              autorisez l&apos;accès, nous accédons en votre nom aux données de
              Google Ads, Google Analytics et Google Search Console associées aux
              comptes que vous gérez.
            </li>
            <li>
              Jetons d&apos;accès OAuth (access token, refresh token), stockés de
              manière chiffrée (AES-256).
            </li>
          </ul>
        </section>
  
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            3. Utilisation des données
          </h2>
          <p>Les données collectées sont utilisées exclusivement pour :</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Afficher des tableaux de bord de performance marketing</li>
            <li>Générer des rapports consolidés pour vos clients</li>
            <li>
              Maintenir la connexion sécurisée à vos comptes Google autorisés
            </li>
          </ul>
        </section>
  
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            4. Partage des données
          </h2>
          <p>
            Nous ne vendons, ne louons et ne partageons vos données avec aucun
            tiers à des fins commerciales. Vos données ne sont utilisées qu&apos;au
            sein de notre plateforme, pour les finalités décrites ci-dessus.
          </p>
        </section>
  
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            5. Stockage et sécurité
          </h2>
          <p>
            Les jetons d&apos;accès sont chiffrés (AES-256) et stockés de manière
            sécurisée via Supabase. L&apos;accès à ces données est strictement
            limité aux fonctionnalités nécessaires de l&apos;application.
          </p>
        </section>
  
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            6. Révocation de l&apos;accès
          </h2>
          <p>
            Vous pouvez révoquer l&apos;accès de notre application à votre compte
            Google à tout moment via{" "}
            <a
              href="https://myaccount.google.com/permissions"
              className="text-blue-600 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              myaccount.google.com/permissions
            </a>
            .
          </p>
        </section>
  
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            7. Conservation des données
          </h2>
          <p>
            Les données sont conservées tant que votre compte reste actif. Vous
            pouvez demander la suppression de vos données à tout moment en nous
            contactant.
          </p>
        </section>
  
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">8. Vos droits</h2>
          <p>
            Conformément aux réglementations applicables (RGPD ou équivalent),
            vous disposez d&apos;un droit d&apos;accès, de rectification et de
            suppression de vos données personnelles.
          </p>
        </section>
  
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">9. Contact</h2>
          <p>
            Pour toute question concernant cette politique de confidentialité,
            contactez-nous à : ajmieya13@gmail.com
          </p>
        </section>
  
        <section>
          <h2 className="text-xl font-semibold mb-2">10. Modifications</h2>
          <p>
            Nous pouvons mettre à jour cette politique de confidentialité. Toute
            modification importante sera communiquée via notre plateforme.
          </p>
        </section>
      </main>
    );
  }