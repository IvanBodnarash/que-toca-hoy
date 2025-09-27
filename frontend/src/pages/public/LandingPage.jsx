import { NavLink, useNavigate } from "react-router-dom";
import { TiShoppingCart } from "react-icons/ti";
import { SiGoogletasks } from "react-icons/si";
import { GiHotMeal } from "react-icons/gi";
import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/app", { replace: true });
    }
  }, [user, loading]);

  return (
    <div className="bg-cyan-950/10">
      {/* Hero */}
      <section className="mx-auto max-w-6xl h-screen px-4 py-16 grid md:grid-cols-2 gap-10 items-center mt-16 md:mt-0">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-cyan-900 leading-tight">
            Plan tasks <br />
            Share recipes <br />
            Buy smarter
          </h1>
          <p className="mt-4 text-slate-700 md:text-lg">
            QueTocaHoy helps households coordinate chores, plan meals, and
            generate a shared buy list — automatically.
          </p>
          <div className="mt-6 flex gap-3">
            <NavLink
              to="/auth/register"
              className="px-8 md:px-22 py-1.5 rounded-lg bg-cyan-900 text-white hover:bg-cyan-800 cursor-pointer"
            >
              Try now
            </NavLink>
            {/* <NavLink
              to="/auth"
              className="px-4 py-2 rounded-lg border border-cyan-900 text-cyan-900 hover:bg-cyan-50 cursor-pointer"
            >
              Log in
            </NavLink> */}
            <p className="mt-3 text-xs text-slate-500">
              No credit card. Free to start.
            </p>
          </div>
        </div>

        <div className="bg-slate-100 rounded-2xl p-8 border border-slate-300 shadow-lg">
          <div className="flex items-center gap-3 text-cyan-900">
            <SiGoogletasks className="shrink-0" size={28} />
            <div>
              <div className="font-semibold">Rotating chores</div>
              <div className="text-sm text-slate-600">
                Assign, rotate, track completion.
              </div>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-3 text-cyan-900">
            <GiHotMeal className="shrink-0" size={30} />
            <div>
              <div className="font-semibold">Recipe templates</div>
              <div className="text-sm text-slate-600">
                Steps + ingredients in one place.
              </div>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-3 text-cyan-900">
            <TiShoppingCart className="shrink-0" size={30} />
            <div>
              <div className="font-semibold">Smart buy list</div>
              <div className="text-sm text-slate-600">
                Auto-aggregated quantities by period.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-t border-slate-200 h-screen mt-16 md:mt-0">
        <div className="mx-auto max-w-6xl px-4 py-12 grid md:grid-cols-3 gap-6">
          {[
            ["Real-time sync", "Everyone sees updates instantly."],
            ["Groups & invites", "Join via PIN, manage members."],
            ["Calendar view", "Daily/weekly rotations made easy."],
          ].map(([title, text]) => (
            <div key={title} className="rounded-xl border border-slate-200 p-6">
              <div className="font-semibold text-cyan-900">{title}</div>
              <div className="text-slate-600 mt-1">{text}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
