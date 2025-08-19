"use client";

import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import styled, { keyframes, css } from "styled-components";
import { BsChatDots, BsChatDotsFill } from "react-icons/bs";
import ChatBox from "@/modules/chat/public/components/ChatBox";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import { translations } from "@/modules/chat";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectChatState,
  selectMessagesByRoom,
  fetchRoomMessages,
  markRoomMessagesRead,
  messageReceived,
  setCurrentRoom,
  setChatOpen,
  selectTotalUnread,
} from "@/modules/chat/slice/chatSlice";
import type { ChatMessage } from "@/modules/chat/types";
import { getSocket } from "@/lib/socket";
import { SUPPORTED_LOCALES, type SupportedLocale, getMultiLang } from "@/types/common";
import { usePathname, useRouter } from "next/navigation";
import type { RootState } from "@/store";
import { useOsNotification } from "@/hooks/useOsNotification";

const LS_ROOM = "chat_room";
const SOUND_URL = "/sounds/support-ding.mp3";

const getUILang = (lng?: string): SupportedLocale => {
  const two = (lng || "tr").slice(0, 2).toLowerCase() as SupportedLocale;
  return (SUPPORTED_LOCALES as readonly SupportedLocale[]).includes(two) ? two : "tr";
};

const makeUserRoomId = (uid: string) => `user:${uid}`;
const resolveRoomForUser = (userId?: string) => {
  if (!userId) return undefined;
  try {
    const saved = localStorage.getItem(LS_ROOM);
    if (saved && saved.startsWith(`user:${userId}`)) return saved;
  } catch {}
  return makeUserRoomId(userId);
};

