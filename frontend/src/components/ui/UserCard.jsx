import { hextoRGBA } from "../../utils/hexToRGBA";
import defaultAvatar from "../../assets/initialAvatar.jpg"

export default function UserCard({ user, isSelected, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl shadow p-3 flex items-center gap-4 cursor-pointer transition hover:shadow-md ${
        isSelected ? "ring-2 ring-cyan-700" : ""
      }`}
      style={{
        backgroundColor: hextoRGBA(user.color, 0.4),
      }}
    >
      {user.imageUrl ? (
        <img
          src={user.imageUrl}
          alt={user.name}
          className="w-20 h-20 object-cover bg-white rounded-full border border-slate-400"
        />
      ) : (
        <div className="w-20 h-20 flex items-center justify-center rounded-full border border-slate-400">
          <img
            src={defaultAvatar}
            alt="default avatar"
            className="overflow-hidden object-cover rounded-full bg-white"
          />
        </div>
      )}
      <div className="flex-1">
        <h3 className="text-lg font-semibold">{user.name}</h3>
        <div className="mt-1 text-sm text-gray-600">
          Tareas: {user.tasksDone}/{user.tasksTotal}
        </div>
        <div className="mt-2 h-2 bg-gray-200 rounded">
          <div
            className="h-2 rounded"
            style={{
              width: `${
                user.tasksTotal > 0
                  ? (user.tasksDone / user.tasksTotal) * 100
                  : 0
              }%`,
              backgroundColor: user.color || "#3b82f6",
            }}
          />
        </div>
      </div>
    </div>
  );
}
