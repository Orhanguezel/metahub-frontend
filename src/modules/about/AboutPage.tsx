'use client';

import AboutMainSection from "@/modules/about/AboutMainSection";
import TeamSection from "@/modules/about/TeamSection";
import MissionSection from "@/modules/about/MissionSection";

const sections = [
  { id: "about-main", component: AboutMainSection },
  { id: "team", component: TeamSection },
  { id: "mission", component: MissionSection },
];

export default function AboutPage() {
  return (
    <>
      {sections.map(({ id, component: SectionComponent }) => (
        <SectionComponent key={id} />
      ))}
    </>
  );
}
