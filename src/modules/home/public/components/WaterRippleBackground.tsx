"use client";
import { useRef, useEffect, useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import type { IGallery, IGalleryCategory } from "@/modules/gallery/types";

const SLIDER_CATEGORY_SLUG = "maintenance";
const FALLBACK_IMAGE = "/img/robot_reading.png";

const WaterRippleBackground = () => {
  const { publicImages } = useAppSelector((state) => state.gallery);
  const { categories } = useAppSelector((state) => state.galleryCategory);

  // Dinamik görsel (ilk gallery > ilk image)
  const bgImage = useMemo(() => {
    const cat = categories?.find((c: IGalleryCategory) => c.slug === SLIDER_CATEGORY_SLUG);
    const catId = cat?._id;
    const heroGallery: IGallery | undefined = publicImages?.find((gallery: IGallery) =>
      typeof gallery.category === "string"
        ? gallery.category === catId
        : (gallery.category as IGalleryCategory)?._id === catId
    );
    return (
      heroGallery?.images?.[0]?.webp ||
      heroGallery?.images?.[0]?.url ||
      heroGallery?.images?.[0]?.thumbnail ||
      FALLBACK_IMAGE
    );
  }, [categories, publicImages]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    let animationId: number;
    let ripples: { x: number; y: number; r: number; alpha: number }[] = [];
    let imgLoaded = false;

    const img = new window.Image();
    img.src = bgImage;

    img.onload = () => {
      imgLoaded = true;
      if (ctx) ctx.drawImage(img, 0, 0, width, height);
      drawRipples();
    };
    img.onerror = () => {
      imgLoaded = false;
      if (ctx) {
        ctx.fillStyle = "#0d1f2d";
        ctx.fillRect(0, 0, width, height);
      }
      drawRipples();
    };

    function drawRipples() {
  if (!ctx) return;
  // HER FRAMEDE TEMİZLE!
  if (imgLoaded) {
    ctx.clearRect(0, 0, width, height); // <-- garanti olsun!
    ctx.drawImage(img, 0, 0, width, height);
  } else {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#0d1f2d";
    ctx.fillRect(0, 0, width, height);
  }
      ripples.forEach((r, i) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, 2 * Math.PI);
        ctx.strokeStyle = `rgba(25,214,227,${r.alpha})`;
        ctx.lineWidth = 5;
        ctx.shadowColor = "#19d6e3";
        ctx.shadowBlur = 16;
        ctx.stroke();
        ctx.restore();
        r.r += 2;
        r.alpha -= 0.02;
        if (r.alpha < 0) ripples[i] = null as any;
      });
      ripples = ripples.filter(Boolean);
      animationId = requestAnimationFrame(drawRipples);
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ripples.push({ x, y, r: 0, alpha: 0.38 });
    };

    canvas.addEventListener("mousemove", handleMouseMove);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
    };
    // bgImage değişirse tekrar çalışmalı!
  }, [bgImage]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        zIndex: 1,
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        opacity: 0.44,
        transition: "opacity 0.3s",
      }}
    />
  );
};

export default WaterRippleBackground;
