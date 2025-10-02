import {
  MaterialTaskTemplate,
  Material,
  TaskTemplate,
} from "../models/index.model.js";
import { canonicalizeQtyUnit } from "../utils/units.js";
import { createBaseController } from "./base.controller.js";

const baseController = createBaseController(MaterialTaskTemplate);

export const materialTaskTemplateController = {
  ...baseController,

  // override create
  create: async (req, res) => {
    try {
      const { quantity, unit, ...rest } = req.body;
      const norm = canonicalizeQtyUnit(quantity, unit);
      const row = await MaterialTaskTemplate.create({ ...rest, ...norm });
      return res.status(201).json(row);
    } catch (e) {
      return res
        .status(500)
        .json({ message: "Failed to create", error: e.message });
    }
  },

  // override update
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const row = await MaterialTaskTemplate.findByPk(id);
      if (!row) return res.status(404).json({ message: "Not found" });

      const { quantity, unit, ...rest } = req.body;
      const norm = canonicalizeQtyUnit(
        quantity ?? row.quantity,
        unit ?? row.unit
      );
      await row.update({ ...rest, ...norm });

      return res.json(row);
    } catch (e) {
      return res
        .status(500)
        .json({ message: "Failed to update", error: e.message });
    }
  },

  // Get materials by template
  getMaterialsByTemplate: async (req, res) => {
    const { id } = req.params;
    try {
      const materials = await Material.findAll({
        include: {
          model: TaskTemplate,
          as: "TaskTemplates",
          where: { idTaskTemplate: id },
          through: { attributes: ["quantity", "unit"] },
        },
      });
      // Flattened for the frontend
      const flattened = materials.map((m) => {
        const rel = m.TaskTemplates[0]?.MaterialTaskTemplate;
        return {
          idMaterial: m.idMaterial,
          name: m.name,
          assumed: m.assumed,
          quantity: rel?.quantity,
          unit: rel?.unit,
        };
      });
      res.json(flattened);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching materials for template" });
    }
  },

  // Get templates by material
  getTemplatesByMaterial: async (req, res) => {
    const { id } = req.params;
    try {
      const templates = await TaskTemplate.findAll({
        include: {
          model: Material,
          where: { idMaterial: id },
          through: { attributes: [] },
        },
      });
      res.json(templates);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching templates for material" });
    }
  },
};
