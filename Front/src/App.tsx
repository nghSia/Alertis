import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Header } from "./components/header/Header";
import { ClientPage } from "./pages/ClientPage";
import { LoginPage } from "./pages/authentification/LoginPage";
import { RegisterPage } from "./pages/authentification/RegisterPage";
import { ProtectedRoute } from "./components/routes/ProtectedRoute";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
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

          {/* Route pour la Patrouille (plus tard) */}
          <Route
            path="/patrol"
            element={
              <ProtectedRoute requiredRole="patrol">
                <div>Page Patrouille en construction...</div>
              </ProtectedRoute>
            }
          />

          {/* Redirection par défaut */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
