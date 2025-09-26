import path from "path";
import fs from "fs";

export const createBaseController = (Model) => ({
  getAll: async (req, res) => {
    try {
      const records = await Model.findAll();
      res.status(200).json(records);
    } catch (error) {
      res.status(500).json({ message: "Error fetching data" });
    }
  },

  create: async (req, res) => {
    try {
      const record = await Model.create(req.body);
      res.status(201).json(record);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error creating record", error: error.message });
    }
  },

  update: async (req, res) => {
    const { id } = req.params;
    try {
      const record = await Model.findByPk(id);
      if (!record) return res.status(404).json({ message: "Not found" });

      await record.update(req.body);
      res.json(record);
    } catch (error) {
      res.status(500).json({ message: "Error updating record" });
    }
  },

  delete: async (req, res) => {
    const { id } = req.params;
    try {
      const record = await Model.findByPk(id);
      if (!record) return res.status(404).json({ message: "Not found" });

      const imageFields = ["image"];

      imageFields.forEach((field) => {
        if (record[field]) {
          const fullPath = path.join(process.cwd(), record[field]);
          fs.unlink(fullPath, (err) => {
            if (err) console.error(`Error deleting ${field}:`, err);
          });
        }
      });

      await record.destroy();
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting record:", error);
      res.status(500).json({ message: "Error deleting record" });
    }
  },
  getByID: async (req, res) => {
    const { id } = req.params;
    try {
      const record = await Model.findByPk(id);
      if (!record) return res.status(404).json({ message: "Not found" });
      res.json(record);
    } catch (error) {
      res.status(500).json({ message: "Error updating record" });
    }
  },
});
