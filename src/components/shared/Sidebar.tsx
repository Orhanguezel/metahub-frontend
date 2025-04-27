"use client";

import styled from "styled-components";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch } from "react-redux";
import { useSidebarModules } from "@/hooks/useSidebarModules";
import { logoutUser } from "@/store/user/authSlice";
import { AppDispatch } from "@/store";
import { FaHome, FaSignOutAlt } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export default function Sidebar() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const { sidebarModules, isLoading } = useSidebarModules();

  const handleLogout = async () => {
    const result = await dispatch(logoutUser());
    if (logoutUser.fulfilled.match(result)) {
      router.push("/login");
    }
  };

  return (
    <SidebarWrapper>
      {/* Dashboard Ana Link */}
      <MenuLink href="/admin" $active={pathname === "/admin"}>
        <FaHome />
        {t("sidebar.dashboard", "Dashboard")}
      </MenuLink>

      {/* Modüller */}
      {isLoading ? (
        <LoadingText>{t("sidebar.loading", "Menü yükleniyor...")}</LoadingText>
      ) : (
        sidebarModules.map(({ key, path, label, Icon }) => (
          <MenuLink key={key} href={path} $active={pathname.startsWith(path)}>
            <Icon />
            {label}
          </MenuLink>
        ))
      )}

      {/* Logout */}
      <LogoutButton onClick={handleLogout}>
        <FaSignOutAlt />
        {t("sidebar.logout", "Çıkış Yap")}
      </LogoutButton>
    </SidebarWrapper>
  );
}

// Styled Components

const SidebarWrapper = styled.aside`
  width: 240px;
  background: ${({ theme }) => theme.backgroundSecondary};
  padding: 2rem 1rem;
  color: ${({ theme }) => theme.text};
  display: flex;
  flex-direction: column;
  gap: 2rem;
  border-right: 1px solid ${({ theme }) => theme.border || "#eee"};
`;

const MenuLink = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.7rem;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  text-decoration: none;
  color: ${({ theme }) => theme.text};
  background: ${({ $active, theme }) => ($active ? theme.backgroundAlt : "transparent")};
  font-weight: ${({ $active }) => ($active ? "600" : "400")};
  transition: all 0.3s ease;

  &:hover {
    background: ${({ theme }) => theme.hoverBackground || "#f5f5f5"};
    font-weight: 500;
    color: ${({ theme }) => theme.primary || "#0070f3"};
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.7rem;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  color: ${({ theme }) => theme.danger || "crimson"};
  cursor: pointer;
  margin-top: auto;

  &:hover {
    background: ${({ theme }) => theme.backgroundAlt || "#f4f4f4"};
    color: ${({ theme }) => theme.dangerHover || "darkred"};
  }
`;

const LoadingText = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.textLight || "#999"};
  padding-left: 1rem;
`;
