import { tasks as initialTasks } from "../mock_data/tasks";

export const TASKS_LS_KEY = "tasks_state";

export function loadTasks() {
  try {
    const saved = localStorage.getItem(TASKS_LS_KEY);
    return saved ? JSON.parse(saved) : initialTasks; // fallback на мок
  } catch {
    return initialTasks;
  }
}

export function saveTasks(tasks) {
  localStorage.setItem(TASKS_LS_KEY, JSON.stringify(tasks));
}
