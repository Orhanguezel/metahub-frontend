'use client';

interface ProductDetailProps {
  title?: string;
  description?: string;
  price?: number;
}

export default function ProductDetailSection({
  title = "Product Title",
  description = "Product description goes here.",
  price = 0,
}: ProductDetailProps) {
  return (
    <section>
      <h1>{title}</h1>
      <p>{description}</p>
      <p>Price: ${price.toFixed(2)}</p>
    </section>
  );
}
