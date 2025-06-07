"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector/cjs";

// 🔹 Translation imports

import productEN from "@/modules/product/i18n/en.json";
import settingsEN from "@/modules/settings/i18n/en.json";
import servicesEN from "@/modules/services/i18n/en.json";
import articlesEN from "@/modules/articles/i18n/en.json";
import activityEN from "@/modules/activity/i18n/en.json";
import aboutEN from "@/modules/about/i18n/en.json";
import bookingEN from "@/modules/booking/i18n/en.json";
import adminModulesEN from "@/modules/adminmodules/i18n/en.json";
import commentsEN from "@/modules/comment/i18n/en.json";
import faqEN from "@/modules/faq/i18n/en.json";
import companyEN from "@/modules/company/i18n/en.json";
import galleryEN from "@/modules/gallery/i18n/en.json";
import homeEN from "@/modules/home/i18n/en.json";
import registerEN from "@/modules/users/i18n/en/register.json";
import loginEN from "@/modules/users/i18n/en/login.json";
import logoutEN from "@/modules/users/i18n/en/logout.json";
import forgotPasswordEN from "@/modules/users/i18n/en/forgot.json";
import changePasswordEN from "@/modules/users/i18n/en/change.json";
import resetPasswordEN from "@/modules/users/i18n/en/reset.json";
import accountEN from "@/modules/users/i18n/en/account.json";
import navbarEN from "@/modules/shared/i18n/en/navbar.json";


import footerEN from "./locales/en/footer.json";
import sidebarEN from "./locales/en/sidebar.json";
import dashboardEN from "./locales/en/dashboard.json";
import headerEN from "./locales/en/header.json";
import commonEN from "./locales/en/common.json";

import adminModulesTR from "@/modules/adminmodules/i18n/tr.json";
import settingsTR from "@/modules/settings/i18n/tr.json";
import servicesTR from "@/modules/services/i18n/tr.json";
import productTR from "@/modules/product/i18n/tr.json";
import articlesTR from "@/modules/articles/i18n/tr.json";
import activityTR from "@/modules/activity/i18n/tr.json";
import aboutTR from "@/modules/about/i18n/tr.json";
import headerTR from "./locales/tr/header.json";
import logoutTR from "@/modules/users/i18n/tr/logout.json";
import forgotPasswordTR from "@/modules/users/i18n/tr/forgot.json";
import resetPasswordTR from "@/modules/users/i18n/tr/reset.json";
import changePasswordTR from "@/modules/users/i18n/tr/change.json";
import accountTR from "@/modules/users/i18n/tr/account.json";
import changePasswordFormTR from "@/modules/users/i18n/tr/change.json";
import companyTR from "@/modules/company/i18n/tr.json";
import commonTR from "./locales/tr/common.json";
import galleryTR from "@/modules/gallery/i18n/tr.json";
import homeTR from "@/modules/home/i18n/tr.json";
import commentsTR from "@/modules/comment/i18n/tr.json";
import faqTR from "@/modules/faq/i18n/tr.json";
import bookingTR from "@/modules/booking/i18n/tr.json";
import navbarTR from "@/modules/shared/i18n/tr/navbar.json";
import footerTR from "./locales/tr/footer.json";
import registerTR from "@/modules/users/i18n/tr/register.json";
import loginTR from "@/modules/users/i18n/tr/login.json";
import sidebarTR from "./locales/tr/sidebar.json";
import dashboardTR from "./locales/tr/dashboard.json";

