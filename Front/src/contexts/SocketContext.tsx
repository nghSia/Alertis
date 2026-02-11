import { createContext, useContext, useEffect } from "react";
import socketService from "../services/socket";

interface SocketContextType {
  sendEmergencyAlert: (data: {
    category: string;
    subcategory: string;
    timestamp: string;
    location?: { latitude: number; longitude: number };
    userId?: string;
  }) => boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket doit être utilisé dans un SocketProvider");
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  useEffect(() => {
    socketService.connect();

    socketService.onAlertConfirmation((data) => {
      console.log("✅ Alerte confirmée par le serveur:", data);
    });

    socketService.onStatusUpdate((data) => {
      console.log("📊 Mise à jour de statut:", data);
    });

    return () => {
      socketService.off("emergency:confirmed");
      socketService.off("emergency:status");
      socketService.disconnect();
    };
  }, []);

  const sendEmergencyAlert = (data: {
    category: string;
    subcategory: string;
    timestamp: string;
    location?: { latitude: number; longitude: number };
    userId?: string;
  }) => {
    return socketService.sendEmergencyAlert(data);
  };

  return (
    <SocketContext.Provider value={{ sendEmergencyAlert }}>
      {children}
    </SocketContext.Provider>
  );
};
