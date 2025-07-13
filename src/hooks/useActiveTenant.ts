// src/hooks/useActiveTenant.ts
import { useAppSelector } from "@/store/hooks";

/**
 * Aktif tenant'ı seçmek için hook.
 * Öncelik sırası:
 * 1. Redux (selectedTenant > selectedTenantId)
 * 2. LocalStorage (sadece browser)
 * 3. DEV/LOCAL ortamında .env override (localhost hariç prod'da asla!)
 * 4. Varsayılan env (NEXT_PUBLIC_DEFAULT_TENANT, vs.)
 */export function useActiveTenant(): string | undefined {
  const selectedTenant = useAppSelector((s) => s.tenants.selectedTenant);
  const selectedTenantId = useAppSelector((s) => s.tenants.selectedTenantId);

  // LocalStorage (browser ortamında)
  let localTenant: string | undefined = undefined;
  if (typeof window !== "undefined") {
    localTenant = localStorage.getItem("tenant") || undefined;
  }

  // Local/dev için .env override (sadece localhost'ta kullanılır)
  let localEnvTenant: string | undefined = undefined;
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    localEnvTenant =
      process.env.NEXT_PUBLIC_APP_ENV ||
      process.env.NEXT_PUBLIC_TENANT_NAME ||
      process.env.TENANT_NAME;
  }

  // Global env fallback (prod ortamı)
  const defaultEnvTenant =
    process.env.NEXT_PUBLIC_DEFAULT_TENANT ||
    process.env.NEXT_PUBLIC_TENANT_NAME ||
    process.env.TENANT_NAME;

  // Sıra: Redux nesnesi > Redux id > LocalStorage > Local ENV > Default ENV
  return (
    selectedTenant?._id ||
    selectedTenantId ||
    localTenant ||
    localEnvTenant ||
    defaultEnvTenant
  );
}
