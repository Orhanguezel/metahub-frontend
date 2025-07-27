// src/app/(public)/booking/page.tsx

"use client";
import React, { Suspense } from "react";
import { BookingPublicPage } from "@/modules/booking";

// Suspense boundary ile sarmala!
export default function BookingRouterPage() {
  return (
    <Suspense fallback={null}>
      <BookingPublicPage />
    </Suspense>
  );
}
