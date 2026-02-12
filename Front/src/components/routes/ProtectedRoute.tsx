import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import type { JSX } from "react/jsx-runtime";

export const ProtectedRoute = ({
  children,
}: {
  children: JSX.Element;
}) => {
  const { user, loading } = useAuth();

  // TODO: Composant loading global à faire
  if (loading) return <div>Chargement sécurisé...</div>;

  if (!user) return <Navigate to="/login" replace />;

  return children;
};
