// src/lib/socket.ts
import { io, Socket } from "socket.io-client";
import { detectTenantFromHost } from "@/lib/tenant";

let socket: Socket | null = null;

export function getSocket() {
  if (!socket && typeof window !== "undefined") {
    socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5019",
      {
        withCredentials: true,
        transports: ["websocket"],
        autoConnect: false,
        query: {
          tenant: detectTenantFromHost(),
        },
      }
    );
  }
  return socket;
}
