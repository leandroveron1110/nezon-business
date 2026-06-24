// lib/socketManager.ts
import { io, Socket } from "socket.io-client";

type BusinessSocketMap = Record<string, Socket>;

const sockets: BusinessSocketMap = {};


export function getSocketForBusiness(businessId: string): Socket {
  if (!businessId) throw new Error("businessId es requerido para crear socket");

  // Si ya existe, devolvemos el mismo socket
  if (sockets[businessId]) {
    const socket = sockets[businessId];
    if (!socket.connected) {
      socket.connect();
    }
    return socket;
  }

  // Crear nueva conexión para este negocio
  const socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
    transports: ["websocket"],
    autoConnect: true,
  });

  socket.on("connect", () => {
    socket.emit("join_role", { role: "business", id: businessId });
  });

  sockets[businessId] = socket;
  return socket;
}

/**
 * Devuelve todos los sockets activos.
 */
export function getAllBusinessSockets(): Socket[] {
  return Object.values(sockets);
}

/**
 * Desconecta el socket de un negocio específico (si realmente se desea).
 */
export function disconnectSocketForBusiness(businessId: string) {
  const socket = sockets[businessId];
  if (socket) {
    socket.disconnect();
    delete sockets[businessId];
  }
}

/**
 * Desconecta y limpia todos los sockets (por ejemplo, al cerrar sesión).
 */
export function disconnectAllSockets() {
  Object.entries(sockets).forEach(([id, socket]) => {
    socket.disconnect();
    // console.log(`🧹 Socket del negocio ${id} desconectado`);
  });
  Object.keys(sockets).forEach((key) => delete sockets[key]);
}
