import { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import FeaturesCarousel from "../../components/ui/FeaturesCarousel";

import {
  LuRefreshCcw,
  LuUsers,
  LuCalendarClock,
  LuShieldCheck,
  LuWifiOff,
  LuShare2,
} from "react-icons/lu";

const featuresList = [
  {
    title: "Real-time sync",
    description:
      "Everyone sees updates instantly - assignments, creations, statuses and all updates across devices.",
    tags: ["Live", "WebSocket"],
    icon: LuRefreshCcw,
  },
  {
    title: "Groups & invites",
    description:
      "Create a household, invite via PIN. Add/remove members safely.",
    tags: ["PIN", "Invites"],
    icon: LuUsers,
  },
  {
    title: "Calendar view",
    description:
      "Visual daily/weekly/monthly rotations, reschedule, unassign, assign to users, plan ahead and auto-rotate chores without conflicts.",
    tags: ["Day", "Week", "Month", "Auto-rotate"],
    icon: LuCalendarClock,
  },
  {
    title: "Recipe Compass integration",
    description:
      "Import recipes in seconds, keep steps and ingredients together, and add them to the plan with one click.",
    tags: ["Import", "Ingredients"],
    icon: LuShare2,
  },
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/app", { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <div className="bg-cyan-950/10">
      {/* Hero */}
      <section className="mx-auto max-w-6xl md:h-screen px-4 py-16 grid md:grid-cols-2 md:gap-10 items-center mt-12 md:mt-0">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-cyan-900 leading-tight">
            Plan tasks <br />
            Add recipes <br />
            Buy smarter
          </h1>
          <p className="mt-4 text-slate-700 md:text-lg">
            QueTocaHoy helps households coordinate chores, plan meals, and
            generate a shared buy list - automatically.
          </p>
          <div className="mt-6 flex gap-3">
            <NavLink
              to="/auth/register"
              className="px-8 md:px-22 py-1.5 rounded-lg bg-cyan-900 text-white hover:bg-cyan-800 cursor-pointer"
            >
              Try now
            </NavLink>
            <p className="mt-3 text-xs text-slate-500">
              No credit card. Free to start.
            </p>
          </div>
        </div>

        <FeaturesCarousel />
      </section>

      {/* Features */}
      <section className="bg-cyan-900 border-t border-slate-200 flex flex-col justify-center">
        <div className="mx-auto max-w-6xl px-4 py-12 mt-18 flex flex-col w-full gap-8">
          {featuresList.map((feature, index) => {
            const Icon = feature.icon;
            const isRight = index % 2 === 1; // 0 - left, 1 - right

            return (
              <div
                key={feature.title}
                className={`group relative rounded-2xl border md:w-4/5 bg-white border-slate-300 p-4 pl-14 hover:-translate-y-0.5 shadow-lg transition cursor-pointer ${
                  isRight ? "md:ml-auto md:text-right md:pr-22" : "md:pl-22"
                } hover:-translate-y-0.5`}
              >
                <div
                  className={`absolute -top-5  ${
                    isRight ? "-right-2 md:-right-5" : "-left-2 md:-left-5"
                  } size-14 md:size-22 rounded-xl bg-white border border-slate-200 shadow-md overflow-hidden flex items-center justify-center`}
                >
                  <Icon className="text-cyan-700 size-8 md:size-14" />
                </div>

                {/* Card Content */}
                <div className="font-semibold text-cyan-900">
                  {feature.title}
                </div>
                <div className="text-slate-600 mt-1">{feature.description}</div>

                {/* <div className="rounded-xl border border-slate-200 p-6 pl-12"> */}
                {feature.tags.length ? (
                  <div
                    className={`mt-3 flex flex-wrap gap-2 ${
                      isRight ? "md:justify-end" : ""
                    }`}
                  >
                    {feature.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[11px] px-2 py-1 rounded-full bg-cyan-900/20 text-slate-700"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null}
                {/* </div> */}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
