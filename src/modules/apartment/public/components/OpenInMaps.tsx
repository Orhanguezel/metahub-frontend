// src/modules/apartment/public/components/OpenInMaps.tsx
"use client";
import styled from "styled-components";

export function buildMapsLinks(opts: { lat?: number; lng?: number; q?: string }) {
  const { lat, lng, q } = opts;
  const enc = (s: string) => encodeURIComponent(s);
  if (typeof lat === "number" && typeof lng === "number") {
    return {
      google: `https://www.google.com/maps?q=${lat},${lng}`,
      apple:  `https://maps.apple.com/?q=${lat},${lng}`,
      osm:    `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`,
    };
  }
  const query = enc(q || "");
  return {
    google: `https://www.google.com/maps/search/?api=1&query=${query}`,
    apple:  `https://maps.apple.com/?q=${query}`,
    osm:    `https://www.openstreetmap.org/search?query=${query}`,
  };
}

export default function OpenInMaps({ lat, lng, address }: { lat?: number; lng?: number; address?: string }) {
  const links = buildMapsLinks({ lat, lng, q: address });
  return (
    <Row>
      <A href={links.google} target="_blank" rel="noreferrer">Google Maps</A>
      <A href={links.apple}  target="_blank" rel="noreferrer">Apple Maps</A>
      <A href={links.osm}    target="_blank" rel="noreferrer">OpenStreetMap</A>
    </Row>
  );
}

const Row = styled.div`display:flex;gap:8px;flex-wrap:wrap;align-items:center;`;
const A = styled.a`
  padding:6px 10px;border-radius:${({theme})=>theme.radii.sm};
  border:${({theme})=>theme.borders.thin} ${({theme})=>theme.colors.border};
  text-decoration:none;
`;
