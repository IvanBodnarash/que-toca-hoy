import { apiGet, apiPut } from "../api/apiFetch";

const API = "http://localhost:3000";

// Get user's buy list
export async function getMyBuyListReport(filter = "today") {
  const rawUser = localStorage.getItem("user");
  if (!rawUser) throw new Error("NO_AUTH");

  const me = JSON.parse(rawUser);
  const idUser = me.idUser;
  return apiGet(`/user/${idUser}/buylist/report?filter=${filter}`);
}

// Update quantities in buylist
export async function updateBuyList(payload) {
  const rawUser = localStorage.getItem("user");
  if (!rawUser) throw new Error("NO_AUTH");
  const me = JSON.parse(rawUser);
  const idUser = me.idUser;
  return apiPut(`/user/${idUser}/buylist`, payload);
}

export async function getGroupBuyListReport(idGroup, filter = "today") {
  const rawUser = localStorage.getItem("user");
  if (!rawUser) throw new Error("NO_AUTH");
  const me = JSON.parse(rawUser);
  const idUser = me.idUser;
  return apiGet(
    `/user/${idUser}/group/${idGroup}/buylist/report?filter=${filter}`
  );
}

export async function getTaskBuyList(taskId) {
  if (!taskId) throw new Error("NO_TASK_ID");
  return apiGet(`/taskdated/${taskId}/buylist`);
}
