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
import adminModulesEN from "./locales/en/admin-modules.json";
import adminSettingsEN from "./locales/en/admin-settings.json";
import headerEN from "./locales/en/header.json";
import logoutEN from "./locales/en/logout.json";
import forgotPasswordEN from "./locales/en/forgot-password.json";
import changePasswordEN from "./locales/en/change-password.json";
import resetPasswordEN from "./locales/en/reset-password.json";
import accountEN from "./locales/en/account.json";
import accountPageEN from "./locales/en/accountPage.json";
import changePasswordFormEN from "./locales/en/change-password-form.json";



import navbarTR from "./locales/tr/navbar.json";
import productsTR from "./locales/tr/products.json";
import authTR from "./locales/tr/auth.json";
import footerTR from "./locales/tr/footer.json";
import contactTR from "./locales/tr/contact.json";
import registerTR from "./locales/tr/register.json";
import loginTR from "./locales/tr/login.json";
import sidebarTR from "./locales/tr/sidebar.json";
import dashboardTR from "./locales/tr/dashboard.json";
import adminModulesTR from "./locales/tr/admin-modules.json";
import adminSettingsTR from "./locales/tr/admin-settings.json";
import headerTR from "./locales/tr/header.json";
import logoutTR from "./locales/tr/logout.json";
import forgotPasswordTR from "./locales/tr/forgot-password.json";
import resetPasswordTR from "./locales/tr/reset-password.json";
import changePasswordTR from "./locales/tr/change-password.json";
import accountTR from "./locales/tr/account.json";
import accountPageTR from "./locales/tr/accountPage.json";
import changePasswordFormTR from "./locales/tr/change-password-form.json";


import navbarDE from "./locales/de/navbar.json";
import productsDE from "./locales/de/products.json";
import authDE from "./locales/de/auth.json";
import footerDE from "./locales/de/footer.json";
import contactDE from "./locales/de/contact.json";
import registerDE from "./locales/de/register.json";
import loginDE from "./locales/de/login.json";
import sidebarDE from "./locales/de/sidebar.json";
import dashboardDE from "./locales/de/dashboard.json";
import adminModulesDE from "./locales/de/admin-modules.json";
import adminSettingsDE from "./locales/de/admin-settings.json";
import headerDE from "./locales/de/header.json";
import logoutDE from "./locales/de/logout.json";
import forgotPasswordDE from "./locales/de/forgot-password.json";
import changePasswordDE from "./locales/de/change-password.json";
import resetPasswordDE from "./locales/de/reset-password.json";
import accountDE from "./locales/de/account.json";
import accountPageDE from "./locales/de/accountPage.json";
import changePasswordFormDE from "./locales/de/change-password-form.json";

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
    adminModules:adminModulesEN,
    adminSettings:adminSettingsEN,
    header: headerEN,
    logout: logoutEN,
    forgotPassword: forgotPasswordEN,
    changePassword: changePasswordEN,
    resetPassword: resetPasswordEN,
    account: accountEN,
    accountPage: accountPageEN,
    changePasswordForm: changePasswordFormEN,

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
    adminModules:adminModulesTR,
    adminSettings:adminSettingsTR,
    header: headerTR,
    logout: logoutTR,
    forgotPassword: forgotPasswordTR,
    changePassword: changePasswordTR,
    resetPassword: resetPasswordTR,
    account: accountTR,
    accountPage: accountPageTR,
    changePasswordForm: changePasswordFormTR,
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
    adminModules:adminModulesDE,
    adminSettings:adminSettingsDE,
    header:headerDE,
    logout: logoutDE,
    forgotPassword: forgotPasswordDE,
    changePassword: changePasswordDE,
    resetPassword: resetPasswordDE,
    account: accountDE,
    accountPage: accountPageDE,
    changePasswordForm: changePasswordFormDE,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: "en", 
    ns: [
      "navbar",
      "products",
      "auth",
      "footer",
      "contact",
      "register",
      "login",
      "sidebar",
      "dashboard",
      "adminModules",
      "adminSettings",
      "header",
      "logout",
      "forgotPassword",
      "changePassword",
      "resetPassword",
      "account",
      "accountPage",
      "changePasswordForm",
    ],
    defaultNS: "navbar",
    interpolation: {
      escapeValue: false,
    },
  });




export default i18n;
