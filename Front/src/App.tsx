import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Header } from "./components/header/Header";
import { ClientPage } from "./pages/ClientPage";
import { AlertStatusPage } from "./pages/AlertStatusPage";
import { MyRequestsPage } from "./pages/MyRequestsPage";
import { LoginPage } from "./pages/authentification/LoginPage";
import { RegisterPage } from "./pages/authentification/RegisterPage";
import PatrolDashboard from "./pages/PatrolDashboard";
import { ProtectedRoute } from "./components/routes/ProtectedRoute";
import "./App.css";

function AppContent() {
  const location = useLocation();
  const isAuthPage = ["/login", "/register"].includes(location.pathname);

  return (
    <div className="App">
      {!isAuthPage && <Header />}
      <Routes>
        {/* Route publique */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Route protégée pour le Client */}
        <Route
          path="/"
          element={
            <ProtectedRoute requiredRole="client">
              <ClientPage />
            </ProtectedRoute>
          }
        />

        {/* Route pour le statut de l'alerte */}
        <Route
          path="/alert-status"
          element={
            <ProtectedRoute requiredRole="client">
              <AlertStatusPage />
            </ProtectedRoute>
          }
        />

        {/* Route pour les demandes de l'utilisateur */}
        <Route
          path="/my-requests"
          element={
            <ProtectedRoute requiredRole="client">
              <MyRequestsPage />
            </ProtectedRoute>
          }
        />

        {/* Route pour la Patrouille */}
        <Route
          path="/patrol"
          element={
            <ProtectedRoute requiredRole="patrol">
              <PatrolDashboard />
            </ProtectedRoute>
          }
        />

        {/* Redirection par défaut */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
