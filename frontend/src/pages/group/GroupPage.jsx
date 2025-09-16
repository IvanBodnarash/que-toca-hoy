import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router";
import {
  getGroupTemplatesTasks,
  getGroupTemplatesRecipes,
  getGroupUsers,
  getGroupById,
  darGroupPin,
  getGroupTasksDatedStatus,
  rotateGroupPin,
} from "../../services/groupsService.js";
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineReload,
  AiOutlineCopy,
} from "react-icons/ai";
import toast, { Toaster } from "react-hot-toast";

import FilterButton from "../../components/ui/FilterButton.jsx";
import UserDetails from "../../components/ui/UserDetails.jsx";

import { getDateRange } from "../../utils/date.js";
import { useGroupRealtime } from "../../realtime/useGroupRealtime.js";
import { useAuth } from "../../context/AuthContext.jsx";
import UserCard from "../../components/ui/UserCard.jsx";

const filterTasksByPeriod = (tasks, period) => {
  const now = new Date();
  return tasks.filter((t) => {
    //console.log("this task ", t);

    if (!t?.startDate || !t?.endDate) return false;

    const start = new Date(t.startDate);
    const end = new Date(t.endDate);

    const { startDate: startFilter, endDate: endFilter } = getDateRange(period);

    //console.log(start, startFilter, end, endFilter);

    return end >= startFilter && start <= endFilter;
  });
};

