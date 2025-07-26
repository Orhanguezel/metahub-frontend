import TeamDetailSection from "@/modules/team/public/components/DetailSection";

export default function Page() {
  return <TeamDetailSection />;
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

