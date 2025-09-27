import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function RequireAuth() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-6 text-slate-500 animate-pulse">Loading...</div>;
  }
  if (!user) {
    return <Navigate to="/welcome" replace />;
  }
  return <Outlet />;

  // const token =
  //   typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // if (loading) return <div className="p-4">Loading...</div>;

  // return user || token ? <Outlet /> : <Navigate to="/auth" replace />;
}
