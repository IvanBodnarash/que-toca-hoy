import { useEffect, useRef } from "react";
import { useRealtime } from "./RealtimeProvider";

export function useUserRealtime(idUser, handlers = {}) {
  const { on, off } = useRealtime();
  const ref = useRef({ onUserTasksChanged: () => {} });
  ref.current = { ...ref.current, ...handlers };

  useEffect(() => {
    if (!idUser) return;
    const safe = (fn) => (payload) => {
      if (!payload) return;
      if (String(payload.idUser) !== String(idUser)) return;
      fn(payload);
    };
    const u = on("usertasks:changed", safe(ref.current.onUserTasksChanged));
    return () => u?.();
  }, [idUser, on, off]);
}
