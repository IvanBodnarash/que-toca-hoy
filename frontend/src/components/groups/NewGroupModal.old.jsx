import { useEffect, useMemo, useState } from "react";

import { MdOutlineNavigateNext } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import InviteDetailsModal from "./InviteDetailsModal";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Unique token generation (test)
function uid() {
  if (crypto?.randomUUID) return crypto.randomUUID();

  // Fallback for old browsers
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// 6-digit pin generation
const getPin = () => Math.floor(100000 + Math.random() * 900000).toString();

// Key for localStorage
const LOCALSTORAGE_KEY = "draft_new_group";

export default function NewGroupModal({ onClose, onAddGroup }) {
  const [step, setStep] = useState(1);

  // Group Data
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  // const [members, setMembers] = useState([]);

  // Invites
  const [emails, setEmails] = useState([]);
  const [emailInput, setEmailInput] = useState("");
  const [roleInput, setRoleInput] = useState("user");
  const [error, setError] = useState("");
  const [inviteDetails, setInviteDetails] = useState(null);

  // Restoring a draft
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCALSTORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setTitle(data.title || "");
        setDescription(data.description || "");
        setEmails(data.emails || []);
        setStep(data.step || 1);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  // Saving Draft
  useEffect(() => {
    const payload = { step, title, description, emails };
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(payload));
  }, [step, title, description, emails]);

  const canGoNext = useMemo(() => title.trim().length > 0, [title]);
  const hasInvites = emails.length > 0;

  const addInvite = () => {
    setError("");
    const email = emailInput.trim().toLowerCase();
    if (!EMAIL_REGEX.test(email)) {
      setError("Please enter a valid email.");
      return;
    }
    if (emails.some((item) => item.email === email)) {
      setError("This email has already been added.");
      return;
    }
    const token = uid();
    const pin = getPin();
    const link = `${window.location.origin}/join?token=${token}`;

    setEmails((prev) => [
      ...prev,
      { email, role: roleInput, pin, link, token },
    ]);
    setEmailInput("");
    setRoleInput("user");
  };

  const removeInvite = (token) => {
    setEmails((prev) => prev.filter((item) => item.token !== token));
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.log(error);
    }
  };

  const resetAndClose = () => {
    localStorage.removeItem(LOCALSTORAGE_KEY);
    onClose();
  };

  const submitAll = () => {
    const newGroup = {
      id: uid(),
      name: title,
      description,
      members: [],
      invitations: emails,
    };

    if (onAddGroup) {
      onAddGroup(newGroup);
    }

    resetAndClose();
  };

  const openInviteDetails = (invite) => setInviteDetails(invite);
  const closeInviteDetails = () => setInviteDetails(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[93%] z-55 min-h-48 rounded-2xl bg-white p-4 shadow-xl">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {step === 1 ? "New Group" : "Add Members"}
          </h2>
          <button
            onClick={resetAndClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100"
            title="close"
          >
            ✕
          </button>
        </div>

        {/* Stepper */}
        <div className="mt-3 mb-5 flex items-center gap-2 text-sm">
          <span
            className={`rounded px-2 py-1 ${
              step === 1 ? "bg-cyan-950 text-white" : "bg-slate-200"
            }`}
          >
            Group
          </span>
          <MdOutlineNavigateNext />
          <span
            className={`rounded px-2 py-1 ${
              step === 2 ? "bg-cyan-950 text-white" : "bg-slate-200"
            }`}
          >
            Members
          </span>
        </div>

        {/* Body */}
        {step === 1 ? (
          <div className="space-y-2">
            {/* Title */}
            <div className="flex flex-col gap-2">
              <label htmlFor="title" className="text-slate-800">
                Title
              </label>
              <input
                id="title"
                value={title}
                type="text"
                className="w-full border border-slate-600 outline-cyan-700 rounded-sm px-2 py-0.5"
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <label htmlFor="description" className="text-slate-800">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                className="w-full border border-slate-600 outline-cyan-700 rounded-sm px-2 py-0.5"
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-row justify-end gap-2">
              <button
                className="px-4 py-1 rounded-md bg-red-500/80 text-white"
                onClick={resetAndClose}
              >
                Cancel
              </button>
              <button
                className="px-4 py-1 rounded-md bg-slate-600 text-white"
                disabled={!canGoNext}
                onClick={() => setStep(2)}
              >
                Next Step
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Add Invite */}
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-slate-800">
                Email
              </label>
              <input
                id="email"
                value={emailInput}
                type="email"
                className="border border-slate-600 outline-cyan-700 rounded-sm px-2 py-0.5"
                onChange={(e) => setEmailInput(e.target.value)}
              />
              <div className="flex flex-row justify-between">
                <div className="flex flex-row items-center gap-2">
                  <label className="text-slate-800">Select Role</label>
                  <select
                    name="role"
                    id="role"
                    className="bg-cyan-800 outline-0 px-2 py-1 text-white text-md rounded-md"
                    onChange={(e) => setRoleInput(e.target.value)}
                  >
                    <option value="user" className="text-xs">
                      User
                    </option>
                    <option value="admin" className="text-xs">
                      Admin
                    </option>
                  </select>
                </div>
                <button
                  onClick={addInvite}
                  className="px-2 py-1 rounded-md bg-cyan-900 text-white"
                >
                  Add +
                </button>
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}

              {/* List */}
              <div className="overflow-hidden">
                {emails.length === 0 ? (
                  <h1 className="text-slate-500 py-3">No invitations yet</h1>
                ) : (
                  <ul className="bg-slate-300 p-1 rounded-md border border-slate-500">
                    {emails.map((item) => (
                      <li
                        key={item.token}
                        className="flex items-center justify-between gap-2 p-1"
                      >
                        <span className="text-slate-800 truncate">
                          {item.email}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openInviteDetails(item)}
                            className="bg-cyan-900 text-white text-sm p-1 rounded"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => removeInvite(item.token)}
                            className="bg-red-500 text-white p-1 rounded"
                          >
                            <RiDeleteBin6Line />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* User Details Modal */}
            {inviteDetails && (
              <InviteDetailsModal
                invite={inviteDetails}
                onClose={closeInviteDetails}
                onRemove={() => {
                  removeInvite(inviteDetails.token);
                  closeInviteDetails();
                }}
                onCopy={copyText}
              />
            )}

            {/* Action Buttons */}
            <div className="flex flex-row justify-between gap-2">
              <button
                className="px-3 py-1 w-2/4 rounded bg-slate-600 text-white"
                onClick={() => setStep(1)}
              >
                Previous Step
              </button>

              <button
                className="px-3 py-1 w-2/4 rounded bg-cyan-900 text-white disabled:opacity-50"
                disabled={!hasInvites}
                onClick={submitAll}
              >
                Create Group
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Demo: PIN and links are generated locally. Later, the backend will
              send emails.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
