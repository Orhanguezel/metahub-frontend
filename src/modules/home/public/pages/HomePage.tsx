"use client";

import React, { useEffect, useMemo } from "react";
import { useAppDispatch } from "@/store/hooks";
import { getCurrentLocale } from "@/utils/getCurrentLocale";
import { SupportedLocale } from "@/types/common";

// --- SECTION COMPONENTS ---
import { AboutSection } from "@/modules/about";
import { ServicesSection } from "@/modules/services";
import { NewsSection } from "@/modules/news";
import { BlogSection } from "@/modules/blog";
import { ArticlesSection } from "@/modules/articles";
import { ActivitySection } from "@/modules/activity";
import { ReferenceSection } from "@/modules/references";
import { BikeSection } from "@/modules/bikes";
import SliderSection from "../components/HeroProductSliderSection";
import CouponBanner from "@/shared/CouponBanner";

// --- SLICE FETCH/CLEAR MAP (TAMAMEN TIP GÜVENLİ!) ---
import { fetchAbout, clearAboutMessages } from "@/modules/about/slice/aboutSlice";
import { fetchServices, clearServicesMessages } from "@/modules/services/slice/servicesSlice";
import { fetchNews, clearNewsMessages } from "@/modules/news/slice/newsSlice";
import { fetchBlogs, clearBlogMessages } from "@/modules/blog/slice/blogSlice";
import { fetchArticles, clearArticlesMessages } from "@/modules/articles/slice/articlesSlice";
import { fetchActivity, clearActivityMessages } from "@/modules/activity/slice/activitySlice";
import { fetchReferences, clearReferenceMessages } from "@/modules/references/slice/referencesSlice";
import { fetchBikes, clearBikeMessages } from "@/modules/bikes/slice/bikeSlice";

// --- SECTION AYARLARI ---
const sectionSettings = [
  { id: "heroSlider", enabled: true, order: 1 },
  { id: "couponBanner", enabled: true, order: 2 },
  { id: "services", enabled: true, order: 3 },
  { id: "about", enabled: true, order: 4 },
  { id: "news", enabled: true, order: 5 },
   { id: "bikes", enabled: true, order: 6 },
  { id: "blog", enabled: true, order: 7 },
  { id: "contact", enabled: false, order: 8 },
  { id: "activity", enabled: true, order: 9 },
  { id: "articles", enabled: true, order: 10 },
  { id: "references", enabled: true, order: 11 },
 
];

// --- DYNAMIC COMPONENT MAP ---
const sectionComponents: Record<string, React.ComponentType<any>> = {
  heroSlider: SliderSection,
  couponBanner: CouponBanner,
  about: AboutSection,
  services: ServicesSection,
  news: NewsSection,
  blog: BlogSection,
  articles: ArticlesSection,
  activity: ActivitySection,
  references: ReferenceSection,
  bikes: BikeSection,
};

// --- DYNAMIC FETCH/CLEAR MAP (TIP GÜVENLİ!) ---
type FetcherConfig = {
  fetch: (lang: SupportedLocale) => any; // RTK slice thunk!
  clear: () => any;
};
const sectionFetchers: Record<string, FetcherConfig> = {
  about: { fetch: fetchAbout, clear: clearAboutMessages },
  services: { fetch: fetchServices, clear: clearServicesMessages },
  news: { fetch: fetchNews, clear: clearNewsMessages },
  blog: { fetch: fetchBlogs, clear: clearBlogMessages },
  articles: { fetch: fetchArticles, clear: clearArticlesMessages },
  activity: { fetch: fetchActivity, clear: clearActivityMessages },
  references: { fetch: fetchReferences, clear: clearReferenceMessages },
  bikes: { fetch: fetchBikes, clear: clearBikeMessages },
  // Yeni section ekle, otomatik çalışır
};

const isDev = process.env.NODE_ENV === "development";

export default function HomePage() {
  const dispatch = useAppDispatch();
  const lang = getCurrentLocale();

  // Aktif section'ları stable sırala
  const activeSections = useMemo(
    () =>
      sectionSettings
        .filter((section) => section.enabled)
        .sort((a, b) => a.order - b.order),
    []
  );

  // --- Tüm sectionlar için dinamik fetch/clear, sadece çok dilli ve type-safe! ---
  useEffect(() => {
    const cleanupFns: Array<() => void> = [];

    activeSections.forEach(({ id }) => {
      const fetcher = sectionFetchers[id];
      if (fetcher) {
        dispatch(fetcher.fetch(lang));
        // Temizlik için cleanup fonksiyonunu diziye ekle
        cleanupFns.push(() => dispatch(fetcher.clear()));
      }
    });

    // Temizlik fonksiyonları (component unmount)
    return () => {
      cleanupFns.forEach((fn) => fn());
    };
  }, [dispatch, lang, activeSections]);

  // --- Render ---
  return (
    <>
      {activeSections.map(({ id }) => {
        const SectionComponent = sectionComponents[id];
        if (!SectionComponent) {
          if (isDev) {
            console.warn(`⚠️ Section '${id}' bulunamadı veya henüz eklenmedi.`);
          }
          return null;
        }
        return <SectionComponent key={id} />;
      })}
    </>
  );
}
