import {
  User,
  Group,
  TaskDated,
  UserGroup,
  UserTask,
  BuyList,
  Material,
  TaskTemplate,
} from "../models/index.model.js";

import { createBaseController } from "./base.controller.js";

import { Op, fn, col, where } from "sequelize";

function toDateOnly(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Calculate the date range based on the filter: today | week | month
function getDateRange(filter) {
  const now = new Date();
  let startDate, endDate;

  if (filter === "today") {
    startDate = toDateOnly(now);
    endDate = toDateOnly(now);
    endDate.setHours(23, 59, 59, 999);
  } else if (filter === "week") {
    // Monday this week
    startDate = toDateOnly(
      new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1)
      )
    );
    // Sunday
    endDate = toDateOnly(new Date(startDate));
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
  } else if (filter === "month") {
    startDate = toDateOnly(new Date(now.getFullYear(), now.getMonth(), 1));
    endDate = toDateOnly(new Date(now.getFullYear(), now.getMonth() + 1, 0));
    endDate.setHours(23, 59, 59, 999);
  } else {
    throw new Error("Invalid filter. Use: today, week or month");
  }

  return { startDate, endDate };
}

// Generates the search condition for tasks within a range

function taskRangeCondition(startDate, endDate) {
  return {
    [Op.or]: [
      where(fn("DATE", col("startDate")), {
        [Op.between]: [startDate, endDate],
      }),
      where(fn("DATE", col("endDate")), { [Op.between]: [startDate, endDate] }),
      {
        [Op.and]: [
          where(fn("DATE", col("startDate")), { [Op.lte]: startDate }),
          where(fn("DATE", col("endDate")), { [Op.gte]: endDate }),
        ],
      },
    ],
  };
}

const baseController = createBaseController(User);

