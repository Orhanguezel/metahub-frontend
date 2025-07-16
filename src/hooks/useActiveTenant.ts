// src/hooks/useActiveTenant.ts
import { useAppSelector } from "@/store/hooks";
import type { ITenant } from "@/modules/tenants/types";

type UseActiveTenantResult = {
  tenant: ITenant | null;
  loading: boolean;
};

// Net ve tipli hook!
export function useActiveTenant(): UseActiveTenantResult {
  const tenant = useAppSelector((s) => s.tenants.selectedTenant);
  const loading = useAppSelector((s) => s.tenants.loading);

  return { tenant, loading };
}
