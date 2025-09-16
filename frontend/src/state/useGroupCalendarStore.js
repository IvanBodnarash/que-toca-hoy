import { useCallback } from "react";
import { useAppStore } from "./AppStore";
import { getGroupEvents } from "../services/calendarService";

export function useGroupCalendarStore(idGroup) {
  const { state, dispatch } = useAppStore();
  const slice = state.groups[idGroup] || {};
  const events = slice.events || [];
  const loaded = !!slice.eventsLoaded;

  const fetchEvents = useCallback(async () => {
    const data = await getGroupEvents(idGroup);
    dispatch({ type: "CAL/SET_EVENTS", idGroup, events: data || [] });
  }, [idGroup, dispatch]);

  const getTaskById = useCallback(
    (taskId) =>
      events.find(
        (e) =>
          String(e.id) === String(taskId) ||
          String(e.idTaskDated) === String(taskId)
      ),
    [events]
  );

  const upsert = useCallback(
    (event) => dispatch({ type: "CAL/UPSERT_EVENT", idGroup, event }),
    [dispatch, idGroup]
  );

  const remove = useCallback(
    (taskId) =>
      dispatch({ type: "CAL/REMOVE_EVENT", idGroup, idEvent: taskId }),
    [dispatch, idGroup]
  );

  return { events, loaded, fetchEvents, getTaskById, upsert, remove };
}
