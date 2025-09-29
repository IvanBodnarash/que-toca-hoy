import { Outlet, useLocation, Navigate, NavLink } from "react-router";
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
    <div className="max-h-full py-4 min-h-screen bg-linear-to-tr from-cyan-100 to-slate-400 flex justify-center items-center">
      <div className="w-full flex flex-col justify-center items-center">
        <Outlet />
        <p className="mt-4 text-slate-700">Back to <NavLink to="/" className="underline text-cyan-800">home page</NavLink></p>
      </div>
    </div>
  );
}
