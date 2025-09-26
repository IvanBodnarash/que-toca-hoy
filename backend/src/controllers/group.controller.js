import {
  Group,
  User,
  TaskDated,
  TaskTemplate,
  Material,
  UserGroup,
  BuyList,
} from "../models/index.model.js";
import { createBaseController } from "./base.controller.js";

import bcrypt from "bcrypt";
import crypto from "crypto";

const baseController = createBaseController(Group);

function emitCal(req, idGroup, patch) {
  const gid = Number(idGroup);
  try {
    req.app.get("io").to(`group:${gid}`).emit("group:patched", {
      idGroup: gid,
      patch,
    });
  } catch (error) {}
}

function emitTemplatesChanged(req, idGroup, payload = {}) {
  const gid = Number(idGroup);
  try {
    req.app
      .get("io")
      .to(`group:${gid}`)
      .emit("templates:changed", { idGroup: gid, ...payload });
  } catch {}
}

/* 
Requirements:
- The PIN must be at least 8 characters long.
- Include at least 1 capital letter and 1 number.
- The PIN is returned in the response for the client to save/view.
- It is stored as a hash (bcrypt) + encryption (AES-256-GCM) so it can be displayed later.
*/

const ENC_ALGO = "aes-256-gcm"; // AES-256-GCM encryption
// Use a 32-byte key. In production, strong environment variable is REQUIRED.

const ENC_KEY = crypto
  .createHash("sha256") // Crea un hash SHA-256
  .update(process.env.JWT_SECRET || "DEV_ONLY__CAMBIA_ESTA_CLAVE_EN_PRODUCCION") // Update the hash with the secret key
  .digest(); // Generate the final hash

