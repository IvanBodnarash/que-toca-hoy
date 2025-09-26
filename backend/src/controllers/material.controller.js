import { Material, TaskTemplate, BuyList } from "../models/index.model.js";
import { createBaseController } from "./base.controller.js";

const baseController = createBaseController(Material);

export const materialController = {
  ...baseController,

  // Get material templates
  getTaskTemplates: async (req, res) => {
    const { id } = req.params;
    try {
      const material = await Material.findByPk(id, { include: TaskTemplate });
      if (!material)
        return res.status(404).json({ message: "Material not found" });
      res.json(material.TaskTemplates);
    } catch (error) {
      res.status(500).json({ message: "Error fetching templates" });
    }
  },

  // Get buy lists
  getBuyLists: async (req, res) => {
    const { id } = req.params;
    try {
      const items = await BuyList.findAll({ where: { idMaterial: id } });
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Error fetching buy lists" });
    }
  },
};
