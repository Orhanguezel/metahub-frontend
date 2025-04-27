"use client";

import React from "react";
import { moduleMap } from "@/components/shared/moduleMap";
import SkeletonBox from "@/components/shared/Skeleton";


interface DynamicPageBuilderProps {
  modules: {
    id: string;
    order: number;
    visible: boolean;
    props?: any;
  }[];
}

const DynamicPageBuilder: React.FC<DynamicPageBuilderProps> = ({ modules }) => {
  if (!modules || modules.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <SkeletonBox />
        <SkeletonBox />
        <SkeletonBox />
      </div>
    );
  }
  

  // Önce sıralıyoruz
  const sortedModules = modules
    .filter((mod) => mod.visible)
    .sort((a, b) => a.order - b.order);

  return (
    <>
      {sortedModules.map((mod) => {
        const SectionComponent = moduleMap[mod.id];
        if (!SectionComponent) {
          console.warn(`Component for module ID '${mod.id}' not found.`);
          return (
            <div
              key={mod.id}
              style={{
                background: "#ffe0e0",
                padding: "1rem",
                marginBottom: "1rem",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              ⚠️ Unknown Module: <strong>{mod.id}</strong>
            </div>
          );
        }
        
        return <SectionComponent key={mod.id} {...(mod.props || {})} />;
      })}
    </>
  );
};

export default DynamicPageBuilder;
