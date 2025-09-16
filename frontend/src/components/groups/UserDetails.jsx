import defaultAvatar from "../../assets/initialAvatar.jpg";
import TaskWheel from "../ui/TaskWeel";

export default function UserDetails({ user }) {
  if (!user) return null;

  const pendientes = (user.tasksAssigned || [])
    .filter((t) =>
      t.Users.some(
        (x) => x.UserTask?.status !== "done" && x.idUser === user.idUser
      )
    )
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  const proxima = pendientes[0];

  console.log(user.color);

  return (
    <div className="bg-white shadow-lg rounded-2xl flex flex-col flex-wrap md:flex-row items-center p-6 gap-6">
      <div className="flex flex-row items-center gap-4">
        {user.imageUrl ? (
          <div>
            <img
              src={user.imageUrl}
              alt={user.name}
              className="size-32 object-cover rounded-full border-6"
              style={{ borderColor: user.color }}
            />
          </div>
        ) : (
          <div
            className={`size-32 flex items-center justify-center rounded-full border border-slate-400`}
          >
            <img
              src={defaultAvatar}
              alt="default avatar"
              className={`overflow-hidden object-cover rounded-full border-6 border-[${user.color}]`}
            />
          </div>
        )}

        <TaskWheel
          done={user.tasksDone || 0}
          total={user.tasksTotal || 0}
          size={160}
          strokeWidth={14}
          strokeColor={user.color || "#06b6d4"}
        />
      </div>

      <div className="flex-1">
        <h2 className="text-xl font-semibold">{user.name}</h2>
        <p className="text-gray-700 mt-2">
          Tasks: {user.tasksDone}/{user.tasksTotal}
        </p>

        <div className="bg-gray-50 rounded-xl shadow p-4 mt-6">
          <h3 className="text-lg font-semibold mb-2">📌 Next task</h3>
          {proxima ? (
            <p className="text-gray-800 font-medium">
              Todo before{" "}
              {new Date(proxima.startDate).toLocaleDateString()}
            </p>
          ) : (
            <p className="text-green-600 font-semibold">🎉 You are up to date</p>
          )}
        </div>
      </div>

      <div className="flex gap-4 h-40">
        <div className="flex flex-col items-center justify-between">
          <span className="text-sm font-semibold text-green-700">Done</span>
          <div className="w-10 bg-green-200 rounded-lg flex-1 flex items-end">
            <div
              className="bg-green-600 w-full transition-all duration-500"
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
          <span className="text-sm font-semibold text-red-700">Todo</span>
          <div className="w-10 bg-red-200 rounded-lg flex-1 flex items-end">
            <div
              className="bg-red-600 w-full transition-all duration-500"
              style={{
                height: `${
                  ((user.tasksPending || 0) / (user.tasksTotal || 1)) * 100
                }%`,
              }}
            />
          </div>
          <span className="font-bold text-lg text-red-800">
            {user.tasksPending || 0}
          </span>
        </div>
      </div>
    </div>
  );
}
