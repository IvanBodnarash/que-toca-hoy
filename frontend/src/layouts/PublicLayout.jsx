import { NavLink, Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/50 backdrop-blur shadow-md w-full fixed z-20">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <NavLink
            to="/welcome"
            className="text-cyan-900 font-bold text-md md:text-3xl main-logo"
          >
            QueTocaHoy
          </NavLink>
          <nav className="flex items-center gap-2">
            <NavLink
              to="aboutUs"
              className="px-3 py-1 md:px-4 md:py-2 text-sm md:text-md text-slate-700 hover:text-slate-500 cursor-pointer transition-all"
            >
              About Us
            </NavLink>
            <NavLink
              to="/auth"
              className="px-3 py-1 md:px-4 md:py-2 text-sm md:text-md rounded-md border border-cyan-800 text-cyan-900 hover:bg-cyan-50 cursor-pointer transition-all"
            >
              Log In
            </NavLink>
            <NavLink
              to="/auth/register"
              className="px-3 py-1 md:px-4 md:py-2 text-sm md:text-md rounded-md bg-cyan-900 text-white hover:bg-cyan-800 cursor-pointer transition-all"
            >
              Sign Up
            </NavLink>
          </nav>
        </div>
      </header>

      {/* Page */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-cyan-900/20 border-slate-200 text-center text-cyan-900 font-bold text-sm py-8">
        © {new Date().getFullYear()}{" "}
        <NavLink
          to="https://github.com/IvanBodnarash/que-toca-hoy"
          target="_blank"
          className="underline hover:text-cyan-800"
        >
          QueTocaHoy
        </NavLink>
      </footer>
    </div>
  );
}
