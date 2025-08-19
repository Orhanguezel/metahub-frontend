"use client";

import { useCallback } from "react";
import { useI18nNamespace } from "@/hooks/useI18nNamespace";
import translations from "@/modules/shared/locales/navbar";

/** Basit HTTPS/localhost kontrolü */
const isSecure = () =>
  (typeof window !== "undefined") &&
  (window.isSecureContext || location.hostname === "localhost");

export function useOsNotification() {
  const { t } = useI18nNamespace("navbar", translations);

  const canUse =
    typeof window !== "undefined" &&
    "Notification" in window &&
    isSecure();

  /** İzni kullanıcı etkileşimiyle çağırın (örn. buton onClick) */
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!canUse) return "denied";
    if (Notification.permission === "granted" || Notification.permission === "denied") {
      return Notification.permission;
    }
    // Birçok tarayıcı izin istemeyi user-gesture içinde şart koşar
    return await Notification.requestPermission();
  }, [canUse]);

  /**
   * OS bildirimi göster.
   * @param text Gövde metni
   * @param opts  whileVisible: sekme görünürken de göster
   */
  const showOSNotification = useCallback(
    async (text: string, opts?: { whileVisible?: boolean; iconUrl?: string; tag?: string }) => {
      if (!canUse) return false;

      // Sekme görünürken engelleme (varsayılan davranışınız korunuyor)
      if (!opts?.whileVisible && typeof document !== "undefined" && document.visibilityState === "visible") {
        return false;
      }

      const title = t("support.notification_title", "Yeni mesajınız var");
      const icon = opts?.iconUrl ?? "/icons/icon-192.png"; // PWA ikonunuz
      const tag = opts?.tag ?? "metahub-msg";

      // İzin yoksa iste
      if (Notification.permission !== "granted") {
        const p = await Notification.requestPermission();
        if (p !== "granted") return false;
      }

      try {
        new Notification(title, { body: text, icon, tag });
        return true;
      } catch {
        // Fallback: Service Worker üzerinden göster (uygunsa)
        try {
          const reg = await navigator.serviceWorker?.getRegistration();
          if (reg) {
            await reg.showNotification(title, { body: text, icon, tag });
            return true;
          }
        } catch {}
      }
      return false;
    },
    [canUse, t]
  );

  return { canUse, requestPermission, showOSNotification };
}
