import { useState } from "react";

export default function InviteDetailsModal({
  invite,
  onClose,
  onRemove,
  onCopy,
}) {
  const [copiedPin, setCopiedPin] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyPin = async () => {
    await onCopy(invite.pin);
    setCopiedPin(true);
    setTimeout(() => {
      setCopiedPin(false);
    }, 2000);
  };

  const handleCopyLink = async () => {
    await onCopy(invite.link);
    setCopiedLink(true);
    setTimeout(() => {
      setCopiedLink(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
      <div className="w-8/9 max-w-md rounded-xl bg-white p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Invitation details</h3>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Email:</span> {invite.email}
          </div>
          <div>
            <span className="font-medium">Role:</span> {invite.role}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">PIN:</span>
            <span className="px-2 py-0.5 rounded border">{invite.pin}</span>
            <button
              onClick={handleCopyPin}
              className={`px-2 py-1 rounded text-xs transition-all ${
                copiedPin
                  ? "bg-slate-400 text-slate-800"
                  : "bg-cyan-900 text-white"
              }`}
              title="Copy PIN"
            >
              {copiedPin ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="">
            <span className="font-medium">Link:</span>{" "}
            <a href={invite.link} target="_blank" className="underline">
              {invite.link}
            </a>
            <button
              onClick={handleCopyLink}
              className={`px-2 py-1 ml-2 rounded text-xs transition-all ${
                copiedLink
                  ? "bg-slate-400 text-slate-800"
                  : "bg-cyan-900 text-white"
              }`}
              title="Copy link"
            >
              {copiedLink ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="text-xs text-slate-500">Token: {invite.token}</div>
        </div>

        <div className="flex justify-between pt-2">
          <button
            onClick={onRemove}
            className="px-3 py-1 rounded bg-red-600 text-white"
          >
            Delete invite
          </button>
          <button onClick={onClose} className="px-3 py-1 rounded border">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
