
 "use client";
 
 import React from "react";
 //import HeroSection from "@/modules/home/hero/HeroSection";
 //import HeroSectionSlayt from "@/modules/home/hero/HeroSectionSlayt";
 import SliderSection from "../components/HeroProductSliderSection";
 import { AboutSection } from "@/modules/about";
 import { ServicesSection } from "@/modules/services";
 import { NewsSection } from "@/modules/news";
 import { ProductSection } from "@/modules/product";
 import { BlogSection } from "@/modules/blog";
 import { ArticlesSection } from "@/modules/articles";
 import { ActivitySection } from "@/modules/activity";
 import { ReferenceSection } from "@/modules/references";
 import CouponBanner from "@/shared/CouponBanner";
 
const isDev = process.env.NODE_ENV === "development";

 // Dummy ayarlar (backend’den çekilecek)
 const sectionSettings = [
   //{ id: "hero", enabled: true, order: 1 },
   //{ id: "heroSlayt", enabled: true, order: 2 },
 
   { id: "heroSlider", enabled: true, order: 1 },
   { id: "couponBanner", enabled: true, order: 2 }, // 🎯 Banner artık bir section
   { id: "services", enabled: true, order: 3 },
   { id: "about", enabled: true, order: 4 },
   { id: "news", enabled: true, order: 5 },
   { id: "products", enabled: true, order: 6 },
   { id: "blog", enabled: true, order: 7 },
   { id: "contact", enabled: false, order: 8 },
   { id: "activity", enabled: true, order: 9 },
   { id: "articles", enabled: true, order: 10 },
   { id: "references", enabled: true, order: 11 },
 ];
 
 // Modül eşleştirme
 const sectionComponents: Record<string, React.ComponentType<any>> = {
   //hero: HeroSection,
   //heroSlayt: HeroSectionSlayt,
   heroSlider: SliderSection,
   couponBanner: CouponBanner,
   about: AboutSection,
   services: ServicesSection,
   news: NewsSection,
   products: ProductSection,
   blog: BlogSection,
   articles: ArticlesSection,
   activity: ActivitySection,
   references: ReferenceSection,
 };
 
 export default function HomePage() {
   const activeSections = sectionSettings
     .filter((section) => section.enabled)
     .sort((a, b) => a.order - b.order);
 
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
