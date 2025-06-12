"use client";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector/cjs";
import { SUPPORTED_LOCALES } from "@/types/common";

// 🔹 Otomatik modül i18n index importları
import aboutTranslations from "@/modules/about/locales";
import activityTranslations from "@/modules/activity/locales";
import adminModulesTranslations from "@/modules/adminmodules/locales";
import articlesTranslations from "@/modules/articles/locales";
import bikeTranslations from "@/modules/bikes/locales";
import blogTranslations from "@/modules/blog/locales";
import bookingTranslations from "@/modules/booking/locales";
import cartTranslations from "@/modules/cart/locales";
import chatTranslations from "@/modules/chat/locales";
import checkoutTranslations from "@/modules/checkout/locales";
import couponTranslations from "@/modules/coupon/locales";
import emailTranslations from "@/modules/email/locales";
import newsTranslations from "@/modules/news/locales";
import orderTranslations from "@/modules/order/locales";
import referencesTranslations from "@/modules/references/locales";
import companyTranslations from "@/modules/company/locales";
import commentsTranslations from "@/modules/comment/locales";
import faqTranslations from "@/modules/faq/locales";
import galleryTranslations from "@/modules/gallery/locales";
import homeTranslations from "@/modules/home/locales";
import settingsTranslations from "@/modules/settings/locales";
import servicesTranslations from "@/modules/services/locales";


// Kullanıcı modülü özel: örnek path, kendi locales dizininizi organize edin!
import registerTranslations from "@/modules/users/locales/register";
import loginTranslations from "@/modules/users/locales/login";
import logoutTranslations from "@/modules/users/locales/logout";
import forgotPasswordTranslations from "@/modules/users/locales/forgot";
import changePasswordTranslations from "@/modules/users/locales/change";
import resetPasswordTranslations from "@/modules/users/locales/reset";
import accountTranslations from "@/modules/users/locales/account";

// Global/local ortak çeviri dizinleri
import footerTranslations from "@/modules/shared/locales/footer";
import navbarTranslations from "@/modules/shared/locales/navbar";
import sidebarTranslations from "@/modules/shared/locales/sidebar";
import dashboardTranslations from "@/modules/dashboard/locales";
import headerTranslations from "@/modules/shared/locales/header";

// 🔹 Tüm modül ve namespace’leri burada tek bir diziye yaz
const modules = [

  { ns: "bike", translations: bikeTranslations },
  { ns: "settings", translations: settingsTranslations },
  { ns: "services", translations: servicesTranslations },
  { ns: "articles", translations: articlesTranslations },
  { ns: "activity", translations: activityTranslations },
  { ns: "about", translations: aboutTranslations },
  { ns: "booking", translations: bookingTranslations },
  { ns: "adminModules", translations: adminModulesTranslations },
  { ns: "comments", translations: commentsTranslations },
  { ns: "faq", translations: faqTranslations },
  { ns: "company", translations: companyTranslations },
  { ns: "gallery", translations: galleryTranslations },
  { ns: "home", translations: homeTranslations },
  { ns: "news", translations: newsTranslations },
  { ns: "order", translations: orderTranslations },
  { ns: "references", translations: referencesTranslations },
  { ns: "cart", translations: cartTranslations },
  { ns: "blog", translations: blogTranslations },
  { ns: "chat", translations: chatTranslations },
  { ns: "checkout", translations: checkoutTranslations },
  { ns: "coupon", translations: couponTranslations },
  { ns: "email", translations: emailTranslations },

  // User modül için
  { ns: "register", translations: registerTranslations },
  { ns: "login", translations: loginTranslations },
  { ns: "logout", translations: logoutTranslations },
  { ns: "forgotPassword", translations: forgotPasswordTranslations },
  { ns: "changePassword", translations: changePasswordTranslations },
  { ns: "resetPassword", translations: resetPasswordTranslations },
  { ns: "account", translations: accountTranslations },
  // Ortak/global ns
  { ns: "navbar", translations: navbarTranslations },
  { ns: "footer", translations: footerTranslations },
  { ns: "sidebar", translations: sidebarTranslations },
  { ns: "admin-dashboard", translations: dashboardTranslations },
  { ns: "header", translations: headerTranslations },
];

// 🔹 Tüm diller ve modülleri içeren resources objesini otomatik oluştur
const resources = SUPPORTED_LOCALES.reduce((acc, locale) => {
  acc[locale] = {};
  for (const mod of modules) {
    // Her modülün ilgili dil dosyası varsa ekle
    acc[locale][mod.ns] = mod.translations[locale] || {};
  }
  return acc;
}, {} as Record<string, any>);

// 🔹 i18n başlatma
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // varsayılan
    fallbackLng: "en",
    ns: modules.map((m) => m.ns),
    defaultNS: "navbar",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
