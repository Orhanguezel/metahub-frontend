"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// 🔹 Translation imports
import navbarEN from "./locales/en/navbar.json";
import productsEN from "./locales/en/products.json";
import authEN from "./locales/en/auth.json";
import footerEN from "./locales/en/footer.json";
import contactEN from "./locales/en/contact.json"; 
import registerEN from "./locales/en/register.json";
import loginEN from "./locales/en/login.json";
import sidebarEN from "./locales/en/sidebar.json";
import dashboardEN from "./locales/en/dashboard.json";


import navbarTR from "./locales/tr/navbar.json";
import productsTR from "./locales/tr/products.json";
import authTR from "./locales/tr/auth.json";
import footerTR from "./locales/tr/footer.json";
import contactTR from "./locales/tr/contact.json";
import registerTR from "./locales/tr/register.json";
import loginTR from "./locales/tr/login.json";
import sidebarTR from "./locales/tr/sidebar.json";
import dashboardTR from "./locales/tr/dashboard.json";

import navbarDE from "./locales/de/navbar.json";
import productsDE from "./locales/de/products.json";
import authDE from "./locales/de/auth.json";
import footerDE from "./locales/de/footer.json";
import contactDE from "./locales/de/contact.json";
import registerDE from "./locales/de/register.json";
import loginDE from "./locales/de/login.json";
import sidebarDE from "./locales/de/sidebar.json";
import dashboardDE from "./locales/de/dashboard.json";

const resources = {
  en: {
    navbar: navbarEN,
    products: productsEN,
    auth: authEN,
    footer: footerEN,
    contact: contactEN,
    register: registerEN,
    login: loginEN,
    sidebar: sidebarEN,
    dashboard: dashboardEN,
  },
  tr: {
    navbar: navbarTR,
    products: productsTR,
    auth: authTR,
    footer: footerTR,
    contact: contactTR,
    register: registerTR,
    login: loginTR,
    sidebar: sidebarTR,
    dashboard: dashboardTR,
  },
  de: {
    navbar: navbarDE,
    products: productsDE,
    auth: authDE,
    footer: footerDE,
    contact: contactDE,
    register: registerDE,
    login: loginDE,
    sidebar: sidebarDE,
    dashboard: dashboardDE,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "de",
    ns: ["navbar", "products", "auth", "footer", "contact", "register", "login", "sidebar", "dashboard"],
    lng: "de",
    defaultNS: "navbar",
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
