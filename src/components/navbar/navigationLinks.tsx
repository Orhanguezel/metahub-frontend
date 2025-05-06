"use client";

import { FaSearch } from "react-icons/fa";
import type { ReactNode } from "react";

const searchIcon: ReactNode = <FaSearch />;

export const SPECIAL_NAV_LINK = {
  href: "/search",
  icon: searchIcon,
};

export const AUTH_LINKS = {
  login: { href: "/login", labelKey: "login" },
  register: { href: "/register", labelKey: "register" },
  account: { href: "/account", labelKey: "account" },
  logout: { href: "/logout", labelKey: "logout" },
};
