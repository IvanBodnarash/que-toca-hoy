import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from "../api/apiFetch";

export async function getMyGroups() {
  const rawUser = localStorage.getItem("user");
  if (!rawUser) throw new Error("NO_AUTH");
  const { idUser } = JSON.parse(rawUser);
  return apiGet(`/user/${idUser}/groups`);
}

export async function getGroupMaterials(groupId) {
  return apiGet(`/group/${groupId}/materials`);
}

export async function getGroupTemplatesTasks(groupId) {
  return apiGet(`/tasktemplate/group/${groupId}/task`);
}

export async function getGroupTemplatesRecipes(groupId) {
  const recipes = await apiGet(`/tasktemplate/group/${groupId}/recipe`);
  const out = [];
  for (const r of recipes) {
    const materials = await apiGet(
      `/materialtasktemplate/${r.idTaskTemplate}/materials`
    );
    out.push({ ...r, materials });
  }
  return out;
}

export async function createGroup({ name, image }) {
  const body = { name, image: image ?? null };
  const res = await apiPost("/group/createwithpin", body);
  return res;
}

// Join with PIN (without idGroup)
export async function joinGroupByPin(pin) {
  const res = await apiPost("/usergroup/join-by-pin", { pin });
  return res;
}

// Get PIN of specific group
export async function fetchGroupPin(idGroup) {
  const res = await apiGet(`/group/${idGroup}/pin`);
  return res.pin;
}

export async function getGroupUsers(groupId) {
  return apiGet(`/group/${groupId}/users`);
}

export async function getGroupTemplates(groupId) {
  return apiGet(`/group/${groupId}/templates`);
}

export async function rotateGroupPin(groupId) {
  const res = await apiPut(`/group/${groupId}/changepin`, {});
  return res.pin; // Returns only the pin
}

export async function getGroupById(groupId) {
  return apiGet(`/group/${groupId}`);
}

export async function updateGroupName(groupId, newName) {
  return apiPatch(`/group/${groupId}/name`, { name: newName });
}

export async function darGroupPin(groupId) {
  return apiGet(`/group/${groupId}/pin`);
}

export async function deleteGroup(groupId) {
  const rawUser = localStorage.getItem("user");
  const { idUser } = JSON.parse(rawUser || "{}");
  return apiDelete(`/usergroup/group/${groupId}/user/${idUser}`);
}

export async function createGroupTemplate(groupId, payload, materials = []) {
  // Сheck if template with same name exists in group
  const existingTemplates = await apiGet(`/group/${groupId}/templates`);
  if (existingTemplates.find((t) => t.name === payload.name)) {
    throw new Error("Template with same name already exists in group");
  }

  // Сheck materials
  let data = await getGroupMaterials(groupId);
  let existingMaterials = data.materials || [];
  let materialsReady = [];

  if (materials && materials.length > 0) {
    for (const mat of materials) {
      let material = existingMaterials.find(
        (m) => m.idMaterial === mat.idMaterial
      );

      if (!material) {
        material = await apiPost(`/material/`, {
          name: mat.name,
          assumed: false,
        });
        existingMaterials.push(material);
      }

      materialsReady.push({
        ...mat,
        idMaterial: material.idMaterial,
      });
    }

    const taskTemplate = await apiPost(`/group/${groupId}/templates`, payload);

    for (const mat of materialsReady) {
      await apiPost(`/materialtasktemplate`, {
        idMaterial: mat.idMaterial,
        idTaskTemplate: taskTemplate.idTaskTemplate,
        quantity: mat.quantity,
        unit: mat.unit || "ud",
      });
    }

    return taskTemplate;
  }

  // If there are no materials, create a template alone
  return apiPost(`/group/${groupId}/templates`, payload);
}

export async function getGroupBuyList(groupId, filter = "week") {
  return apiGet(
    `/group/${groupId}/buylist?filter=${encodeURIComponent(filter)}`
  );
}

export const getGroupTasksDated = async (groupId) => {
  return apiGet(`/taskDated/group/${groupId}`);
};

// Tasks with status for status page
export const getGroupTasksDatedStatus = async (groupId) => {
  return apiGet(`/taskDated/group/${groupId}/status`);
};

export async function uploadGroupImage(groupId, file) {
  const formData = new FormData();
  formData.append("file", file);
  const data = await apiPost(`/group/${groupId}/upload`, formData);
  return data.base64Image || data.path;
}

export async function updateGroupTemplate(groupId, template) {
  return apiPut(
    `/tasktemplate/group/${groupId}/template/${template.idTaskTemplate}`,
    template
  );
}

export async function getGroupDetails(groupId) {
  try {
    const [info, users, tasks] = await Promise.all([
      getGroupById(groupId), // Basic info (name, image, etc.)
      getGroupUsers(groupId), // Group users
      getGroupTasksDatedStatus(groupId), // Tasks with state
    ]);

    return {
      ...info,
      users,
      tasks,
    };
  } catch (error) {
    console.error("Error fetching group details:", error);
    throw error;
  }
}
