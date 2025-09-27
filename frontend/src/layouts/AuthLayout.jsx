import { Outlet, useLocation, Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";

export default function AuthLayout() {
  const { user } = useAuth();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const location = useLocation();

  if (user || token) {
    const next = new URLSearchParams(location.search).get("next");
    return <Navigate to={next || "/app"} replace />;
  }

  return (
    <div className="max-h-full min-h-screen bg-linear-to-tr from-cyan-100 to-slate-400 flex justify-center items-center">
      <Outlet />
    </div>
  );
}
