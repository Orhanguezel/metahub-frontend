'use client';

import ContactFormSection from "@/modules/contact/ContactFormSection";
import LocationMapSection from "@/modules/contact/LocationMapSection";
import FAQSection from "@/modules/contact/FAQSection";

const sections = [
  { id: "contact-form", component: ContactFormSection },
  { id: "location-map", component: LocationMapSection },
  { id: "faq", component: FAQSection },
];

export default function ContactPage() {
  return (
    <>
      {sections.map(({ id, component: SectionComponent }) => (
        <SectionComponent key={id} />
      ))}
    </>
  );
}
