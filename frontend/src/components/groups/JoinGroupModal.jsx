import { useState } from "react";
import { joinGroupByPin } from "../../services/groupsService";

export default function JoinGroupModal({ onClose, onJoined }) {
  const [invitePin, setInvitePin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submitAll = async () => {
    setError("");
    setBusy(true);
    try {
      if (!invitePin.trim()) throw new Error("Enter PIN");
      await joinGroupByPin(invitePin.trim());
      if (onJoined) await onJoined(); // refetch in Home
    } catch (err) {
      setError(err?.message || "Something went wrong!");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[80%] md:w-2/5 z-55 rounded-2xl bg-white p-4 shadow-xl">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Join Group</h2>
            <button
              onClick={() => onClose()}
              className="inline-flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100 cursor-pointer"
              title="close"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="space-y-2">
            {/* PIN Check */}
            <div className="flex flex-col gap-2">
              <label htmlFor="title" className="text-slate-800">
                Enter invite PIN
              </label>
              <input
                id="title"
                value={invitePin}
                type="text"
                className="w-full border border-slate-600 outline-cyan-700 rounded-sm p-2"
                onChange={(e) => setInvitePin(e.target.value)}
              />
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            {/* Action Buttons */}
            <div className="flex flex-row justify-end gap-2">
              <button
                className="px-4 py-1 rounded-md bg-red-600/60 hover:bg-red-500 active:bg-red-400 text-white cursor-pointer transition-all"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="px-4 py-1 rounded-md bg-cyan-900 hover:bg-cyan-800 active:bg-cyan-700 text-white cursor-pointer transition-all"
                onClick={submitAll}
              >
                {busy ? "Joining..." : "Join"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
