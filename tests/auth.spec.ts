import { test, expect } from '@playwright/test';

/**
 * Tests E2E — Flux d'authentification
 * -------------------------------------------------
 * NextAuth avec Google réel ne peut pas être testé en E2E automatisé
 * (Google bloque les logins scriptés). On mocke donc la session
 * NextAuth via le cookie de session, ce qui permet de tester tout
 * le comportement applicatif (redirections, accès protégés, UI)
 * sans dépendre du vrai fournisseur OAuth.
 */

const FAKE_SESSION = {
  user: {
    name: 'Utilisateur Test',
    email: 'test@agence-digitale.fr',
    image: null,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

test.describe('Authentification', () => {
  test('un visiteur non connecté est redirigé vers /login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('la page de connexion affiche les options d\'authentification', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText(/se connecter avec google/i)).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /recevoir un lien de connexion/i })).toBeVisible();
  });

  test('un email invalide affiche une erreur de validation', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/email/i).fill('pas-un-email');
    await page.getByRole('button', { name: /recevoir un lien de connexion/i }).click();
    await expect(page.getByText(/adresse email invalide/i)).toBeVisible();
  });

  test('la demande de magic link affiche un message de confirmation', async ({ page }) => {
    // Mock de la route NextAuth qui envoie le magic link
    await page.route('**/api/auth/signin/email', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
    });

    await page.goto('/login');
    await page.getByPlaceholder(/email/i).fill('test@agence-digitale.fr');
    await page.getByRole('button', { name: /recevoir un lien de connexion/i }).click();

    await expect(page.getByText(/un lien de connexion vous a été envoyé/i)).toBeVisible();
  });

  test.describe('Utilisateur authentifié (session mockée)', () => {
    test.beforeEach(async ({ context }) => {
      // Injecte un cookie de session NextAuth valide avant chaque test
      // Nom du cookie à adapter selon la config NextAuth (dev: sans préfixe __Secure-)
      await context.addCookies([
        {
          name: 'next-auth.session-token',
          value: 'fake-session-token-e2e',
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          sameSite: 'Lax',
        },
      ]);

      // Mock de l'endpoint de session que NextAuth interroge côté client
      await context.route('**/api/auth/session', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(FAKE_SESSION),
        });
      });
    });

    test('un utilisateur connecté accède au dashboard', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/dashboard/);
      await expect(page.getByText(/utilisateur test/i)).toBeVisible();
    });

    test('le nom et l\'email de l\'utilisateur apparaissent dans le menu de profil', async ({ page }) => {
      await page.goto('/dashboard');
      await page.getByRole('button', { name: /profil|compte/i }).click();
      await expect(page.getByText('test@agence-digitale.fr')).toBeVisible();
    });

    test('la déconnexion redirige vers la page de connexion', async ({ page, context }) => {
      await page.goto('/dashboard');

      await context.route('**/api/auth/signout', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
      });

      await page.getByRole('button', { name: /profil|compte/i }).click();
      await page.getByRole('button', { name: /se déconnecter/i }).click();

      await expect(page).toHaveURL(/\/login/);
    });
  });
});