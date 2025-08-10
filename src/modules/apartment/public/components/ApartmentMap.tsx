// /src/modules/apartment/public/components/ApartmentMap.tsx
"use client";

import { useMemo, useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import Map, {
  Marker,
  Popup,
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  type MarkerEvent,            // 👈 ekle
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchApartment } from "@/modules/apartment/slice/apartmentSlice";
import type { IApartment } from "@/modules/apartment/types";

type Props = {
  height?: number | string;
  width?: number | string;
  markerColor?: string;
  onSelect?: (apt: IApartment) => void;
};

// Ücretsiz Carto stili (API key gerektirmez)
const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

export default function ApartmentMap({
  height = 520,
  width = "100%",
  markerColor = "#1f7ae0",
  onSelect,
}: Props) {
  const dispatch = useAppDispatch();
  const { apartment, status } = useAppSelector((s) => s.apartment);
  const [popup, setPopup] = useState<IApartment | null>(null);

  // Public listeyi garantiye almak için burada da fetch edelim
  useEffect(() => {
    if ((status === "idle" || status === "failed") && apartment.length === 0) {
      dispatch(fetchApartment({ isPublished: true }));
    }
  }, [status, apartment.length, dispatch]);

  // Noktalar
  const points = useMemo(
    () =>
      apartment
        .map((a) => {
          const coords = (a as any)?.location?.coordinates;
          if (
            Array.isArray(coords) &&
            typeof coords[0] === "number" &&
            typeof coords[1] === "number"
          ) {
            return { apt: a, lng: coords[0], lat: coords[1] };
          }
          return null;
        })
        .filter(Boolean) as { apt: IApartment; lng: number; lat: number }[],
    [apartment]
  );

  // Tüm noktaları kadraja sığdır
  const fitViewState = useMemo(() => {
    if (!points.length) {
      return { longitude: 10, latitude: 50, zoom: 4 } as const; // Avrupa fallback
    }
    const lons = points.map((p) => p.lng);
    const lats = points.map((p) => p.lat);
    return {
      bounds: [
        [Math.min(...lons), Math.min(...lats)],
        [Math.max(...lons), Math.max(...lats)],
      ] as [[number, number], [number, number]],
      fitBoundsOptions: { padding: 48 },
    } as const;
  }, [points]);

  const handleMarkerClick = useCallback(
    (apt: IApartment) => {
      setPopup(apt);
      onSelect?.(apt);
    },
    [onSelect]
  );

  return (
    <MapWrap style={{ height, width }}>
      <Map
        reuseMaps
        mapStyle={MAP_STYLE}
        initialViewState={
          "bounds" in fitViewState
            ? (fitViewState as any)
            : ({ ...fitViewState } as any)
        }
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="top-right" />
        <FullscreenControl position="top-right" />
        <ScaleControl maxWidth={120} unit="metric" />

        {points.map(({ apt, lng, lat }) => (
          <Marker
  key={String(apt._id)}
  longitude={lng}
  latitude={lat}
  anchor="bottom"
  onClick={(e: MarkerEvent<MouseEvent>) => {   // 👈 tip düzeltildi
    e.originalEvent?.stopPropagation();        // MapLibre -> DOM MouseEvent
    handleMarkerClick(apt);
  }}
>
  <Dot aria-label="marker" $color={markerColor} />
</Marker>
        ))}

        {popup && (popup as any).location?.coordinates && (
          <Popup
            longitude={(popup as any).location.coordinates[0]}
            latitude={(popup as any).location.coordinates[1]}
            anchor="top"
            onClose={() => setPopup(null)}
            closeButton
            closeOnClick={false}
            maxWidth="320px"
          >
            <PopupBox>
              <Title>{firstNonEmpty(popup.title)}</Title>
              {popup.address && (
                <Addr>
                  {popup.address.fullText ||
                    [
                      [popup.address.street, popup.address.number]
                        .filter(Boolean)
                        .join(" "),
                      [popup.address.zip, popup.address.city]
                        .filter(Boolean)
                        .join(" "),
                      popup.address.country,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                </Addr>
              )}
              <a href={`/apartment/${popup.slug}`} className="link">
                Detaya Git
              </a>
            </PopupBox>
          </Popup>
        )}
      </Map>
    </MapWrap>
  );
}

function firstNonEmpty(obj?: Record<string, string>) {
  if (!obj) return "";
  return obj.tr || obj.en || obj.de || Object.values(obj)[0] || "";
}

// --- styles ---
const MapWrap = styled.div`
  position: relative;
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
`;

const Dot = styled.button<{ $color: string }>`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  border: 2px solid #ffffff;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.25);
  cursor: pointer;
  transform: translateY(2px);
  &:hover {
    transform: translateY(0);
  }
`;

const PopupBox = styled.div`
  display: grid;
  gap: 0.35rem;

  .link {
    margin-top: 0.25rem;
    display: inline-block;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
  }
  .link:hover {
    text-decoration: underline;
  }
`;

const Title = styled.div`
  font-weight: 700;
  font-size: 0.98rem;
`;

const Addr = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
