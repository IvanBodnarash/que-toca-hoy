import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function RequireAuth() {
  const { user, loading } = useAuth();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (loading) return <div className="p-4">Loading...</div>;

  return user || token ? <Outlet /> : <Navigate to="/auth" replace />;
}
