import { apiGet, apiPost, apiPut, apiDelete } from "../api/apiFetch";

export async function getGroupDatedTasks(idGroup) {
  return apiGet(`/taskdated/group/${idGroup}`);
}

export async function assignUserToTask(idUser, idTaskDated) {
  return apiPost(`/usertask/assign`, { idUser, idTaskDated });
}

export async function unassignUserFromTask(idUser, idTaskDated) {
  return apiPost(`/usertask/unassign`, { idUser, idTaskDated });
}

export async function updateUserTaskStatus(idUser, idTaskDated, status) {
  return apiPost(`/usertask/status`, { idUser, idTaskDated, status });
}

export async function updateTaskDatedStatus(idTaskDated, status) {
  return apiPut(`/taskdated/${idTaskDated}`, { status });
}

export async function createTaskDated(payload) {
  const { materials, ...cleanPayload } = payload;

  const taskDatedCreated = await apiPost(`/taskdated`, {
    status: "todo",
    frequency: "none",
    rotative: false,
    ...cleanPayload,
  });

  if (materials && materials.length > 0) {
    await apiPost(`/buylist/${payload.idTaskTemplate}/list`, {
      materials,
      idTaskDated: taskDatedCreated.idTaskDated,
    });
  }
  return { idTaskDated: taskDatedCreated.idTaskDated };
}

export async function deleteTaskDated(idTaskDated) {
  return apiDelete(`/taskdated/${idTaskDated}`);
}

export async function getMaterialsforTemplante(idTemplate) {
  return apiGet(`/materialtasktemplate/${idTemplate}/materials`);
}

export async function startCronJob() {
  return apiPost(`/cron/start-cron`);
}

export async function createNextNow(idTaskDated, times = 1) {
  return apiPost(`/taskdated/${idTaskDated}/next`, { times });
}
