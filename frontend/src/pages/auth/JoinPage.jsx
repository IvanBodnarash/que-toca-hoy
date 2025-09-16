import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { loadGroups, saveGroups } from "../../store/groupsStore";

const LOCALSTORAGE_PENDING_INVITE_KEY = "pending_invite";

export default function JoinPage() {
  const { user } = useAuth();
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") || "";

  const [groups, setGroups] = useState([]);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [acceptedInfo, setAcceptedInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setGroups(loadGroups());
    setLoading(true);
  }, []);

  const context = useMemo(() => {
    for (let gi = 0; gi < groups.length; gi++) {
      const g = groups[gi];
      const invs = Array.isArray(g.invitations) ? g.invitations : [];
      const ii = invs.findIndex((i) => i.token === token);
      if (ii !== -1) return { gi, ii, group: g, invite: invs[ii] };
    }
    return null;
  }, [groups, token]);

  useEffect(() => {
    if (!token || !context) return;
    if (!user) {
      localStorage.setItem(
        LOCALSTORAGE_PENDING_INVITE_KEY,
        JSON.stringify({ token })
      );
      const next = encodeURIComponent(`${location.pathname}${location.search}`);
      window.location.replace(`/auth?next=${next}`);
    }
  }, [user, token, context]);

  if (ok) {
    return (
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-xl font-semibold mb-3">
          Join “{acceptedInfo?.groupName ?? "Group"}”
        </h1>
        <div className="rounded border p-4 bg-green-50">
          Done! You joined as <b>{acceptedInfo?.role ?? "member"}</b>.
        </div>
        <div className="mt-4">
          <a
            className="inline-block px-4 py-2 rounded bg-cyan-900 text-white"
            href={
              acceptedInfo?.groupId
                ? `/group/${acceptedInfo.groupId}/manageTasks`
                : "/"
            }
          >
            Go to group
          </a>
          <a className="ml-2 inline-block px-4 py-2 rounded border" href="/">
            Home
          </a>
        </div>
      </div>
    );
  }

  if (!loading) return <div className="p-6">Loading invitation…</div>;
  if (!token) return <div className="p-6 text-red-600">Missing token.</div>;
  if (!context)
    return (
      <div className="p-6 text-red-600">Invitation not found or used.</div>
    );
  if (!user) return <div className="p-6">Redirecting to sign in…</div>;

  const { group, invite } = context;

  const accept = (e) => {
    e.preventDefault();
    setError("");
    if (pin.trim() !== invite.pin) {
      setError("Invalid PIN.");
      return;
    }

    setAcceptedInfo({
      role: invite.role,
      email: invite.email,
      groupId: group.id,
      groupName: group.name,
    });

    const next = [...groups];
    const g = { ...next[context.gi] };

    g.members = Array.isArray(g.members)
      ? [...g.members, { userId: user.id, role: invite.role }]
      : [{ userId: user.id, role: invite.role }];

    const invs = [...(g.invitations || [])];
    invs.splice(context.ii, 1);
    g.invitations = invs;

    next[context.gi] = g;
    setGroups(next);
    saveGroups(next);
    localStorage.removeItem(LOCALSTORAGE_PENDING_INVITE_KEY);
    setOk(true);
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-semibold mb-3">Join “{group.name}”</h1>
      <form onSubmit={accept} className="space-y-3">
        <p className="text-sm text-gray-600">
          Invite sent to <b>{invite.email}</b>
        </p>
        <input
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full rounded border p-2"
          placeholder="Enter PIN"
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="px-4 py-2 rounded bg-cyan-900 text-white">
          Confirm
        </button>
      </form>
    </div>
  );
}
