// ./src/app/(public)/aboutme/[id]/page.tsx
"use client";

import dynamic from "next/dynamic";

const AboutDetailPage = dynamic(() => import("@/modules/about/public/components/AboutDetailPage"), {
  ssr: false,
});

export default AboutDetailPage;
