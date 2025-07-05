// TenantSwitcher.tsx
import React, { useEffect, useCallback } from "react";
import { useAppDispatch } from "@/store/hooks";
import { setSelectedTenant } from "@/modules/tenants/slice/tenantSlice";
import type { ITenant } from "@/modules/tenants/types";

type Props = {
  tenantList: ITenant[];
  selectedTenantId: string;
  isSuperAdmin: boolean;
};

export const TenantSwitcher: React.FC<Props> = ({
  tenantList,
  selectedTenantId,
  isSuperAdmin,
}) => {
  const dispatch = useAppDispatch();

  // Merkezi switch fonksiyonu
  const handleSwitch = useCallback(
  (tenantId: string) => {
    if (typeof window !== "undefined") {
      if (isSuperAdmin) {
        localStorage.setItem("selectedTenant", tenantId);
        localStorage.setItem("selectedTenantOverride", tenantId);
      } else {
        localStorage.setItem("selectedTenant", tenantId);
        localStorage.removeItem("selectedTenantOverride");
      }
    }
    dispatch(setSelectedTenant(tenantId));
  },
  [dispatch, isSuperAdmin]
);

useEffect(() => {
  if (typeof window !== "undefined") {
    const savedTenantId = isSuperAdmin
      ? localStorage.getItem("selectedTenantOverride")
      : localStorage.getItem("selectedTenant");
    if (
      savedTenantId &&
      savedTenantId !== selectedTenantId &&
      tenantList.some((t) => t._id === savedTenantId)
    ) {
      handleSwitch(savedTenantId);
    }
  }
  // eslint-disable-next-line
}, [tenantList.length, isSuperAdmin]);


  return (
    <select
      value={selectedTenantId}
      onChange={(e) => handleSwitch(e.target.value)}
      style={{ minWidth: 160, padding: 5, borderRadius: 4 }}
    >
      {tenantList.length > 0 ? (
        tenantList.map((tenant) => (
          <option key={tenant._id} value={tenant._id}>
            {tenant.name?.en || tenant.slug}
          </option>
        ))
      ) : (
        <option disabled>No tenants</option>
      )}
    </select>
  );
};
