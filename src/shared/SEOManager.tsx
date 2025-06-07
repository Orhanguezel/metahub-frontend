// metahub-frontend/src/shared/SEOManager.tsx
import Head from "next/head";
import React from "react";

export interface SEOMeta {
  title?: string;
  description?: string;
  keywords?: string;
  [name: string]: string | undefined;
}

interface SEOManagerProps {
  meta: SEOMeta;
}

const SEOManager: React.FC<SEOManagerProps> = ({ meta }) => {
  const { title, description, keywords, ...rest } = meta;

  return (
    <Head>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      {Object.entries(rest).map(([name, content]) =>
        content ? <meta key={name} name={name} content={content} /> : null
      )}
    </Head>
  );
};

export default SEOManager;