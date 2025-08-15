// src/modules/apartment/public/components/CoverageStats.tsx
"use client";
import styled from "styled-components";
import type { IApartment } from "@/modules/apartment/types";

export default function CoverageStats({ apartments }: { apartments: IApartment[] }) {
  const total = apartments.length;
  const neighborhoods = new Set(
    apartments
      .map(a => a.place?.neighborhood)
      .map(n => (typeof n === "string" ? n : n?._id))
      .filter(Boolean) as string[]
  ).size;
  const cities = new Set(apartments.map(a => a.address?.city).filter(Boolean)).size;
  const countries = new Set(apartments.map(a => a.address?.country).filter(Boolean)).size;

  const items = [
    { label: "Toplam Apartman", value: total },
    { label: "Mahalle", value: neighborhoods },
    { label: "Şehir", value: cities },
    { label: "Ülke", value: countries },
  ];

  return (
    <Bar role="region" aria-label="Coverage">
      {items.map((it) => (
        <Card key={it.label}>
          <Val>{it.value}</Val>
          <Lbl>{it.label}</Lbl>
        </Card>
      ))}
    </Bar>
  );
}

const Bar = styled.div`
  display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));
  gap:${({theme})=>theme.spacings.sm};
  margin-bottom:${({theme})=>theme.spacings.lg};
`;
const Card = styled.div`
  background:${({theme})=>theme.colors.cardBackground};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  border-radius:${({theme})=>theme.radii.lg};
  box-shadow:${({theme})=>theme.cards.shadow};
  padding:${({theme})=>theme.spacings.md};
  text-align:center;
`;
const Val = styled.div`font-size:1.6rem;font-weight:800;`;
const Lbl = styled.div`opacity:.7;margin-top:4px;`;
