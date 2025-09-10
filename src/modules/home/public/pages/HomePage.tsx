"use client";

import React, { Suspense, useMemo } from "react";
import { useAppSelector } from "@/store/hooks";

// SECTION COMPONENTS (statik importlar)
import { AboutSection, AboutMeSection } from "@/modules/about";
import { ServicesSection } from "@/modules/services";
import { MassageSection } from "@/modules/massage";
import { NewsSection } from "@/modules/news";
import { BlogSection } from "@/modules/blog";
import { ArticlesSection } from "@/modules/articles";
import { ActivitySection } from "@/modules/activity";
import { ReferencesSection, ReferencesAltSection } from "@/modules/references";
import { BikesSection } from "@/modules/bikes";
import { LibrarySection } from "@/modules/library";
import { EnsotekprodSection } from "@/modules/ensotekprod";
import { SparepartSection } from "@/modules/sparepart";
import { WelcomeCouponBanner } from "@/modules/coupon";
import { TeamSection } from "@/modules/team";
import { ContactFormSection } from "@/modules/contact";
import { PortfolioSection } from "@/modules/portfolio";
import { SkillSection } from "@/modules/skill";
import { TestimonialSection, TestimonialSectionAlt, TestimonialSectionGzl } from "@/modules/comment";
import { ApartmentAltSection } from "@/modules/apartment";

import WhatsAppFloatingSection from "@/modules/home/public/components/WhatsAppFloatingSection";
import FloatingChatboxSection from "@/modules/chat/public/components/FloatingChatbox";
import ScrollToTopSection from "@/modules/home/public/components/ScrollToTop";
import RequestOfferButton from "@/modules/offer/public/components/RequestOfferButton";
import CatalogRequestButton from "@/modules/catalog/public/components/CatalogRequestButton";
import NewsletterButton from "@/modules/newsletter/public/components/NewsletterButton";
import NewsletterSection from "@/modules/newsletter/public/components/NewsletterSection";
import PricingSection from "@/modules/pricing/public/components/Section";
import CategoryMenuSection from "@/modules/menu/public/components/CategoryMenuSection";
import MenuSection from "@/modules/menu/public/components/MenuSection";
import ReactionsSection from "@/modules/reactions/public/components/ReactionsSection";
import AboutUsSection from "@/modules/about/public/components/SectionUs";

import HeroSlider from "@/modules/home/public/components/HeroSlider";
import HeroSection from "@/modules/home/public/components/HeroSection";
import HeroSectionSlayt from "@/modules/home/public/components/HeroSectionSlayt";
import HeroRobotic from "@/modules/home/public/components/HeroRobotic";
import HeroMetahub from "@/modules/home/public/components/HeroMetahub";
import HeroRestaurant from "@/modules/home/public/components/HeroRestaurant";

const isDev = process.env.NODE_ENV === "development";

/** İsteğe bağlı: Section config için gevşek tip (projendeki gerçeğe uyarlayabilirsin) */
type SectionConfig = {
  id?: string;
  sectionKey: string;
  enabled?: boolean;
  order?: number;
  props?: Record<string, any>;
};

/** Section Key → Component map */
const sectionComponents: Record<string, React.ComponentType<any> | undefined> = {
  heroSlider: HeroSlider,
  heroSection: HeroSection,                // Deprecated
  heroSectionSlayt: HeroSectionSlayt,      // Deprecated
  heroRobotic: HeroRobotic,
  heroMetahub: HeroMetahub,
  couponBanner: WelcomeCouponBanner,

  about: AboutSection,
  services: ServicesSection,
  massage: MassageSection,
  news: NewsSection,
  blog: BlogSection,
  articles: ArticlesSection,
  activity: ActivitySection,
  references: ReferencesSection,
  referencesAlt: ReferencesAltSection,
  bikes: BikesSection,
  library: LibrarySection,
  ensotekprod: EnsotekprodSection,
  sparepart: SparepartSection,

  whatsapp: WhatsAppFloatingSection,
  scrollToTop: ScrollToTopSection,
  requestOffer: RequestOfferButton,
  catalogRequest: CatalogRequestButton,
  newsletter: NewsletterButton,
  newsletterSection: NewsletterSection,
  chatbox: FloatingChatboxSection,

  testimonial: TestimonialSection,
  testimonialAlt: TestimonialSectionAlt,
  testimonialGzl: TestimonialSectionGzl,

  team: TeamSection,
  aboutMe: AboutMeSection,
  contact: ContactFormSection,
  portfolio: PortfolioSection,
  skills: SkillSection,
  pricing: PricingSection,
  apartment: ApartmentAltSection,

  menuCategory: CategoryMenuSection,
  menuSection: MenuSection,
  reactions: ReactionsSection,

  heroRestaurant: HeroRestaurant,
  aboutUs: AboutUsSection,
};

/** Basit hata sınırı (per-section) */
class SectionBoundary extends React.Component<{ name: string; children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any) {
    if (isDev) console.error(`❌ Section error in '${this.props.name}':`, error);
  }
  render() {
    if (this.state.hasError) {
      // prod'da sessizce gizle; dev'de basit uyarı
      return isDev ? <div style={{ display: "none" }} /> : null;
    }
    return this.props.children;
  }
}

export default function HomePage() {
  // Store'dan sadece oku (fetch yok; init başka yerde)
  const sectionSettings = useAppSelector((s) => s.sectionSetting.settings) as SectionConfig[] | undefined;

  const activeSections = useMemo(() => {
    if (!Array.isArray(sectionSettings) || sectionSettings.length === 0) return [];
    return sectionSettings
      .filter((s) => s?.enabled !== false)
      .sort((a, b) => (a?.order ?? 9999) - (b?.order ?? 9999));
  }, [sectionSettings]);

  if (!activeSections.length) {
    // İstersen placeholder/skeleton koy
    return null;
  }

  return (
    <>
      {activeSections.map((setting, idx) => {
        const sectionKey = setting.sectionKey;
        const SectionComponent = sectionComponents[sectionKey];
        const key = setting.id || `${sectionKey}:${idx}`;

        if (!SectionComponent) {
          if (isDev) {
            console.warn(`⚠️ Section component '${sectionKey}' import edilmemiş veya tanımlı değil.`);
          }
          return null;
        }

        // props paslama: hem "props" alanını hem de tüm config'i istersen child'a ilet
        const passedProps = { ...(setting.props || {}), config: setting };

        return (
          <SectionBoundary key={key} name={sectionKey}>
            <Suspense fallback={null}>
              <SectionComponent {...passedProps} />
            </Suspense>
          </SectionBoundary>
        );
      })}
    </>
  );
}
