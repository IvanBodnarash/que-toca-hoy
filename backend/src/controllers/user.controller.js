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

// Calcula el rango de fechas según filtro: today | week | month
function getDateRange(filter) {
  const now = new Date();
  let startDate, endDate;

  if (filter === "today") {
    startDate = toDateOnly(now);
    endDate = toDateOnly(now);
    endDate.setHours(23, 59, 59, 999);
  } else if (filter === "week") {
    // lunes de esta semana
    startDate = toDateOnly(
      new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1)
      )
    );
    // domingo
    endDate = toDateOnly(new Date(startDate));
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
  } else if (filter === "month") {
    startDate = toDateOnly(new Date(now.getFullYear(), now.getMonth(), 1));
    endDate = toDateOnly(new Date(now.getFullYear(), now.getMonth() + 1, 0));
    endDate.setHours(23, 59, 59, 999);
  } else {
    throw new Error("Filtro inválido. Usa: today, week o month");
  }

  return { startDate, endDate };
}

// Genera la condición de búsqueda para tareas dentro de un rango

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

/// groupController.post("ruta", groupController)

// export const funcion

export const userController = {
  ...baseController,

  // funciones
  // Obtener grupos de usuario
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

  // Añadir grupo a usuario
  addGroup: async (req, res) => {
    const { id } = req.params; // id del usuario
    const { idGroup } = req.body; // id del grupo a asignar

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

  // Obtener tareas de usuario
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

  // Asignar tarea a usuario
  assignTask: async (req, res) => {
    const { id } = req.params;
    const { taskId } = req.body;

    try {
      // Comprobar que existen usuario y tarea
      const user = await User.findByPk(id);
      const task = await TaskDated.findByPk(taskId);

      if (!user && !task)
        return res
          .status(404)
          .json({ message: "Usuario y TaskDated no encontrados" });
      if (!user)
        return res.status(404).json({ message: "Usuario no encontrado" });
      if (!task)
        return res.status(404).json({ message: "TaskDated no encontrada" });

      await UserTask.create({ idUser: id, idTaskDated: taskId });
      res.status(201).json({ message: "Task assigned to user" });
    } catch (error) {
      res.status(500).json({ message: "Error assigning task" });
    }
  },

  // asignar imagen en base de datos
  asignImage: async (req, res) => {
    const id = req.params.id;
    const normalizedPath = req.file.path.replace(/\\/g, "/");

    try {
      const user = await User.findByPk(id);
      if (!user) return res.status(404).json({ message: "User not found" });

      await User.update({ image: normalizedPath }, { where: { idUser: id } });

      res.status(201).json({
        message: "Imagen asignada correctamente",
        name: req.file.filename,
        path: normalizedPath,
      });
    } catch (error) {
      res.status(500).json({ message: "Error assigning image" });
    }
  },

  // Obtener tareas por usuario y rango de fechas
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

        // унікальні id груп зі звіту
        const groupIds = Array.from(
          new Set(tasks.map((t) => Number(t.idGroup)).filter(Boolean))
        );

        // 1) нотифікнемо персональну кімнату користувача
        io.to(`user:${uid}`).emit("usertasks:changed", {
          idUser: uid,
          reason: "report",
          filter,
          groups: groupIds,
        });

        // 2) (необовʼязково) пінгнемо календарні кімнати груп
        for (const gid of groupIds) {
          io.to(`calendar:${gid}`).emit("usertasks:changed", {
            idGroup: gid,
            idUser: uid,
            reason: "report",
          });
        }
      } catch (e) {
        // без паніки, просто не завалюємо відповідь
      }

      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  //ESTA FUNCION SE CAMBIARIA POR UN getBuyListReportGlobal
  // Obtener lista de compras por usuario y rango de fechas
  getBuyListReport: async (req, res) => {
    const { id } = req.params; // id del usuario
    const { filter } = req.query;

    try {
      const { startDate, endDate } = getDateRange(filter);

      // Traer solo los BuyList asociados a tareas del grupo del usuario
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

      // aplanamos todas las buylists de las tareas
      const buyLists = tasks.flatMap((task) => task.BuyLists);

      res.json(buyLists);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // ➤ Update de buylist (marcar comprado, modificar o revertir cantidad)
  updateBuyList: async (req, res) => {
    const { id } = req.params; // idUser
    const updates = req.body; // array con {idBuyList, quantity}

    try {
      // 1) Grupos del usuario
      const userGroups = await UserGroup.findAll({
        where: { idUser: id },
        attributes: ["idGroup"],
      });
      const groupIds = userGroups.map((g) => g.idGroup);

      if (groupIds.length === 0) {
        return res
          .status(403)
          .json({ error: "Usuario no pertenece a ningún grupo" });
      }

      const affected = [];

      // 2) Para cada item a actualizar
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

        // validar que pertenece a un grupo del usuario
        // if (!groupIds.includes(buyItem.TaskDated.TaskTemplate.idGroup)) {
        //   continue;
        // }
        const gid = buyItem.TaskDated.TaskTemplate.idGroup;
        if (!groupIds.includes(gid)) continue;

        // 3) Actualizar cantidad (acepta poner 0 o devolverlo a >0)
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
      console.error("❌ Error updateBuyList:", err);
      res.status(500).json({ error: "Error actualizando lista" });
    }
  },

  //CONSULTAR ESTO
  // Nuevo controlador: lista de compras de un grupo específico
  getBuyListReportByGroup: async (req, res) => {
    const { idGroup } = req.params; // id del grupo
    const { filter } = req.query;

    try {
      const { startDate, endDate } = getDateRange(filter);

      // Traer solo los BuyList asociados a tareas de este grupo
      const tasks = await TaskDated.findAll({
        where: {
          ...taskRangeCondition(startDate, endDate),
          idGroup, // 🔑 diferencia: ahora limitamos al grupo
        },
        include: [
          {
            model: BuyList,
            required: true,
            include: [Material],
          },
        ],
      });

      // aplanamos todas las buylists de las tareas
      const buyLists = tasks.flatMap((task) => task.BuyLists);

      res.json(buyLists);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getGroupBuyListReport: async (req, res) => {
    const { idUser, idGroup } = req.params; // id del usuario y del grupo
    const { filter = "today" } = req.query;

    console.log("idUser:", idUser, "idGroup:", idGroup);

    try {
      // 🔹 Verificar que el usuario pertenece al grupo
      const membership = await UserGroup.findOne({
        where: { idUser, idGroup },
      });
      if (!membership) {
        return res
          .status(403)
          .json({ message: "El usuario no pertenece a este grupo" });
      }

      // 🔹 Obtener rango de fechas
      const { startDate, endDate } = getDateRange(filter);

      // 🔹 Traer tareas del grupo dentro del rango
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

      // 🔹 Aplanar todas las buyLists
      const buyLists = tasks.flatMap((task) => task.BuyLists);

      return res.json(buyLists);
    } catch (error) {
      console.error("Error en getGroupBuyListReport:", error);
      return res.status(500).json({ message: error.message });
    }
  },
};
