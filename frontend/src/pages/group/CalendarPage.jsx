import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { getGroupDatedTasks } from "../../services/taskDatedService";
import { mapTaskDatedToEvents, getContrastYIQ } from "../../utils/calendar";
import DayTasksModal from "../../components/calendar/DayTasksModal";
import NewTaskDatedModal from "../../components/calendar/NewTaskDatedModal";
import EventContent from "../../components/calendar/EventContent";
import { useCalendarRealtime } from "../../realtime/useCalendarRealtime";
import { useRef } from "react";
import { useCallback } from "react";

// Set the locale to start the week on Monday
moment.updateLocale("en", {
  week: {
    dow: 1, // dow: 1 means Monday is the first day of the week
  },
});

const localizer = momentLocalizer(moment);

export default function CalendarPage() {
  const { groupId } = useParams();

  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());

  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");

  // day modal
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayOpen, setDayOpen] = useState(false);

  // create modal
  const [createOpen, setCreateOpen] = useState(false);

  const loadingRef = useRef(false);

  const loadAll = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setError("");
    try {
      const data = await getGroupDatedTasks(groupId);
      const evts = (Array.isArray(data) ? data : []).flatMap(
        mapTaskDatedToEvents
      );
      setEvents(evts);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.warn("Calendar loadAll failed:", error);
        setError(error.message || "Failed to load calendar");
      }
    } finally {
      loadingRef.current = false;
    }
  }, [groupId]);

  useEffect(() => {
    loadAll();
  }, [groupId]);

  useCalendarRealtime(groupId, loadAll);

  const eventsForDay = useMemo(() => {
    if (!selectedDate) return [];
    const m = moment(selectedDate);
    return events.filter((ev) => moment(ev.start).isSame(m, "day"));
  }, [events, selectedDate]);

  const handleSelectSlot = ({ start }) => {
    setSelectedDate(start);
    setDayOpen(true);
  };

  const handleSelectEvent = (event) => {
    const day = event.start;
    setSelectedDate(day);
    setDayOpen(true);
  };

  const eventPropGetter = (event) => {
    const bg = event.user?.color || "#6b7280";
    const textColor = getContrastYIQ(bg);
    return {
      style: {
        backgroundColor: bg,
        border: `1px solid ${textColor}`,
        borderRadius: "6px",
        color: textColor,
        fontWeight: "500",
        padding: "2px 4px",
      },
      title: `${event.title}${
        event.user?.username ? ` — @${event.user.username}` : ""
      }`,
    };
  };

  return (
    <div className="px-2 py-22 md:px-32">
      {error && <div className="text-red-600 p-2">{error}</div>}
      <div className="h-[75vh]">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          date={date}
          onView={setView}
          onNavigate={(newDate) => setDate(newDate)}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          popup
          selectable="ignoreEvents"
          longPressThreshold={1}
          drilldownView={null}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventPropGetter}
          components={{
            event: EventContent,
            agenda: { event: EventContent },
          }}
          messages={{
            today: "Today",
            previous: "Back",
            next: "Next",
            month: "Month",
            week: "Week",
            day: "Day",
            agenda: "Agenda",
          }}
          className="cursor-pointer"
        />
      </div>

      <DayTasksModal
        open={dayOpen}
        date={selectedDate}
        eventsForDay={eventsForDay}
        groupId={groupId}
        onClose={() => setDayOpen(false)}
        onAdd={() => {
          setDayOpen(false);
          setCreateOpen(true);
        }}
        onChanged={loadAll}
      />

      <NewTaskDatedModal
        open={createOpen}
        groupId={groupId}
        defaultDate={selectedDate}
        onClose={() => setCreateOpen(false)}
        onCreated={loadAll}
      />
    </div>
  );
}
