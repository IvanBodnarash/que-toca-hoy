import { useContext, useEffect } from "react";
import { createContext } from "react";
import { socket } from "./socket";
import { useMemo } from "react";
import { useRef } from "react";

const RealtimeContext = createContext(null);

export function RealtimeProvider({ children }) {
  const groupsRef = useRef(new Set());
  const calendarsRef = useRef(new Set());

  useEffect(() => {
    const onConnect = () => {
      groupsRef.current.forEach((idGroup) => {
        socket.emit("group:subscribe", idGroup);
      });
      calendarsRef.current.forEach((idGroup) =>
        socket.emit("calendar:subscribe", idGroup)
      );
    };

    const onConnectError = (err) => {
      console.warn("socket connect_error:", err?.message || err);
    };

    socket.on("connect", onConnect);
    socket.on("reconnect", onConnect);
    socket.on("connect_error", onConnectError);

    if (!socket.connected) socket.connect();

    // universal logger for payloads (test)
    const logAny = (event, payload) =>
      console.log("[WS] event:", event, payload);
    [
      "group:patched",
      "group:membersUpdated",
      "group:deleted",
      "buylist:changed",
      "templates:changed",
      "calendar:eventPatched",
      "calendar:refresh",
      "calendar:eventCreated",
      "calendar:eventUpdated",
      "calendar:eventDeleted",
      "usertasks:changed",
    ].forEach((ev) => socket.on(ev, (p) => logAny(ev, p)));

    return () => {
      socket.off("connect", onConnect);
      socket.off("reconnect", onConnect);
      socket.off("connect_error", onConnectError);
      socket.off("logger_disconnect", logAny);
      if (socket.connected) socket.disconnect();
    };
  }, []);

  const api = useMemo(
    () => ({
      socket,
      // Groups
      joinGroup(idGroup) {
        groupsRef.current.add(idGroup);
        if (socket.connected) socket.emit("group:subscribe", idGroup);
      },
      leaveGroup(idGroup) {
        groupsRef.current.delete(idGroup);
        if (socket.connected) socket.emit("group:unsubscribe", idGroup);
      },
      // Calendar
      joinCalendar(idGroup) {
        calendarsRef.current.add(idGroup);
        if (socket.connected) socket.emit("calendar:subscribe", idGroup);
      },
      leaveCalendar(idGroup) {
        calendarsRef.current.delete(idGroup);
        if (socket.connected) socket.emit("calendar:unsubscribe", idGroup);
      },
      on(event, handler) {
        socket.on(event, handler);
        return () => socket.off(event, handler);
      },
      off(event, handler) {
        socket.off(event, handler);
      },
    }),
    []
  );

  return (
    <RealtimeContext.Provider value={api}>{children}</RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const ctx = useContext(RealtimeContext);
  if (!ctx) throw new Error("useRealtime must be used within RealtimeProvider");
  return ctx;
}
