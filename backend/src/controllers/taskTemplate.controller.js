import {
  TaskTemplate,
  Material,
  TaskDated,
  MaterialTaskTemplate,
} from "../models/index.model.js";
import { normalizeQtyUnit } from "../utils/units.js";
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

  // Get task template materials
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

  // Get tasks from task template
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

  // Get the templates by type: task or template
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

  // List all taskTemplate by type passed as variable (task or recipe) by group ID
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

  // Update template
  updateTemplate: async (req, res) => {
    const { idTaskTemplate } = req.params;
    const { name, steps, materials } = req.body;

    try {
      const template = await TaskTemplate.findByPk(idTaskTemplate, {
        include: Material,
      });
      if (!template)
        return res.status(404).json({ message: "Template not found" });

      // Update name and steps
      await template.update({ name, steps });

      // Update materials
      if (materials && Array.isArray(materials)) {
        // First we remove the existing relations
        await MaterialTaskTemplate.destroy({ where: { idTaskTemplate } });

        // We create the new relations
        for (const mat of materials) {
          // If the material does not have idMaterial, we assume it is new and create it
          let materialId = mat.idMaterial;
          if (!materialId) {
            const newMaterial = await Material.create({
              name: mat.name,
              assumed: false,
            });
            materialId = newMaterial.idMaterial;
          }

          const norm = normalizeQtyUnit(mat.quantity, mat.unit);

          await MaterialTaskTemplate.create({
            idTaskTemplate,
            idMaterial: materialId,
            quantity: norm.quantity || 1,
            unit: norm.unit || "ud",
          });
        }
      }

      // We bring the updated template with its materials
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
      if (!updatedTemplate)
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
      // Convert steps to array if it comes as a string
      let stepsData = steps;
      if (typeof steps === "string") {
        stepsData = steps
          .split("\n")
          .map((s) => s.trim())
          .filter((s) => s.length);
      }

      // Create tempate with type = recipe
      const recipe = await TaskTemplate.create({
        name,
        steps: stepsData,
        idGroup,
        type: "recipe",
      });

      // Process materials
      for (const mat of materials) {
        let material = null;

        if (mat.idMaterial) {
          material = await Material.findByPk(mat.idMaterial);
        }

        if (!material) {
          material = await Material.create({ name: mat.name, assumed: false });
        }

        const norm = normalizeQtyUnit(mat.quantity, mat.unit);

        await MaterialTaskTemplate.create({
          idTaskTemplate: recipe.idTaskTemplate,
          idMaterial: material.idMaterial,
          quantity: norm.quantity || 1,
          unit: norm.unit || "ud",
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

  // Delete template
  deleteTemplate: async (req, res) => {
    const { idTaskTemplate } = req.params;

    try {
      const template = await TaskTemplate.findByPk(idTaskTemplate);
      if (!template)
        return res.status(404).json({ message: "Template not found" });

      // 1. Check if the instances planned
      const scheduledCount = await TaskDated.count({
        where: { idTaskTemplate },
      });
      if (scheduledCount > 0) {
        return res.status(409).json({
          massage: "Cannot delete: template has scheduled tasks",
          code: "TEMPLATE_IN_USE",
          scheduledCount,
        });
      }

      // 2. Delete
      const idGroup = template.idGroup;
      await template.destroy();

      // 3. Notifications
      emitTemplatesChanged(req, idGroup, {
        action: "deleted",
        templateId: Number(idTaskTemplate),
      });
      emitCalendarRefresh(req, idGroup);

      return res.status(204).send();
    } catch (error) {
      console.error("Delete template failed:", error);
      return res.status(500).json({ message: "Error deleting template" });
    }
  },
};
