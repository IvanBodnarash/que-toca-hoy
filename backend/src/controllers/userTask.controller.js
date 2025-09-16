import { User, UserTask, TaskDated, TaskTemplate } from "../models/index.model.js";

import { createBaseController } from "./base.controller.js";

const baseController = createBaseController(UserTask);

function emitCal(req, idGroup, event, payload = {}) {
  const gid = Number(idGroup);
  try {
    req.app
      .get("io")
      .to(`calendar:${gid}`)
      .emit(event, { idGroup: gid, ...payload });
  } catch (error) {}
}

async function buildTaskSnapshot(idTaskDated) {
  const row = await TaskDated.findByPk(idTaskDated, {
    attributes: [
      "idTaskDated",
      "idGroup",
      "idTaskTemplate",
      "startDate",
      "endDate",
      "status",
      "frequency",
      "rotative",
    ],
    include: [
      { model: TaskTemplate, attributes: ["idTaskTemplate", "name"] },
      {
        model: User,
        attributes: ["idUser", "username", "name", "color", "image"],
        through: { attributes: ["status"] },
      },
    ],
  });

  if (!row) return null;

  const assignees = (row.Users || []).map((u) => u.idUser);
  const doneBy = {};
  (row.Users || []).forEach((u) => {
    const st = u.UserTask?.status;
    doneBy[u.idUser] =
      st === true || st === "done" || st === 1 || st === "DONE";
  });

  return {
    id: row.idTaskDated,
    idTaskDated: row.idTaskDated,
    idGroup: row.idGroup,
    title: row.TaskTemplate?.name || "",
    date: row.startDate,
    start: row.startDate,
    end: row.endDate,
    status: row.status,
    frequency: row.frequency,
    rotative: row.rotative,
    assignees,
    doneBy,
  };
}

// las funciones más comunes ya las manejamos desde UserController y TaskController.

export const userTaskController = {
  ...baseController,

  // Asignar tarea a usuario
  assignTask: async (req, res) => {
    const { idUser, idTaskDated } = req.body;

    if (!idUser || !idTaskDated) {
      return res.status(400).json({ message: "Faltan idUser o idTaskDated" });
    }

    try {
      // Comprobar que el usuario existe
      const userExists = await User.findByPk(idUser);
      if (!userExists) {
        return res
          .status(404)
          .json({ message: `Usuario con id ${idUser} no existe` });
      }

      // Comprobar que la tarea existe
      const taskExists = await TaskDated.findByPk(idTaskDated);
      if (!taskExists) {
        return res
          .status(404)
          .json({ message: `TaskDated con id ${idTaskDated} no existe` });
      }

      // Crear la relación
      const record = await UserTask.create({ idUser, idTaskDated });

      const snap = await buildTaskSnapshot(idTaskDated);
      if (snap)
        emitCal(req, snap.idGroup, "calendar:eventPatched", {
          task: snap,
        });

      res.status(201).json({ message: "Task asignada correctamente", record });
    } catch (error) {
      res.status(500).json({
        message: "Error asignando task",
        error: error.original ? error.original.sqlMessage : error.message,
      });
    }
  },

  unassignTask: async (req, res) => {
    const { idUser, idTaskDated } = req.body;

    if (!idUser || !idTaskDated) {
      return res.status(400).json({ message: "Faltan idUser o idTaskDated" });
    }

    try {
      console.log("UNASSIGN req.body:", req.body);

      const task = await TaskDated.findByPk(idTaskDated);

      const deleted = await UserTask.destroy({
        where: { idUser, idTaskDated },
      });

      if (deleted === 0) {
        // Fila no encontrada: ya se eliminó o los identificadores no coinciden
        return res.status(404).json({ error: "RELATION_NOT_FOUND" });
      }

      if (task) {
        const snap = await buildTaskSnapshot(idTaskDated);
        if (snap)
          emitCal(req, snap.idGroup, "calendar:eventPatched", {
            task: snap,
          });
      }

      return res.json({ ok: true, deleted });
    } catch (e) {
      console.error("UNASSIGN_FAILED:", e);
      return res
        .status(500)
        .json({ error: "UNASSIGN_FAILED", details: e.message });
    }
  },

  // PUT /usertask/status  { idUser, idTaskDated, status: 'todo'|'done' }
  updateStatus: async (req, res) => {
    try {
      const { idUser, idTaskDated, status } = req.body;

      if (!idUser || !idTaskDated || !["todo", "done"].includes(status)) {
        return res.status(400).json({ message: "Invalid payload" });
      }

      const rel = await UserTask.findOne({ where: { idUser, idTaskDated } });
      if (!rel) {
        return res.status(404).json({ error: "RELATION_NOT_FOUND" });
      }

      rel.status = status;
      await rel.save();

      const task = await TaskDated.findByPk(idTaskDated);
      if (task) {
        const snap = await buildTaskSnapshot(idTaskDated);
        if (snap)
          emitCal(req, snap.idGroup, "calendar:eventPatched", {
            task: snap,
          });
      }

      return res.json({ message: "ok", record: rel });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Error updating status" });
    }
  },
};
