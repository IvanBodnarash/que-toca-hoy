import { NavLink, useLocation } from "react-router-dom";

export default function NotFoundPage() {
  const { pathname } = useLocation();

  return (
    <div className="flex justify-center items-center h-screen p-6 text-center bg-cyan-800/10">
      <div className="max-w-md">
        <h1 className="text-7xl font-bold text-cyan-900">404</h1>
        <p className="mt-3 text-slate-700">
          Page <span className="font-mono">{pathname}</span> not found.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <NavLink
            to="/"
            className="px-4 py-2 rounded-md bg-cyan-900 text-white hover:bg-cyan-800 transition"
          >
            Home
          </NavLink>
          <NavLink
            to="/auth"
            className="px-4 py-2 rounded-md border border-slate-400 bg-slate-100 hover:bg-white transition"
          >
            Login
          </NavLink>
        </div>
      </div>
    </div>
  );
}
