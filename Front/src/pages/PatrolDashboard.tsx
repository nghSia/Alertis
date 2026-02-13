import {
  AlertCircle,
  Calendar,
  CheckCircle,
  MapPin,
  User,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MapComponent } from "../components/map/Map";
import type { Alert as PatrolAlert } from "../services/PatrolService";
import { getAlertsByStatus } from "../services/PatrolService";
import socketService from "../services/socket";
import { supabase } from "../integrations/supabase/client";
import { useAuth } from "../contexts/AuthContext";
import "./PatrolDashboard.css";

/** Dashboard tab types */
type TabType = "pending" | "accepted" | "resolved";

/** Alert data structure for patrol dashboard */
export interface Alert {
  id: string;
  category: string;
  subcategory: string;
  clientId: string;
  clientName: string;
  created_at: string;
  timestamp: string;
  location: { latitude: number; longitude: number };
  status: "pending" | "accepted" | "resolved";
  patrolId?: string;
  patrolName?: string;
}

/** Display labels for each patrol type */
const PATROL_LABELS: Record<string, string> = {
  samu: "SAMU",
  police: "Police",
  firefighter: "Pompiers",
};

/** Patrol dashboard - displays and manages alerts in real-time via WebSocket */
const PatrolDashboard = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [patrolLocation, setPatrolLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const patrolWatchIdRef = useRef<number | null>(null);

  const patrolId = user?.id || null;
  const patrolType = profile?.type || null;
  const patrolName = profile?.name_patrols || null;

  useEffect(() => {
    if (!patrolType) {
      return;
    }

    socketService.connect();
    socketService.joinChannel("patrol", patrolType);

    const loadAlerts = async () => {
      try {
          const pendingAlerts = await getAlertsByStatus(patrolType, 'pending');
          const acceptedAlerts = await getAlertsByStatus(patrolType, 'accepted');
          const resolvedAlerts = await getAlertsByStatus(patrolType, 'resolved');

          const allAlerts = [...pendingAlerts, ...acceptedAlerts, ...resolvedAlerts].map((alert: PatrolAlert) => ({
              id: alert.id,
              category: alert.category_name,
              subcategory: alert.subcategory_name,
              clientId: "",
              clientName: `${alert.client_first_name} ${alert.client_last_name}`,
              created_at: alert.created_at,
              timestamp: alert.created_at,
              location: {
                latitude: alert.latitude || 0,
                longitude: alert.longitude || 0,
              },
              status: alert.status as "pending" | "accepted" | "resolved",
              patrolId: alert.patrol_id,
          }));

        setAlerts(allAlerts);
      } catch (error) {
        setError("Impossible de charger les alertes");
      }
    };

    loadAlerts();
  }, [patrolType]);

  useEffect(() => {
    socketService.onNewAlert((alertData) => {
      const newAlert: Alert = {
        id: alertData.id,
        category: alertData.category,
        subcategory: alertData.subcategory,
        clientId: alertData.clientId,
        clientName: alertData.clientName,
        created_at: alertData.timestamp,
        timestamp: alertData.timestamp,
        location: alertData.location,
        status: alertData.status as "pending" | "accepted" | "resolved",
      };

      setAlerts((prev) => [newAlert, ...prev]);
    });

    socketService.onAlertAccepted((data) => {
      setAlerts((prev) => {
        if (data.patrolId === patrolId) {
          return prev.map((alert) =>
            alert.id === data.alertId
              ? {
                  ...alert,
                  status: "accepted",
                  patrolId: data.patrolId,
                  patrolName: data.patrolName,
                }
              : alert,
          );
        }
        // Sinon, on retire l'alerte de la liste (acceptée par une autre patrouille)
        return prev.filter((alert) => alert.id !== data.alertId);
      });
    });

    socketService.onAlertResolved((data) => {
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === data.alertId ? { ...alert, status: "resolved" } : alert,
        ),
      );
    });

    return () => {
      socketService.off("alert:new");
      socketService.off("alert:accepted");
      socketService.off("alert:resolved");
    };
  }, [patrolType]);

  const filteredAlerts = alerts.filter((alert) => alert.status === activeTab);

  const pendingCount = alerts.filter(
    (alert) => alert.status === "pending",
  ).length;
  const acceptedCount = alerts.filter(
    (alert) => alert.status === "accepted",
  ).length;
  const resolvedCount = alerts.filter(
    (alert) => alert.status === "resolved",
  ).length;

  /**
   * Handle accept alert
   * @param alert - L'alerte à accepter
   */
  const handleAcceptAlert = (alert: Alert) => {
    const success = socketService.acceptAlert(alert.id, patrolType || "police");
    if (!success) {
      setError("Impossible d'accepter l'alerte. Vérifiez votre connexion.");
    }
  };

  /** Mark an alert as resolved and notify server via WebSocket */
  const handleResolveAlert = (alert: Alert) => {
    const success = socketService.resolveAlert(
      alert.id,
      patrolType || "police",
    );
    if (!success) {
      setError("Impossible de résoudre l'alerte. Vérifiez votre connexion.");
    }
  };

  const updatePatrolLocation = async (location: {
    latitude: number;
    longitude: number;
  }) => {
    if (!patrolId) {
      return;
    }

    const { error } = await supabase
      .from("patrols")
      .update({
        current_location: { lat: location.latitude, lng: location.longitude },
      })
      .eq("id", patrolId);

    if (error) {
      console.error("Erreur update patrol location:", error.message);
    }
  };

  const startPatrolLocationWatch = () => {
    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas supportée sur cet appareil.");
      return;
    }

    if (patrolWatchIdRef.current !== null) {
      return;
    }

    patrolWatchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const nextLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setPatrolLocation(nextLocation);
        updatePatrolLocation(nextLocation);
      },
      () => {
        setError("Impossible d'obtenir la localisation de la patrouille.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 10000,
      },
    );
  };

  const stopPatrolLocationWatch = () => {
    if (patrolWatchIdRef.current === null) {
      return;
    }

    navigator.geolocation.clearWatch(patrolWatchIdRef.current);
    patrolWatchIdRef.current = null;
  };

  useEffect(() => {
    startPatrolLocationWatch();

    return () => {
      stopPatrolLocationWatch();
    };
  }, []);

  return (
    <div className="patrol-dashboard-container">
      <header className="patrol-header">
        <h1>
          {patrolType ? PATROL_LABELS[patrolType] : "Patrouille"} - Tableau de
          bord
        </h1>
        <p className="patrol-info">
          Bienvenue {patrolName} • ID: {patrolId}
        </p>
      </header>

      {error && (
        <div className="error-banner">
          <XCircle size={20} />
          <span>{error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="patrol-tabs">
        <button
          onClick={() => setActiveTab("pending")}
          className={`tab-button ${activeTab === "pending" ? "active" : ""}`}
        >
          <AlertCircle size={20} />
          Nouvelles alertes
          {pendingCount > 0 && <span className="badge">{pendingCount}</span>}
        </button>
        <button
          onClick={() => setActiveTab("accepted")}
          className={`tab-button ${activeTab === "accepted" ? "active" : ""}`}
        >
          <CheckCircle size={20} />
          Acceptées
          {acceptedCount > 0 && <span className="badge">{acceptedCount}</span>}
        </button>
        <button
          onClick={() => setActiveTab("resolved")}
          className={`tab-button ${activeTab === "resolved" ? "active" : ""}`}
        >
          <CheckCircle size={20} />
          Résolues
          {resolvedCount > 0 && <span className="badge">{resolvedCount}</span>}
        </button>
      </div>

      <div className="alerts-list">
        {filteredAlerts.length === 0 ? (
          <div className="empty-state">
            <AlertCircle size={48} />
            <p>Aucune alerte pour le moment</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div key={alert.id} className={`alert-card alert-${alert.status}`}>
              <div className="alert-header">
                <div className="alert-title">
                  <h3>{alert.category}</h3>
                  <span className="subcategory">{alert.subcategory}</span>
                </div>
                <span className={`status-badge status-${alert.status}`}>
                  {alert.status === "pending" && "⏳ En attente"}
                  {alert.status === "accepted" && "✅ Acceptée"}
                  {alert.status === "resolved" && "✔️ Résolue"}
                </span>
              </div>

              <div className="alert-details">
                <div className="detail-row">
                  <User size={18} />
                  <div>
                    <span className="detail-label">Client</span>
                    <span className="detail-value">{alert.clientName}</span>
                  </div>
                </div>

                <div className="detail-row">
                  <Calendar size={18} />
                  <div>
                    <span className="detail-label">Date du signalement</span>
                    <span className="detail-value">
                      {new Date(alert.timestamp).toLocaleString("fr-FR")}
                    </span>
                  </div>
                </div>

                <div className="detail-row">
                  <MapPin size={18} />
                  <div>
                    <span className="detail-label">Position</span>
                    <div className="patrol-map-container">
                      <MapComponent
                        customerLocalisation={alert.location}
                        patrolLocalisation={patrolLocation ?? undefined}
                      ></MapComponent>
                    </div>
                  </div>
                </div>
              </div>

              {alert.status === "accepted" && alert.patrolName && (
                <div className="alert-info">
                  <p>
                    Acceptée par: <strong>{alert.patrolName}</strong>
                  </p>
                </div>
              )}

              <div className="alert-actions">
                {activeTab === "pending" && (
                  <button
                    onClick={() => handleAcceptAlert(alert)}
                    className="btn btn-accept"
                  >
                    ✅ Accepter l'intervention
                  </button>
                )}
                {activeTab === "accepted" && (
                  <button
                    onClick={() => handleResolveAlert(alert)}
                    className="btn btn-resolve"
                  >
                    ✔️ Marquer comme résolue
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export { PatrolDashboard as default };
