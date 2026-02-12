import "./Header.css";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";

export function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  const username = localStorage.getItem("username") || user?.email || "Utilisateur";
  const userRole = localStorage.getItem("userRole");

  return (
    <header className="navbar">
      <div className="navbar-logo">
        <p>🚨 Alertis</p>
      </div>

      {user && (
        <div className="user-status">
          <div className="user-info">
            <User size={20} />
            <span className="user-name">
              {username}
            </span>
            <span className="user-role">
              {userRole === "patrol" ? "Patrouille" : "Client"}
            </span>
          </div>
          <button className="logout-button" onClick={handleLogout} title="Se déconnecter">
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      )}
    </header>
  );
}
