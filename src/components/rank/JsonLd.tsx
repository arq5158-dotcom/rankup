import { useEffect, useState } from "react";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/seo";

function safeJsonLd(data: unknown) {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
  );
}

export function SiteJsonLd() {
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);
  if (!origin) return null;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebSite",
            name: SITE_NAME,
            alternateName: SITE_TAGLINE,
            url: origin,
            description: SITE_DESCRIPTION,
            inLanguage: "en",
          },
          {
            "@type": "Organization",
            name: SITE_NAME,
            url: origin,
            logo: `${origin}/favicon.svg`,
            description: SITE_DESCRIPTION,
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "customer support",
              url: `${origin}/contact`,
            },
          },
        ],
      }}
    />
  );
}
