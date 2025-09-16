import { apiGet } from "../api/apiFetch";
import { updateUserTaskStatus } from "./taskDatedService";

export async function getGroupEvents(idGroup, range) {
  if (range?.from || range?.to) {
    const p = new URLSearchParams();
    if (range.from) p.set("from", range.from);
    if (range.to) p.set("to", range.to);
    return apiGet(`/taskdated/group/${idGroup}/range?` + p.toString());
  }
  return apiGet(`/taskdated/group/${idGroup}`);
}

export async function toggleTaskDoneForUser(idTaskDated, idUser, status) {
  return updateUserTaskStatus(idUser, idTaskDated, status);
}
