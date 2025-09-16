const API = "http://localhost:3000";

export async function updateTaskTemplate(idTaskTemplate, payload) {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("NO_AUTH");

    const res = await fetch(`${API}/tasktemplate/${idTaskTemplate}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${msg || ""}`.trim());
    }

    return res.json();
}

// Crear receta con materiales
export async function createRecipeTemplate(groupId, payload, materials = []) {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("NO_AUTH");

    // Crear el TaskTemplate de tipo recipe
    const resTpl = await fetch(`${API}/tasktemplate/group/${groupId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ ...payload, type: "recipe" }),
    });

    if (!resTpl.ok) {
        const msg = await resTpl.text().catch(() => "");
        throw new Error(`HTTP ${resTpl.status} ${msg || ""}`.trim());
    }

    const taskTemplate = await resTpl.json();

    // Asociar materiales
    for (const mat of materials) {
        const resMat = await fetch(`${API}/materialtasktemplate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
            body: JSON.stringify({
                idTaskTemplate: taskTemplate.idTaskTemplate,
                idMaterial: mat.idMaterial,
                quantity: mat.quantity,
                unit: mat.unit || "ud",
            }),
        });

        if (!resMat.ok) {
            const msg = await resMat.text().catch(() => "");
            throw new Error(`HTTP ${resMat.status} ${msg || ""}`.trim());
        }
    }

    return taskTemplate;
}