// Encrypts the PIN with AES-256-GCM. Returns iv:ciphertext:tag in hex
function encryptPin(pinPlain) {
  const iv = crypto.randomBytes(12); // Recommended 12 bytes for GCM
  const cipher = crypto.createCipheriv(ENC_ALGO, ENC_KEY, iv);
  const encrypted = Buffer.concat([
    cipher.update(pinPlain, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${encrypted.toString("hex")}:${authTag.toString(
    "hex"
  )}`;
}

// Decrypts iv:ciphertext:tag format into hex
function decryptPin(encryptedStr) {
  if (!encryptedStr) return null;
  const [ivHex, dataHex, tagHex] = encryptedStr.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const data = Buffer.from(dataHex, "hex");
  const tag = Buffer.from(tagHex, "hex");

  const decipher = crypto.createDecipheriv(ENC_ALGO, ENC_KEY, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString("utf8");
}

// Strong Password Validator
function validatePassword(password) {
  const minLength = 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return password.length >= minLength && hasUpper && hasNumber;
}

// Random PIN Generator
function generateStrongPin(length = 8) {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const allChars = upper + lower + numbers;

  let pin = "";
  // Ensure at least 1 capital letter and 1 number
  pin += upper.charAt(Math.floor(Math.random() * upper.length));
  pin += numbers.charAt(Math.floor(Math.random() * numbers.length));

  // Fill in the rest of the characters
  for (let i = pin.length; i < length; i++) {
    pin += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  // Mix it up so that it doesn't always start with the same pattern.
  pin = pin
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");

  return pin;
}

export const groupController = {
  ...baseController,

  // Get group users
  getUsers: async (req, res) => {
    const { id } = req.params;
    try {
      const group = await Group.findByPk(id, { include: User });
      if (!group) return res.status(404).json({ message: "Group not found" });
      res.json(group.Users);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users" });
    }
  },

  // Get group tasks
  getTasks: async (req, res) => {
    const { id } = req.params;
    try {
      const tasks = await TaskDated.findAll({ where: { idGroup: id } });
      if (tasks.length === 0)
        return res
          .status(404)
          .json({ message: "No se encuentran tareas para este grupo" });
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create task template for the group
  createTaskTemplate: async (req, res) => {
    const { id } = req.params; // group id
    const { name, description, steps, type } = req.body;

    try {
      const newTemplate = await TaskTemplate.create({
        name,
        description,
        steps,
        idGroup: id,
        type: type || "task", // default value
      });
      res.status(201).json(newTemplate);
      emitTemplatesChanged(req, id, {
        action: "created",
        templateId: newTemplate.idTaskTemplate,
      });
    } catch (error) {
      console.error("Sequelize error:", error);
      res.status(500).json({ message: "Error creating task template", error });
    }
  },

  // Get group task templates
  getTaskTemplates: async (req, res) => {
    const { id } = req.params;
    try {
      const templates = await TaskTemplate.findAll({ where: { idGroup: id } });
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Error fetching templates" });
    }
  },

  asignImage: async (req, res) => {
    console.log("req.file:", req.file);
    console.log("req.body:", req.body);
    const id = req.params.id;

    try {
      const group = await Group.findByPk(id);
      if (!group) return res.status(404).json({ message: "Group not found" });

      // Read a file and convert to base64
      const base64Image = `data:${
        req.file.mimetype
      };base64,${req.file.buffer.toString("base64")}`;

      // Save to DB into large text
      await Group.update({ image: base64Image }, { where: { idGroup: id } });

      res.status(201).json({
        message: "Image assigned correctly",
        name: req.file.filename,
        base64Image,
        base64Length: base64Image.length,
      });

      // Push live
      emitCal(req, id, { image: base64Image });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error assigning image" });
    }
  },

  //Get group image

  //groupRouter.get("/:id/image", groupController.getImage);
  getImage: async (req, res) => {
    const { id } = req.params;
    try {
      const group = await Group.findByPk(id);
      if (!group) return res.status(404).json({ message: "Group not found" });
      res.json({ image: group.image });
    } catch (error) {
      res.status(500).json({ message: "Error fetching image" });
    }
  },

  // Get group materials
  getGroupMaterials: async (req, res) => {
    const { id } = req.params;
    try {
      const group = await Group.findOne({
        where: { idGroup: id },
        attributes: ["idGroup", "name"],
        include: [
          {
            model: TaskTemplate,
            attributes: ["idTaskTemplate"],
            include: [
              {
                model: Material,
                attributes: ["idMaterial", "name"],
                through: { attributes: [] },
              },
            ],
          },
        ],
      });

      if (!group) {
        return res
          .status(404)
          .json({ message: "No materials found for this group" });
      }

      const materials = group.TaskTemplates.flatMap((t) => t.Materials);

      return res.json({
        idGroup: group.idGroup,
        name: group.name,
        materials,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Error fetching materials", error });
    }
  },

  // Create group with generated and encrypted PIN
  createWithPin: async (req, res) => {
    const { name, image } = req.body;
    const meId = req.user?.idUser;

    try {
      // Generate stronh PIN
      let randomPin;
      do {
        randomPin = generateStrongPin(8);
      } while (!validatePassword(randomPin));

      // Hash + encrypted
      const hashedPin = await bcrypt.hash(randomPin, 10);
      const encryptedPin = encryptPin(randomPin);

      // Create group
      const group = await Group.create({
        name,
        image,
        pin: hashedPin, // hash (bcrypt)
        pinEncrypted: encryptedPin, // encrypted (AES-256-GCM)
      });

      if (meId) {
        await UserGroup.create({ idUser: meId, idGroup: group.idGroup });
      }

      res.status(201).json({
        message: "Group created successfully",
        group,
        pin: randomPin,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error creando grupo", error });
    }
  },

  // Change a group's PIN (auto-generated and ENCRYPTED)
  changePin: async (req, res) => {
    const { id } = req.params;

    try {
      let newPin;
      do {
        newPin = generateStrongPin(8);
      } while (!validatePassword(newPin));

      const hashedPin = await bcrypt.hash(newPin, 10);
      const encryptedPin = encryptPin(newPin);

      const group = await Group.findByPk(id);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      group.pin = hashedPin;
      group.pinEncrypted = encryptedPin;
      await group.save();

      res.json({
        message: "PIN updated successfully",
        pin: newPin,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error updating PIN", error });
    }
  },

  // NEW: View group PIN (decrypted)
  getPin: async (req, res) => {
    const { id } = req.params;

    try {
      const group = await Group.findByPk(id, {
        attributes: ["idGroup", "name", "pinEncrypted"],
      });
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      const pin = decryptPin(group.pinEncrypted);
      if (!pin) {
        return res.status(409).json({ message: "PIN not available" });
      }

      res.json({
        message: "PIN obtained successfully",
        pin,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error getting PIN", error });
    }
  },

  updateName: async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });
    try {
      const group = await Group.findByPk(id);
      if (!group) return res.status(404).json({ message: "Group not found" });

      group.name = name;
      await group.save();

      res.json(group);

      // Push live to members of the group
      emitCal(req, id, { name: group.name });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Get buy list of the grupo (filtered by date range)
  getBuyList: async (req, res) => {
    const { id } = req.params; // idGroup
    const { filter } = req.query;

    try {
      const { startDate, endDate } = getDateRange(filter);

      const tasks = await TaskDated.findAll({
        where: {
          ...taskRangeCondition(startDate, endDate),
          idGroup: id,
        },
        include: [
          {
            model: BuyList,
            required: true,
            include: [Material],
          },
        ],
      });

      const buyLists = tasks.flatMap((task) => task.BuyLists);

      res.json(buyLists);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching buy list", error });
    }
  },
};
