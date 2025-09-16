export function getUserColor(u) {
  const c = (u?.color || "").trim();
  return c ? c : "#9aa5b1"; // gray default
}

export function usersGradient(users) {
  if (!users?.length) return "#9aa5b1";
  if (users.length === 1) return getUserColor(users[0]);

  // Gradient
  const stops = users
    .map((u, i) => {
      const pctStart = Math.round((i / users.length) * 100);
      const pctEnd = Math.round(((i + 1) / users.length) * 100);
      return `${getUserColor(u)} ${pctStart}%, ${getUserColor(u)} ${pctEnd}%`;
    })
    .join(", ");

  return `linear-gradient(135deg, ${stops})`;
}

// Color invertion converter
export function getContrastYIQ(hexcolor) {
  if (!hexcolor) return "#fff";
  let c = hexcolor.replace("#", "");
  if (c.length === 3) {
    // #fff -> #ffffff
    c = c
      .split("")
      .map((ch) => ch + ch)
      .join("");
  }
  const r = parseInt(c.substr(0, 2), 16);
  const g = parseInt(c.substr(2, 2), 16);
  const b = parseInt(c.substr(4, 2), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000" : "#fff"; // light background -> black text, dark background -> white text
}

// Converting TaskDated -> event для react-big-calendar
export function toCalendarEvent(task) {
  const start = new Date(task.startDate);
  const end = task.endDate
    ? new Date(task.endDate)
    : new Date(start.getTime() + 60 * 60 * 1000);

  const titleBase = task?.TaskTemplate?.name || "Task";
  const assignees = (task.Users || []).map(
    (u) => u.username || u.name || `user#${u.idUser}`
  );
  const title = assignees.length
    ? `${titleBase} • ${assignees.join(", ")}`
    : titleBase;

  return {
    id: task.idTaskDated,
    title,
    start,
    end,
    raw: task,
  };
}

export function mapTaskDatedToEvents(task) {
  if (!task) return [];

  const base = {
    id: task.idTaskDated,
    taskId: task.idTaskDated,
    title: task.TaskTemplate?.name || "Untitled task",
    start: new Date(task.startDate),
    end: new Date(task.endDate),
    status: task.status,

    userTaskStatus: task.Users?.[0]?.UserTask?.status || null,
    frequency: task.frequency,
    rotative: task.rotative,
  };

  const users = Array.isArray(task.Users) ? task.Users : [];

  if (users.length > 0) {
    return users.map((u) => ({
      ...base,
      id: `${task.idTaskDated}:${u.idUser}`,
      user: {
        idUser: u.idUser,
        username: u.username,
        name: u.name,
        color: u.color || "#6b7280",
        image: u.image || null,
      },
      userTaskStatus: u.UserTask?.status || "todo",
    }));
  }

  return [
    {
      ...base,
      // id: `${task.idTaskDated}:unassigned`,
      user: null,
      userTaskStatus: null,
    },
  ];
}
