import { apiGet, apiPut } from "../api/apiFetch";

export async function getMyTasksReport(idUser, filter = "today") {
  return apiGet(`/user/${idUser}/usertask/report?filter=${filter}`);
}

export async function setUserTaskStatus({ idUser, idTaskDated, status }) {
  return apiPut(`/usertask/status`, { idUser, idTaskDated, status });
}
