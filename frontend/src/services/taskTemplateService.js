import { apiPost, apiPut } from "../api/apiFetch";

// Update template (TaskTemplate)
export async function updateTaskTemplate(idTaskTemplate, payload) {
  if (!idTaskTemplate) throw new Error("NO_ID");
  return apiPut(`/tasktemplate/${idTaskTemplate}`, payload);
}

// Create recipe with materials
export async function createRecipeTemplate(groupId, payload, materials = []) {
  if (!groupId) throw new Error("NO_GROUP");

  // 1. Create TaskTemplate - recipe type
  const taskTemplate = await apiPost(`/tasktemplate/group/${groupId}`, {
    ...payload,
    type: "recipe",
  });

  // 2. Associate materials
  if (Array.isArray(materials) && materials.length > 0) {
    for (const mat of materials) {
      await apiPost(`/materialtasktemplate`, {
        idTaskTemplate: taskTemplate.idTaskTemplate,
        idMaterial: mat.idMaterial,
        quantity: mat.quantity,
        unit: mat.unit || "ud",
      });
    }
  }

  return taskTemplate;
}
