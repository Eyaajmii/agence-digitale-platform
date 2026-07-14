// app/oauth-success/page.tsx
export default function OAuthSuccess() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f9fafb",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        padding: "24px",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
          padding: "48px 40px",
          maxWidth: "420px",
          width: "100%",
          textAlign: "center",
        }}
      >
        {/* Icône SVG de succès */}
        <div
          style={{
            width: "56px",
            height: "56px",
            margin: "0 auto 24px",
            borderRadius: "50%",
            backgroundColor: "#ecfdf5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 6L9 17L4 12"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1
          style={{
            fontSize: "20px",
            fontWeight: 600,
            color: "#111827",
            margin: "0 0 12px",
          }}
        >
          Connexion réussie
        </h1>

        <p
          style={{
            fontSize: "14px",
            color: "#6b7280",
            lineHeight: 1.6,
            margin: "0 0 8px",
          }}
        >
          Votre compte a été connecté avec succès à notre plateforme.
        </p>

        <p
          style={{
            fontSize: "14px",
            color: "#6b7280",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          Vous pouvez maintenant fermer cette page.
        </p>
      </div>
    </div>
  );
}