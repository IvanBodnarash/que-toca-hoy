import { initialGroups } from "../mock_data/groups";

export const LOCALSTORAGE_GROUPS_KEY = "groups_state";

export function loadGroups() {
  try {
    const saved = localStorage.getItem(LOCALSTORAGE_GROUPS_KEY);
    return saved ? JSON.parse(saved) : initialGroups;
  } catch {
    return initialGroups;
  }
}

export function saveGroups(groups) {
  localStorage.setItem(LOCALSTORAGE_GROUPS_KEY, JSON.stringify(groups));
}

export function addGroup(groups, newGroup) {
  const next = [...groups, newGroup];
  saveGroups(next);
  return next;
}

export function findGroupById(groups, id) {
  return groups.find((g) => g.id === id) || null;
}
