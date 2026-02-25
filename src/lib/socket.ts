// socket.ts - UBICACIÓN: /src/lib/socket.ts
import { io, Socket } from 'socket.io-client';

// Creamos una única instancia del socket para toda la aplicación
// Forzamos 'websocket' para evitar errores de polling y 404
const socket: Socket = io({
  transports: ['websocket'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5
});

export default socket;