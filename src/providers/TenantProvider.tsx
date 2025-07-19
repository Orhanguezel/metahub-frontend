"use client";
import { ReactNode, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { detectTenantFromHost } from "@/lib/tenant";
import { RootState } from "@/store";
import { fetchTenants, setSelectedTenant } from "@/modules/tenants/slice/tenantSlice";

export default function TenantProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const tenants = useSelector((state: RootState) => state.tenants.tenants);
  const selectedTenant = useSelector((state: RootState) => state.tenants.selectedTenant);

  // 1. Tenant listesi yoksa fetch et
  useEffect(() => {
    if (!tenants.length) {
      dispatch(fetchTenants() as any);
    }
  }, [dispatch, tenants.length]);

  // 2. Sadece ilk seferde tenant tespit et
  useEffect(() => {
    if (tenants.length && !selectedTenant) {
      const tenantSlug = detectTenantFromHost(); // Prod’da domain, dev’de .env
      const tenantObj = tenants.find(t => t.slug === tenantSlug);
      if (tenantObj) {
        dispatch(setSelectedTenant(tenantObj));
      }
    }
  }, [dispatch, tenants, selectedTenant]);

  return <>{children}</>;
}
