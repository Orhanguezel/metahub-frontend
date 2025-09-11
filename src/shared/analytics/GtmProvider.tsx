// frontend/src/shared/analytics/GtmProvider.tsx
"use client";

import Script from "next/script";

type ConsentDefaults = Partial<{
  ad_storage: "granted" | "denied";
  analytics_storage: "granted" | "denied";
  ad_user_data: "granted" | "denied";
  ad_personalization: "granted" | "denied";
}>;

/**
 * Body açılışından HEMEN sonra render et.
 * Örn: <body><GtmProvider ... /></body>
 */
export default function GtmProvider({
  containerId,
  dataLayerName = "dataLayer",
  consentDefaults, // opsiyonel
}: {
  containerId: string;
  dataLayerName?: string;
  consentDefaults?: ConsentDefaults;
}) {
  if (!containerId) return null;

  const noscriptHtml = `
    <iframe src="https://www.googletagmanager.com/ns.html?id=${containerId}"
      height="0" width="0" style="display:none;visibility:hidden"></iframe>
  `;

  return (
    <>
      {/* JS kapalıyken fallback */}
      <noscript dangerouslySetInnerHTML={{ __html: noscriptHtml }} />

      {/* (Opsiyonel) Consent Mode varsayılanları */}
      {consentDefaults && (
        <Script id={`gtm-consent-${containerId}`} strategy="afterInteractive">
          {`
            (function(w){
              w.${dataLayerName} = w.${dataLayerName} || [];
              function gtag(){ ${dataLayerName}.push(arguments); }
              gtag('consent','default', ${JSON.stringify(consentDefaults)});
            })(window);
          `}
        </Script>
      )}

      {/* GTM bootstrap (afterInteractive) */}
      <Script id={`gtm-base-${containerId}`} strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){
            w[l]=w[l]||[];
            w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
            var f=d.getElementsByTagName(s)[0], j=d.createElement(s), dl=l!='${dataLayerName}'?'&l='+l:'';
            j.async=true; j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
            f.parentNode.insertBefore(j,f);
          })(window,document,'script','${dataLayerName}','${containerId}');
        `}
      </Script>
    </>
  );
}
