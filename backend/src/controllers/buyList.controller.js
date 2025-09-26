import { BuyList, TaskDated, Material } from "../models/index.model.js";
import { createBaseController } from "./base.controller.js";

const baseController = createBaseController(BuyList);

async function emitForTask(req, idTaskDated, type, payload) {
  try {
    const task = await TaskDated.findByPk(idTaskDated, {
      attributes: ["idGroup"],
    });
    if (!task) return;
    const gid = Number(task.idGroup);
    req.app
      .get("io")
      .to(`group:${gid}`)
      .emit("buylist:changed", {
        idGroup: gid,
        type,
        ...payload,
      });
  } catch (error) {}
}

export const buyListController = {
  ...baseController,

  // Get buy list by task
  getByTask: async (req, res) => {
    const { taskId } = req.params;
    try {
      const items = await BuyList.findAll({ where: { idTaskDated: taskId } });
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Error fetching buy list items" });
    }
  },

  // Get buy list by material
  getByMaterial: async (req, res) => {
    const { materialId } = req.params;
    try {
      const items = await BuyList.findAll({
        where: { idMaterial: materialId },
      });
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Error fetching buy list items" });
    }
  },

  createListForTask: async (req, res) => {
    try {
      const { materials, idTaskDated } = req.body;

      if (!Array.isArray(materials) || !idTaskDated) {
        return res.status(400).json({ message: "Datos inválidos" });
      }

      // Build array of objects to insert
      const entries = materials.map((material) => ({
        idTaskDated,
        idMaterial: material.idMaterial,
        quantity: material.quantity,
        unit: material.unit,
      }));

      // Insert all into the database
      // await BuyList.bulkCreate(entries);

      const created = await BuyList.bulkCreate(entries);
      res.status(201).json({ message: "Buy list created successfully" });

      // Live
      emitForTask(req, idTaskDated, "bulk-created", { items: created });
    } catch (error) {
      console.error("Error al crear la lista:", error);
      res.status(500).json({ message: "Error del servidor" });
    }
  },

  createItem: async (req, res) => {
    const { idTaskDated, idMaterial, quantity, unit } = req.body;

    try {
      // Check that the task exists
      const taskExists = await TaskDated.findByPk(idTaskDated);
      if (!taskExists) {
        return res
          .status(404)
          .json({ message: `TaskDated con id ${idTaskDated} no existe` });
      }

      // Check that the material exists
      const materialExists = await Material.findByPk(idMaterial);
      if (!materialExists) {
        return res
          .status(404)
          .json({ message: `Material con id ${idMaterial} no existe` });
      }

      const record = await BuyList.create({
        idTaskDated,
        idMaterial,
        quantity,
        unit,
      });
      res.status(201).json(record);

      // Live
      emitForTask(req, idTaskDated, "created", { item: record });
    } catch (error) {
      if (error.original && error.original.code === "ER_NO_REFERENCED_ROW_2") {
        return res.status(400).json({
          message:
            "Foreign key violation: check idTaskDated and idMaterial exist",
          error: error.original.sqlMessage,
        });
      }
      res.status(500).json({
        message:
          "Unable to create record: The specified task (idTaskDated) does not exist or is invalid.",
        error: "Foreign key violation in idTaskDated",
      });
    }
  },

  update: async (req, res) => {
    const { id } = req.params;
    try {
      const row = await BuyList.findByPk(id);
      if (!row) return res.status(404).json({ message: "Not Found" });

      await row.update(req.body);
      res.json(row);

      // Emit Live
      emitForTask(req, row.idTaskDated, "updated", { item: row });
    } catch (error) {
      console.error("buyList update failed:", error);
      res.status(500).json({ message: "Error updating buy list item" });
    }
  },

  delete: async (req, res) => {
    const { id } = req.params;
    try {
      const row = await BuyList.findByPk(id);
      if (!row) return res.status(404).json({ message: "Not Found" });

      const taskId = row.idTaskDated;
      await row.destroy();
      res.status(204).send();

      // Emit Live
      emitForTask(req, taskId, "deleted", { id });
    } catch (error) {
      console.error("buyList delete failed:", error);
      res.status(500).json({ message: "Error deleting buy list item" });
    }
  },
};
