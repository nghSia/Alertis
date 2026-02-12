import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import type { JSX } from "react/jsx-runtime";

export const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: JSX.Element;
  allowedRoles?: ("client" | "patrol")[];
}) => {
  const { user, role, loading } = useAuth();

  if (loading) return <div>Chargement sécurisé...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to={role === "client" ? "/" : "/patrol"} replace />;
  }

  return children;
};
