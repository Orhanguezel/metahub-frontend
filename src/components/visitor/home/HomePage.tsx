import HeroSection from "@/components/visitor/home/HeroSection";
import AboutSection from "@/components/visitor/home/AboutSection";
import ServicesSection from "@/components/visitor/home/ServicesSection";
import ProductsSection from "@/components/visitor/home/ProductsSection";
import BlogSection from "@/components/visitor/home/BlogSection";
import ContactSection from "@/components/visitor/home/ContactSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <ProductsSection />
      <BlogSection />
      <ContactSection />
    </>
  );
}
