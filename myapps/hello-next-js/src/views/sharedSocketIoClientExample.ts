import { io, Socket } from "socket.io-client";
import { WebSocketServerPath } from "@/lib/app/socketIoExample";

let socket: Socket;

export function getSocket() {
  if (!socket) {
    socket = io({
      path: WebSocketServerPath,
    });
  }

  return socket;
}
