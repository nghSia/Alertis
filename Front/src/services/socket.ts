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
        // Joindre le canal approprié après la connexion
        this.joinUserChannel();
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

  private joinUserChannel() {
    const userId = sessionStorage.getItem('userId');
    const userRole = sessionStorage.getItem('userRole');
    const patrolType = sessionStorage.getItem('patrolType') || 'police'; // Type pour les canaux: police, samu, firefighter

    if (userId && this.socket) {
      const userData = {
        userId,
        userType: userRole,
        patrolType: userRole === 'patrol' ? patrolType : undefined
      };

      this.socket.emit('user:join', userData);
      console.log("👤 Utilisateur rejoint le canal:", userData);
    }
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
      const clientFirstName = sessionStorage.getItem('userFirstName');
      const clientLastName = sessionStorage.getItem('userLastName');

      const alertData = {
        ...data,
        clientName: `${clientFirstName} ${clientLastName}`
      };

      this.socket.emit("emergency:alert", alertData);
      console.log("🚨 Alerte d'urgence envoyée:", alertData);
      return true;
    } else {
      console.error("❌ Socket non connecté. Impossible d'envoyer l'alerte.");
      return false;
    }
  }

  // Patrouille accepte une alerte
  acceptAlert(alertId: string, patrolType: string) {
    if (this.socket && this.socket.connected) {
      const patrolId = sessionStorage.getItem('userId');
      const patrolName = sessionStorage.getItem('username'); // Nom pour l'affichage

      this.socket.emit('emergency:accept', {
        alertId,
        patrolId,
        patrolType, // Type pour les canaux: police, samu, firefighter
        patrolName
      });
      console.log("✅ Alerte acceptée:", alertId);
      return true;
    } else {
      console.error("❌ Socket non connecté. Impossible d'accepter l'alerte.");
      return false;
    }
  }

  // Patrouille résout une alerte
  resolveAlert(alertId: string, patrolType: string) {
    if (this.socket && this.socket.connected) {

      this.socket.emit('emergency:resolve', {
        alertId,
        patrolType
      });
      console.log("✅ Alerte résolue:", alertId);
      return true;
    } else {
      console.error("❌ Socket non connecté. Impossible de résoudre l'alerte.");
      return false;
    }
  }

  // Écouteurs pour les mises à jour

  onAlertCreated(callback: (data: { alertId: string; status: string }) => void) {
    if (this.socket) {
      this.socket.on("alert:created", callback);
    }
  }

  onAlertAccepted(callback: (data: { alertId: string; patrolId: string; patrolType: string; patrolName: string; status?: string }) => void) {
    if (this.socket) {
      this.socket.on("alert:accepted", callback);
    }
  }

  onAlertResolved(callback: (data: { alertId: string; status?: string }) => void) {
    if (this.socket) {
      this.socket.on("alert:resolved", callback);
    }
  }

  onNewAlert(callback: (data: { id: string; category: string; subcategory: string; location: { latitude: number; longitude: number }; timestamp: string; clientId: string; clientName: string; status: string }) => void) {
    if (this.socket) {
      console.log('🔌 onNewAlert: Écoute de "alert:new"...');
      this.socket.on("alert:new", (data) => {
        console.log('🔌 onNewAlert: Événement reçu!', data);
        callback(data);
      });
    }
  }

  onAlertConfirmation(callback: (data: { alertId?: string }) => void) {
    if (this.socket) {
      this.socket.on("emergency:confirmed", callback);
    }
  }

  onStatusUpdate(callback: (data: { alertId?: string; status?: string }) => void) {
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
