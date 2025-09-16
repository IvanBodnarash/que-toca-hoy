import moment from "moment";
import { useState } from "react";
import {
  assignUserToTask,
  unassignUserFromTask,
  updateTaskDatedStatus,
  updateUserTaskStatus,
  deleteTaskDated,
  createNextNow,
} from "../../services/taskDatedService";
import { getGroupUsers } from "../../services/groupsService";
import { getContrastYIQ } from "../../utils/calendar";
import ConfirmDialog from "../alerts/ConfirmDialog";
import ReassignDialog from "../alerts/Reassign";
import { useAuth } from "../../context/AuthContext";
import PlanTasksAhead from "./PlanTasksAhead";

export default function DayTasksModal({
  open,
  date,
  eventsForDay,
  groupId,
  onClose,
  onAdd,
  onChanged,
}) {
  const { user: me } = useAuth();

  const [busyId, setBusyId] = useState(null);

  // Confirm
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmPayload, setConfirmPayload] = useState(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [confirmMode, setConfirmMode] = useState(null); // 'unassign' | 'delete'

  // Reassign
  const [reassignOpen, setReassignOpen] = useState(false);
  const [reassignBusy, setReassignBusy] = useState(false);
  const [reassignFor, setReassignFor] = useState(null); // event
  const [groupUsers, setGroupUsers] = useState([]);

  // Plan Tasks Now
  const [planOpen, setPlanOpen] = useState(false);
  const [planForEvent, setPlanForEvent] = useState(null);
  const [planTimes, setPlanTimes] = useState(1);
  const [planBusy, setPlanBusy] = useState(false);

  // Accordion
  const [openId, setOpenId] = useState(null);
  const toggleOpen = (id) => setOpenId((curr) => (curr === id ? null : id));

  if (!open) return null;

  const getTaskId = (event) => event.taskId ?? event.idTaskDated ?? event.id;

  const toggleDone = async (event) => {
    try {
      setBusyId(event.id);

      // if there is an assigned user — change the status in UserTask
      if (event.user?.idUser) {
        const curr = event.userTaskStatus === "done" ? "done" : "todo";
        const nextStatus = curr === "done" ? "todo" : "done";
        await updateUserTaskStatus(
          event.user.idUser,
          getTaskId(event),
          nextStatus
        );
      } else {
        // otherwise — change the status to TaskDated (rarely needed, but whatever)
        const curr = event.status === "done" ? "done" : "todo";
        const nextStatus = curr === "done" ? "todo" : "done";
        await updateTaskDatedStatus(getTaskId(event), nextStatus);
      }

      onChanged?.();
    } catch (e) {
      const msg = String(e?.message || "");
      if (!msg.includes("RELATION_NOT_FOUND")) {
        console.error(e);
      }
    } finally {
      setBusyId(null);
      setConfirmOpen(false);
      setConfirmPayload(null);
      setConfirmBusy(false);
      onChanged?.();
    }
  };

  // Unassign (throught ConfirmDialog)
  const openUnassignConfirm = (event) => {
    if (!event.user?.idUser) return;
    setConfirmPayload(event);
    setConfirmMode("unassign");
    setConfirmOpen(true);
  };

  const doUnassign = async () => {
    if (!confirmPayload?.user?.idUser) return;
    try {
      setConfirmBusy(true);
      await unassignUserFromTask(
        confirmPayload.user.idUser,
        getTaskId(confirmPayload)
      );
      setConfirmOpen(false);
      setConfirmPayload(null);
      onChanged?.();
    } catch (e) {
      const msg = String(e?.message || "");
      if (!msg.includes("RELATION_NOT_FOUND")) {
        console.error(e);
      }
    } finally {
      setConfirmOpen(false);
      setConfirmPayload(null);
      setConfirmBusy(false);
      onChanged?.();
    }
  };

  // Delete task (throught ConfirmDialog)
  const openDeleteConfirm = (event) => {
    setConfirmPayload(event);
    setConfirmMode("delete");
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    if (!confirmPayload) return;
    try {
      setConfirmBusy(true);
      await deleteTaskDated(confirmPayload.taskId ?? confirmPayload.id);
      setConfirmOpen(false);
      setConfirmPayload(null);
      onChanged?.();
    } catch (error) {
      console.error(error);
    } finally {
      setConfirmBusy(false);
    }
  };

  // Reassign
  const openReassign = async (event) => {
    try {
      setReassignFor(event);
      const users = await getGroupUsers(groupId);
      setGroupUsers(Array.isArray(users) ? users : []);
      setReassignOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  const doReassign = async (newUserId) => {
    if (!reassignFor) return;
    const taskId = getTaskId(reassignFor);
    const prevId = reassignFor.user?.idUser;

    try {
      setReassignBusy(true);
      if (prevId && prevId !== Number(newUserId)) {
        await unassignUserFromTask(prevId, taskId);
      }
      await assignUserToTask(Number(newUserId), taskId);

      setReassignOpen(false);
      setReassignFor(null);
      onChanged?.();
    } catch (e) {
      console.error(e);
    } finally {
      setReassignBusy(false);
    }
  };

  // Claim (assign to me)
  const claimTask = async (event) => {
    if (!me?.idUser) return;
    const taskId = event.taskId ?? event.id;
    try {
      setBusyId(event.id);
      await assignUserToTask(me.idUser, taskId);
      onChanged?.();
    } catch (e) {
      console.error(e);
    } finally {
      setBusyId(null);
    }
  };

  // Plan Tasks Now
  const openPlanAhead = (event) => {
    setPlanForEvent(event);
    console.log(event);
    setPlanTimes(
      event.frequency === "weekly" ? 4 : event.frequency === "monthly" ? 3 : 7
    );
    setPlanOpen(true);
  };

  const doPlanAhead = async () => {
    if (!planForEvent) return;
    try {
      setPlanBusy(true);
      const taskId = getTaskId(planForEvent);
      await createNextNow(taskId, Number(planTimes));
      setPlanOpen(false);
      setPlanForEvent(null);
      onChanged?.();
    } catch (e) {
      console.error(e);
    } finally {
      setPlanBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[92%] max-w-xl rounded-2xl bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg text-gray-900 font-semibold">
            Tasks for {date ? moment(date).format("DD.MM") : ""}
          </h2>
          <button
            onClick={() => onClose()}
            className="inline-flex h-8 w-8 items-center justify-center rounded hover:bg-gray-200 transition-all cursor-pointer"
            title="close"
          >
            ✕
          </button>
        </div>

        {!eventsForDay || eventsForDay.length === 0 ? (
          <p className="text-sm text-gray-500">No tasks for this day.</p>
        ) : (
          <ul className="space-y-2 max-h-[45vh] overflow-auto">
            {eventsForDay.map((event) => {
              const isAssigned = !!event.user?.idUser;
              const isDone = isAssigned
                ? event.userTaskStatus === "done"
                : event.status === "done";
              const bg = isAssigned
                ? event.user?.color || "#6b7280"
                : "#9ca3af"; // Gray back for unassigned
              const textColor = isAssigned ? getContrastYIQ(bg) : "#1f2937"; // Dark text on gray background
              return (
                <li
                  key={event.id}
                  className={`rounded border border-slate-400 transition-all ${
                    isDone ? "opacity-80" : "opacity-100"
                  }`}
                  style={{
                    background: isAssigned ? bg : "#9ca3af",
                    color: textColor,
                  }}
                >
                  {/* Header */}
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 p-3"
                    onClick={() => toggleOpen(event.id)}
                    aria-expanded={openId === event.id}
                  >
                    <input
                      type="checkbox"
                      className="size-5 cursor-pointer accent-cyan-900"
                      checked={isDone}
                      disabled={busyId === event.id}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleDone(event)}
                      title={isDone ? "Mark as todo" : "Mark as done"}
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <div
                        className={`font-medium truncate ${
                          isDone ? "line-through text-gray-700/70" : ""
                        }`}
                        style={{ color: textColor }}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                      <div
                        className="text-xs truncate"
                        style={{ color: textColor }}
                      >
                        {isAssigned ? `@${event.user.username}` : "Unassigned"}
                      </div>
                    </div>

                    <svg
                      className={`w-4 h-4 shrink-0 duration-300 cursor-pointer transition-all ${
                        openId === event.id ? "rotate-180" : ""
                      }`}
                      viewBox="0 0 10 6"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      style={{ color: textColor }}
                    >
                      <path
                        d="M9 5 5 1 1 5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {/* Body */}
                  <div
                    className={`${
                      openId === event.id ? "block" : "hidden"
                    } ${bg} text-gray-800`}
                  >
                    <div className="p-3 border-t border-slate-300 space-y-2">
                      {/* Actions */}
                      <div className="flex flex-wrap justify-end gap-2">
                        {event.frequency && event.frequency !== "none" && (
                          <button
                            className="text-xs px-3 py-2 rounded border bg-slate-300 hover:bg-slate-400 transition-all cursor-pointer"
                            style={{ borderColor: textColor }}
                            onClick={() => openPlanAhead(event)}
                            disabled={busyId === event.id}
                            title="Plan ahead (create many future instances)"
                          >
                            Plan ahead
                          </button>
                        )}
                        {isAssigned ? (
                          <>
                            <button
                              className="text-xs px-3 py-2 rounded border bg-cyan-900 text-white hover:bg-cyan-800 transition-all cursor-pointer"
                              style={{ borderColor: textColor }}
                              onClick={() => openReassign(event)}
                              disabled={busyId === event.id}
                              title="Reassign"
                            >
                              Reassign
                            </button>
                            <button
                              className="text-xs px-3 py-2 rounded border bg-cyan-900 text-white hover:bg-cyan-800 transition-all cursor-pointer"
                              style={{ borderColor: textColor }}
                              onClick={() => openUnassignConfirm(event)}
                              disabled={busyId === event.id}
                              title="Unassign"
                            >
                              Unassign
                            </button>
                          </>
                        ) : (
                          <button
                            className="text-xs px-3 py-2 rounded border bg-green-700 text-white hover:bg-green-800 transition-all cursor-pointer"
                            style={{ borderColor: textColor }}
                            onClick={() => claimTask(event)}
                            disabled={busyId === event.id}
                            title="Claim this task"
                          >
                            Claim
                          </button>
                        )}

                        <button
                          className="text-xs px-3 py-2 rounded border bg-red-700 text-white hover:bg-red-800 transition-all cursor-pointer"
                          style={{ borderColor: textColor }}
                          onClick={() => openDeleteConfirm(event)}
                          disabled={busyId === event.id}
                          title="Delete task"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-4">
          <button
            className="w-full rounded-md bg-cyan-900 hover:bg-cyan-800 active:hover:bg-cyan-700 cursor-pointer transition-all px-4 py-2 text-white"
            onClick={onAdd}
          >
            Add task
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={confirmMode === "delete" ? "Delete task" : "Remove assignment"}
        message={
          confirmMode === "delete"
            ? "This will permanently delete the task. Continue?"
            : confirmPayload?.user?.username
            ? `Remove @${confirmPayload.user.username} from this task?`
            : "Remove user from this task?"
        }
        confirmText={confirmMode === "delete" ? "Delete" : "Remove"}
        cancelText="Cancel"
        danger
        busy={confirmBusy}
        onCancel={() => {
          if (confirmBusy) return;
          setConfirmOpen(false);
          setConfirmPayload(null);
          setConfirmMode(null);
        }}
        onConfirm={confirmMode === "delete" ? doDelete : doUnassign}
      />

      <ReassignDialog
        open={reassignOpen}
        users={groupUsers}
        initialUserId={reassignFor?.user?.idUser ?? ""}
        busy={reassignBusy}
        onCancel={() => {
          if (reassignBusy) return;
          setReassignOpen(false);
          setReassignFor(null);
        }}
        onSave={doReassign}
      />

      {planOpen && planForEvent && (
        <PlanTasksAhead
          doPlanAhead={doPlanAhead}
          planBusy={planBusy}
          planForEvent={planForEvent}
          planTimes={planTimes}
          setPlanForEvent={setPlanForEvent}
          setPlanOpen={setPlanOpen}
          setPlanTimes={setPlanTimes}
        />
      )}
    </div>
  );
}
