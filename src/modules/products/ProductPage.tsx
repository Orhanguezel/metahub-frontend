'use client';

import ProductListSection from "@/modules/products/ProductListSection";

const sections = [
  { id: "product-list", component: ProductListSection },
];

export default function ProductPage() {
  return (
    <>
      {sections.map(({ id, component: SectionComponent }) => (
        <SectionComponent key={id} />
      ))}
    </>
  );
}
