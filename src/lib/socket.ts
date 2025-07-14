import { io } from "socket.io-client";
import { getTenantSlug } from "@/lib/tenant";

const socket = io(
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5019",
  {
    withCredentials: true,
    transports: ["websocket"],
    autoConnect: false,
    query: {
      tenant: getTenantSlug(),
    },
  }
);
export default socket;

