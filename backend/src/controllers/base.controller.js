import path from 'path';
import fs from 'fs';
//los importo para poder borrar las imágenes si es necesario


export const createBaseController = (Model) => ({
    getAll: async (req, res) => {
        try {
            const records = await Model.findAll();
            res.status(200).json(records);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching data' });
        }
    },

    create: async (req, res) => {
        try {
            const record = await Model.create(req.body);
            res.status(201).json(record);
        } catch (error) {
            res.status(500).json({ message: 'Error creating record', error: error.message });
        }
    },

    update: async (req, res) => {
        const { id } = req.params;
        try {
            const record = await Model.findByPk(id);
            if (!record) return res.status(404).json({ message: 'Not found' });

            await record.update(req.body);
            res.json(record);
        } catch (error) {
            res.status(500).json({ message: 'Error updating record' });
        }
    },

    delete: async (req, res) => {
        const { id } = req.params;
        try {
            const record = await Model.findByPk(id);
            if (!record) return res.status(404).json({ message: 'Not found' });
    
            // faltaba declarar los campos de imagen para poder borrarlos si es necesario
            const imageFields = ['image']; 

            imageFields.forEach(field => {
                if (record[field]) {
                    const fullPath = path.join(process.cwd(), record[field]);
                    fs.unlink(fullPath, (err) => {
                        if (err) console.error(`Error borrando ${field}:`, err);
                    });
                }
            });

            await record.destroy();
            res.status(204).send();
        } catch (error) {
            console.error("Error deleting record:", error);
            res.status(500).json({ message: 'Error deleting record' });
        }
    },
    getByID: async (req, res) => {
        const { id } = req.params;
        try {
            const record = await Model.findByPk(id);
            if (!record) return res.status(404).json({ message: 'Not found' });
            res.json(record);
        } catch (error) {
            res.status(500).json({ message: 'Error updating record' });
        }
    },
});

/*
// controllers/base.controller.js
export const createBaseController = (service) => ({
    getAll: async (req, res) => {
        try {
            const records = await service.getAll();
            res.status(200).json(records);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching data' });
        }
    },

    create: async (req, res) => {
        try {
            const record = await service.create(req.body);
            res.status(201).json(record);
        } catch (error) {
            res.status(500).json({ message: 'Error creating record' });
        }
    },

    update: async (req, res) => {
        try {
            const updated = await service.update(req.params.id, req.body);
            if (!updated) return res.status(404).json({ message: 'Not found' });
            res.json(updated);
        } catch (error) {
            res.status(500).json({ message: 'Error updating record' });
        }
    },

    delete: async (req, res) => {
        try {
            const deleted = await service.delete(req.params.id);
            if (!deleted) return res.status(404).json({ message: 'Not found' });
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: 'Error deleting record' });
        }
    }
});
*/