import { useEffect, useRef } from "react";
import { useRealtime } from "./RealtimeProvider";

export function useCalendarRealtime(idGroup, reload) {
  const { joinCalendar, leaveCalendar, on, off } = useRealtime();
  const handlerRef = useRef(() => {});
  const tRef = useRef(null);

  handlerRef.current = (payload) => {
    const same = String(payload.idGroup) === String(idGroup);

    if (!same) return;
    reload?.();
    if (tRef.current) clearTimeout(tRef.current);
    tRef.current = setTimeout(() => reload?.(), 120);
  };

  useEffect(() => {
    if (!idGroup) return;
    joinCalendar(idGroup);
    const wrapped = (p) => handlerRef.current(p);

    on("calendar:eventCreated", wrapped);
    on("calendar:eventUpdated", wrapped);
    on("calendar:eventDeleted", wrapped);
    on("calendar:eventPatched", wrapped);

    return () => {
      off("calendar:eventCreated", wrapped);
      off("calendar:eventUpdated", wrapped);
      off("calendar:eventDeleted", wrapped);
      on("calendar:eventPatched", wrapped);
      leaveCalendar(idGroup);
      if (tRef.current) {
        clearTimeout(tRef.current);
        tRef.current = null;
      }
    };
  }, [idGroup, reload]);
}
