"use client";

import styled from "styled-components";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/store/user/authSlice";
import { AppDispatch } from "@/store";
import { sidebarModules } from "@/store/dashboard/sidebarConfig"; // burada tanımlı
import { FaHome, FaSignOutAlt } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export default function Sidebar() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { t } = useTranslation();

  const handleLogout = async () => {
    const result = await dispatch(logoutUser());
    if (logoutUser.fulfilled.match(result)) {
      router.push("/login");
    }
  };

  return (
    <SidebarWrapper>
      <MenuLink href="/admin">
        <FaHome />
        {t("sidebar.dashboard", "Dashboard")}
      </MenuLink>

      {sidebarModules.map(({ key, path, labelKey, icon: Icon }) => (
        <MenuLink key={key} href={path}>
          <Icon />
          {t(labelKey)}
        </MenuLink>
      ))}

      <LogoutButton onClick={handleLogout}>
        <FaSignOutAlt />
        {t("sidebar.logout", "Çıkış Yap")}
      </LogoutButton>
    </SidebarWrapper>
  );
}



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

const MenuLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.7rem;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  text-decoration: none;
  color: ${({ theme }) => theme.text};

  &:hover {
    background: ${({ theme }) => theme.backgroundAlt || "#f4f4f4"};
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
    background: rgba(255, 0, 0, 0.05);
  }
`;
