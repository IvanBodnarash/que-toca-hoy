import { NavLink, useLocation, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

import { BiShow, BiHide } from "react-icons/bi";
import UserImageUploader from "../../components/auth/UserImageUploader";

import defaultAvatar from "../../assets/initialAvatar.jpg";

const LOCALSTORAGE_PENDING_INVITE_KEY = "pending_invite";
const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);

export default function Register() {
  const { setLoggedUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [avatar, setAvatar] = useState(defaultAvatar);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [profileColor, setProfileColor] = useState(randomColor);
  const [pw, setPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (pw.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }
    if (pw !== confirmPw) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const regRes = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          username: username.trim(),
          password: pw,
          image: avatar,
          color: profileColor,
        }),
      });

      if (!regRes.ok) {
        const err = await regRes.json().catch(() => null);
        throw new Error(err?.error || err?.message || "Register failed");
      }

      const data = await regRes.json();
      const token = data.token;
      const user = data.user;

      if (!token || !user) throw new Error("Invalid server response");

      // const { token, user } = await regRes.json();
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setLoggedUser(user);

      // If pending_invite exists return to /join
      const pendingInvite = localStorage.getItem("pending_invite");
      if (pendingInvite) {
        const { token } = JSON.parse(pendingInvite);
        localStorage.removeItem(LOCALSTORAGE_PENDING_INVITE_KEY);
        navigate(`/join?token=${encodeURIComponent(token)}`, { replace: true });
        return;
      }

      // If came from redirect (?next=/join?token=...)
      const params = new URLSearchParams(location.search);
      const next = params.get("next");
      if (next) {
        navigate(next, { replace: true });
        return;
      }

      // Default
      navigate("/", { replace: true }); // after login -> to Home
    } catch (error) {
      setError(error.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col py-8 w-4/5 md:w-3/6 gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="font-bold text-3xl text-cyan-950">Create account</h1>
        <h1 className="text-4xl md:text-5xl text-cyan-900 font-bold">
          QueTocaHoy
        </h1>
      </div>

      <div className="bg-white p-6 shadow-xl">
        {/* User Image */}
        <div className="flex justify-center">
          <UserImageUploader avatar={avatar} onChangeAvatar={setAvatar} />
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row justify-center gap-4"
        >
          <div className="flex flex-col md:w-1/2 gap-2">
            {/* Name */}
            <div className="flex flex-col gap-2">
              <label htmlFor="email">Name</label>
              <input
                id="name"
                className="pl-2 w-full border border-slate-500 px-3 py-2 focus:ring-2 outline-none text-slate-700 focus:ring-cyan-600 transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>

            {/* Username */}
            <div className="flex flex-col gap-2">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                className="pl-2 w-full border border-slate-500 px-3 py-2 focus:ring-2 outline-none text-slate-700 focus:ring-cyan-600 transition-all"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                className="pl-2 w-full border border-slate-500 px-3 py-2 focus:ring-2 outline-none text-slate-700 focus:ring-cyan-600 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="flex flex-col md:w-1/2 gap-2">
            {/* Password */}
            <div className="flex flex-col gap-2">
              <label htmlFor="password">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  name="password"
                  className="pl-2 w-full border border-slate-500 px-3 py-2 focus:ring-2 outline-none text-slate-700 focus:ring-cyan-600 transition-all"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <BiHide /> : <BiShow />}
                </button>
              </div>
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            {/* Repeat password */}
            <div className="flex flex-col gap-2">
              <label htmlFor="confirmPw">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPw ? "text" : "password"}
                  name="confirmPw"
                  className="pl-2 w-full border border-slate-500 px-3 py-2 focus:ring-2 outline-none text-slate-700 focus:ring-cyan-600 transition-all"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw((s) => !s)}
                  className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                  aria-label={showConfirmPw ? "Hide password" : "Show password"}
                >
                  {showConfirmPw ? <BiHide /> : <BiShow />}
                </button>
              </div>
            </div>

            <div className="h-full flex items-end">
              <button
                type="submit"
                className="bg-cyan-900 w-full hover:bg-cyan-800 active:bg-cyan-700 transition-all cursor-pointer p-1.5 text-white rounded-md"
                disabled={loading}
              >
                {loading ? "Signing up..." : "Sign up"}
              </button>
            </div>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
        </form>
        <p className="pt-2 text-slate-800">
          You already have an account?{" "}
          <NavLink to="/" className="text-cyan-700 underline">
            Sign In
          </NavLink>
        </p>
      </div>
    </div>
  );
}
