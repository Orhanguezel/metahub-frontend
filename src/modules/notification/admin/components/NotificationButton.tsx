"use client";

import Link from "next/link";
import styled from "styled-components";
import { Bell } from "lucide-react";
import { useAppSelector } from "@/store/hooks";

interface Props {
  ariaLabel?: string;
}

export default function NotificationButton({ ariaLabel }: Props) {
  // Kullanıcı profilini ve rolünü al
  const profile = useAppSelector((state) => state.account.profile);
  const { notifications = [] } = useAppSelector((state) => state.notification);

  // Sadece admin veya süperadmin ise göster!
  if (!profile || (profile.role !== "admin" && profile.role !== "superadmin")) return null;

  // Okunmamış bildirim adedi
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <IconWrapper
      href="/admin/notification"
      aria-label={ariaLabel || "Notifications"}
      title="Bildirimler"
    >
      <Bell size={24} />
      {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
    </IconWrapper>
  );
}

// --- Styled Components ---
const IconWrapper = styled(Link)`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  color: ${({ theme }) => theme.colors.primary};
  background: transparent;
  border: none;
  cursor: pointer;
  padding: ${({ theme }) => theme.spacings.xs};
  border-radius: 50%;
  transition: background 0.2s;
  &:hover {
    background: ${({ theme }) => theme.colors.backgroundAlt};
  }
`;

const Badge = styled.span`
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.danger || "#ff3232"};
  color: #fff;
  font-size: 0.82rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid ${({ theme }) => theme.colors.backgroundSecondary};
  box-shadow: 0 0 4px rgba(0,0,0,0.08);
  pointer-events: none;
`;
