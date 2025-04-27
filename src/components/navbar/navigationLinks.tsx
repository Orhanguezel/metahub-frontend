"use client";

import { FaSearch } from "react-icons/fa";
import type { ReactNode } from "react";

export type MainNavLink =
  | { type: "link"; href: string; labelKey: string }
  | { type: "dropdown"; key: string; labelKey: string; children: { href: string; labelKey: string }[] };

export const MAIN_NAV_LINKS: MainNavLink[] = [
  { type: "link", href: "/", labelKey: "home" },
  { type: "link", href: "/visitor/solutions", labelKey: "solutions" },
  { type: "link", href: "/visitor/products", labelKey: "products" },
  { type: "link", href: "/visitor/projects", labelKey: "projects" },
  { type: "link", href: "/visitor/contact", labelKey: "contact" },
];

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
