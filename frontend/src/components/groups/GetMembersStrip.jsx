import { useEffect } from "react";
import defaultAvatar from "../../assets/initialAvatar.jpg";
import { safeImageSrc } from "../../utils/imageProcessor";
import { useGroupMembersStore } from "../../state/useGroupMembersStore";
import { useGroupRealtime } from "../../realtime/useGroupRealtime";

// const cache = new Map();

export default function GroupMembersStrip({
  idGroup,
  max = 5,
  refreshKey,
  onClick,
}) {
  const { members, loaded, fetchMembers } = useGroupMembersStore(idGroup);

  useGroupRealtime(idGroup, {
    onMembersUpdated: () => fetchMembers(),
  });

  useEffect(() => {
    if (idGroup) fetchMembers();
  }, [idGroup, fetchMembers]);

  if (!loaded) {
    return (
      <div className="flex -space-x-2 mt-1">
        {[...Array(Math.min(max, 3))].map((_, i) => (
          <div
            key={i}
            className="w-6 h-6 rounded-full bg-slate-200 animate-pulse border border-white"
          />
        ))}
      </div>
    );
  }
  if (!members.length) return null;

  const shown = members.slice(0, max);
  const rest = members.length - shown.length;

  return (
    <div
      className="flex items-center gap-1 mt-1"
      title={members.map((u) => u.username || u.name).join(", ")}
    >
      <div className="flex -space-x-2">
        {shown.map((u) => (
          <div
            key={u.idUser}
            className="w-6 h-6 rounded-full border border-slate-400/70 overflow-hidden bg-slate-100 flex items-center justify-center text-[10px] font-semibold"
          >
            {u.image ? (
              <img
                alt={u.username || u.name}
                src={safeImageSrc(u.image, defaultAvatar) || defaultAvatar}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = defaultAvatar;
                }}
              />
            ) : (
              <span className="text-slate-700">
                {(u.username?.[0] || u.name?.[0] || "?").toUpperCase()}
              </span>
            )}
          </div>
        ))}
        {rest > 0 && (
          <div className="w-6 h-6 rounded-full border border-white bg-slate-200 text-slate-700 text-[10px] font-semibold flex items-center justify-center">
            +{rest}
          </div>
        )}
      </div>
      <p className="text-slate-700 text-sm md:text-md truncate">
        {members.length} member{members.length > 1 ? "s" : ""}
      </p>
    </div>
  );
}
