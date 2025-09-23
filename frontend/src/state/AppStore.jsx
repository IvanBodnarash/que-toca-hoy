import { createContext, useContext, useMemo, useReducer } from "react";

const AppStoreCtx = createContext(null);

const initialState = {
  groups: {},
};

function reducer(state, action) {
  switch (action.type) {
    // ---- GROUP MEMBERS ----
    case "GROUP/SET_MEMBERS": {
      const { idGroup, members } = action;
      return {
        ...state,
        groups: {
          ...state.groups,
          [idGroup]: {
            ...(state.groups[idGroup] || {}),
            members,
            membersLoaded: true,
          },
        },
      };
    }
    case "GROUP/UPSERT_MEMBER": {
      const { idGroup, member } = action;
      const g = state.groups[idGroup] || {};
      const list = g.members || [];
      const idx = list.findIndex((m) => m.idUser === member.idUser);
      const newList =
        idx === -1
          ? [member, ...list]
          : list.map((m, i) => (i === idx ? member : m));
      return {
        ...state,
        groups: {
          ...state.groups,
          [idGroup]: { ...g, members: newList, membersLoaded: true },
        },
      };
    }
    case "GROUP/REMOVE_MEMBER": {
      const { idGroup, idUser } = action;
      const g = state.groups[idGroup] || {};
      const newList = (g.members || []).filter((m) => m.idUser !== idUser);
      return {
        ...state,
        groups: {
          ...state.groups,
          [idGroup]: { ...g, members: newList, membersLoaded: true },
        },
      };
    }

    // ---- CALENDAR EVENTS ----
    case "CAL/SET_EVENTS": {
      const { idGroup, events } = action;
      const g = state.groups[idGroup] || {};
      return {
        ...state,
        groups: {
          ...state.groups,
          [idGroup]: { ...g, events, eventsLoaded: true },
        },
      };
    }
    case "CAL/UPSERT_EVENT": {
      const { idGroup, event } = action;
      const g = state.groups[idGroup] || {};
      const list = g.events || [];
      const idx = list.findIndex((e) => e.idEvent === event.idEvent);
      const newList =
        idx === -1
          ? [event, ...list]
          : list.map((e, i) => (i === idx ? event : e));
      return {
        ...state,
        groups: {
          ...state.groups,
          [idGroup]: { ...g, events: newList, eventsLoaded: true },
        },
      };
    }
    case "CAL/REMOVE_EVENT": {
      const { idGroup, idEvent } = action;
      const g = state.groups[idGroup] || {};
      const newList = (g.events || []).filter((e) => e.idEvent !== idEvent);
      return {
        ...state,
        groups: {
          ...state.groups,
          [idGroup]: { ...g, events: newList, eventsLoaded: true },
        },
      };
    }

    default:
      return state;
  }
}

export function AppStoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <AppStoreCtx.Provider value={value}>{children}</AppStoreCtx.Provider>;
}

export function useAppStore() {
  const ctx = useContext(AppStoreCtx);
  if (!ctx) throw new Error("useAppStore must be used within AppStoreProvider");
  return ctx;
}
