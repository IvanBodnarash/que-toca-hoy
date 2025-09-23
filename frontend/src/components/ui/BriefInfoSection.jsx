import { useCallback, useEffect, useState, useMemo } from "react";
import { getMyTasksReport } from "../../services/tasksService";
import { useGroupRealtime } from "../../realtime/useGroupRealtime";
import BriefTasksList from "./BriefTasksListItem";

import { RiTodoFill } from "react-icons/ri";
import { MdOutlineDownloadDone } from "react-icons/md";

// CACHE between mounts (within page session)
const TASKS_CACHE = new Map(); // key -> { data, ts }
const TTL_MS = 5 * 60_000; // 1 minute
const cacheKey = (userId, filter) => `tasks:${userId}:${filter}`;

export default function BriefInfoSection({ userData }) {
  const [filter, setFilter] = useState("today");
  const [todoTasks, setTodoTasks] = useState([]);
  const [doneTasks, setDoneTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Is there a valid cache right away (for spinner control)
  const hasValidCache = useMemo(() => {
    const key = cacheKey(userData.idUser, filter);
    const entry = TASKS_CACHE.get(key);
    return !!(entry && Date.now() - entry.ts < TTL_MS);
  }, [userData.idUser, filter]);

  const applyData = useCallback((rows) => {
    const tasksTodo = rows.filter((item) => item.status === "todo");
    const tasksDone = rows.filter((item) => item.status === "done");
    setTodoTasks(tasksTodo);
    setDoneTasks(tasksDone);
  }, []);

  const fetchAndUpdate = useCallback(
    async (signal) => {
      try {
        if (!hasValidCache) setLoading(true); // Spinner will apear when no cache
        setErr("");

        const res = await getMyTasksReport(userData.idUser, filter);
        if (signal?.aborted) return;

        // Update state
        applyData(res);

        // Update cache
        const key = cacheKey(userData.idUser, filter);
        TASKS_CACHE.set(key, { data: res, ts: Date.now() });
      } catch (error) {
        if (error?.name === "AbortError") return;
        setErr("Failed to load tasks");
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [userData.idUser, filter, hasValidCache, applyData]
  );

  // Initial render: return cache immediately (if there is), next - background update
  useEffect(() => {
    const key = cacheKey(userData.idUser, filter);
    const entry = TASKS_CACHE.get(key);

    // Instantly show cached data
    if (
      entry &&
      typeof entry.ts === "number" &&
      Date.now() - entry.ts < TTL_MS
    ) {
      applyData(entry.data);
    }

    const ac = new AbortController();
    fetchAndUpdate(ac.signal);
    return () => ac.abort();
  }, [userData.idUser, filter, applyData, fetchAndUpdate]);

  useGroupRealtime(userData.idUser, {
    onUserTasksChanged: () => {
      const ac = new AbortController();
      fetchAndUpdate(ac.signal);
      // Don't forget to cancel if the component manages to unmount
      return () => ac.abort();
    },
  });

  const handleChangeFilter = (e) => setFilter(e.target.value);

  return (
    <div className="">
      <div className="flex flex-row items-center gap-2">
        <h1 className="font-bold text-cyan-900/80 text-lg">Your tasks for</h1>
        <select
          value={filter}
          className="text-md text-cyan-800 border border-cyan-800/30 hover:bg-cyan-900/10 transition-all rounded cursor-pointer outline-0 px-2 py-0.5"
          onChange={handleChangeFilter}
        >
          <option value="today">today</option>
          <option value="week">week</option>
          <option value="month">month</option>
        </select>
      </div>

      {loading && !hasValidCache && (
        <p className="text-slate-500 mt-2">Loading...</p>
      )}
      {err && <p className="text-red-500 mt-2">{err}</p>}

      {/* if there is a cache - show the content (even when loading=true) */}
      {!err && (
        <div className="flex flex-row gap-4 mt-4 text-sm md:text-md">
          <div className="w-1/2 space-y-2 bg-slate-300 p-1.5 rounded-md border border-slate-400">
            <div className="flex flex-row items-center gap-2">
              <RiTodoFill className="text-cyan-900/80" />
              <p className="text-cyan-900/80 font-bold">Todo</p>
            </div>
            {todoTasks.length > 0 ? (
              <ul className="border border-cyan-800/40 bg-cyan-800/20 p-2 space-y-1 rounded-md max-h-34 md:max-h-40 overflow-y-scroll">
                {todoTasks.map((item, index) => (
                  <BriefTasksList key={index} data={item} type="todo" />
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 mt-2">
                No tasks for {filter !== "today" ? "this " : ""}
                {filter}
              </p>
            )}
          </div>
          <div className="w-1/2 space-y-2 bg-slate-300 p-1.5 rounded-md border border-slate-400">
            <div className="flex flex-row items-center gap-2">
              <MdOutlineDownloadDone className="text-green-900/80" />
              <p className="text-green-900/80 font-bold">Done</p>
            </div>
            {doneTasks.length > 0 ? (
              <ul className="border border-green-800/40 bg-green-800/20 p-2 space-y-1 rounded-md max-h-34 md:max-h-40 overflow-y-scroll">
                {doneTasks.map((item, index) => (
                  <BriefTasksList key={index} data={item} type="done" />
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 mt-2">
                No done tasks for {filter !== "today" ? "this " : ""}
                {filter}
              </p>
            )}
          </div>
        </div>
      )}
      <div></div>
    </div>
  );
}