export default function GroupPage() {
  const token = localStorage.getItem("token");
  const rawUser = localStorage.getItem("user");
  const { user } = useAuth();
  // console.log(rawUser);
  if (!token || !rawUser) throw new Error("NO_AUTH");

  const me = user;
  const { groupId } = useParams();

  const [selectedUser, setSelectedUser] = useState(null);
  const [groupUsers, setGroupUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);
  const [groupPin, setGroupPin] = useState(null);
  const [period, setPeriod] = useState("day");

  const fetchGroupData = async () => {
    setLoading(true);
    setError("");
    try {
      const allUsersRaw = await getGroupUsers(groupId);
      const allUsers = allUsersRaw.find((u) => u.idUser === user.idUser)
        ? allUsersRaw
        : [user, ...allUsersRaw];

      const tasksDated = await getGroupTasksDatedStatus(groupId);
      const recipes = await getGroupTemplatesRecipes(groupId);

      const allUsersWithKpis = allUsers.map((u) => {
        const userTasks = (tasksDated || []).filter((t) =>
          (t?.Users || []).some((x) => x.idUser === u.idUser)
        );

        const counts = userTasks.reduce(
          (acc, t) => {
            const rel = t.Users.find((x) => x.idUser === u.idUser);
            const s = String(rel?.UserTask?.status || "todo").toLowerCase();
            if (s === "done") acc.done += 1;
            else acc.todo += 1;
            return acc;
          },
          { done: 0, todo: 0 }
        );

        const userRecipes = (recipes || []).filter(
          (r) => r?.assignedTo === u.idUser
        );

        return {
          ...u,
          tasksAssigned: userTasks,
          tasksDone: counts.done,
          tasksPending: counts.todo,
          tasksTotal: userTasks.length,
          recipesAssigned: userRecipes,
          imageUrl: u.image || u.imageUrl || null,
        };
      });

      setGroupUsers(allUsersWithKpis);
      setSelectedUser(allUsersWithKpis.find((u) => u.idUser === user.idUser));

      try {
        const pinData = await darGroupPin(groupId);
        setGroupPin(pinData?.pin || "N/A");
      } catch {
        setGroupPin("N/A");
      }
    } catch (err) {
      console.error("Error cargando datos del grupo:", err);
      setError("No se pudo cargar el grupo");
      toast.error("❌ Error cargando datos del grupo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  useGroupRealtime(groupId, {
    onCalendarPatched: () => fetchGroupData(),
    onTemplatesChanged: () => fetchGroupData(),
    onGroupPatched: () => fetchGroupData(),
    onMembersUpdated: () => fetchGroupData(),
  });

  const filteredGroupUsers = useMemo(() => {
    return groupUsers.map((user) => {
      const tasksFiltered = filterTasksByPeriod(
        user.tasksAssigned || [],
        period
      );
      const recipesFiltered = filterTasksByPeriod(
        user.recipesAssigned || [],
        period
      );

      const counts = tasksFiltered.reduce(
        (acc, t) => {
          const rel = t.Users.find((x) => x.idUser === user.idUser);
          const s = String(rel?.UserTask?.userStatus || "todo").toLowerCase();
          if (s === "done") acc.done += 1;
          else acc.todo += 1;
          return acc;
        },
        { done: 0, todo: 0 }
      );

      return {
        ...user,
        tasksAssigned: tasksFiltered,
        tasksDone: counts.done,
        tasksPending: counts.todo,
        tasksTotal: tasksFiltered.length,
        recipesAssigned: recipesFiltered,
      };
    });
  }, [groupUsers, period]);

  const userToShowFiltered = useMemo(() => {
    if (!filteredGroupUsers || filteredGroupUsers.length === 0) return null;
    return selectedUser
      ? filteredGroupUsers.find((u) => u.idUser === selectedUser.idUser)
      : filteredGroupUsers.find((u) => u.idUser === user.idUser);
  }, [filteredGroupUsers, selectedUser, user.idUser]);

  if (loading) return <p className="text-center mt-8">Loading group data...</p>;
  if (error) return <p className="text-center mt-8 text-red-500">{error}</p>;

  return (
    <div className="bg-cyan-950/10 py-22 xl:px-48">
      <Toaster position="bottom-center" />
      <div className="flex flex-col w-11/12 md:w-4/5 gap-4 mx-auto">
        {/* PIN del grupo */}
        <div className="flex items-center justify-between bg-white p-1.5 rounded-xl shadow">
          <div className="flex items-center gap-4">
            {" "}
            <button
              type="button"
              onClick={() => setVisible(!visible)}
              className="p-2 bg-cyan-800 text-white rounded hover:bg-cyan-700 transition-all cursor-pointer"
            >
              {visible ? (
                <AiOutlineEyeInvisible size={18} />
              ) : (
                <AiOutlineEye size={18} />
              )}
            </button>
            <h1 className="text-cyan-900">Show group details</h1>
          </div>
          {visible && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-700 font-medium">
                {groupPin ? `Group pin:  ${groupPin}` : "Group pin:  N/A"}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (groupPin) {
                    navigator.clipboard.writeText(groupPin);
                    toast.success("PIN copied to clipboard");
                  }
                }}
                className="p-2 bg-cyan-800 text-white rounded hover:bg-cyan-700 transition-all cursor-pointer"
              >
                <AiOutlineCopy size={18} />
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const newPin = await rotateGroupPin(groupId);
                    setGroupPin(newPin);
                    toast.success("PIN refreshed");
                  } catch (err) {
                    toast.error(`❌ ${err.message}`);
                  }
                }}
                className="p-2 bg-cyan-800 text-white rounded hover:bg-cyan-700 transition cursor-pointer"
              >
                <AiOutlineReload size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Period selector */}
        <div className="flex justify-center gap-2 bg-slate-300 rounded-xl p-1">
          {["day", "week", "month"].map((p) => (
            <FilterButton
              key={p}
              onClick={() => setPeriod(p)}
              active={period === p}
            >
              {p === "day" ? "Day" : p === "week" ? "Week" : "Month"}
            </FilterButton>
          ))}
        </div>

        {/* User details */}
        <UserDetails user={userToShowFiltered} />

        {/* Users grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredGroupUsers.map((u) => (
            <UserCard
              key={u.idUser}
              user={u}
              isSelected={u.idUser === userToShowFiltered?.idUser}
              onClick={() => setSelectedUser(u)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
