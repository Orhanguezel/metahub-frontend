// app/visitor/layout.tsx
import React from "react";

export const metadata = {
  title: "Visitor - Ensotek",
  description: "Visitor-facing pages",
};

export default function VisitorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>; 
}
