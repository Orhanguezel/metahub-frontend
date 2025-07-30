"use client";

// Empty.tsx
export default function Empty({ t }: { t: any }) {
  return <div style={{ textAlign: "center", padding: 40, color: "#aaa" }}>{t("noNotifications", "Henüz bildirim yok.")}</div>;
}