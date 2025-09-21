import TaskWheel from "./TaskWeel";
import defaultAvatar from "../../assets/initialAvatar.jpg";

export default function ({ user }) {
  if (!user) return null;

  const pending = (user.tasksAssigned || [])
    .filter((t) =>
      t.Users.some(
        (x) => x.UserTask?.status !== "done" && x.idUser === user.idUser
      )
    )
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  const next = pending[0];

  return (
    <div className="bg-white border border-slate-400 shadow rounded-2xl flex flex-col md:flex-row justify-between items-center p-4 gap-6">
      <div className="flex items-center gap-4">
        {user.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={user.name}
            className="size-28 md:size-36 object-cover border-4 rounded-full"
            style={{ borderColor: user.color }}
          />
        ) : (
          <div className="size-36 flex items-center justify-center rounded-full border border-slate-400">
            <img
              src={defaultAvatar}
              alt="default avatar"
              className="overflow-hidden object-cover rounded-full bg-white"
            />
          </div>
        )}

        <TaskWheel
          done={user.tasksDone || 0}
          total={user.tasksTotal || 0}
          size={140}
          strokeWidth={14}
          strokeColor={user.color || "#06b6d4"}
        />
      </div>

      <div className="flex w-full md:w-3/5 gap-2">
        <div className="flex-1">
          <h2 className="text-lg md:text-xl font-semibold">{user.name}</h2>
          <p className="text-gray-700 text-sm md:text-md md:mt-2">
            Tasks: {user.tasksDone}/{user.tasksTotal}
          </p>

          <div className="bg-slate-500/20 border border-slate-300 rounded-xl shadow p-3 mt-2">
            <h3 className="md:text-lg font-semibold md:mb-2">Next task</h3>
            {next ? (
              <p className="text-slate-600 text-sm md:text-md font-medium">
                To be done before{" "}
                <span className="underline">
                  {new Date(next.startDate).toLocaleDateString()}
                </span>
              </p>
            ) : (
              <p className="text-green-600 text-sm md:text-md font-semibold">No pending tasks</p>
            )}
          </div>
        </div>

        <div className="flex gap-4 min-h-38">
          <div className="flex flex-col items-center justify-between">
            <span className="text-sm font-semibold text-green-700">Done</span>
            <div className="w-10 bg-green-800/50 rounded-lg flex-1 flex items-end">
              <div
                className="bg-green-800 w-full rounded-lg transition-all duration-500"
                style={{
                  height: `${
                    ((user.tasksDone || 0) / (user.tasksTotal || 1)) * 100
                  }%`,
                }}
              />
            </div>
            <span className="font-bold text-lg text-green-800">
              {user.tasksDone || 0}
            </span>
          </div>
          <div className="flex flex-col items-center justify-between">
            <span className="text-sm font-semibold text-red-700/50">Todo</span>
            <div className="w-10 bg-red-200 rounded-lg flex-1 flex items-end">
              <div
                className="bg-red-700 w-full rounded-lg transition-all duration-500"
                style={{
                  height: `${
                    ((user.tasksPending || 0) / (user.tasksTotal || 1)) * 100
                  }%`,
                }}
              />
            </div>
            <span className="font-bold text-lg rounded-lg text-red-800">
              {user.tasksPending || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
