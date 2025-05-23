"use client";

import {
  ContactFormSection,
  LocationMapSection,
  FAQSection,
 } from "@/modules/contact";

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
