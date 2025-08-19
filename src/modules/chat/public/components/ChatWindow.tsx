// frontend/modules/chat/components/ChatWindow.tsx
"use client";
import { useEffect } from "react";
import { useOsNotification } from "@/hooks/useOsNotification";

export default function ChatWindow() {
  const { showOSNotification } = useOsNotification();

  useEffect(() => {
    // Örnek kullanım:
    showOSNotification("Yeni bir mesajınız var");
  }, [showOSNotification]);

  return null;
}

