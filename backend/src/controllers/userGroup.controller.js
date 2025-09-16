import { UserGroup, User, Group } from "../models/index.model.js";

import { createBaseController } from "./base.controller.js";

import bcrypt from "bcrypt";

const baseController = createBaseController(UserGroup);

export const userGroupController = {
  ...baseController,
  // funciones

  // Asignar grupo a usuario
  assignGroup: async (req, res) => {
    const { idUser, idGroup } = req.body;

    if (!idUser || !idGroup) {
      return res.status(400).json({ message: "Faltan idUser o idGroup" });
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
      const groupExists = await Group.findByPk(idGroup);
      if (!groupExists) {
        return res
          .status(404)
          .json({ message: `Group con id ${idGroup} no existe` });
      }

      // Crear la relación
      const record = await UserGroup.create({ idUser, idGroup });

      req.app
        .get("io")
        .to(`group:${idGroup}`)
        .emit("group:membersUpdated", { idGroup, idUser, action: "added" });
      res.status(201).json({ message: "Grupo asignado correctamente", record });
    } catch (error) {
      res.status(500).json({
        message: "Error asignando grupo",
        error: error.original ? error.original.sqlMessage : error.message,
      });
    }
  },

  // Unirse a grupo validando PIN
  joinGroup: async (req, res) => {
    const { idUser, idGroup, password } = req.body;

    if (!idUser || !idGroup || !password) {
      return res
        .status(400)
        .json({ message: "Faltan idUser, idGroup o password" });
    }

    try {
      const user = await User.findByPk(idUser);
      if (!user)
        return res.status(404).json({ message: "Usuario no encontrado" });

      const group = await Group.findByPk(idGroup);
      if (!group)
        return res.status(404).json({ message: "Grupo no encontrado" });

      const isMatch = await bcrypt.compare(password, group.pin);
      if (!isMatch) {
        return res.status(401).json({ message: "PIN incorrecto" });
      }

      const exists = await UserGroup.findOne({ where: { idUser, idGroup } });
      if (exists) {
        return res
          .status(400)
          .json({ message: "El usuario ya está en este grupo" });
      }

      const record = await UserGroup.create({ idUser, idGroup });

      req.app
        .get("io")
        .to(`group:${idGroup}`)
        .emit("group:membersUpdated", { idGroup, idUser, action: "joined" });
      res
        .status(201)
        .json({ message: "Usuario unido al grupo correctamente", record });
    } catch (error) {
      res.status(500).json({ message: "Error uniéndose al grupo", error });
    }
  },

  // Test
  joinByPin: async (req, res) => {
    try {
      const meId = req.user?.idUser;
      // const meId = req.user?.idUser || req.body.idUser;
      if (!meId) return res.status(401).json({ message: "UNAUTHORIZED" });

      const { pin } = req.body;
      if (!pin || typeof pin !== "string") {
        return res.status(400).json({ message: "PIN_REQUIRED" });
      }

      const groups = await Group.findAll({
        attributes: ["idGroup", "name", "pin", "image"],
      });

      let matched = null;
      for (const g of groups) {
        if (g.pin && (await bcrypt.compare(pin, g.pin))) {
          matched = g;
          break;
        }
      }

      if (!matched) {
        return res.status(401).json({ message: "PIN_INVALID" });
      }

      const exists = await UserGroup.findOne({
        where: { idUser: meId, idGroup: matched.idGroup },
      });
      if (exists) {
        return res.status(400).json({ message: "ALREADY_IN_GROUP" });
      }

      const record = await UserGroup.create({
        idUser: meId,
        idGroup: matched.idGroup,
      });

      req.app
        .get("io")
        .to(`group:${matched.idGroup}`)
        .emit("group:membersUpdated", {
          idGroup: matched.idGroup,
          idUser: meId,
          action: "joined",
        });
      return res.status(201).json({
        message: "JOINED",
        group: {
          idGroup: matched.idGroup,
          name: matched.name,
          image: matched.image,
        },
        record,
      });
    } catch (error) {
      console.error("joinByPin error:", error);
      return res.status(500).json({ message: "SERVER_ERROR" });
    }
  },

  // Eliminar relacion y comprobar si borrar grupo
  deleteUserGroup: async (req, res) => {
    const { idGroup, idUser } = req.params;

    try {
      // Comprobar que la relacion
      const userGroupRelation = await UserGroup.findOne({
        where: { idUser, idGroup },
      });
      if (!userGroupRelation) {
        return res
          .status(404)
          .json({ message: `Usuario con id ${idUser} no existe en el grupo` });
      }

      // Eliminar la relación
      await userGroupRelation.destroy();

      req.app
        .get("io")
        .to(`group:${idGroup}`)
        .emit("group:membersUpdated", { idGroup, idUser, action: "removed" });

      let mess = "Relacion eliminada";

      // comprobar si quedan usuarios de este grupo
      const usersInGroup = await UserGroup.findAll({ where: { idGroup } });
      if (usersInGroup.length < 1) {
        // eliminar el grupo
        const gr = await Group.findByPk(idGroup);
        const res2 = await gr.destroy();
        mess += " y grupo eliminado";

        req.app
          .get("io")
          .to(`group:${idGroup}`)
          .emit("group:deleted", { idGroup });
      }

      res.status(201).json({ message: mess, idGroup, idUser });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error eliminando usuario del grupo",
        error: error.original ? error.original.sqlMessage : error.message,
      });
    }
  },
};
