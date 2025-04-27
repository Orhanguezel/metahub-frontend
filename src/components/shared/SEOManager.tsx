'use client';

import Head from "next/head";

interface SEOManagerProps {
  meta?: {
    title?: string;
    description?: string;
    image?: string;
    canonical?: string;
  };
}

const SEOManager: React.FC<SEOManagerProps> = ({ meta }) => {
  const title = meta?.title || "Default Site Title";
  const description = meta?.description || "Default description about the site.";
  const image = meta?.image || "/default-og-image.jpg";
  const canonical = meta?.canonical || "";

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      {canonical && <link rel="canonical" href={canonical} />}
    </Head>
  );
};

export default SEOManager;
