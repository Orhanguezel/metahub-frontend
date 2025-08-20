"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L, { Icon } from "leaflet";
import "leaflet.markercluster";
import styled, { useTheme } from "styled-components";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/dashboard/locales";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

interface AnalyticsEvent {
  module: string;
  eventType: string;
  location?: { type: "Point"; coordinates: [number, number] }; // [lon, lat]
  userId?: string;
  timestamp?: string;
}
interface Props {
  data: AnalyticsEvent[];
}

/* renkler */
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
  const { t } = useI18nNamespace("dashboard", translations);

  // Leaflet default marker görselleri
  useEffect(() => {
    if (typeof window === "undefined") return;
    // @ts-expect-error leaflet internals
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: (markerIcon2x as any).src || (markerIcon2x as any),
      iconUrl: (markerIcon as any).src || (markerIcon as any),
      shadowUrl: (markerShadow as any).src || (markerShadow as any),
    });
  }, []);

  // yalnızca geçerli koordinatlı eventler
  const validEvents: AnalyticsEvent[] = useMemo(
    () =>
      Array.isArray(data)
        ? data.filter((e) => {
            const c = e?.location?.coordinates;
            return Array.isArray(c) && c.length === 2 && c.every((n) => typeof n === "number");
          })
        : [],
    [data]
  );

  // merkez (ilk event) veya İstanbul
  const center: [number, number] =
    validEvents.length > 0
      ? [validEvents[0].location!.coordinates[1], validEvents[0].location!.coordinates[0]]
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
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MarkerClusterGroupWrapper events={validEvents} />
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

/* Cluster bileşeni */
function MarkerClusterGroupWrapper({ events }: { events: AnalyticsEvent[] }) {
  const { t, i18n } = useI18nNamespace("dashboard", translations);
  const map = useMap();
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);

  // cluster'i bir kere oluştur
  if (!clusterRef.current) {
    clusterRef.current = L.markerClusterGroup({
      chunkedLoading: true,
      showCoverageOnHover: false,
      disableClusteringAtZoom: 8,
      spiderfyOnMaxZoom: true,
      maxClusterRadius: 50,
    }) as any;
  }

  useEffect(() => {
    const group = clusterRef.current!;
    group.clearLayers();

    const bounds = L.latLngBounds([]);

    for (const e of events) {
      const [lon, lat] = e.location!.coordinates;
      const icon = getIconByEvent(e.eventType);

      let formattedDate = "-";
      if (e.timestamp) {
        const d = new Date(e.timestamp);
        if (!Number.isNaN(d.getTime())) {
          const hh = d.getHours().toString().padStart(2, "0");
          const mm = d.getMinutes().toString().padStart(2, "0");
          formattedDate = `${d.toLocaleDateString(i18n.language)} ${hh}:${mm}`;
        }
      }

      const moduleLabel = t(`modules.${e.module}`, e.module);
      const eventLabel = t(`events.${e.eventType}`, e.eventType);

      const marker = L.marker([lat, lon], { icon });
      marker.bindPopup(
        `<div style="font-size:0.93rem">
           <strong>${moduleLabel}</strong><br/>
           ${eventLabel}<br/>
           ${e.userId ? `<span style='color:gray'>${e.userId}</span><br/>` : ""}
           <small>${formattedDate}</small>
         </div>`
      );

      group.addLayer(marker);
      bounds.extend([lat, lon]);
    }

    map.addLayer(group);

    // bounds'a sığdır (en az 2 nokta varsa)
    if (events.length > 1 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [24, 24] });
    }

    return () => {
      map.removeLayer(group);
    };
  }, [events, map, t, i18n.language]);

  return null;
}

/* styled */
const MapWrapper = styled.div<{ $border: string }>`
  width: 100%;
  height: 400px;
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid ${({ $border }) => $border};
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  position: relative;
`;

const NoData = styled.div`
  position: absolute;
  inset-inline: 0;
  top: 50%;
  transform: translateY(-50%);
  text-align: center;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.md};
  pointer-events: none;
  background: rgba(255,255,255,0.8);
`;

const NoDataText = styled.span`
  display: inline-block;
  background: ${({ theme }) => theme.colors.cardBackground};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 0.5em 1em;
  color: ${({ theme }) => theme.colors.textMuted};
`;
