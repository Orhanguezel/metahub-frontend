"use client";

import React from "react";
import styled, { keyframes } from "styled-components";
import { BsChatDotsFill } from "react-icons/bs";
import { useAppSelector } from "@/store/hooks";
import { selectTotalUnread } from "@/modules/chat/slice/chatSlice";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/chat";
import { useOsNotification } from "@/hooks/useOsNotification";
import type { RootState } from "@/store";
import { SUPPORTED_LOCALES, type SupportedLocale, getMultiLang } from "@/types/common";

const getUILang = (lng?: string): SupportedLocale => {
  const two = (lng || "tr").slice(0, 2).toLowerCase() as SupportedLocale;
  return (SUPPORTED_LOCALES as readonly SupportedLocale[]).includes(two) ? two : "tr";
};

export default function ChatAlertButton() {
  const { t, i18n } = useI18nNamespace("chat", translations);
  const lang = getUILang(i18n?.language);
  const totalUnread = useAppSelector(selectTotalUnread);

  const tenantNameObj = useAppSelector((s: RootState) => {
    const st = s.tenants;
    if (st.selectedTenant?.name) return st.selectedTenant.name;
    if (st.selectedTenantId) {
      const byId = st.tenants.find((tt) => tt._id === st.selectedTenantId)?.name;
      if (byId) return byId;
    }
    return st.tenants[0]?.name;
  });
  const tenantName =
    getMultiLang(tenantNameObj as any, lang) ||
    (typeof tenantNameObj === "string" ? tenantNameObj : "Metahub");

  const { requestPermission } = useOsNotification();

  if (totalUnread <= 0) return null;

  const label = t("support.unread_btn", "Yeni mesajınız var");
  const count = totalUnread > 9 ? "9+" : String(totalUnread);

  const handleOpen = async () => {
    await requestPermission().catch(() => {});
    window.dispatchEvent(new CustomEvent("metahub:openChat"));
  };

  return (
    <Btn onClick={handleOpen} aria-label={label} title={`${tenantName} — ${label}`}>
      <IconWrap>
        <BsChatDotsFill size={18} />
        <Badge aria-hidden="true">{count}</Badge>
        <Ping />
      </IconWrap>
      <span>{label}</span>
    </Btn>
  );
}

/* === styles === */
const ping = keyframes`0%{transform:scale(1);opacity:.8}70%{transform:scale(1.8);opacity:0}100%{opacity:0}`;
const glow = keyframes`0%{box-shadow:0 0 0 #0000}50%{box-shadow:0 0 22px rgba(72,98,137,.25)}100%{box-shadow:0 0 0 #0000}`;

const Btn = styled.button`
  display: inline-flex; align-items: center; gap: .5em;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.accentText};
  border: 0; border-radius: ${({ theme }) => theme.radii.pill};
  padding: .45em .8em; cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.button};
  transition: ${({ theme }) => theme.transition.fast};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  &:hover { background: ${({ theme }) => theme.colors.primaryHover}; }
`;

const IconWrap = styled.span`
  position: relative; display: inline-flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; border-radius: 999px;
  animation: ${glow} 1.6s ease-in-out infinite;
`;

const Badge = styled.span`
  position: absolute; top: -6px; right: -7px;
  min-width: 16px; height: 16px; padding: 0 4px;
  border-radius: 10px; background: #fff; color: ${({ theme }) => theme.colors.primary};
  font-weight: 800; font-size: 10px; line-height: 16px; pointer-events: none;
  box-shadow: 0 0 0 2px rgba(255,255,255,.75);
`;

const Ping = styled.span`
  position: absolute; top: -2px; right: -2px; width: 20px; height: 20px; border-radius: 999px;
  background: rgba(72,98,137,.2); animation: ${ping} 1.6s cubic-bezier(0,0,0.2,1) infinite; pointer-events: none;
`;
