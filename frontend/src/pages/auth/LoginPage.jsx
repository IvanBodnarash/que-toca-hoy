import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { BiShow, BiHide } from "react-icons/bi";
import { useAuth } from "../../context/AuthContext";
import { login } from "../../services/authService";

export default function LoginPage() {
  const navigate = useNavigate();
  const { setLoggedUser } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);
    try {
      const { token, user } = await login(username.trim(), password);

      if (!token || !user) throw new Error("Invalid server response");

      localStorage.setItem("user", JSON.stringify(user)); // Saving accessToken to localStorage
      setLoggedUser(user);
      navigate("/", { replace: true });
    } catch (error) {
      const msg =
        error?.message === "UNAUTHORIZED"
          ? "Session expired. Please login again."
          : error?.message || "Invalid credentials";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-4/5 md:w-2/5 gap-4 md:gap-6">
      <div className="flex flex-col gap-1 md:gap-4">
        <h1 className="font-bold text-3xl md:text-4xl text-cyan-950">
          Login to
        </h1>
        <h1 className="text-4xl md:text-5xl text-cyan-900 font-bold">
          QueTocaHoy
        </h1>
      </div>
      <div className="bg-white p-6 shadow-xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Username / Email */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="username"
              className="text-slate-600 text-md md:text-lg"
            >
              Username
            </label>
            <input
              type="text"
              name="username"
              // className="outline-1 p-1 pl-2"
              className="w-full border border-slate-500 px-3 py-2 focus:ring-2 outline-none text-slate-700 focus:ring-cyan-600"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-slate-600 text-md md:text-lg"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                name="password"
                className="w-full border border-slate-500 px-3 py-2 focus:ring-2 outline-none text-slate-700 focus:ring-cyan-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute inset-y-0 right-2 flex items-center text-gray-500 transition-all cursor-pointer"
                aria-label={showPw ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPw ? (
                  <BiHide className="size-5 md:size-6" />
                ) : (
                  <BiShow className="size-5 md:size-6" />
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && <div className="text-red-600 text-sm">{error}</div>}

          <button
            type="submit"
            className="bg-cyan-900 hover:bg-cyan-800 active:bg-cyan-700 transition-all p-2 text-white rounded-md outline-0 cursor-pointer disabled:opacity-70"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="pt-2 text-slate-600">
          Don't have an account?{" "}
          <NavLink to="/auth/register" className="text-cyan-700 underline">
            Create one
          </NavLink>
        </p>
      </div>
    </div>
  );
}
