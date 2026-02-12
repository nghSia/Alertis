import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyRequestsPage.css";

type Request = {
  id: string;
  categoryName: string;
  subcategoryName: string;
  timestamp: string;
  status: "pending" | "accepted" | "completed";
};

export const MyRequestsPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Récupérer les demandes depuis l'API/Supabase
    // Pour l'instant, données de démonstration
    const mockRequests: Request[] = [
      {
        id: "1",
        categoryName: "Santé",
        subcategoryName: "Malaise",
        timestamp: new Date(Date.now() - 3600000).toISOString(), // Il y a 1h
        status: "pending",
      },
      {
        id: "2",
        categoryName: "Danger",
        subcategoryName: "Agression",
        timestamp: new Date(Date.now() - 86400000).toISOString(), // Il y a 1 jour
        status: "completed",
      },
    ];

    setTimeout(() => {
      setRequests(mockRequests);
      setIsLoading(false);
    }, 500);
  }, []);

  const handleBackHome = () => {
    navigate("/");
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "En attente";
      case "accepted":
        return "Acceptée";
      case "completed":
        return "Terminée";
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "pending":
        return "status-pending";
      case "accepted":
        return "status-accepted";
      case "completed":
        return "status-completed";
      default:
        return "";
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 24) {
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `Aujourd'hui à ${hours}:${minutes}`;
    } else if (diffDays === 1) {
      return "Hier";
    } else {
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      return `${day}/${month}/${date.getFullYear()}`;
    }
  };

  return (
    <div className="my-requests-page">
      <div className="my-requests-container">
        <div className="requests-header">
          <h1 className="requests-title">Mes demandes</h1>
          <button className="back-home-btn" onClick={handleBackHome}>
            Retour
          </button>
        </div>

        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Chargement...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <svg
              className="empty-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
            <h2>Aucune demande</h2>
            <p>Vous n'avez pas encore envoyé de demande d'aide.</p>
            <button className="create-request-btn" onClick={handleBackHome}>
              Créer une demande
            </button>
          </div>
        ) : (
          <div className="requests-list">
            {requests.map((request) => (
              <div key={request.id} className="request-card">
                <div className="request-header-info">
                  <div className="request-main-info">
                    <h3 className="request-category">
                      {request.categoryName} → {request.subcategoryName}
                    </h3>
                    <p className="request-date">
                      {formatDate(request.timestamp)}
                    </p>
                  </div>
                  <span
                    className={`request-status ${getStatusClass(request.status)}`}
                  >
                    {getStatusLabel(request.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
