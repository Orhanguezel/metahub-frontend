"use client";
import { ReactNode, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { detectTenantFromHost } from "@/lib/tenant";
import { RootState } from "@/store";
import { fetchTenants, setSelectedTenant } from "@/modules/tenants/slice/tenantSlice";

export default function TenantProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const tenants = useSelector((state: RootState) => state.tenants.tenants);
  const tenantsLoading = useSelector((state: RootState) => state.tenants.loading);
  const selectedTenant = useSelector((state: RootState) => state.tenants.selectedTenant);

  const initialized = useRef(false);

  // 1. Tenantlar hiç yüklenmediyse fetch et
  useEffect(() => {
    if (!tenants.length && !tenantsLoading) {
      dispatch(fetchTenants() as any);
    }
  }, [dispatch, tenants.length, tenantsLoading]);

  // 2. Tenantlar yüklendikten sonra tenantı bul ve seç
  useEffect(() => {
    if (initialized.current || tenantsLoading || !tenants.length) return;

    const tenantSlug = detectTenantFromHost();
    const tenantObj = tenants.find((t) => t.slug === tenantSlug);

    if (tenantObj && tenantObj._id) {
      if (!selectedTenant || selectedTenant._id !== tenantObj._id) {
        dispatch(setSelectedTenant(tenantObj));
      }
      initialized.current = true;
    } else {
      // Eğer tenant bulunamadıysa ekrana özel hata mesajı bas
      initialized.current = true;
    }
  }, [dispatch, tenants, selectedTenant, tenantsLoading]);

  // 3. Henüz fetch tamamlanmadıysa (API çağrısı devam ediyor)
  if (tenantsLoading || !tenants.length) {
    return <div style={{ minHeight: "100vh", background: "#f8f8fb" }}>Loading tenant list...</div>;
  }

  // 4. Tenant bulunamadıysa
  if (!selectedTenant) {
    return <div style={{ minHeight: "100vh", background: "#fff0f0", color: "#b00", display: "flex", alignItems: "center", justifyContent: "center" }}>
      Tenant bulunamadı! Lütfen domain ayarlarını kontrol edin.
    </div>;
  }

  // 5. Her şey tamam, children'ı göster
  return <>{children}</>;
}
