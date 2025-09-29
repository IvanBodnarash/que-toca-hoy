import { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";

import { BiShow, BiHide } from "react-icons/bi";
import UserImageUploader from "../../components/auth/UserImageUploader";

import defaultAvatar from "../../assets/initialAvatar.jpg";
import { register } from "../../services/authService";

function getRandomColor() {
  const c = Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0");
  return `#${c}`;
}

const isValidName = (s) => s.trim().length >= 2;
const isValidUsername = (s) => /^[a-zA-Z0-9._-]{3,20}$/.test(s.trim());
const isValidEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
const isStrongPassword = (s) => typeof s === "string" && s.length >= 6;

export default function Register() {
  const { setLoggedUser } = useAuth();
  const navigate = useNavigate();

  const [avatar, setAvatar] = useState(defaultAvatar);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [profileColor, setProfileColor] = useState(getRandomColor());
  const [pw, setPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pwHint = useMemo(() => {
    if (!pw) return "";
    if (!isStrongPassword(pw))
      return "Password should be at least 6 characters.";
  }, [pw]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedUsername = username.trim();

    if (!isValidName(trimmedName)) {
      setError("Name should be at least 2 characters.");
      return;
    }
    if (!isValidUsername(trimmedUsername)) {
      setError("Username must be 3–20 chars: letters, numbers, ., _, -");
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setError("Please enter a valid email.");
      return;
    }
    if (!isStrongPassword(pw)) {
      setError("Password should be at least 6 characters.");
      return;
    }
    if (pw !== confirmPw) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { token, user } = await register(
        trimmedName,
        trimmedEmail,
        trimmedUsername,
        pw,
        avatar,
        profileColor
      );

      if (!token || !user) throw new Error("Invalid server response");

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setLoggedUser(user);
      navigate("/app", { replace: true }); // after login -> to Home
    } catch (error) {
      const msg =
        error?.message === "UNAUTHORIZED"
          ? "Session expired. Please login again."
          : error?.message || "Register failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-4/5 md:w-3/6 gap-4">
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

        {/* Profile Color */}
        <div className="flex items-center gap-3 justify-center my-3">
          <label htmlFor="profileColor" className="text-slate-700">
            Profile color
          </label>
          <input
            id="profileColor"
            type="color"
            value={profileColor}
            onChange={(e) => setProfileColor(e.target.value)}
            className="h-8 w-12 cursor-pointer border"
            aria-label="Choose profile color"
          />
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row justify-center gap-4"
          noValidate
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
                inputMode="text"
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
                inputMode="email"
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
                  aria-invalid={!!pwHint}
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
              {pwHint && <div className="text-red-600 text-sm">{pwHint}</div>}
            </div>

            {/* Repeat password */}
            <div className="flex flex-col gap-2">
              <label htmlFor="confirmPw">Confirm Password</label>
              <div className="relative">
                <input
                  id="confirmPw"
                  type={showConfirmPw ? "text" : "password"}
                  name="confirmPw"
                  className="pl-2 w-full border border-slate-500 px-3 py-2 focus:ring-2 outline-none text-slate-700 focus:ring-cyan-600 transition-all"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  autoComplete="current-password"
                  required
                  aria-invalid={pw !== confirmPw && confirmPw.length > 0}
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

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <div className="h-full flex items-end">
              <button
                type="submit"
                className="bg-cyan-900 w-full hover:bg-cyan-800 active:bg-cyan-700 transition-all cursor-pointer p-1.5 text-white rounded-md"
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? "Signing up..." : "Sign up"}
              </button>
            </div>
          </div>
        </form>

        <p className="pt-2 text-slate-800">
          You already have an account?{" "}
          <NavLink to="/auth" className="text-cyan-700 underline">
            Sign In
          </NavLink>
        </p>
      </div>
    </div>
  );
}
