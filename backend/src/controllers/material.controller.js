import { Material, TaskTemplate, BuyList } from "../models/index.model.js";
import { createBaseController } from "./base.controller.js";

const baseController = createBaseController(Material);

export const materialController = {
  ...baseController,

  // Obtener plantillas de material
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

  // Obtener listas de compra
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
