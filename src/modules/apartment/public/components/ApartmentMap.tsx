// /src/modules/apartment/public/components/ApartmentMap.tsx
"use client";

import { useMemo, useEffect, useState, useCallback, useRef } from "react";
import styled from "styled-components";
import MapGL, {
  Popup,
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  Source,
  Layer,
  type MapRef,
  type MapLayerMouseEvent,
} from "react-map-gl/maplibre";
import type { Feature, FeatureCollection, Point, Geometry } from "geojson";
import "maplibre-gl/dist/maplibre-gl.css";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchApartment } from "@/modules/apartment/slice/apartmentSlice";
import type { IApartment } from "@/modules/apartment/types";

type Props = {
  height?: number | string;
  width?: number | string;
  /** Unclustered (tekil) nokta rengi */
  markerColor?: string;
  /** Harita stil URL’i (API key gerektirmeyen varsayılanla gelir) */
  mapStyleUrl?: string;
  /** Isı haritasını göster */
  showHeatmap?: boolean;
  /** Bir nokta seçildiğinde üst bileşene haber ver */
  onSelect?: (apt: IApartment) => void;
};

// Ücretsiz (API key istemeyen) varsayılan stil
const DEFAULT_STYLE =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

/* ---------- yardımcı ---------- */
function firstNonEmpty(obj?: Record<string, string>) {
  if (!obj) return "";
  return (
    obj.tr ||
    obj.en ||
    obj.de ||
    obj.fr ||
    obj.es ||
    obj.pl ||
    Object.values(obj)[0] ||
    ""
  );
}

/** Geometry → [lng, lat] güvenli daraltıcı */
function pointCoords(g: Geometry | undefined): [number, number] | null {
  if (!g || g.type !== "Point") return null;
  const coords = (g as Point).coordinates;
  if (
    Array.isArray(coords) &&
    coords.length === 2 &&
    typeof coords[0] === "number" &&
    typeof coords[1] === "number"
  ) {
    return [coords[0], coords[1]];
  }
  return null;
}

