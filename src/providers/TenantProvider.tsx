"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

type TenantContextType = {
  tenant: string;
  setTenant: (tenant: string) => void;
};

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState("default");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const host = window.location.host;
      let t = "default";
      if (host.includes("metahub")) t = "metahub";
      else if (host.includes("anastasia")) t = "anastasia";
      setTenant(t);
    }
  }, []);

  return (
    <TenantContext.Provider value={{ tenant, setTenant }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant(): TenantContextType {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenant must be used within a TenantProvider");
  return ctx;
}
