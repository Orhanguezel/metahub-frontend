"use client";

import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L, { Icon } from "leaflet";
import "leaflet.markercluster";
import styled, { useTheme } from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "../../../locales";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// --- TYPES ---
interface AnalyticsEvent {
  module: string;
  eventType: string;
  location?: { type: "Point"; coordinates: [number, number] };
  userId?: string;
  timestamp?: string;
}

interface Props {
  data: AnalyticsEvent[];
}

// --- Olay tipine göre marker rengi ---
const EVENT_COLORS: Record<string, string> = {
  add: "3cba54",
  delete: "db3236",
  login: "4885ed",
};
const DEFAULT_COLOR = "999999";

const getIconByEvent = (eventType: string): Icon => {
  const color = EVENT_COLORS[eventType] || DEFAULT_COLOR;
  return new L.Icon({
    iconUrl: `https://chart.googleapis.com/chart?chst=d_map_pin_icon&chld=pin|${color}`,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -36],
  });
};

export default function MapChart({ data }: Props) {
  const theme = useTheme();
  const { t, i18n } = useI18nNamespace("dashboard", translations);

  // Leaflet default marker görsellerini sadece bir kez set et
  useEffect(() => {
    if (typeof window === "undefined") return;
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: markerIcon2x.src || markerIcon2x,
      iconUrl: markerIcon.src || markerIcon,
      shadowUrl: markerShadow.src || markerShadow,
    });
  }, []);

  // Geçerli eventleri filtrele
  const validEvents: AnalyticsEvent[] = Array.isArray(data)
    ? data.filter(
        (e) =>
          !!e.location &&
          Array.isArray(e.location.coordinates) &&
          e.location.coordinates.length === 2 &&
          typeof e.location.coordinates[0] === "number" &&
          typeof e.location.coordinates[1] === "number"
      )
    : [];

  // Harita merkezi: ilk event veya fallback (İstanbul)
  const center: [number, number] =
    validEvents.length > 0
      ? [
          validEvents[0].location!.coordinates[1],
          validEvents[0].location!.coordinates[0],
        ]
      : [41.01, 28.97];

  return (
    <MapWrapper $border={theme.colors.border}>
      <MapContainer
        center={center}
        zoom={3}
        scrollWheelZoom
        style={{ width: "100%", height: "100%" }}
        aria-label={t("analytics.mapAria", "Log haritası")}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MarkerClusterGroupWrapper events={validEvents} t={t} i18n={i18n} />
      </MapContainer>
      {validEvents.length === 0 && (
        <NoData>
          <strong>
            <NoDataText>
              {t("analytics.noGeoData", "Konum verisi içeren kayıt yok.")}
            </NoDataText>
          </strong>
        </NoData>
      )}
    </MapWrapper>
  );
}

// --- Cluster bileşeni (memory/perf için useRef) ---
function MarkerClusterGroupWrapper({
  events,
  t,
  i18n,
}: {
  events: AnalyticsEvent[];
  t: ReturnType<typeof useI18nNamespace>["t"];
  i18n: ReturnType<typeof useI18nNamespace>["i18n"];
}) {
  const map = useMap();
  const markerClusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

  // Sadece ilk mount'ta cluster instance oluştur
  if (!markerClusterGroupRef.current) {
    markerClusterGroupRef.current = L.markerClusterGroup();
  }

  useEffect(() => {
    const markerClusterGroup = markerClusterGroupRef.current!;
    markerClusterGroup.clearLayers();

    events.forEach((event) => {
      const [lon, lat] = event.location!.coordinates;
      const icon = getIconByEvent(event.eventType);

      // Tarih formatı (tip güvenli)
      let formattedDate = "-";
      if (event.timestamp) {
        const date = new Date(event.timestamp);
        formattedDate = `${date.toLocaleDateString(i18n.language)} ${date
          .getHours()
          .toString()
          .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
      }

      const moduleLabel = t(`modules.${event.module}`, event.module);
      const eventLabel = t(`events.${event.eventType}`, event.eventType);

      const marker = L.marker([lat, lon], { icon });
      marker.bindPopup(
        `<div style="font-size: 0.93rem">
          <strong>${moduleLabel}</strong><br/>
          ${eventLabel}<br/>
          ${
            event.userId
              ? `<span style='color:gray'>${event.userId}</span><br/>`
              : ""
          }
          <small>${formattedDate}</small>
        </div>`
      );

      markerClusterGroup.addLayer(marker);
    });

    map.addLayer(markerClusterGroup);

    return () => {
      map.removeLayer(markerClusterGroup);
    };
  }, [events, map, t, i18n.language]);

  return null;
}

// --- Styled Components ---
const MapWrapper = styled.div<{ $border: string }>`
  width: 100%;
  height: 400px;
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid ${({ $border }) => $border};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
`;

const NoData = styled.div`
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  text-align: center;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.md};
  pointer-events: none;
  transform: translateY(-50%);
  background: rgba(255,255,255,0.8);
`;

const NoDataText = styled.span`
  display: inline-block;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 0.5em 1em;
  color: ${({ theme }) => theme.colors.textMuted};
`;