/* ---------- bileşen ---------- */
export default function ApartmentMap({
  height = 520,
  width = "100%",
  markerColor = "#2E90FA",
  mapStyleUrl = DEFAULT_STYLE,
  showHeatmap = false,
  onSelect,
}: Props) {
  const dispatch = useAppDispatch();
  const { apartment, status } = useAppSelector((s) => s.apartment);

  // public list yoksa çek
  useEffect(() => {
    if ((status === "idle" || status === "failed") && apartment.length === 0) {
      dispatch(fetchApartment({ isPublished: true }));
    }
  }, [status, apartment.length, dispatch]);

  // id -> apt hızlı erişim
  const byId = useMemo(() => {
    const m = new Map<string, IApartment>();
    for (const a of apartment) m.set(String(a._id), a);
    return m;
  }, [apartment]);

  // GeoJSON FeatureCollection (cluster & heatmap için)
  type AptProps = { id: string; title: string };
  type AptFeature = Feature<Point, AptProps>;
  type AptFC = FeatureCollection<Point, AptProps>;

  const data: AptFC = useMemo(() => {
    const feats: AptFeature[] = apartment
      .map((a) => {
        const coords = a.location?.coordinates ?? [];
        if (
          Array.isArray(coords) &&
          coords.length === 2 &&
          typeof coords[0] === "number" &&
          typeof coords[1] === "number"
        ) {
          return {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [coords[0] as number, coords[1] as number],
            },
            properties: { id: String(a._id), title: firstNonEmpty(a.title) },
          } as AptFeature;
        }
        return null;
      })
      .filter(Boolean) as AptFeature[];
    return { type: "FeatureCollection", features: feats };
  }, [apartment]);

  // kadraja sığdırma
  const initialViewState = useMemo(() => {
    if (!data.features.length) return { longitude: 29.05, latitude: 41.02, zoom: 9 };
    const lons = data.features.map((f) => f.geometry.coordinates[0]);
    const lats = data.features.map((f) => f.geometry.coordinates[1]);
    return {
      bounds: [
        [Math.min(...lons), Math.min(...lats)],
        [Math.max(...lons), Math.max(...lats)],
      ] as [[number, number], [number, number]],
      fitBoundsOptions: { padding: 48 },
    };
  }, [data]);

  const mapRef = useRef<MapRef | null>(null);
  const [popup, setPopup] = useState<{
    lng: number;
    lat: number;
    apt: IApartment;
  } | null>(null);

  const handleMapClick = useCallback(
    (e: MapLayerMouseEvent) => {
      const f = e.features?.[0];
      if (!f) return;

      // cluster ise zoom'u büyüt
      if (f.layer.id === "clusters" && (f.properties as any)?.cluster_id != null) {
        const source = mapRef.current?.getSource("apts") as any;
        source?.getClusterExpansionZoom(
          (f.properties as any).cluster_id,
          (err: unknown, zoom: number) => {
            if (err) return;
            const c = pointCoords(f.geometry);
            if (!c) return;
            mapRef.current?.easeTo({ center: c, zoom, duration: 500 });
          }
        );
        return;
      }

      // unclustered nokta ise popup
      if (f.layer.id === "unclustered") {
        const id = String((f.properties as any)?.id || "");
        const apt = byId.get(id);
        if (!apt) return;
        const c = pointCoords(f.geometry);
        if (!c) return;
        const [lng, lat] = c;
        setPopup({ lng, lat, apt });
        onSelect?.(apt);
      }
    },
    [byId, onSelect]
  );

  return (
    <MapWrap style={{ height, width }}>
      <MapGL
        ref={mapRef}
        mapStyle={mapStyleUrl}
        initialViewState={initialViewState as any}
        reuseMaps
        style={{ width: "100%", height: "100%" }}
        interactiveLayerIds={["clusters", "unclustered"]}
        onClick={handleMapClick}
      >
        <NavigationControl position="top-right" />
        <FullscreenControl position="top-right" />
        <ScaleControl maxWidth={120} unit="metric" />

        {/* CLUSTERLI KAYNAK: nokta/cluster gösterimi */}
        <Source
          id="apts"
          type="geojson"
          data={data as any}
          cluster
          clusterMaxZoom={14}
          clusterRadius={52}
        >
          {/* cluster topları */}
          <Layer
            id="clusters"
            type="circle"
            filter={["has", "point_count"]}
            paint={{
              "circle-color": [
                "step",
                ["get", "point_count"],
                "#9CC9FF",
                10,
                "#60A5FA",
                25,
                "#3B82F6",
                50,
                "#2563EB",
              ],
              "circle-radius": ["step", ["get", "point_count"], 18, 10, 24, 25, 30, 50, 38],
              "circle-stroke-width": 2,
              "circle-stroke-color": "#fff",
            }}
          />
          {/* cluster sayısı */}
          <Layer
            id="cluster-count"
            type="symbol"
            filter={["has", "point_count"]}
            layout={{
              "text-field": ["get", "point_count_abbreviated"],
              "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
              "text-size": 12,
            }}
            paint={{ "text-color": "#ffffff" }}
          />
          {/* tekil noktalar */}
          <Layer
            id="unclustered"
            type="circle"
            filter={["!", ["has", "point_count"]]}
            paint={{
              "circle-color": markerColor,
              "circle-radius": 7,
              "circle-stroke-width": 2,
              "circle-stroke-color": "#ffffff",
            }}
          />
        </Source>

        {/* HEATMAP: clustersız ayrı bir kaynakla (isteğe bağlı) */}
        {showHeatmap && (
          <Source id="apts-heat" type="geojson" data={data as any}>
            <Layer
              id="heat"
              type="heatmap"
              maxzoom={15}
              paint={{
                // Nokta yoğunluğuna göre ağırlık
                "heatmap-weight": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  0,
                  0.6,
                  15,
                  1.0,
                ],
                // Yakınlaştırmaya göre yoğunluk
                "heatmap-intensity": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  0,
                  0.8,
                  15,
                  2.0,
                ],
                // Renk geçişleri
                "heatmap-color": [
                  "interpolate",
                  ["linear"],
                  ["heatmap-density"],
                  0,
                  "rgba(0,0,0,0)",
                  0.2,
                  "rgba(56,189,248,0.6)", // sky-400
                  0.4,
                  "rgba(59,130,246,0.7)", // blue-500
                  0.6,
                  "rgba(37,99,235,0.8)",  // blue-600
                  0.8,
                  "rgba(30,64,175,0.9)",  // indigo-800
                ],
                // Bulanıklık & yarıçap
                "heatmap-radius": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  0,
                  12,
                  10,
                  28,
                  15,
                  40,
                ],
                "heatmap-opacity": 0.85,
              }}
            />
          </Source>
        )}

        {/* POPUP */}
        {popup && (
          <Popup
            longitude={popup.lng}
            latitude={popup.lat}
            anchor="top"
            closeButton
            closeOnClick={false}
            maxWidth="320px"
            onClose={() => setPopup(null)}
          >
            <PopupBox>
              <Title>{firstNonEmpty(popup.apt.title)}</Title>
              {popup.apt.address && (
                <Addr>
                  {popup.apt.address.fullText ||
                    [
                      [popup.apt.address.street, popup.apt.address.number]
                        .filter(Boolean)
                        .join(" "),
                      [popup.apt.address.zip, popup.apt.address.city]
                        .filter(Boolean)
                        .join(" "),
                      popup.apt.address.country,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                </Addr>
              )}
              {popup.apt.slug && (
                <a className="link" href={`/apartment/${popup.apt.slug}`}>
                  Detaya Git
                </a>
              )}
            </PopupBox>
          </Popup>
        )}
      </MapGL>
    </MapWrap>
  );
}

/* ---- styles ---- */
const MapWrap = styled.div`
  position: relative;
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.cardBackground};
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
  .link:hover { text-decoration: underline; }
`;

const Title = styled.div`
  font-weight: 700;
  font-size: 0.98rem;
`;

const Addr = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
