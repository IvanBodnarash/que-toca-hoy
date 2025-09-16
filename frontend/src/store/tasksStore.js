import { tasks as initialTasks } from "../mock_data/tasks";

const LOCALSTORAGE_TASKS_KEY = "tasks";

const normalizeTask = (t) => {
  const assignees = Array.isArray(t.assignees)
    ? t.assignees
    : t.userId
    ? [t.userId]
    : [];
  const doneBy =
    typeof t.doneBy === "object" && t.doneBy !== null
      ? t.doneBy
      : t.userId
      ? { [t.userId]: !!t.done }
      : {};
  return {
    ...t,
    assignees,
    doneBy,
    done: !!t.done,
  };
};

export function loadTasks() {
  const stored = localStorage.getItem(LOCALSTORAGE_TASKS_KEY);
  if (stored) {
    try {
      return stored ? JSON.parse(stored) : [];
    } catch {
      return initialTasks;
    }
  }
  return initialTasks;
}

export function saveTasks(tasks) {
  try {
    localStorage.setItem(LOCALSTORAGE_TASKS_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("Error saving tasks:", error);
  }
}

export function addTask(task) {
  const tasks = loadTasks();
  const newTask = {
    ...task,
    id: Date.now().toString(),
    done: false,
  };
  const updated = [...tasks, newTask];
  saveTasks(updated);
  return newTask;
}

export function updateTask(prev, taskId, patch) {
  const next = prev.map((t) =>
    t.id === taskId ? normalizeTask({ ...t, ...patch }) : t
  );
  saveTasks(next);
  return next;
}

export function deleteTask(taskId) {
  const tasks = loadTasks();
  const updated = tasks.filter((t) => t.id !== taskId);
  saveTasks(updated);
}
