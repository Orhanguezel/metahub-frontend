"use client";

import React, { useEffect, useMemo } from "react";
import { useAppDispatch } from "@/store/hooks";

// SECTION COMPONENTS
import { AboutSection } from "@/modules/about";
import { ServicesSection } from "@/modules/services";
import { NewsSection } from "@/modules/news";
import { BlogSection } from "@/modules/blog";
import { ArticlesSection } from "@/modules/articles";
import { ActivitySection } from "@/modules/activity";
import { ReferencesSection } from "@/modules/references";
import { BikesSection } from "@/modules/bikes";
import SliderProductSection from "../components/HeroProductSliderSection";
import HeroSection from "../components/HeroSection";
import HeroSectionSlayt from "../components/HeroSectionSlayt";
import CouponBanner from "@/modules/coupon/public/components/CouponBanner";

// SLICE FETCH/CLEAR
import { fetchAbout, clearAboutMessages } from "@/modules/about/slice/aboutSlice";
import { fetchServices, clearServicesMessages } from "@/modules/services/slice/servicesSlice";
import { fetchNews, clearNewsMessages } from "@/modules/news/slice/newsSlice";
import { fetchBlog, clearBlogMessages } from "@/modules/blog/slice/blogSlice";
import { fetchArticles, clearArticlesMessages } from "@/modules/articles/slice/articlesSlice";
import { fetchActivity, clearActivityMessages } from "@/modules/activity/slice/activitySlice";
import { fetchReferences, clearReferencesMessages } from "@/modules/references/slice/referencesSlice";
import { fetchBikes, clearBikeMessages } from "@/modules/bikes/slice/bikeSlice";
import {fetchPublishedGalleryItems,fetchPublishedGalleryCategories,} from "@/modules/gallery/slice/gallerySlice";
import { fetchGalleryCategories,clearGalleryCategoryMessages } from "@/modules/gallery/slice/galleryCategorySlice";

const isDev = process.env.NODE_ENV === "development";

// SECTION SETTINGS
const sectionSettings = [
  { id: "heroSlider", enabled: false, order: 1 }, // Hero slider section
  { id: "heroSection", enabled: true, order: 1 }, // Hero section (deprecated)
  { id: "heroSectionSlayt", enabled: false, order: 1 }, // Hero section with slides (deprecated)
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

// COMPONENT MAP
const sectionComponents: Record<string, React.ComponentType<any> | undefined> = {
  heroSlider: SliderProductSection,
  heroSection: HeroSection, // Deprecated
  heroSectionSlayt: HeroSectionSlayt, // Deprecated
  couponBanner: CouponBanner,
  about: AboutSection,
  services: ServicesSection,
  news: NewsSection,
  blog: BlogSection,
  articles: ArticlesSection,
  activity: ActivitySection,
  references: ReferencesSection,
  bikes: BikesSection,
};

// FETCH MAP
const sectionFetchers = {
  about: { fetch: fetchAbout, clear: clearAboutMessages },
  services: { fetch: fetchServices, clear: clearServicesMessages },
  news: { fetch: fetchNews, clear: clearNewsMessages },
  blog: { fetch: fetchBlog, clear: clearBlogMessages },
  articles: { fetch: fetchArticles, clear: clearArticlesMessages },
  activity: { fetch: fetchActivity, clear: clearActivityMessages },
  references: { fetch: fetchReferences, clear: clearReferencesMessages },
  bikes: { fetch: fetchBikes, clear: clearBikeMessages },
  gallery: { fetch: fetchPublishedGalleryItems, clear: clearGalleryCategoryMessages },
  galleryCategories: { fetch: fetchGalleryCategories, clear: clearGalleryCategoryMessages },
};

export default function HomePage() {
  const dispatch = useAppDispatch();

  const activeSections = useMemo(
    () => sectionSettings.filter((s) => s.enabled).sort((a, b) => a.order - b.order),
    []
  );

  useEffect(() => {
    const cleanupFns: Array<() => void> = [];

    activeSections.forEach(({ id }) => {
      const fetcher = sectionFetchers[id as keyof typeof sectionFetchers];
      if (fetcher) {
        try {
          dispatch(fetcher.fetch()); // ✅ parametresiz çağrı
          cleanupFns.push(() => dispatch(fetcher.clear())); // ✅ parametresiz çağrı
        } catch (err) {
          if (isDev) console.warn(`❌ Fetch failed for section '${id}'`, err);
        }
      }
    });

    return () => {
      cleanupFns.forEach((fn) => fn());
    };
  }, [dispatch, activeSections]);

  return (
    <>
      {activeSections.map(({ id }) => {
        const SectionComponent = sectionComponents[id];
        if (!SectionComponent) {
          if (isDev) {
            console.warn(`⚠️ Section '${id}' bileşeni import edilmemiş veya tanımlı değil.`);
          }
          return null;
        }
        try {
          return <SectionComponent key={id} />;
        } catch (err) {
          if (isDev) {
            console.error(`❌ Render error in section '${id}'`, err);
          }
          return null;
        }
      })}
    </>
  );
}