import navbarDE from "@/modules/shared/i18n/de/navbar.json";
import productDE from "@/modules/product/i18n/de.json";
import footerDE from "./locales/de/footer.json";
import registerDE from "@/modules/users/i18n/de/register.json";
import loginDE from "@/modules/users/i18n/de/login.json";
import sidebarDE from "./locales/de/sidebar.json";
import dashboardDE from "./locales/de/dashboard.json";
import adminModulesDE from "@/modules/adminmodules/i18n/de.json";
import settingsDE from "@/modules/settings/i18n/de.json";
import servicesDE from "@/modules/services/i18n/de.json";
import articlesDE from "@/modules/articles/i18n/de.json";
import activityDE from "@/modules/activity/i18n/de.json";
import aboutDE from "@/modules/about/i18n/de.json";
import headerDE from "./locales/de/header.json";
import logoutDE from "@/modules/users/i18n/de/logout.json";
import forgotPasswordDE from "@/modules/users/i18n/de/forgot.json";
import changePasswordDE from "@/modules/users/i18n/de/change.json";
import resetPasswordDE from "@/modules/users/i18n/de/reset.json";
import accountDE from "@/modules/users/i18n/de/account.json";
import changePasswordFormDE from "@/modules/users/i18n/de/change.json";
import companyDE from "@/modules/company/i18n/de.json";
import commonDE from "./locales/de/common.json";
import galleryDE from "@/modules/gallery/i18n/de.json";
import homeDE from "@/modules/home/i18n/de.json";
import commentsDE from "@/modules/comment/i18n/de.json";
import faqDE from "@/modules/faq/i18n/de.json";
import bookingDE from "@/modules/booking/i18n/de.json";

const resources = {
  en: {
    navbar: navbarEN,
    product: productEN,
    footer: footerEN,
    register: registerEN,
    login: loginEN,
    sidebar: sidebarEN,
    dashboard: dashboardEN,
    adminModules: adminModulesEN,
    activity: activityEN,
    about: aboutEN,
    header: headerEN,
    logout: logoutEN,
    forgotPassword: forgotPasswordEN,
    changePassword: changePasswordEN,
    resetPassword: resetPasswordEN,
    account: accountEN,
    company: companyEN,
    common: commonEN,
    gallery: galleryEN,
    home: homeEN,
    services: servicesEN,
    comments: commentsEN,
    faq: faqEN,
    booking: bookingEN,
    settings: settingsEN,
    articles: articlesEN,
  },
  tr: {
    navbar: navbarTR,
    product: productTR,
    footer: footerTR,
    register: registerTR,
    login: loginTR,
    sidebar: sidebarTR,
    dashboard: dashboardTR,
    adminModules: adminModulesTR,
    activity: activityTR,
    about: aboutTR,
    header: headerTR,
    logout: logoutTR,
    forgotPassword: forgotPasswordTR,
    changePassword: changePasswordTR,
    resetPassword: resetPasswordTR,
    account: accountTR,
    changePasswordForm: changePasswordFormTR,
    company: companyTR,
    common: commonTR,
    gallery: galleryTR,
    home: homeTR,
    services: servicesTR,
    comments: commentsTR,
    faq: faqTR,
    booking: bookingTR,
    settings: settingsTR,
    articles: articlesTR,
  },
  de: {
    navbar: navbarDE,
    product: productDE,
    footer: footerDE,
    register: registerDE,
    login: loginDE,
    sidebar: sidebarDE,
    dashboard: dashboardDE,
    adminModules: adminModulesDE,
    activity: activityDE,
    about: aboutDE,
    header: headerDE,
    logout: logoutDE,
    forgotPassword: forgotPasswordDE,
    changePassword: changePasswordDE,
    resetPassword: resetPasswordDE,
    account: accountDE,
    changePasswordForm: changePasswordFormDE,
    company: companyDE,
    common: commonDE,
    gallery: galleryDE,
    home: homeDE,
    services: servicesDE,
    comments: commentsDE,
    faq: faqDE,
    booking: bookingDE,
    settings: settingsDE,
    articles: articlesDE,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: "de", // Default language
    fallbackLng: "de",
    ns: [
      "navbar",
      "product",
      "auth",
      "footer",
      "contact",
      "register",
      "login",
      "sidebar",
      "dashboard",
      "adminModules",
      "activity",
      "about",
      "header",
      "logout",
      "forgotPassword",
      "changePassword",
      "resetPassword",
      "account",
      "changePassword",
      "company",
      "common",
      "gallery",
      "home",
      "services",
      "news",
      "comments",
      "faq",
      "booking",
      "settings",
      "articles",
    ],
    defaultNS: "navbar",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
