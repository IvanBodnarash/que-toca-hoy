import {
  TaskTemplate,
  Material,
  TaskDated,
  MaterialTaskTemplate,
} from "../models/index.model.js";
import { createBaseController } from "./base.controller.js";

const baseController = createBaseController(TaskTemplate);

function emitTemplatesChanged(req, idGroup, payload = {}) {
  const gid = Number(idGroup);
  try {
    req.app
      .get("io")
      .to(`group:${gid}`)
      .emit("templates:changed", { idGroup: gid, ...payload });
  } catch {}
}

function emitCalendarRefresh(req, idGroup) {
  const gid = Number(idGroup);
  try {
    req.app
      .get("io")
      .to(`calendar:${gid}`)
      .emit("calendar:refresh", { idGroup: gid });
  } catch (e) {}
}

export const taskTemplateController = {
  ...baseController,

  // Obtener materiales de plantilla de tarea
  getMaterials: async (req, res) => {
    const { id } = req.params;
    try {
      const template = await TaskTemplate.findByPk(id, { include: Material });
      if (!template)
        return res.status(404).json({ message: "Template not found" });
      res.json(template.Materials);
    } catch (error) {
      res.status(500).json({ message: "Error fetching materials" });
    }
  },

  // Obtener tareas de plantilla de tarea
  getTasksByID: async (req, res) => {
    const { idTask } = req.params;
    try {
      const tasks = await TaskDated.findAll({
        where: { idTaskTemplate: idTask },
      });
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Error fetching tasks" });
    }
  },

  // obtener las templates por tipo: task o template
  getByType: async (req, res) => {
    const { type } = req.params;
    try {
      const tasks = await TaskDated.findAll({
        include: [
          { model: TaskTemplate, where: { type: type }, require: true },
        ],
      });
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Error fetching tasks" });
    }
  },
  // listar todos taskTemplate por tipo pasado como variable (tarea o receta) por ID de grupo
  getTasksByTypeByGroupID: async (req, res) => {
    const { type, idGroup } = req.params;

    try {
      const tasks = await TaskTemplate.findAll({
        where: { type: type, idGroup: idGroup },
      });

      res.json(tasks);
    } catch (error) {
      res.status(500).json({
        message: "Error fetching task templates",
        error: error.message,
      });
    }
  },

  // Actualizar plantilla
  updateTemplate: async (req, res) => {
    const { idTaskTemplate } = req.params;
    const { name, steps, materials } = req.body;

    try {
      const template = await TaskTemplate.findByPk(idTaskTemplate, {
        include: Material,
      });
      if (!template)
        return res.status(404).json({ message: "Template not found" });

      // Actualizar nombre y pasos
      await template.update({ name, steps });

      // Actualizar materiales
      if (materials && Array.isArray(materials)) {
        // Primero eliminamos las relaciones existentes
        await MaterialTaskTemplate.destroy({ where: { idTaskTemplate } });

        // Creamos las nuevas relaciones
        for (const mat of materials) {
          // Si el material no tiene idMaterial, asumimos que es nuevo y lo creamos
          let materialId = mat.idMaterial;
          if (!materialId) {
            const newMaterial = await Material.create({
              name: mat.name,
              assumed: false,
            });
            materialId = newMaterial.idMaterial;
          }

          await MaterialTaskTemplate.create({
            idTaskTemplate,
            idMaterial: materialId,
            quantity: mat.quantity || 1,
            unit: mat.unit || "ud",
          });
        }
      }

      // Traemos el template actualizado con sus materiales
      const updatedTemplate = await TaskTemplate.findByPk(idTaskTemplate, {
        include: Material,
      });
      res.json(updatedTemplate);

      // Live
      emitTemplatesChanged(req, updatedTemplate.idGroup, {
        action: "updated",
        templateId: updatedTemplate.idTaskTemplate,
      });
      emitCalendarRefresh(req, updatedTemplate.idGroup);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Error updating template", error: error.message });
    }
  },

  updateBasicTemplate: async (req, res) => {
    const { idTaskTemplate } = req.params;
    const { name, steps } = req.body;

    try {
      const updatedTemplate = await TaskTemplate.findByPk(idTaskTemplate, {
        include: Material,
      });
      if (!template)
        return res.status(404).json({ message: "Template not found" });

      await updatedTemplate.update({ name, steps });

      res.json(updatedTemplate);

      // Live
      emitTemplatesChanged(req, updatedTemplate.idGroup, {
        action: "updated",
        template: updatedTemplate,
      });
      emitCalendarRefresh(req, updatedTemplate.idGroup, {
        action: "updated",
        template: updatedTemplate,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error updating template", error: error.message });
    }
  },

  createRecipe: async (req, res) => {
    const { idGroup } = req.params;
    const { name, steps, materials = [] } = req.body;

    try {
      // Convertir steps a array si viene como string
      let stepsData = steps;
      if (typeof steps === "string") {
        stepsData = steps
          .split("\n")
          .map((s) => s.trim())
          .filter((s) => s.length);
      }

      // Crear el template con type = recipe
      const recipe = await TaskTemplate.create({
        name,
        steps: stepsData,
        idGroup,
        type: "recipe",
      });

      // Procesar materiales
      for (const mat of materials) {
        let material = null;

        if (mat.idMaterial) {
          material = await Material.findByPk(mat.idMaterial);
        }

        if (!material) {
          material = await Material.create({ name: mat.name, assumed: false });
        }

        await MaterialTaskTemplate.create({
          idTaskTemplate: recipe.idTaskTemplate,
          idMaterial: material.idMaterial,
          quantity: mat.quantity || 1,
          unit: mat.unit || "ud",
        });
      }

      const fullRecipe = await TaskTemplate.findByPk(recipe.idTaskTemplate, {
        include: [Material],
      });
      res.status(201).json(fullRecipe);
      emitTemplatesChanged(req, idGroup, {
        action: "created",
        template: fullRecipe,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },
};
