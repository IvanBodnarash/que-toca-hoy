import { UserGroup, User, Group } from "../models/index.model.js";

import { createBaseController } from "./base.controller.js";

import bcrypt from "bcrypt";

const baseController = createBaseController(UserGroup);

export const userGroupController = {
  ...baseController,
  // Functions

  // Assign group to user
  assignGroup: async (req, res) => {
    const { idUser, idGroup } = req.body;

    if (!idUser || !idGroup) {
      return res.status(400).json({ message: "Missing idUser or idGroup" });
    }

    try {
      // Check that the user exists
      const userExists = await User.findByPk(idUser);
      if (!userExists) {
        return res
          .status(404)
          .json({ message: `User with id ${idUser} does not exist` });
      }

      // Check that the task exists
      const groupExists = await Group.findByPk(idGroup);
      if (!groupExists) {
        return res
          .status(404)
          .json({ message: `Group with id ${idGroup} does not existe` });
      }

      // Create relation
      const record = await UserGroup.create({ idUser, idGroup });

      req.app
        .get("io")
        .to(`group:${idGroup}`)
        .emit("group:membersUpdated", { idGroup, idUser, action: "added" });
      res.status(201).json({ message: "Group assigned successfully", record });
    } catch (error) {
      res.status(500).json({
        message: "Error group assigning",
        error: error.original ? error.original.sqlMessage : error.message,
      });
    }
  },

  // Join group by validating PIN
  joinGroup: async (req, res) => {
    const { idUser, idGroup, password } = req.body;

    if (!idUser || !idGroup || !password) {
      return res
        .status(400)
        .json({ message: "idUser, idGroup or password are missing" });
    }

    try {
      const user = await User.findByPk(idUser);
      if (!user) return res.status(404).json({ message: "User not found" });

      const group = await Group.findByPk(idGroup);
      if (!group) return res.status(404).json({ message: "Group not found" });

      const isMatch = await bcrypt.compare(password, group.pin);
      if (!isMatch) {
        return res.status(401).json({ message: "Incorrect PIN" });
      }

      const exists = await UserGroup.findOne({ where: { idUser, idGroup } });
      if (exists) {
        return res
          .status(400)
          .json({ message: "The user is already in this group" });
      }

      const record = await UserGroup.create({ idUser, idGroup });

      req.app
        .get("io")
        .to(`group:${idGroup}`)
        .emit("group:membersUpdated", { idGroup, idUser, action: "joined" });
      res
        .status(201)
        .json({ message: "User joined group successfully", record });
    } catch (error) {
      res.status(500).json({ message: "Error joining group", error });
    }
  },

  // Test
  joinByPin: async (req, res) => {
    try {
      const meId = req.user?.idUser;
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

  // Delete relation and check if delete group
  deleteUserGroup: async (req, res) => {
    const { idGroup, idUser } = req.params;

    try {
      const userGroupRelation = await UserGroup.findOne({
        where: { idUser, idGroup },
      });
      if (!userGroupRelation) {
        return res.status(404).json({
          message: `User with id ${idUser} does not exists in the group`,
        });
      }

      // Delete the relation
      await userGroupRelation.destroy();

      req.app
        .get("io")
        .to(`group:${idGroup}`)
        .emit("group:membersUpdated", { idGroup, idUser, action: "removed" });

      let mess = "Relation deleted";

      // Check if there are any users left in this group
      const usersInGroup = await UserGroup.findAll({ where: { idGroup } });
      if (usersInGroup.length < 1) {
        // Delete group
        const gr = await Group.findByPk(idGroup);
        const res2 = await gr.destroy();
        mess += " and group deleted";

        req.app
          .get("io")
          .to(`group:${idGroup}`)
          .emit("group:deleted", { idGroup });
      }

      res.status(201).json({ message: mess, idGroup, idUser });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error deleting user from group",
        error: error.original ? error.original.sqlMessage : error.message,
      });
    }
  },
};
