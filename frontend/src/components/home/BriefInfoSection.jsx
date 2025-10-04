import { useRef, useState } from "react";
import { getMyTasksReport } from "../../services/tasksService";
import BriefTasksList from "./BriefTasksListItem";

import { RiTodoFill } from "react-icons/ri";
import { MdOutlineDownloadDone } from "react-icons/md";
import { useCachedQuery } from "../../hooks/useCachedQuery";
import { useUserRealtime } from "../../realtime/useUserRealtime";

export default function BriefInfoSection({ userData }) {
  const [filter, setFilter] = useState("today");

  const {
    data: rows = { todo: [], done: [] },
    loading,
    error,
    hasValidCache,
    refetch,
  } = useCachedQuery(
    ["tasksReport", userData.idUser, filter],
    () => getMyTasksReport(userData.idUser, filter),
    {
      ttl: 60_000,
      refetchOnWindowFocus: false,
      select: (list) => ({
        todo: list.filter((r) => r.status === "todo"),
        done: list.filter((r) => r.status === "done"),
      }),
    }
  );

  const todoTasks = rows.todo ?? [];
  const doneTasks = rows.done ?? [];

  const refetchTs = useRef(0);
  useUserRealtime(userData.idUser, {
    onUserTasksChanged: () => {
      const now = Date.now();
      if (now - refetchTs.current < 600) return;
      refetchTs.current = now;
      refetch();
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
        <p className="text-slate-500 mt-2 animate-pulse">Loading...</p>
      )}
      {error && <p className="text-red-500 mt-2">{error}</p>}

      {/* if there is a cache - show the content (even when loading=true) */}
      {!error && (
        <div className="flex flex-row gap-4 mt-4 text-sm md:text-md">
          <div className="w-1/2 space-y-2 bg-slate-300 p-1.5 rounded-md border border-slate-400">
            <div className="flex flex-row items-center gap-2">
              <RiTodoFill className="text-cyan-900/80" />
              <p className="text-cyan-900/80 font-bold">Todo</p>
            </div>
            {todoTasks.length > 0 ? (
              <ul className="border border-cyan-800/40 bg-cyan-800/20 p-2 space-y-1 rounded-md max-h-34 md:max-h-40 overflow-y-auto">
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
              <ul className="border border-green-800/40 bg-green-800/20 p-2 space-y-1 rounded-md max-h-34 md:max-h-40 overflow-y-auto">
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
