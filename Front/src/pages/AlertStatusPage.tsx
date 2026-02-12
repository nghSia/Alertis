import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import socketService from "../services/socket";
import "./AlertStatusPage.css";

type AlertData = {
  categoryName: string;
  subcategoryName: string;
  timestamp: string;
  alertId?: string;
};

type AlertStatus = 'pending' | 'in_progress' | 'resolved';

const STATUS_LABELS: Record<AlertStatus, string> = {
  'pending': 'En attente',
  'in_progress': 'En cours',
  'resolved': 'Terminée'
};

const STATUS_MESSAGES: Record<AlertStatus, string> = {
  'pending': 'Votre demande est en cours de traitement. Les secours vont être contactés.',
  'in_progress': 'Les secours sont en route ou en intervention sur place.',
  'resolved': 'L\'intervention est terminée. Merci de nous avoir contactés.'
};

export const AlertStatusPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const alertData = location.state as AlertData | null;
  const [status, setStatus] = useState<AlertStatus>('pending');
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    if (!alertData) {
      navigate("/", { replace: true });
    } else {
      const date = new Date(alertData.timestamp);
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      setCurrentTime(`${hours}:${minutes}`);
    }
  }, [alertData, navigate]);

  useEffect(() => {
    const socket = socketService.connect();

    const userId = sessionStorage.getItem('userId');

    const onConnect = () => {
      socket?.emit('user:join', {
        userId: userId,
        userType: 'client'
      });
    };

    if (socket) {
      if (socket.connected) {
        onConnect();
      } else {
        socket.on('connect', onConnect);
      }
    }

    return () => {
      if (socket) {
        socket.off('connect', onConnect);
      }
    };
  }, []);

  useEffect(() => {
    if (!alertData?.alertId) return;

    const handleStatusUpdate = (data: { alertId: string; status: string }) => {
      if (data.alertId === alertData.alertId) {
        setStatus(() => {
          return data.status as AlertStatus;
        });

        const now = new Date();
        const hours = now.getHours().toString().padStart(2, "0");
        const minutes = now.getMinutes().toString().padStart(2, "0");
        setCurrentTime(`${hours}:${minutes}`);
      }
    };

    socketService.onAlertStatusUpdate(handleStatusUpdate);

    return () => {
      socketService.off('alert:status-update');
    };
  }, [alertData?.alertId]);

  /** Redirect user to home page for a new request */
  const handleNewRequest = () => {
    navigate("/", { replace: true });
  };

  if (!alertData) {
    return null;
  }

  return (
    <div className="alert-status-page">
      <div className="alert-status-container">
        <div className={`alert-card status-${status}`}>
          <div className="alert-header">
            <h1 className="alert-title">Alerte envoyée</h1>
            <span className="alert-time">{currentTime}</span>
          </div>

          <div className="alert-info">
            <p className="alert-category">
              {alertData.categoryName} → {alertData.subcategoryName}
            </p>
          </div>

          <div className="alert-status">
            <svg
              className="status-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span className="status-text">Statut : {STATUS_LABELS[status]}</span>
          </div>

          <p className="alert-message">
            {STATUS_MESSAGES[status]}
          </p>
        </div>

        <button className="new-request-btn" onClick={handleNewRequest}>
          Nouvelle demande
        </button>
      </div>
    </div>
  );
};
