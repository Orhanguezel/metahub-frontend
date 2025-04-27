import ProductDetailSection from "@/modules/products/ProductDetailSection";

export default function Page({ params }: { params: { id: string } }) {
  return (
    <ProductDetailSection
      title={`Product ${params.id}`}
      description="Detailed description of the product."
      price={99.99}
    />
  );
}
