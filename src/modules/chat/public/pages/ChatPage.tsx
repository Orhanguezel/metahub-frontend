// ChatPage.tsx
"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/chat";
import type { RootState } from "@/store";
import {
  selectChatState,
  selectMessagesByRoom,
  fetchRoomMessages,
  markRoomMessagesRead,
} from "@/modules/chat/slice/chatSlice";
import {ChatBox} from "@/modules/chat";
import type { SupportedLocale } from "@/types/common";
import { SUPPORTED_LOCALES, getMultiLang } from "@/types/common";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const LS_ROOM = "chat_room";
const makeUserRoomId = (uid: string) => `user:${uid}`;

const resolveRoomForUser = (userId?: string) => {
  if (!userId) return undefined;
  try {
    const saved = localStorage.getItem(LS_ROOM);
    if (saved && saved.startsWith(`user:${userId}`)) return saved;
  } catch {}
  return makeUserRoomId(userId);
};

const getUILang = (lng?: string): SupportedLocale => {
  const two = (lng || "tr").slice(0, 2).toLowerCase() as SupportedLocale;
  return (SUPPORTED_LOCALES as readonly SupportedLocale[]).includes(two) ? two : "tr";
};

export default function ChatPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { i18n, t } = useI18nNamespace("chat", translations);
  const lang = getUILang(i18n?.language);

  // auth
  const { profile: user, loading: userLoading } = useAppSelector((s) => s.account);
  const isAuthenticated = !!user?._id;
  const userId = user?._id;

  // 🔧 Lokal slug (.env) — sadece localhost'ta anlamlıdır
  const localSlug =
    typeof window !== "undefined" && window.location.hostname === "localhost"
      ? (process.env.NEXT_PUBLIC_TENANT_NAME ||
         process.env.NEXT_PUBLIC_APP_ENV ||
         process.env.TENANT_NAME)
      : undefined;

  // 🏷️ Tenant adı (lokalde .env slugu öncelikli)
  const tenantNameObj = useAppSelector((s: RootState) => {
    const st = s.tenants;

    // a) Lokal slug varsa, listedeki o tenant'ı kullan
    if (localSlug) {
      const envMatch = st.tenants.find(
        (t) => t.slug === localSlug || t._id === localSlug
      )?.name;
      if (envMatch) return envMatch;
    }

    // b) Seçilmiş tenant
    if (st.selectedTenant?.name) return st.selectedTenant.name;

    // c) ID seçiliyse listeden bul
    if (st.selectedTenantId) {
      const byId = st.tenants.find((t) => t._id === st.selectedTenantId)?.name;
      if (byId) return byId;
    }

    // d) Fallback: ilk tenant
    return st.tenants[0]?.name;
  });

  const tenantName =
    getMultiLang(tenantNameObj as any, lang) ||
    (typeof tenantNameObj === "string" ? tenantNameObj : "Metahub");

  // i18n stringinde {{brand}} → tenantName
  const brandTitle = t("support.brand", "{{brand}} Canlı Destek", { brand: tenantName });

  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(selectChatState);

  const [roomId, setRoomId] = useState<string | undefined>(undefined);
  const [canRedirect, setCanRedirect] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setCanRedirect(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!canRedirect) return;
    if (userLoading) return;
    if (!isAuthenticated) {
      const qs = searchParams?.toString();
      const nextUrl = qs ? `${pathname}?${qs}` : pathname || "/";
      router.push(`/login?next=${encodeURIComponent(nextUrl)}`);
    }
  }, [canRedirect, isAuthenticated, userLoading, pathname, searchParams, router]);

  useEffect(() => {
    if (!isAuthenticated || !userId) return;
    const rid = resolveRoomForUser(userId);
    setRoomId(rid);
    try { localStorage.setItem(LS_ROOM, rid!); } catch {}
  }, [isAuthenticated, userId]);

  const messages = useAppSelector(
    useMemo(() => selectMessagesByRoom(roomId || "__none__"), [roomId])
  );

  const handleResolved = useCallback(async (rid: string) => {
    setRoomId(rid);
    try { localStorage.setItem(LS_ROOM, rid); } catch {}
    await dispatch(fetchRoomMessages({ roomId: rid, page: 1, limit: 20, sort: "asc" }));
    await dispatch(markRoomMessagesRead({ roomId: rid }));
  }, [dispatch]);

  useEffect(() => {
    if (!roomId) return;
    dispatch(fetchRoomMessages({ roomId, page: 1, limit: 20, sort: "asc" }));
    dispatch(markRoomMessagesRead({ roomId }));
  }, [dispatch, roomId]);

  if (userLoading) {
    return (
      <Wrap>
        <Header>
          <h1>{t("support.title", "Canlı Destek")}</h1>
          <p>{t("support.loading", "Yükleniyor…")}</p>
        </Header>
      </Wrap>
    );
  }

  if (!isAuthenticated) {
    return (
      <Wrap>
        <Header>
          <h1>{t("support.title", "Canlı Destek")}</h1>
          <p>{t("support.login_required", "Canlı desteği kullanmak için lütfen giriş yapın…")}</p>
        </Header>
      </Wrap>
    );
  }

  return (
    <Wrap>
      <Header>
        <h1>{t("support.title", "Canlı Destek")}</h1>
        <p>{t("support.subtitle", "Sorularınızı buradan iletebilirsiniz.")}</p>
      </Header>

      <Card>
        <ChatBox
          brandTitle={brandTitle}
          lang={lang}
          userId={userId!}
          roomId={roomId}
          loading={loading}
          error={typeof error === "string" ? error : undefined}
          messages={messages}
          onRoomResolved={handleResolved}
        />
      </Card>
    </Wrap>
  );
}

/* styled */
const Wrap = styled.div`
  max-width: ${({ theme }) => theme.layout.containerWidth};
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacings.xl};
  ${({ theme }) => theme.media.mobile} { padding: ${({ theme }) => theme.spacings.md}; }
`;
const Header = styled.header`
  margin-bottom: ${({ theme }) => theme.spacings.lg};
  h1 { margin: 0; font-size: ${({ theme }) => theme.fontSizes.h3}; }
  p  { margin: 6px 0 0; color: ${({ theme }) => theme.colors.textSecondary}; }
`;
const Card = styled.section`
  background: ${({ theme }) => theme.colors.cardBackground};
  border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.cards.shadow};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacings.lg};
`;
