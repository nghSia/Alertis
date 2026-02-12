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

    /**
     * Join chanel
     * @private
     */
  private joinUserChannel() {
    const userId = sessionStorage.getItem('userId');
    const userRole = sessionStorage.getItem('userRole');
    const patrolType = sessionStorage.getItem('patrolType');

    if (userId && this.socket) {
      const userData = {
        userId,
        userType: userRole,
        patrolType: userRole === 'patrol' ? patrolType : undefined
      };

      this.socket.emit('user:join', userData);
    }
  }


  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  sendEmergencyAlert(data: {
    category: string;
    subcategory: string;
    timestamp: string;
    location?: { latitude: number; longitude: number };
    userId?: string;
  }): Promise<string | false> {
    return new Promise((resolve) => {
      if (!this.socket || !this.socket.connected) {
        console.error("❌ Socket non connecté. Impossible d'envoyer l'alerte.");
        resolve(false);
        return;
      }

      const clientFirstName = sessionStorage.getItem('userFirstName');
      const clientLastName = sessionStorage.getItem('userLastName');

      const alertData = {
        ...data,
        clientName: `${clientFirstName} ${clientLastName}`
      };

      const handleAlertCreated = (response: { alertId: string; status: string }) => {
        console.log("✅ Alerte créée avec ID:", response.alertId);
        resolve(response.alertId);
      };

      this.socket.off('alert:created');
      this.socket.once('alert:created', handleAlertCreated);

      this.socket.emit("emergency:alert", alertData);
      console.log("🚨 Alerte d'urgence envoyée:", alertData);
    });
  }

  acceptAlert(alertId: string, patrolType: string) {
    if (this.socket && this.socket.connected) {
      const patrolId = sessionStorage.getItem('userId');
      const patrolName = sessionStorage.getItem('username');

      this.socket.emit('emergency:accept', {
        alertId,
        patrolId,
        patrolType,
        patrolName
      });
      console.log("✅ Alerte acceptée:", alertId);
      return true;
    } else {
      console.error("❌ Socket non connecté. Impossible d'accepter l'alerte.");
      return false;
    }
  }

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
      this.socket.on("alert:new", (data) => {
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

  onAlertStatusUpdate(callback: (data: { alertId: string; status: string }) => void) {
    if (!this.socket) return;

    console.log('🔌 onAlertStatusUpdate: Enregistrement du listener');

    const listener = (data: { alertId: string; status: string }) => {
      console.log('🔌 onAlertStatusUpdate: Événement reçu!', data);
      callback(data);
    };

    this.socket.off("alert:status-update");

    this.socket.on("alert:status-update", listener);
  }

  off(event: string) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

const socketService = new SocketService();

export default socketService;
