import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      this.socket.on("connect", () => {
        console.log("✅ Connecté au serveur Socket.IO");
      });

      this.socket.on("disconnect", (reason) => {
        console.log("❌ Déconnecté du serveur:", reason);
      });

      this.socket.on("connect_error", (error) => {
        console.error("Erreur de connexion Socket.IO:", error);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  sendEmergencyAlert(data: {
    category: string;
    subcategory: string;
    timestamp: string;
    location?: { latitude: number; longitude: number };
    userId?: string;
  }) {
    if (this.socket && this.socket.connected) {
      this.socket.emit("emergency:alert", data);
      console.log("🚨 Alerte d'urgence envoyée:", data);
      return true;
    } else {
      console.error("❌ Socket non connecté. Impossible d'envoyer l'alerte.");
      return false;
    }
  }

  onAlertConfirmation(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on("emergency:confirmed", callback);
    }
  }

  onStatusUpdate(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on("emergency:status", callback);
    }
  }

  off(event: string) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

const socketService = new SocketService();

export default socketService;