export const userController = {
  ...baseController,

  // Functions
  // Get user groups
  getGroups: async (req, res) => {
    const { id } = req.params;
    try {
      console.log("Fetching groups for user ID:", id);
      const user = await User.findByPk(id, { include: Group });
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user.Groups);
    } catch (error) {
      res.status(500).json({ message: "Error fetching groups" });
    }
  },

  // Add group to user
  addGroup: async (req, res) => {
    const { id } = req.params;
    const { idGroup } = req.body;

    try {
      const user = await User.findByPk(id);
      if (!user) return res.status(404).json({ message: "User not found" });

      const group = await Group.findByPk(idGroup);
      if (!group) return res.status(404).json({ message: "Group not found" });

      await UserGroup.create({ idUser: id, idGroup: idGroup });
      res.status(200).json({ message: "Group added to user" });
    } catch (error) {
      console.error("Assign group error:", error);
      res.status(500).json({ message: "Error adding group", error });
    }
  },

  // Get user tasks
  getTasks: async (req, res) => {
    const { id } = req.params;
    try {
      const user = await User.findByPk(id, { include: TaskDated });
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user.TaskDateds);
    } catch (error) {
      res.status(500).json({ message: "Error fetching tasks" });
    }
  },

  // Assign task to the user
  assignTask: async (req, res) => {
    const { id } = req.params;
    const { taskId } = req.body;

    try {
      // Check that the user and task exist
      const user = await User.findByPk(id);
      const task = await TaskDated.findByPk(taskId);

      if (!user && !task)
        return res
          .status(404)
          .json({ message: "User and TaskDated not found" });
      if (!user) return res.status(404).json({ message: "Usuer not found" });
      if (!task)
        return res.status(404).json({ message: "TaskDated not found" });

      await UserTask.create({ idUser: id, idTaskDated: taskId });
      res.status(201).json({ message: "Task assigned to user" });
    } catch (error) {
      res.status(500).json({ message: "Error assigning task" });
    }
  },

  // Assign image to DB
  asignImage: async (req, res) => {
    const id = req.params.id;
    const normalizedPath = req.file.path.replace(/\\/g, "/");

    try {
      const user = await User.findByPk(id);
      if (!user) return res.status(404).json({ message: "User not found" });

      await User.update({ image: normalizedPath }, { where: { idUser: id } });

      res.status(201).json({
        message: "Imagen assigned successfully",
        name: req.file.filename,
        path: normalizedPath,
      });
    } catch (error) {
      res.status(500).json({ message: "Error assigning image" });
    }
  },

  // Get tasks by user and date range
  getTasksReport: async (req, res) => {
    const { id } = req.params;
    const { filter } = req.query;

    try {
      const { startDate, endDate } = getDateRange(filter);

      const tasks = await TaskDated.findAll({
        where: taskRangeCondition(startDate, endDate),
        include: [
          {
            model: Group,
            required: true,
            include: [
              {
                model: User,
                where: { idUser: id },
                attributes: ["idUser", "name", "username"],
                through: { attributes: [] },
              },
            ],
          },
          {
            model: TaskTemplate,
            attributes: ["name", "steps", "type"],
          },
          {
            model: BuyList,
            include: [Material],
          },
        ],
      });

      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getUserTasksReport: async (req, res) => {
    const { id } = req.params;
    const { filter = "today" } = req.query;

    try {
      const { startDate, endDate } = getDateRange(filter);

      const rows = await UserTask.findAll({
        where: { idUser: id },
        attributes: ["idUserTask", "idUser", "idTaskDated", "status"],
        include: [
          {
            model: TaskDated,
            required: true,
            where: taskRangeCondition(startDate, endDate),
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
              { model: Group, attributes: ["idGroup", "name"] },
              {
                model: TaskTemplate,
                attributes: ["idTaskTemplate", "name", "type", "steps"],
              },
              { model: BuyList, include: [Material] },
            ],
          },
        ],
        order: [[TaskDated, "startDate", "ASC"]],
      });

      const tasks = rows.map((r) => {
        const t = r.TaskDated;
        return {
          idUserTask: r.idUserTask,
          idUser: r.idUser,
          status: r.status || "todo",
          idTaskDated: t.idTaskDated,
          idGroup: t.idGroup,
          startDate: t.startDate,
          endDate: t.endDate,
          taskStatusGlobal: t.status,
          frequency: t.frequency,
          rotative: t.rotative,
          group: t.Group,
          template: t.TaskTemplate,
          buyLists: t.BuyLists || [],
        };
      });

      res.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
      );
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");

      try {
        const io = req.app.get("io");
        const uid = Number(id);

        const groupIds = Array.from(
          new Set(tasks.map((t) => Number(t.idGroup)).filter(Boolean))
        );

        io.to(`user:${uid}`).emit("usertasks:changed", {
          idUser: uid,
          reason: "report",
          filter,
          groups: groupIds,
        });

        for (const gid of groupIds) {
          io.to(`calendar:${gid}`).emit("usertasks:changed", {
            idGroup: gid,
            idUser: uid,
            reason: "report",
          });
        }
      } catch (e) {
        //
      }

      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  //THIS FUNCTION WOULD BE CHANGED FOR A getBuyListReportGlobal

  // Get buy list by user and date range
  getBuyListReport: async (req, res) => {
    const { id } = req.params;
    const { filter } = req.query;

    try {
      const { startDate, endDate } = getDateRange(filter);

      // Bring only the BuyLists associated with tasks from the user's group
      const tasks = await TaskDated.findAll({
        where: taskRangeCondition(startDate, endDate),
        include: [
          {
            model: Group,
            required: true,
            include: [
              {
                model: User,
                where: { idUser: id },
                attributes: ["idUser", "name"],
                through: { attributes: [] },
              },
            ],
          },
          {
            model: BuyList,
            required: true,
            include: [Material],
          },
        ],
      });

      // We flatten all the task buylists
      const buyLists = tasks.flatMap((task) => task.BuyLists);

      res.json(buyLists);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update of buylist (mark purchased, modify or reverse quantity)
  updateBuyList: async (req, res) => {
    const { id } = req.params; // idUser
    const updates = req.body; // array with {idBuyList, quantity}

    try {
      // 1. User groups
      const userGroups = await UserGroup.findAll({
        where: { idUser: id },
        attributes: ["idGroup"],
      });
      const groupIds = userGroups.map((g) => g.idGroup);

      if (groupIds.length === 0) {
        return res
          .status(403)
          .json({ error: "User does not belong to any group" });
      }

      const affected = [];

      // 2. For each item to update
      for (const u of updates) {
        const buyItem = await BuyList.findByPk(u.idBuyList, {
          include: [
            {
              model: TaskDated,
              include: { model: TaskTemplate, attributes: ["idGroup"] },
            },
          ],
        });

        if (!buyItem) continue;

        const gid = buyItem.TaskDated.TaskTemplate.idGroup;
        if (!groupIds.includes(gid)) continue;

        // 3. Update quantity (accepts setting 0 or returning it to >0)
        await buyItem.update({ quantity: u.quantity });
        affected.push({ idGroup: gid, idTaskDated: buyItem.idTaskDated });
      }

      const byGroup = new Map();
      affected.forEach((a) => {
        if (!byGroup.has(a.idGroup)) byGroup.set(a.idGroup, new Set());
        byGroup.get(a.idGroup).add(a.idTaskDated);
      });

      byGroup.forEach((taskIds, gid) => {
        req.app
          .get("io")
          .to(`group:${gid}`)
          .emit("buylist:changed", {
            idGroup: gid,
            type: "batch-updated",
            taskIds: Array.from(taskIds),
          });
      });

      res.json({ success: true });
    } catch (err) {
      console.error("Error updateBuyList:", err);
      res.status(500).json({ error: "Error updating list" });
    }
  },

  // Buy list of specific group
  getBuyListReportByGroup: async (req, res) => {
    const { idGroup } = req.params;
    const { filter } = req.query;

    try {
      const { startDate, endDate } = getDateRange(filter);

      // Bring only the BuyLists associated with tasks in this group
      const tasks = await TaskDated.findAll({
        where: {
          ...taskRangeCondition(startDate, endDate),
          idGroup, // difference: now we limit the group
        },
        include: [
          {
            model: BuyList,
            required: true,
            include: [Material],
          },
        ],
      });

      // we flatten all the task buylists
      const buyLists = tasks.flatMap((task) => task.BuyLists);

      res.json(buyLists);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getGroupBuyListReport: async (req, res) => {
    const { idUser, idGroup } = req.params;
    const { filter = "today" } = req.query;

    console.log("idUser:", idUser, "idGroup:", idGroup);

    try {
      // Verify that the user belongs to the group
      const membership = await UserGroup.findOne({
        where: { idUser, idGroup },
      });
      if (!membership) {
        return res
          .status(403)
          .json({ message: "The user does not exist in this group" });
      }

      // Get date range
      const { startDate, endDate } = getDateRange(filter);

      // Bring group tasks within range
      const tasks = await TaskDated.findAll({
        where: taskRangeCondition(startDate, endDate),
        include: [
          {
            model: Group,
            where: { idGroup },
            required: true,
          },
          {
            model: BuyList,
            required: true,
            include: [Material],
          },
        ],
      });

      // Flatten all buyLists
      const buyLists = tasks.flatMap((task) => task.BuyLists);

      return res.json(buyLists);
    } catch (error) {
      console.error("Error in getGroupBuyListReport:", error);
      return res.status(500).json({ message: error.message });
    }
  },
};
