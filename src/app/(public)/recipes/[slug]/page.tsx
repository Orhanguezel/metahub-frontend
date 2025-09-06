"use client";
import RecipesDetailSection from "@/modules/recipes/public/components/DetailSection";

export default function Page() {
  return <RecipesDetailSection />;
}


/*
import { useParams } from "next/navigation";
import SEOManager from "@/shared/SEOManager";
import AboutDetailSection from "@/modules/about/public/components/AboutDetailSection";

export default function Page() {
  const { slug } = useParams();
  // slug ile ilgili veriyi çekip meta doldurabilirsin (örn. RTK, static, vs.)
  return (
    <>
      <SEOManager
        meta={{
          title: `Ensotek | ${slug}`,
          description: `Ensotek ${slug} hakkında detaylar.`,
        }}
      />
      <AboutDetailSection />
    </>
  );
}


*/

