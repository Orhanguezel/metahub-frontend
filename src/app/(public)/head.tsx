// app/head.tsx
export default function Head() {
  return (
    <>
      <title>Ensotek Kühlturmsysteme – Energieeffiziente Kühllösungen</title>
      <meta
        name="description"
        content="Ensotek bietet energieeffiziente, nachhaltige Kühlturmlösungen für industrielle Anwendungen. Qualität & Innovation made in Germany."
      />
      <meta
        name="keywords"
        content="Kühlturm, Kühlsysteme, industrielle Kühlung, Energierückgewinnung, Nachhaltigkeit, Ensotek, Kühltechnologie, Wärmetauscher"
      />
      <meta name="author" content="Ensotek GmbH" />
      <meta name="robots" content="index, follow" />
      {/* Viewport */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="UTF-8" />
      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />
      {/* OG/Twitter varsayılanları */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content="Ensotek – Industrielle Kühlturmsysteme" />
      <meta
        property="og:description"
        content="Innovative industrielle Kühltürme mit Fokus auf Energieeffizienz und Umweltfreundlichkeit."
      />
      <meta property="og:image" content="/og-image.jpg" />
      <meta property="og:url" content="https://ensotek.de" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Ensotek – Industrielle Kühlturmsysteme" />
      <meta
        name="twitter:description"
        content="Entdecken Sie energieeffiziente Kühlturm-Lösungen von Ensotek für die Industrie."
      />
      <meta name="twitter:image" content="/og-image.jpg" />
      {/* Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap"
        rel="stylesheet"
      />
    </>
  );
}

