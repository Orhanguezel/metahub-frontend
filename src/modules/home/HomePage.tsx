'use client';

import HeroSection from "@/modules/home/HeroSection";
import AboutSection from "@/modules/home/AboutSection";
import ServicesSection from "@/modules/home/ServicesSection";
import ProductsSection from "@/modules/home/ProductsSection";
import BlogSection from "@/modules/home/BlogSection";
import ContactSection from "@/modules/home/ContactSection";

const sections = [
  { id: "hero", component: HeroSection },
  { id: "about", component: AboutSection },
  { id: "services", component: ServicesSection },
  { id: "products", component: ProductsSection },
  { id: "blog", component: BlogSection },
  { id: "contact", component: ContactSection },
];

export default function HomePage() {
  return (
    <>
      {sections.map(({ id, component: SectionComponent }) => (
        <SectionComponent key={id} />
      ))}
    </>
  );
}
