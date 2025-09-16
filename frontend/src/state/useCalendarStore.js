import { useAppStore } from "./AppStore";
import { apiGet } from "../api/apiFetch";

export function useCalendarStore(idGroup) {
  const { state, dispatch } = useAppStore();
  const slice = state.groups[idGroup] || {};
  const events = slice.events || [];
  const loaded = !!slice.eventsLoaded;

  async function fetchEvents(range) {
    const data = await apiGet(
      `/calendar/${idGroup}/events${range ? `?range=${range}` : ""}`
    );
    dispatch({ type: "CAL/SET_EVENTS", idGroup, events: data || [] });
  }

  return { events, loaded, fetchEvents, dispatch };
}
