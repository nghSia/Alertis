import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import "./AlertStatusPage.css";

type AlertData = {
  categoryName: string;
  subcategoryName: string;
  timestamp: string;
};

export const AlertStatusPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const alertData = location.state as AlertData | null;

  useEffect(() => {
    if (!alertData) {
      navigate("/", { replace: true });
    }
  }, [alertData, navigate]);

  const currentTime = alertData
    ? (() => {
        const date = new Date(alertData.timestamp);
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        return `${hours}:${minutes}`;
      })()
    : "";

  const handleNewRequest = () => {
    navigate("/", { replace: true });
  };

  if (!alertData) {
    return null;
  }

  return (
    <div className="alert-status-page">
      <div className="alert-status-container">
        <div className="alert-card">
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
            <span className="status-text">Statut : En attente</span>
          </div>

          <p className="alert-message">
            Votre demande est en cours de traitement. Les secours vont être
            contactés.
          </p>
        </div>

        <button className="new-request-btn" onClick={handleNewRequest}>
          Nouvelle demande
        </button>
      </div>
    </div>
  );
};
