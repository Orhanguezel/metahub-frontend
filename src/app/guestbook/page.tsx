'use client';

import DynamicPageBuilder from "@/components/shared/DynamicPageBuilder";
import SEOManager from "@/components/shared/SEOManager";
import { useGetPageConfig } from "@/hooks/pageHooks";
import { useTranslation } from "react-i18next";

export default function GuestbookPage() {
  const { t } = useTranslation("guestbook");
  const { data, isLoading, error } = useGetPageConfig("guestbook");

  if (isLoading) return <div>{t("loading", "Yükleniyor...")}</div>;
  if (error) return <div>{t("error", "Sayfa yüklenirken bir hata oluştu.")}</div>;

  return (
    <main>
      <SEOManager meta={data?.meta} />
      <DynamicPageBuilder modules={data?.modules || []} />
    </main>
  );
}