export default function FloatingChatboxSection() {
  const router = useRouter();
  const pathname = usePathname();

  const { i18n, t } = useI18nNamespace("chat", translations);
  const lang = getUILang(i18n?.language);

  const { profile: user, loading: authLoading } = useAppSelector((s) => s.account);
  const isAuthenticated = !!user?._id;
  const userId = user?._id;

  // 🏷️ Tenant adı
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

  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(selectChatState);

  const [open, setOpen] = useState(false);
  const [localRoom, setLocalRoom] = useState<string | undefined>(undefined);
  const [toast, setToast] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const faviconOriginal = useRef<string | null>(null);
  const joinedRef = useRef<string | null>(null);

  const { showOSNotification, requestPermission } = useOsNotification();

  // Odayı çöz (yalnızca girişliyse)
  useEffect(() => {
    if (!isAuthenticated || !userId) return;
    const rid = resolveRoomForUser(userId);
    setLocalRoom(rid);
    dispatch(setCurrentRoom(rid));
    try { localStorage.setItem(LS_ROOM, rid!); } catch {}
  }, [isAuthenticated, userId, dispatch]);

  // Navbar’dan chat açma olayı
  useEffect(() => {
    const openHandler = () => setOpen(true);
    window.addEventListener("metahub:openChat", openHandler);
    return () => window.removeEventListener("metahub:openChat", openHandler);
  }, []);

  // Chat açık/kapalı flag → slice
  useEffect(() => {
    dispatch(setChatOpen(open));
  }, [open, dispatch]);

  // --- helpers ---
  const playDing = useCallback(() => {
    try {
      if (!audioRef.current) audioRef.current = new Audio(SOUND_URL);
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } catch {}
  }, []);

  const updateFaviconBadge = useCallback((count: number) => {
    try {
      const link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
      if (!link) return;
      if (!faviconOriginal.current) faviconOriginal.current = link.href;

      if (count <= 0) {
        if (faviconOriginal.current) link.href = faviconOriginal.current;
        return;
      }
      const img = document.createElement("img");
      img.src = faviconOriginal.current || link.href;
      img.onload = () => {
        const size = 32;
        const c = document.createElement("canvas");
        c.width = size; c.height = size;
        const ctx = c.getContext("2d")!;
        ctx.drawImage(img, 0, 0, size, size);
        ctx.fillStyle = "#E53935";
        ctx.beginPath(); ctx.arc(size - 8, 8, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "bold 10px sans-serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        // total unread yaz
        const text = count > 9 ? "9+" : String(count);
        ctx.fillText(text, size - 8, 8);
        link.href = c.toDataURL("image/png");
      };
    } catch {}
  }, []);

  // total unread değişince favicon rozetini güncelle
  const totalUnread = useAppSelector(selectTotalUnread);
  useEffect(() => {
    updateFaviconBadge(totalUnread);
  }, [totalUnread, updateFaviconBadge]);

  // Bu kullanıcının oda mesajları (ChatBox'a)
  const messages = useAppSelector(
    useMemo(() => selectMessagesByRoom(localRoom || "__none__"), [localRoom])
  );

  // Modal açılınca: geçmiş + read
  useEffect(() => {
    if (!open || !localRoom) return;
    (async () => {
      await dispatch(fetchRoomMessages({ roomId: localRoom, page: 1, limit: 20, sort: "asc" }));
      await dispatch(markRoomMessagesRead({ roomId: localRoom }));
      setToast(null);
      // (Eski LS sayaçları kaldırıldı)
      window.dispatchEvent(new CustomEvent("metahub:chatRead"));
    })();
  }, [open, localRoom, dispatch]);

  // Modal kapalıyken soket dinle → slice messageReceived ile unread artır
  useEffect(() => {
    if (!isAuthenticated || !userId || open || !localRoom) return;
    const socket = getSocket();
    if (!socket) return;

    const join = () => {
      if (joinedRef.current !== localRoom) {
        socket.emit("join-room", { roomId: localRoom });
        joinedRef.current = localRoom;
      }
    };
    if (socket.connected) join(); else socket.once("connect", join);

    const onInbound = (msg: ChatMessage) => {
      if (msg.roomId !== localRoom) return;
      // store’a yaz (unread artırma kararı slice’ta)
      dispatch(messageReceived(msg));
      playDing();
      const toastMsg = t("support.new_message", "Yeni mesajınız var");
      setToast(toastMsg);
      setTimeout(() => setToast(null), 3000);
      // OS bildirimi
      showOSNotification(msg.message);
    };

    socket.on("chat-message", onInbound);
    socket.on("admin-message", onInbound);

    return () => {
      socket.off("chat-message", onInbound);
      socket.off("admin-message", onInbound);
    };
  }, [isAuthenticated, userId, open, localRoom, dispatch, playDing, showOSNotification, t]);

  // Buton: authLoading iken redirect yapma
  const handleOpenClick = () => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(pathname || "/")}`);
      return;
    }
    setOpen(true);
    requestPermission().catch(() => {});
  };

  const supportLabel = t("support.open", "Canlı Destek");
  const unreadLabel = t("support.unread_btn", "Yeni mesajınız var");
  const unread = totalUnread; // 🔸 global unread
  const btnText = unread > 0 ? unreadLabel : supportLabel;
  const btnAria =
    unread > 0
      ? t("support.unread_aria", "{{count}} yeni mesaj — Canlı Destek", { count: unread })
      : supportLabel;

  const brandTitle = t("support.brand_title", "{{brand}} Canlı Destek", { brand: tenantName });

  return (
    <>
      <Live aria-live="polite" aria-atomic="true">
        {unread > 0 ? t("support.unread_live", "{{count}} yeni mesaj", { count: unread }) : ""}
      </Live>

      <ChatButton
        aria-label={btnAria}
        onClick={handleOpenClick}
        title={authLoading ? t("support.loading", "Yükleniyor…") : btnText}
        $unread={unread > 0}
        disabled={authLoading}
      >
        <IconWrap $unread={unread > 0}>
          {unread > 0 ? <BsChatDotsFill size={20} /> : <BsChatDots size={20} />}
          {unread > 0 && (
            <>
              <Ping />
              <Badge role="status" aria-label={t("support.unread_badge", "{{count}} yeni mesaj", { count: unread })}>
                {unread > 9 ? "9+" : unread}
              </Badge>
            </>
          )}
        </IconWrap>
        <span>{authLoading ? t("support.loading", "Yükleniyor…") : btnText}</span>
        {toast && <Toast>{toast}</Toast>}
      </ChatButton>

      {open && isAuthenticated && userId && (
        <ChatModalOverlay onClick={() => setOpen(false)} role="dialog" aria-modal="true" aria-label={t("support.modal_aria", "Canlı Destek penceresi")}>
          <ChatModal onClick={(e) => e.stopPropagation()}>
            <CloseBtn onClick={() => setOpen(false)} aria-label={t("close", "Kapat")}>×</CloseBtn>
            <Inner>
              <ChatBox
                brandTitle={brandTitle}
                lang={lang}
                userId={userId}
                roomId={localRoom}
                loading={loading}
                error={typeof error === "string" ? error : undefined}
                messages={messages}
                onRoomResolved={async (rid) => {
                  setLocalRoom(rid);
                  dispatch(setCurrentRoom(rid));
                  await dispatch(fetchRoomMessages({ roomId: rid, page: 1, limit: 20, sort: "asc" }));
                  await dispatch(markRoomMessagesRead({ roomId: rid }));
                  window.dispatchEvent(new CustomEvent("metahub:chatRead"));
                }}
              />
            </Inner>
          </ChatModal>
        </ChatModalOverlay>
      )}
    </>
  );
}

/* === Styles (aynı) === */
const pulse = keyframes`0%{transform:scale(1)}50%{transform:scale(1.04)}100%{transform:scale(1)}`;
const glow = keyframes`0%{box-shadow:0 0 0 #0000}50%{box-shadow:0 0 22px rgba(255,86,86,.35)}100%{box-shadow:0 0 0 #0000}`;
const ping = keyframes`0%{transform:scale(1);opacity:.8}70%{transform:scale(1.8);opacity:0}100%{opacity:0}`;

const ChatButton = styled.button<{ $unread: boolean }>`
  position: fixed; bottom: 24px; right: 84px; z-index: ${({ theme }) => theme.zIndex.dropdown};
  background: ${({ theme, $unread }) => ($unread ? "#E53935" : theme.colors.primary)};
  color: ${({ theme }) => theme.colors.accentText};
  border: 0; border-radius: ${({ theme }) => theme.radii.pill};
  padding: .75em 1.1em; display: inline-flex; align-items: center; gap: .6em; cursor: pointer;
  transition: ${({ theme }) => theme.transition.fast};
  ${({ $unread }) => $unread ? css`animation:${pulse} 1.2s ease-in-out infinite;` : css`&:hover{background:${({theme})=>theme.colors.primaryHover};}`}
  @media (max-width: 600px){ bottom:16px; right:56px; padding:.65em .9em; }
`;
const IconWrap = styled.span<{ $unread: boolean }>`
  position: relative; display: inline-flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: 999px;
  ${({ $unread }) => $unread && css`animation:${glow} 1.6s ease-in-out infinite;`}
`;
const Badge = styled.span`
  position: absolute; top: -6px; right: -6px; min-width: 18px; height: 18px; padding: 0 5px;
  border-radius: 10px; background: #fff; color: #E53935; font-weight: 800; font-size: 11px; line-height: 18px;
  box-shadow: 0 0 0 2px #E53935 inset; pointer-events: none;
`;
const Ping = styled.span`
  position: absolute; top: -2px; right: -2px; width: 22px; height: 22px; border-radius: 999px;
  background: rgba(229,57,53,.35); animation: ${ping} 1.6s cubic-bezier(0,0,0.2,1) infinite; pointer-events: none;
`;
const ChatModalOverlay = styled.div`
  position: fixed; inset: 0; background: ${({ theme }) => theme.colors.overlayBackground};
  z-index: ${({ theme }) => theme.zIndex.modal}; display: flex; align-items: flex-end; justify-content: flex-end;
`;
const ChatModal = styled.div`
  width: min(480px, 96vw); height: min(640px, 78vh); margin: 0 24px 28px 0;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: 18px; border: ${({ theme }) => theme.borders.thin} ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.lg}; display: flex; flex-direction: column; position: relative;
  @media (max-width: 800px){ width:100vw; height:85vh; margin:0; border-radius:16px 16px 0 0; }
`;
const CloseBtn = styled.button`
  position: absolute; top: 8px; right: 14px; z-index: 2; background: none; border: none;
  color: ${({ theme }) => theme.colors.textSecondary}; font-size: 1.8rem; cursor: pointer; opacity:.75;
  &:hover{ opacity:1; color:${({ theme }) => theme.colors.danger}; }
`;
const Inner = styled.div` padding:${({ theme }) => theme.spacings.md}; height:100%; display:flex; flex-direction:column; `;
const Live = styled.div` position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(1px,1px,1px,1px); white-space:nowrap; `;
const Toast = styled.span`
  position: absolute; top: -36px; left: 50%; transform: translateX(-50%);
  background: #111; color: #fff; font-size: 12px; padding: 6px 10px; border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,.2); opacity:.95; pointer-events:none;
`;
