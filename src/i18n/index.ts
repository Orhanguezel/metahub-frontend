"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector/cjs";

// 🔹 Translation imports

import productEN from "@/modules/product/i18n/en.json";
import settingsEN from "@/modules/settings/i18n/en.json";
import newsEN from "@/modules/news/i18n/en.json";
import servicesEN from "@/modules/services/i18n/en.json";
import articlesEN from "@/modules/articles/i18n/en.json";
import activityEN from "@/modules/activity/i18n/en.json";
import aboutEN from "@/modules/about/i18n/en.json";
import accountEN from "@/modules/account/i18n/en.json";
import bookingEN from "@/modules/booking/i18n/en.json";
import adminModulesEN from "@/modules/adminmodules/i18n/en.json";
import commentsEN from "@/modules/comment/i18n/en.json";
import faqEN from "@/modules/faq/i18n/en.json";
import companyEN from "@/modules/company/i18n/en.json";
import galleryEN from "@/modules/gallery/i18n/en.json";
import homeEN from "@/modules/home/i18n/en.json";



import navbarEN from "./locales/en/navbar.json";
import authEN from "./locales/en/auth.json";
import footerEN from "./locales/en/footer.json";
import registerEN from "./locales/en/register.json";
import loginEN from "./locales/en/login.json";
import sidebarEN from "./locales/en/sidebar.json";
import dashboardEN from "./locales/en/dashboard.json";
import headerEN from "./locales/en/header.json";
import logoutEN from "./locales/en/logout.json";
import forgotPasswordEN from "./locales/en/forgot-password.json";
import changePasswordEN from "./locales/en/change-password.json";
import resetPasswordEN from "./locales/en/reset-password.json";
import changePasswordFormEN from "./locales/en/change-password-form.json";
import commonEN from "./locales/en/common.json";



import adminModulesTR from "@/modules/adminmodules/i18n/tr.json";
import settingsTR from "@/modules/settings/i18n/tr.json";
import newsTR from "@/modules/news/i18n/tr.json";
import servicesTR from "@/modules/services/i18n/tr.json";
import productTR from "@/modules/product/i18n/tr.json";
import articlesTR from "@/modules/articles/i18n/tr.json";
import activityTR from "@/modules/activity/i18n/tr.json";
import aboutTR from "@/modules/about/i18n/tr.json";
import headerTR from "./locales/tr/header.json";
import logoutTR from "./locales/tr/logout.json";
import forgotPasswordTR from "./locales/tr/forgot-password.json";
import resetPasswordTR from "./locales/tr/reset-password.json";
import changePasswordTR from "./locales/tr/change-password.json";
import accountTR from "@/modules/account/i18n/tr.json";
import changePasswordFormTR from "./locales/tr/change-password-form.json";
import companyTR from "@/modules/company/i18n/tr.json";
import commonTR from "./locales/tr/common.json";
import galleryTR from "@/modules/gallery/i18n/tr.json";
import homeTR from "@/modules/home/i18n/tr.json";
import commentsTR from "@/modules/comment/i18n/tr.json";
import faqTR from "@/modules/faq/i18n/tr.json";
import bookingTR from "@/modules/booking/i18n/tr.json";
import navbarTR from "./locales/tr/navbar.json";
import authTR from "./locales/tr/auth.json";
import footerTR from "./locales/tr/footer.json";
import registerTR from "./locales/tr/register.json";
import loginTR from "./locales/tr/login.json";
import sidebarTR from "./locales/tr/sidebar.json";
import dashboardTR from "./locales/tr/dashboard.json";


import navbarDE from "./locales/de/navbar.json";
import productDE from "@/modules/product/i18n/de.json";
import authDE from "./locales/de/auth.json";
import footerDE from "./locales/de/footer.json";
import registerDE from "./locales/de/register.json";
import loginDE from "./locales/de/login.json";
import sidebarDE from "./locales/de/sidebar.json";
import dashboardDE from "./locales/de/dashboard.json";
import adminModulesDE from "@/modules/adminmodules/i18n/de.json";
import settingsDE from "@/modules/settings/i18n/de.json";
import newsDE from "@/modules/news/i18n/de.json";
import servicesDE from "@/modules/services/i18n/de.json";
import articlesDE from "@/modules/articles/i18n/de.json";
import activityDE from "@/modules/activity/i18n/de.json";
import aboutDE from "@/modules/about/i18n/de.json";
import headerDE from "./locales/de/header.json";
import logoutDE from "./locales/de/logout.json";
import forgotPasswordDE from "./locales/de/forgot-password.json";
import changePasswordDE from "./locales/de/change-password.json";
import resetPasswordDE from "./locales/de/reset-password.json";
import accountDE from "@/modules/account/i18n/de.json";
import changePasswordFormDE from "./locales/de/change-password-form.json";
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
    auth: authEN,
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
    changePasswordForm: changePasswordFormEN,
    company: companyEN,
    common: commonEN,
    gallery: galleryEN,
    home: homeEN,
    services: servicesEN,
    news: newsEN,
    comments: commentsEN,
    faq: faqEN,
    booking: bookingEN,
    settings: settingsEN,
    articles: articlesEN,



  },
  tr: {
    navbar: navbarTR,
    product: productTR,
    auth: authTR,
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
    news: newsTR,
    comments: commentsTR,
    faq: faqTR,
    booking: bookingTR,
    settings: settingsTR,
    articles: articlesTR,
    
  },
  de: {
    navbar: navbarDE,
    product: productDE,
    auth: authDE,
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
    news: newsDE,
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
    lng: "en",
    fallbackLng: "en",
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
      "changePasswordForm",
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
