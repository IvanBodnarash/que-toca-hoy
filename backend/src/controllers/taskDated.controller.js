import {
  TaskDated,
  User,
  BuyList,
  TaskTemplate,
  UserGroup,
  UserTask,
  Material,
} from "../models/index.model.js";
import { Op } from "sequelize"; //
import { createBaseController } from "./base.controller.js";

const baseController = createBaseController(TaskDated);

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

function addByFrequencyUTC(baseDate, frequency, step) {
  const d = new Date(baseDate);
  if (frequency === "daily") {
    d.setUTCDate(d.getUTCDate() + step);
  } else if (frequency === "weekly") {
    d.setUTCDate(d.getUTCDate() + step * 7);
  } else if (frequency === "monthly") {
    const day = d.getUTCDate();
    d.setUTCMonth(d.getUTCMonth() + step, Math.min(day, 28));
    const target = new Date(
      Date.UTC(
        d.getUTCFullYear(),
        d.getUTCMonth(),
        day,
        d.getUTCHours(),
        d.getUTCMinutes(),
        d.getUTCSeconds(),
        d.getUTCMilliseconds()
      )
    );
    if (!isNaN(target)) return target;
  }
  return d;
}

export const taskDatedController = {
  ...baseController,

  // --- override base.create ---
  create: async (req, res) => {
    try {
      const record = await TaskDated.create(req.body);
      res.status(201).json(record);

      const snap = await buildTaskSnapshot(record.idTaskDated);
      if (snap)
        emitCal(req, snap.idGroup, "calendar:eventPatched", { task: snap });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error creating record", error: error.message });
    }
  },

  // --- override base.update ---
  update: async (req, res) => {
    const { id } = req.params;
    try {
      const record = await TaskDated.findByPk(id);
      if (!record) return res.status(404).json({ message: "Not found" });

      await record.update(req.body);
      res.json(record);

      const snap = await buildTaskSnapshot(record.idTaskDated);
      if (snap)
        emitCal(req, snap.idGroup, "calendar:eventPatched", { task: snap });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error updating record", error: error.message });
    }
  },

  // --- override base.delete ---
  delete: async (req, res) => {
    const { id } = req.params;
    try {
      const record = await TaskDated.findByPk(id);
      if (!record) return res.status(404).json({ message: "Not found" });

      const { idGroup, idTaskDated } = record;
      await record.destroy();
      res.status(204).send();

      emitCal(req, idGroup, "calendar:eventDeleted", { idTaskDated });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error deleting record", error: error.message });
    }
  },

  // All tasks in a group with Users + TaskTemplate (for calendar)

  // GET /taskdated/group/:idGroup
  getByGroup: async (req, res) => {
    const { idGroup } = req.params;
    try {
      const tasks = await TaskDated.findAll({
        where: { idGroup },
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
        order: [["startDate", "ASC"]],
      });

      res.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
      );
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");

      return res.json(tasks);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Error fetching tasks for group" });
    }
  },

  // Same, but with a date range filter

  // GET /taskdated/group/:idGroup/range?from=YYYY-MM-DD&to=YYYY-MM-DD
  getByGroupRange: async (req, res) => {
    const { idGroup } = req.params;
    const { from, to } = req.query;
    try {
      const where = { idGroup };

      // if passed from/to — add a range condition
      if (from || to) {
        where.startDate = {};
        if (from) where.startDate[Op.gte] = new Date(from);
        if (to) where.startDate[Op.lte] = new Date(to);
      }

      const tasks = await TaskDated.findAll({
        where,
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
        order: [["startDate", "ASC"]],
      });

      res.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
      );
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");

      return res.json(tasks);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Error getting tasks by date range" });
    }
  },

  // Assign a user to a task

  // POST /taskdated/:idTaskDated/assign/:idUser
  assignUser: async (req, res) => {
    const { idTaskDated, userId } = req.params;

    try {
      const task = await TaskDated.findByPk(idTaskDated);
      const user = await User.findByPk(userId);

      if (!user && !task) {
        return res
          .status(404)
          .json({ message: "User and TaskDated not found" });
      }
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (!task) {
        return res.status(404).json({ message: "TaskDated not found" });
      }

      // Add the many-to-many relations to the UserTask table
      await task.addUser(user);

      const snap = await buildTaskSnapshot(task.idTaskDated);
      if (snap)
        emitCal(req, snap.idGroup, "calendar:eventPatched", { task: snap });

      return res.json({ message: "User assigned to task successfully" });
    } catch (error) {
      // FK-specific capture
      if (error?.original?.code === "23503") {
        return res.status(400).json({
          message:
            "Foreign key violation: make sure that idTaskDated and userId exist",
          error: error?.original?.detail,
        });
      }

      // Catch error when resource not found (SequelizeEmptyResultError)
      if (error.name === "SequelizeEmptyResultError") {
        return res.status(404).json({
          message: "The requested resource was not found",
          error: error.message,
        });
      }

      // Other errors
      return res
        .status(500)
        .json({ message: "Error assigning task", error: error.message });
    }
  },

  // Remove user from the task

  // DELETE /taskdated/:idTaskDated/assign/:idUser
  unassignUser: async (req, res) => {
    const { idTaskDated, idUser } = req.params;
    try {
      const task = await TaskDated.findByPk(idTaskDated);
      const user = await User.findByPk(idUser);

      if (!user && !task) {
        return res
          .status(404)
          .json({ message: "User and TaskDated not found" });
      }
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (!task) {
        return res.status(404).json({ message: "TaskDated not found" });
      }

      // Add the many-to-many relations to the UserTask table
      await task.removeUser(user);

      // emitCal(req, task.idGroup, "calendar:eventUpdated", {
      //   idTaskDated: task.idTaskDated,
      // });
      const snap = await buildTaskSnapshot(task.idTaskDated);
      if (snap)
        emitCal(req, snap.idGroup, "calendar:eventPatched", { task: snap });

      return res.json({ message: "User assigned to task successfully" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error unassigning task", error: error.message });
    }
  },

  // Get task users
  getUsers: async (req, res) => {
    const { id } = req.params;
    try {
      const task = await TaskDated.findByPk(id, { include: User });
      if (!task) return res.status(404).json({ message: "Task not found" });
      res.json(task.Users);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users" });
    }
  },

  // Get task buy list
  getBuyList: async (req, res) => {
    const { id } = req.params;
    try {
      const task = await TaskDated.findByPk(id, {
        attributes: ["idTaskDated", "idGroup", "idTaskTemplate"],
        include: [
          {
            model: TaskTemplate,
            attributes: ["idTaskTemplate", "name", "type"],
          },
          {
            model: BuyList,
            attributes: [
              "idBuyList",
              "idTaskDated",
              "quantity",
              "unit",
              "idMaterial",
            ],
            include: [{ model: Material, attributes: ["idMaterial", "name"] }],
          },
        ],
        order: [[BuyList, "idBuyList", "ASC"]],
      });

      if (!task) return res.status(404).json({ message: "Task not found" });

      const items = (task.BuyLists || []).map((bl) => ({
        ...bl.toJSON(),
        recipeName: task.TaskTemplate?.name ?? null,
        recipeType: task.TaskTemplate?.type ?? null,
      }));

      res.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
      );
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");
      return res.json(items);
    } catch (error) {
      console.error("getBuyList failed:", error);
      return res.status(500).json({
        message: "Error fetching buy list",
        error: String(error?.message || error),
      });
    }
  },

  // Get all the dated tasks of a group with their status
  getStatusByGroup: async (req, res) => {
    const { idGroup } = req.params;
    try {
      const tasks = await TaskDated.findAll({
        where: { idGroup },
        attributes: ["idTaskDated", "startDate", "endDate"],
        include: [
          {
            model: User,
            attributes: ["idUser", "name"],
            through: { attributes: [["status", "userStatus"]] },
          },
        ],
        order: [["createdAt", "ASC"]],
      });

      res.json(tasks);
    } catch (err) {
      console.error("Error fetching task statuses for group:", err);
      res.status(500).json({ message: "Error fetching task statuses" });
    }
  },

  // POST /taskdated/:id/next  { times?: number }
  createNextNow: async (req, res) => {
    try {
      const { id } = req.params;
      const { times = 1 } = req.body || {};

      const DAY_MS = 24 * 60 * 60 * 1000;

      const task = await TaskDated.findByPk(id);
      if (!task)
        return res.status(404).json({ message: "TaskDated not found" });
      if (!["daily", "weekly", "monthly"].includes(task.frequency)) {
        return res.status(400).json({ message: "Task is not recurrent" });
      }

      const baseStart = new Date(task.startDate);
      const baseEnd = new Date(task.endDate);
      let durationMs = baseEnd - baseStart;

      if (durationMs >= 23 * 60 * 60 * 1000 && durationMs < DAY_MS) {
        durationMs = DAY_MS; // correct to 24h
      }

      const durationDays = Math.max(1, Math.round(durationMs / DAY_MS));

      let currUserId =
        (
          await UserTask.findOne({
            where: { idTaskDated: task.idTaskDated },
          })
        )?.idUser ?? null;

      let rotationIds = [];
      if (task.rotative) {
        const userGroups = await UserGroup.findAll({
          where: { idGroup: task.idGroup },
          include: [{ model: User, attributes: ["idUser", "username"] }],
          order: [[User, "username", "ASC"]],
        });
        rotationIds = userGroups.map((ug) => ug.User?.idUser).filter(Boolean);
      }

      const stepsToCreate = Math.max(1, Number(times) || 1);
      const createdIds = [];

      for (let i = 1; i <= stepsToCreate; i++) {
        const logicalStartUTC = addByFrequencyUTC(baseStart, task.frequency, i);

        const y = logicalStartUTC.getUTCFullYear();
        const m = logicalStartUTC.getUTCMonth();
        const d = logicalStartUTC.getUTCDate();

        const startNext = new Date(y, m, d, 0, 0, 0, 0);
        const endNext = new Date(y, m, d + durationDays, 0, 0, 0, 0);

        const exists = await TaskDated.findOne({
          where: {
            idTaskTemplate: task.idTaskTemplate,
            idGroup: task.idGroup,
            startDate: { [Op.gte]: startNext, [Op.lt]: endNext },
          },
        });
        if (exists) {
          if (task.rotative && rotationIds.length) {
            const idx = Math.max(
              0,
              rotationIds.findIndex((id) => id === currUserId)
            );
            currUserId =
              rotationIds[(idx + 1) % rotationIds.length] ?? currUserId;
          }
          continue;
        }

        const newTask = await TaskDated.create({
          idGroup: task.idGroup,
          idTaskTemplate: task.idTaskTemplate,
          startDate: startNext,
          endDate: endNext,
          status: "todo",
          frequency: task.frequency,
          rotative: task.rotative,
        });
        createdIds.push(newTask.idTaskDated);

        const snap = await buildTaskSnapshot(newTask.idTaskDated);
        if (snap)
          emitCal(req, snap.idGroup, "calendar:eventPatched", { task: snap });

        let assignTo = currUserId;
        if (task.rotative && rotationIds.length) {
          const idx = Math.max(
            0,
            rotationIds.findIndex((id) => id === currUserId)
          );
          assignTo = rotationIds[(idx + 1) % rotationIds.length] ?? currUserId;
          currUserId = assignTo;
        }
        if (assignTo) {
          await UserTask.create({
            idUser: assignTo,
            idTaskDated: newTask.idTaskDated,
          });
        }
      }

      return res.status(201).json({
        message: "Next instances created",
        createdIds,
        count: createdIds.length,
      });
    } catch (err) {
      console.error("createNextNow failed:", err);
      return res.status(500).json({ message: "Internal error" });
    }
  },

  // PATCH /taskdated/:idTaskDated/status
  updateStatus: async (req, res) => {
    try {
      const { idTaskDated } = req.params;
      const { status } = req.body;

      if (!["todo", "done"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }

      const task = await TaskDated.findByPk(idTaskDated);
      if (!task) {
        return res.status(404).json({ message: "TaskDated not found" });
      }

      task.status = status;
      await task.save();

      const snap = await buildTaskSnapshot(task.idTaskDated);
      if (snap)
        emitCal(req, snap.idGroup, "calendar:eventPatched", { task: snap });

      return res.json({ message: "ok", record: task });
    } catch (error) {
      console.error("Error updating TaskDated status:", error);
      return res
        .status(500)
        .json({ message: "Error updating TaskDated status" });
    }
  },
};
