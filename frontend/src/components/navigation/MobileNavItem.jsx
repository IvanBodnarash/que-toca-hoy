import { NavLink } from "react-router";

export default function MobileNavItem({ children, path }) {
  return (
    <>
      <NavLink
        to={path}
        className={({ isActive }) =>
          [
            "inline-flex h-14 w-14 items-center justify-center",
            "rounded-2xl border-2 transition-all duration-150",
            "transform-gpu will-change-transform",
            isActive
              ? "border-white/80 bg-white/10"
              : "border-transparent hover:border-white/40 hover:bg-white/5 hover:scale-105 active:scale-95",
          ].join(" ")
        }
      >
        {children}
      </NavLink>
    </>
  );
}
