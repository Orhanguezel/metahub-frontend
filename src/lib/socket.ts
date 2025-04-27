import { io } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5015", {
  withCredentials: true,
  transports: ["websocket"],
  autoConnect: false, // 👈 bağlantı kontrolü ChatBox içinde yapılır
});

export default socket;
