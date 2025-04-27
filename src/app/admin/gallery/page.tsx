'use client';

import DynamicAdminPageBuilder from "@/components/shared/DynamicAdminPageBuilder";
import { useGetAdminModules } from "@/hooks/adminHooks";
import { useTranslation } from "react-i18next";

export default function GalleryPage() {
  const { t } = useTranslation("admin-gallery");
  const { data, isLoading, error } = useGetAdminModules();

  if (isLoading) return <div>{t("loading", "Yükleniyor...")}</div>;
  if (error) return <div>{t("error", "Modüller yüklenirken hata oluştu.")}</div>;

  return (
    <main>
      <DynamicAdminPageBuilder modules={data?.modules || []} />
    </main>
  );
}
