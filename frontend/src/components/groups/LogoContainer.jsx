import { NavLink } from "react-router-dom";

export default function LogoContainer({ stacked = true, className = "" }) {
  return (
    <NavLink
      to="/"
      aria-label="Que Toca Hoy — Home"
      className={`select-none ${className} main-logo`}
    >
      {stacked ? (
        <div className="leading-none text-cyan-900 tracking-tight">
          <span className="block text-[22px] md:text-2xl">Que</span>
          <span className="block text-[22px] md:text-2xl">Toca</span>
          <span className="block text-[22px] md:text-2xl bg-gradient-to-r from-cyan-800 to-cyan-500 bg-clip-text text-transparent">
            Hoy
          </span>
        </div>
      ) : (
        <div className="leading-none text-cyan-900 tracking-tight text-2xl md:text-3xl">
          <span>Que</span>
          <span className="mx-1">Toca</span>
          <span className="block text-[22px] md:text-2xl bg-gradient-to-r from-cyan-800 to-cyan-500 bg-clip-text text-transparent">
            Hoy
          </span>
        </div>
      )}
    </NavLink>
  );
}
