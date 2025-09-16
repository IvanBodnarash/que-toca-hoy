import { useEffect, useRef } from "react";
import { useRealtime } from "./RealtimeProvider";

const NOOP = () => {};

export function useGroupRealtime(idGroup, handlers = {}) {
  const { joinGroup, leaveGroup, on } = useRealtime();

  const ref = useRef({
    onGroupPatched: NOOP,
    onBuylistChanged: NOOP,
    onTemplatesChanged: NOOP,
    onCalendarPatched: NOOP,
    onMembersUpdated: NOOP,
    onUserTasksChanged: NOOP,
  });

  ref.current = { ...ref.current, ...handlers };

  useEffect(() => {
    if (!idGroup) return;

    joinGroup(idGroup);

    const safe = (fn) => (payload) => {
      if (!payload) return;
      if (String(payload.idGroup) !== String(idGroup)) return;
      fn(payload);
    };

    const unsubscribers = [
      on("group:patched", safe(ref.current.onGroupPatched)),
      on("group:membersUpdated", safe(ref.current.onMembersUpdated)),
      on("group:deleted", safe(ref.current.onGroupDeleted)),
      on("buylist:changed", safe(ref.current.onBuylistChanged)),
      on("templates:changed", safe(ref.current.onTemplatesChanged)),
      on("template:updated", safe(ref.current.onTemplatesChanged)),
      on("calendar:eventPatched", safe(ref.current.onCalendarPatched)),
      on("calendar:refresh", safe(ref.current.onCalendarPatched)),
      on("usertasks:changed", safe(ref.current.onUserTasksChanged)),
    ];

    return () => {
      unsubscribers.forEach((u) => {
        try {
          u?.();
        } catch {}
      });
      leaveGroup(idGroup);
    };
  }, [idGroup, joinGroup, leaveGroup, on]);
}
