import {
  MaterialTaskTemplate,
  Material,
  TaskTemplate,
} from "../models/index.model.js";
import { normalizeQtyUnit } from "../utils/units.js";
import { createBaseController } from "./base.controller.js";

const baseController = createBaseController(MaterialTaskTemplate);

export const materialTaskTemplateController = {
  ...baseController,

  // --- override base.create ---
  create: async (req, res, next) => {
    try {
      const { idMaterial, idTaskTemplate, quantity, unit } = req.body;
      const norm = normalizeQtyUnit(quantity, unit);
      const row = await MaterialTaskTemplate.create({
        idMaterial,
        idTaskTemplate,
        quantity: norm.quantity,
        unit: norm.unit, // 'ud' | 'ml' | 'gr'
      });
      res.status(201).json(row);
    } catch (e) {
      next(e);
    }
  },

  // --- override base.update ---
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const row = await MaterialTaskTemplate.findByPk(id);
      if (!row) return res.status(404).json({ message: "Not Found" });

      const patch = { ...req.body };
      if ("quantity" in patch || "unit" in patch) {
        const n = normalizeQtyUnit(
          patch.quantity ?? row.quantity,
          patch.unit ?? row.unit
        );
        patch.quantity = n.quantity;
        patch.unit = n.unit;
      }
      await row.update(patch);
      res.json(row);
    } catch (e) {
      next(e);
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
