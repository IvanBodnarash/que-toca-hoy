import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

import { safeImageSrc } from "../../utils/imageProcessor";
import { validate } from "../../utils/validations";
import { apiPut } from "../../api/apiFetch.js";

import { BiHide, BiShow } from "react-icons/bi";

import UserImageUploader from "../../components/auth/UserImageUploader";
import defaultAvatar from "../../assets/initialAvatar.jpg";

export default function UserSettings() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  // Loading div
  if (!user) return <div className="p-4">Loading...</div>;

  // Local states
  const [avatar, setAvatar] = useState(
    safeImageSrc(user.image) || defaultAvatar
  );
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [userName, setUserName] = useState(user.username || "");
  const [profileColor, setProfileColor] = useState(user.color || "#000000");

  // Passwords
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // UX states
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");

  // Notice Timeout
  const timeoutForNotices = () => {
    setTimeout(() => {
      setNotice("");
    }, 2500);
  };

  // If has changes
  const hasChanges = () => {
    return (
      name !== user.name ||
      email !== user.email ||
      userName !== user.username ||
      avatar !== (user.image || "") ||
      profileColor.toLowerCase() !== (user.color || "#000000").toLowerCase() ||
      newPassword.length > 0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotice("");

    const ok = validate({
      name,
      email,
      username: userName,
      newPassword,
      confirmPassword,
      currentPassword,
      setErrors,
    });

    if (!ok) return;

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        username: userName.trim(),
        image: avatar,
        color: profileColor,
        ...(newPassword ? { password: newPassword, currentPassword } : {}),
      };
      const { user: updated } = await apiPut("/auth/profile", payload);
      updateUser(updated);
      setNotice("Saved!");
    } catch (error) {
      setNotice(error?.message || "Save failed. Try again.");
    } finally {
      setSaving(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      timeoutForNotices();
    }
  };

  const handleReset = () => {
    setAvatar(user.image || "");
    setName(user.name || "");
    setEmail(user.email || "");
    setUserName(user.username || "");
    setProfileColor(user.color || "#000000");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrors({});
    setNotice("");
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/welcome", { replace: true });
    }
  };

  return (
    <div className="min-h-screen py-24 flex justify-center">
      <div className="fixed top-0 left-0 w-full z-10 bg-cyan-800 flex flex-row justify-between items-center p-4 gap-4">
        <h1 className="text-white font-bold text-xl">User Settings</h1>
        <div className="flex flex-row gap-4">
          <button
            onClick={handleLogout}
            className="bg-red-700 hover:bg-red-600 active:bg-red-500 transition-all text-white p-2 rounded-md cursor-pointer"
          >
            Logout
          </button>
          <button
            onClick={() => navigate("/app")}
            className="bg-cyan-950 hover:bg-cyan-900 active:bg-cyan-800 transition-all text-white p-2 px-4 rounded-md cursor-pointer"
          >
            Back
          </button>
        </div>
      </div>

      <div className="flex flex-col w-full justify-center items-center">
        {/* User image */}
        <UserImageUploader avatar={avatar} onChangeAvatar={setAvatar} />

        {/* Change user data */}
        <form onSubmit={handleSubmit} className="flex flex-col md:w-4/6 gap-2">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex md:w-2/4 flex-col gap-2">
              {/* Name */}
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-slate-800">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  className={`w-full text-slate-700 border rounded-md px-3 py-2 outline-none focus:ring-2 ${
                    errors.name
                      ? "border-red-500 focus:ring-red-500"
                      : "border-slate-600 focus:ring-cyan-600"
                  }`}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2">
                <label htmlFor="userEmail" className="text-slate-800">
                  Email
                </label>
                <input
                  type="email"
                  id="userEmail"
                  value={email}
                  className={`w-full text-slate-700 border rounded-md px-3 py-2 outline-none focus:ring-2 ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-slate-600 focus:ring-cyan-600"
                  }`}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                )}
              </div>

              {/* Username */}
              <div className="flex flex-col gap-2">
                <label htmlFor="userName" className="text-slate-800">
                  Username
                </label>
                <input
                  type="text"
                  id="userName"
                  value={userName}
                  className={`w-full text-slate-700 border rounded-md px-3 py-2 outline-none focus:ring-2 ${
                    errors.userName
                      ? "border-red-500 focus:ring-red-500"
                      : "border-slate-600 focus:ring-cyan-600"
                  }`}
                  onChange={(e) => {
                    setUserName(e.target.value);
                    setErrors((prev) => ({ ...prev, userName: undefined }));
                  }}
                />
                {errors.userName && (
                  <p className="text-sm text-red-600 mt-1">{errors.userName}</p>
                )}
              </div>

              {/* ProfileColor */}
              <div className="flex items-center gap-3">
                <label htmlFor="color" className="text-slate-800">
                  Profile color
                </label>
                <input
                  type="color"
                  id="color"
                  value={profileColor}
                  onChange={(e) => {
                    setProfileColor(e.target.value);
                  }}
                  className="h-10 w-14 p-0 border border-slate-300 rounded cursor-pointer"
                />
                <span className="text-slate-600 text-sm font-mono tabular-nums w-24 text-center select-all">
                  {profileColor}
                </span>
              </div>
            </div>

            {/* Passwords */}
            <div className="flex md:w-2/4 flex-col gap-2">
              {/* Current Password */}
              <div className="flex flex-col gap-2">
                <label htmlFor="currentPassword" className="text-slate-800">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    id="currentPassword"
                    value={currentPassword}
                    className={`w-full text-slate-700 border rounded-md px-3 py-2 pr-10 outline-none focus:ring-2 ${
                      errors.currentPw
                        ? "border-red-500 focus:ring-red-500"
                        : "border-slate-600 focus:ring-cyan-600"
                    }`}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value);
                      setErrors((prev) => ({
                        ...prev,
                        currentPassword: undefined,
                      }));
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? <BiShow /> : <BiHide />}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.currentPassword}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div className="flex flex-col gap-2">
                <label htmlFor="newPassword" className="text-slate-800">
                  New password
                </label>
                <div className="relative">
                  <input
                    type={showNewPw ? "text" : "password"}
                    id="newPassword"
                    value={newPassword}
                    className={`w-full text-slate-700 border rounded-md px-3 py-2 pr-10 outline-none focus:ring-2 ${
                      errors.newPassword
                        ? "border-red-500 focus:ring-red-500"
                        : "border-slate-600 focus:ring-cyan-600"
                    }`}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setErrors((prev) => ({
                        ...prev,
                        newPassword: undefined,
                      }));
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw((s) => !s)}
                    className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                    aria-label={showNewPw ? "Hide password" : "Show password"}
                  >
                    {showNewPw ? <BiShow /> : <BiHide />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.newPassword}
                  </p>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="flex flex-col gap-2">
                <label htmlFor="confirmNewPassword" className="text-slate-800">
                  Confirm new password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPw ? "text" : "password"}
                    id="confirmNewPassword"
                    value={confirmPassword}
                    className={`w-full text-slate-700 border rounded-md px-3 py-2 pr-10 outline-none focus:ring-2 ${
                      errors.confirmPassword
                        ? "border-red-500 focus:ring-red-500"
                        : "border-slate-600 focus:ring-cyan-600"
                    }`}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrors((prev) => ({
                        ...prev,
                        confirmPassword: undefined,
                      }));
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw((s) => !s)}
                    className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                    aria-label={
                      showConfirmPw ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPw ? <BiShow /> : <BiHide />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Message Banner */}
          {notice && (
            <div className="text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded">
              {notice}
            </div>
          )}

          <div className="flex flex-row w-full gap-2 mt-2">
            {/* Reset Button */}
            <button
              type="button"
              onClick={handleReset}
              className="bg-red-800 hover:bg-red-700 active:bg-red-600 transition-all cursor-pointer p-1.5 rounded-md text-white font-bold w-2/5"
            >
              Reset
            </button>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!hasChanges() || saving}
              className={`p-1.5 rounded-md text-white font-bold w-3/4 transition-all cursor-pointer ${
                !hasChanges() || saving
                  ? "bg-slate-500 cursor-not-allowed"
                  : "bg-cyan-900 hover:bg-cyan-800 active:bg-cyan-700"
              }`}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
