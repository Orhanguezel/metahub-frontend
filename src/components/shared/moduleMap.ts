// src/modules/shared/moduleMap.ts

import HeroSection from "@/modules/home/HeroSection";
import AboutSection from "@/modules/home/AboutSection";
import ServicesSection from "@/modules/home/ServicesSection";
import ProductsSection from "@/modules/home/ProductsSection";
import BlogSection from "@/modules/home/BlogSection";
import ContactSection from "@/modules/home/ContactSection";

import AboutMainSection from "@/modules/about/AboutMainSection";
import TeamSection from "@/modules/about/TeamSection";
import MissionSection from "@/modules/about/MissionSection";

import ContactFormSection from "@/modules/contact/ContactFormSection";
import LocationMapSection from "@/modules/contact/LocationMapSection";
import FAQSection from "@/modules/contact/FAQSection";

import NewsListSection from "@/modules/news/NewsListSection";
import NewsDetailSection from "@/modules/news/NewsDetailSection";

import BlogListSection from "@/modules/blogs/BlogListSection";
import BlogDetailSection from "@/modules/blogs/BlogDetailSection";

import ProductListSection from "@/modules/products/ProductListSection";
import ProductDetailSection from "@/modules/products/ProductDetailSection";

// 🎯 Map: backend'den gelen id ➔ ilgili bileşen
export const moduleMap: Record<string, React.FC<any>> = {
  // Home
  hero: HeroSection,
  about: AboutSection,
  services: ServicesSection,
  products: ProductsSection,
  blog: BlogSection,
  contact: ContactSection,

  // About
  aboutMain: AboutMainSection,
  team: TeamSection,
  mission: MissionSection,

  // Contact
  contactForm: ContactFormSection,
  locationMap: LocationMapSection,
  faq: FAQSection,

  // News
  newsList: NewsListSection,
  newsDetail: NewsDetailSection,

  // Blogs
  blogList: BlogListSection,
  blogDetail: BlogDetailSection,

  // Products
  productList: ProductListSection,
  productDetail: ProductDetailSection,
};
