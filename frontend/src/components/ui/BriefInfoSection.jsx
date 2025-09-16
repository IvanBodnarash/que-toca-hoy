import { useCallback, useEffect, useState } from "react";
import { getMyTasksReport } from "../../services/tasksService";
import { useGroupRealtime } from "../../realtime/useGroupRealtime";
import BriefTasksList from "./BriefTasksListItem";

import { RiTodoFill } from "react-icons/ri";
import { MdOutlineDownloadDone } from "react-icons/md";

export default function BriefInfoSection({ userData }) {
  const [filter, setFilter] = useState("today");
  const [todoTasks, setTodoTasks] = useState([]);
  const [doneTasks, setDoneTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const getAllMyTasks = useCallback(async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await getMyTasksReport(userData.idUser, filter);
      const tasksTodo = res.filter((item) => item.status === "todo");
      const tasksDone = res.filter((item) => item.status === "done");
      console.log(tasksTodo);
      setTodoTasks(tasksTodo);
      setDoneTasks(tasksDone);
    } catch (error) {
      setErr("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [userData.idUser, filter]);

  useEffect(() => {
    getAllMyTasks();
  }, [getAllMyTasks]);

  useGroupRealtime(userData.idUser, {
    onUserTasksChanged: () => {
      getAllMyTasks();
    },
  });

  const handleChangeFilter = (e) => setFilter(e.target.value);

  return (
    <div className="">
      <div className="flex flex-row items-center gap-2">
        <h1 className="font-bold text-lg">Your tasks for</h1>
        <select
          value={filter}
          className="text-lg border border-cyan-800 rounded cursor-pointer outline-0 px-2 py-0.5"
          onChange={handleChangeFilter}
        >
          <option value="today">today</option>
          <option value="week">week</option>
          <option value="month">month</option>
        </select>
      </div>

      {loading && <p className="text-slate-500 mt-2">Loading...</p>}
      {err && <p className="text-red-500 mt-2">{err}</p>}

      {!loading && !err && (
        <div className="flex flex-row gap-4 mt-4">
          <div className="w-full space-y-2 bg-slate-300 p-1.5 rounded-md border border-slate-400">
            <div className="flex flex-row items-center gap-2">
              <RiTodoFill className="text-cyan-900/80" />
              <p className="text-cyan-900/80 font-bold">Todo</p>
            </div>
            {todoTasks.length > 0 ? (
              <ul className="border border-cyan-800/40 bg-cyan-800/20 p-2 space-y-1 rounded-md max-h-40 overflow-y-scroll">
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
          <div className="w-full space-y-2 bg-slate-300 p-1.5 rounded-md border border-slate-400">
            <div className="flex flex-row items-center gap-2">
              <MdOutlineDownloadDone className="text-green-900/80" />
              <p className="text-green-900/80 font-bold">Done</p>
            </div>
            {doneTasks.length > 0 ? (
              <ul className="border border-green-800/40 bg-green-800/20 p-2 space-y-1 rounded-md max-h-40 overflow-y-scroll">
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
