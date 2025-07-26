"use client";

import React, { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";

// SECTION COMPONENTS
import { AboutSection } from "@/modules/about";
import { AboutMeSection } from "@/modules/about";
import { ServicesSection } from "@/modules/services";
import { NewsSection } from "@/modules/news";
import { BlogSection } from "@/modules/blog";
import { ArticlesSection } from "@/modules/articles";
import { ActivitySection } from "@/modules/activity";
import { ReferencesSection } from "@/modules/references";
import { BikesSection } from "@/modules/bikes";
import { LibrarySection } from "@/modules/library";
import { EnsotekprodSection } from "@/modules/ensotekprod";
import { SparepartSection } from "@/modules/sparepart";
import { WelcomeCouponBanner } from "@/modules/coupon";
import { TeamSection } from "@/modules/team";
import { ContactFormSection } from "@/modules/contact";
import WhatsAppFloatingSection from "@/modules/home/public/components/WhatsAppFloatingSection";
import FloatingChatboxSection from "@/modules/chat/public/components/FloatingChatbox"; // Senin chat kutun
import ScrollToTopSection from "@/modules/home/public/components/ScrollToTop";
import RequestOfferButton from "@/modules/requestOffer/public/components/RequestOfferButton";
import CatalogRequestButton from "@/modules/catalogRequest/public/components/CatalogRequestButton";
import NewsletterButton from "@/modules/newsletter/public/components/NewsletterButton";
import TestimonialSection from "@/modules/comment/public/components/TestimonialSection"; 

import HeroSlider from "@/modules/home/public/components/HeroSlider";
import HeroSection from "@/modules/home/public/components/HeroSection";
import HeroSectionSlayt from "@/modules/home/public/components/HeroSectionSlayt";
import HeroRobotic from "../components/HeroRobotic";


// Section Key -> Component Map
const sectionComponents: Record<string, React.ComponentType<any> | undefined> = {
  heroSlider: HeroSlider,
  heroSection: HeroSection, // Deprecated
  heroSectionSlayt: HeroSectionSlayt, // Deprecated
  couponBanner: WelcomeCouponBanner, 
  about: AboutSection,
  services: ServicesSection,
  news: NewsSection,
  blog: BlogSection,
  articles: ArticlesSection,
  activity: ActivitySection,
  references: ReferencesSection,
  bikes: BikesSection,
  library: LibrarySection,
  ensotekprod: EnsotekprodSection,
  sparepart: SparepartSection,
  whatsapp:WhatsAppFloatingSection,
  scrollToTop:ScrollToTopSection,
  requestOffer:RequestOfferButton,
  catalogRequest:CatalogRequestButton,
  newsletter:NewsletterButton,
  chatbox: FloatingChatboxSection,
  testimonial: TestimonialSection,
  herorobotic: HeroRobotic,
  team: TeamSection,
  aboutMe: AboutMeSection,
  contact: ContactFormSection,
};

const isDev = process.env.NODE_ENV === "development";

export default function HomePage() {
  // Sadece store’dan oku, fetch yok!
  const sectionSettings = useAppSelector((s) => s.sectionSetting.settings);

  // Tenant’a özel aktif section’ları sırala
const activeSections = useMemo(() => {
  if (!Array.isArray(sectionSettings) || sectionSettings.length === 0) return [];
  return sectionSettings
    .filter((s) => s.enabled !== false)
    .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
}, [sectionSettings]);

  // Render
  return (
    <>
      {activeSections.map((setting) => {
        const sectionKey = setting.sectionKey;
        const SectionComponent = sectionComponents[sectionKey];
        if (!SectionComponent) {
          if (isDev) {
            console.warn(`⚠️ Section component '${sectionKey}' import edilmemiş veya tanımlı değil.`);
          }
          return null;
        }
        try {
          // Gerekirse override parametre/props aktarabilirsin: <SectionComponent {...setting} />
          return <SectionComponent key={sectionKey} />;
        } catch (err) {
          if (isDev) {
            console.error(`❌ Render error in section '${sectionKey}'`, err);
          }
          return null;
        }
      })}
    </>
  );
}
