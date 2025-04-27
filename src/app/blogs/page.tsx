// src/app/visitor/blogs/page.tsx

'use client';

import DynamicPageBuilder from "@/components/shared/DynamicPageBuilder";
import SEOManager from "@/components/shared/SEOManager";
import { useGetPageConfig } from "@/hooks/pageHooks";
import { useTranslation } from "react-i18next";

export default function BlogsPage() {
  const { t } = useTranslation("blog");
  const { data, isLoading, error } = useGetPageConfig("blogs");

  if (isLoading) return <div>{t("loading", "Yükleniyor...")}</div>;
  if (error) return <div>{t("error", "Sayfa yüklenirken hata oluştu.")}</div>;

  return (
    <main>
      <SEOManager meta={data?.meta} />
      <DynamicPageBuilder modules={data?.modules || []} />
    </main>
  );
}


