import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import type { JSX } from "react/jsx-runtime";

export const ProtectedRoute = ({
  children,
  requiredRole,
}: {
  children: JSX.Element;
  requiredRole: "client" | "patrol";
}) => {
  const { user, profile, loading } = useAuth();

  // TODO: Composant loading global à faire
  if (loading) return <div>Chargement sécurisé...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (profile?.role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
