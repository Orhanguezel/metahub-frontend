"use client";

import { useRef, useEffect, useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import type { IGallery, GalleryCategory } from "@/modules/gallery/types";

const SLIDER_CATEGORY_SLUG = "maintenance";
const FALLBACK_IMAGE = "/img/robot_reading.png";

// Basit ripple durumu
type Ripple = { x: number; y: number; r: number; alpha: number };

const WaterRippleBackground = () => {
  const { gallery } = useAppSelector((state) => state.gallery);
  const { categories } = useAppSelector((state) => state.galleryCategory);

  // Dinamik arkaplan (kategori: maintenance -> ilk görsel)
  const bgImage = useMemo(() => {
    const cat = categories?.find((c: GalleryCategory) => c.slug === SLIDER_CATEGORY_SLUG);
    const catId = cat?._id;
    const heroGallery: IGallery | undefined = gallery?.find((gallery: IGallery) =>
      typeof gallery.category === "string"
        ? gallery.category === catId
        : gallery.category?._id === catId
    );
    return (
      heroGallery?.images?.[0]?.webp ||
      heroGallery?.images?.[0]?.url ||
      heroGallery?.images?.[0]?.thumbnail ||
      FALLBACK_IMAGE
    );
  }, [categories, gallery]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // --- Ölçülendirme (retina desteği) ---
    const state = {
      width: 0,
      height: 0,
      dpr: Math.min(window.devicePixelRatio || 1, 2), // performans için 2 ile sınırla
      ripples: [] as Ripple[],
      img: new Image(),
      imgLoaded: false,
      rafId: 0 as number,
      lastTs: 0,
      // ayarlar
      rippleSpeed: 180, // px/sn
      alphaDecay: 0.7, // sn başına alpha azalması
      maxRipples: 220,
      lineWidth: 4,
      color: "rgba(25,214,227,1)",
      overlay: "rgba(0,0,0,0.30)",
      throttleMs: 28,
      lastPointerTs: 0,
    };

    const resize = () => {
      state.width = window.innerWidth;
      state.height = window.innerHeight;

      // canvas boyutu (dpr ölçekli)
      canvas.width = Math.floor(state.width * state.dpr);
      canvas.height = Math.floor(state.height * state.dpr);
      canvas.style.width = `${state.width}px`;
      canvas.style.height = `${state.height}px`;

      // ctx'i scale et
      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset
      ctx.scale(state.dpr, state.dpr);

      // yeniden çizim
      drawBase();
    };

    const drawBase = () => {
      // Arkaplan görseli veya düz renk
      if (state.imgLoaded) {
        ctx.clearRect(0, 0, state.width, state.height);
        ctx.drawImage(state.img, 0, 0, state.width, state.height);
      } else {
        ctx.clearRect(0, 0, state.width, state.height);
        ctx.fillStyle = "#0d1f2d";
        ctx.fillRect(0, 0, state.width, state.height);
      }
      // hafif koyu overlay
      ctx.fillStyle = state.overlay;
      ctx.fillRect(0, 0, state.width, state.height);
    };

    // --- Görsel yükle ---
    let cancelled = false;
    state.img.crossOrigin = "anonymous"; // Cloudinary için sorun çıkarmaz
    state.img.src = bgImage;

    const onImgLoad = async () => {
      if (cancelled) return;
      state.imgLoaded = true;
      try {
        // decode varsa yırtılmayı azaltır
        if (state.img.decode) await state.img.decode();
      } catch {}
      drawBase();
    };

    const onImgError = () => {
      if (cancelled) return;
      state.imgLoaded = false;
      drawBase();
    };

    state.img.addEventListener("load", onImgLoad);
    state.img.addEventListener("error", onImgError);

    // --- Animasyon döngüsü (delta-time) ---
    const tick = (ts: number) => {
      const dt = state.lastTs ? (ts - state.lastTs) / 1000 : 0;
      state.lastTs = ts;

      // baz katman
      drawBase();

      // ripples
      ctx.save();
      ctx.lineWidth = state.lineWidth;
      for (let i = 0; i < state.ripples.length; i++) {
        const r = state.ripples[i];
        // yarıçap ve alpha güncelle
        r.r += state.rippleSpeed * dt;
        r.alpha -= state.alphaDecay * dt;

        if (r.alpha <= 0) continue;

        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(25,214,227,${Math.max(r.alpha, 0)})`;
        ctx.shadowColor = "#19d6e3";
        ctx.shadowBlur = 14;
        ctx.stroke();
      }
      ctx.restore();

      // ömrü bitenleri temizle
      state.ripples = state.ripples.filter((r) => r.alpha > 0 && r.r < Math.max(state.width, state.height) * 1.1);

      state.rafId = requestAnimationFrame(tick);
    };

    // --- Ripple ekleme ---
    const addRipple = (x: number, y: number, alpha = 0.38) => {
      if (state.ripples.length > state.maxRipples) {
        state.ripples.splice(0, state.ripples.length - state.maxRipples);
      }
      state.ripples.push({ x, y, r: 0, alpha });
    };

    // pointer move / touch
    const handlePointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - state.lastPointerTs < state.throttleMs) return;
      state.lastPointerTs = now;
      const rect = canvas.getBoundingClientRect();
      addRipple(e.clientX - rect.left, e.clientY - rect.top, 0.34);
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      addRipple(e.clientX - rect.left, e.clientY - rect.top, 0.48);
    };

    const handleTouchStart = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        addRipple(t.clientX - rect.left, t.clientY - rect.top, 0.44);
      }
    };

    // başlat
    resize();
    state.rafId = requestAnimationFrame(tick);

    // eventler
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointermove", handlePointerMove, { passive: true });
    canvas.addEventListener("click", handleClick, { passive: true });
    canvas.addEventListener("touchstart", handleTouchStart, { passive: true });

    // cleanup
    return () => {
      cancelled = true;
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("click", handleClick);
      canvas.removeEventListener("touchstart", handleTouchStart);
      cancelAnimationFrame(state.rafId);
      state.img.removeEventListener("load", onImgLoad);
      state.img.removeEventListener("error", onImgError);
    };
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
        display: "block",
      }}
      aria-hidden="true"
    />
  );
};

export default WaterRippleBackground;
