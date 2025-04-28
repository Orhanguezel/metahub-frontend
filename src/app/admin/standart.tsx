"use client";

import { useGetAdminModules } from "@/hooks/adminHooks";
import DynamicAdminPageBuilder from "@/components/shared/DynamicAdminPageBuilder";
import Loading from "@/components/shared/Loading";
import ErrorMessage from "@/components/shared/ErrorMessage";

export default function SomeAdminPage() {
  const { data, isLoading, error } = useGetAdminModules();

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage />;

  return (
    <main>
      <DynamicAdminPageBuilder modules={data?.modules || []} />
    </main>
  );
}
