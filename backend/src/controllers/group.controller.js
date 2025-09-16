import { type } from "os";
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
Requisitos:
- El PIN tiene mínimo 8 caracteres.
- Incluye al menos 1 mayúscula y 1 número.
- Se devuelve el PIN en la respuesta para que el cliente lo guarde/vea.
- Se guarda: hash (bcrypt) + cifrado (AES-256-GCM) para poder mostrarlo después.
*/

const ENC_ALGO = "aes-256-gcm"; // Cifrado AES-256-GCM
// Usa una clave de 32 bytes. En producción, OBLIGATORIO usar variable de entorno fuerte.

const ENC_KEY = crypto
  .createHash("sha256") // Crea un hash SHA-256
  .update(process.env.JWT_SECRET || "DEV_ONLY__CAMBIA_ESTA_CLAVE_EN_PRODUCCION") // Actualiza el hash con la clave secreta
  .digest(); // Genera el hash final

/** Cifra el PIN con AES-256-GCM. Devuelve iv:ciphertext:tag en hex */
function encryptPin(pinPlain) {
  const iv = crypto.randomBytes(12); // recomendado 12 bytes para GCM
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

/** Descifra el formato iv:ciphertext:tag en hex */
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

// Validador de contraseña fuerte
function validatePassword(password) {
  const minLength = 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return password.length >= minLength && hasUpper && hasNumber;
}

// Generador de PIN aleatorio
function generateStrongPin(length = 8) {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const allChars = upper + lower + numbers;

  let pin = "";
  // Garantizar al menos 1 mayúscula y 1 número
  pin += upper.charAt(Math.floor(Math.random() * upper.length));
  pin += numbers.charAt(Math.floor(Math.random() * numbers.length));

  // Rellenar el resto de caracteres
  for (let i = pin.length; i < length; i++) {
    pin += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  // Mezclar para que no empiece siempre con el mismo patrón
  pin = pin
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");

  return pin;
}

export const groupController = {
  ...baseController,

  // Obtener usuarios de grupo
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

  // Obtener tareas de grupo
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

  // Crear plantilla de tarea para un grupo
  createTaskTemplate: async (req, res) => {
    const { id } = req.params; // id del grupo
    const { name, description, steps, type } = req.body;

    try {
      const newTemplate = await TaskTemplate.create({
        name,
        description,
        steps,
        idGroup: id,
        type: type || "task", // valor por defecto "task"
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

  // Obtener plantillas de tareas de grupo
  getTaskTemplates: async (req, res) => {
    const { id } = req.params;
    try {
      const templates = await TaskTemplate.findAll({ where: { idGroup: id } });
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Error fetching templates" });
    }
  },

  /*
  // asignar imagen en base de datos
  asignImage: async (req, res) => {
    const id = req.params.id;
    const normalizedPath = req.file.path.replace(/\\/g, "/");

    try {
      const user = await Group.findByPk(id);
      if (!user) return res.status(404).json({ message: "Group not found" });

      await Group.update({ image: normalizedPath }, { where: { idGroup: id } });

      res.status(201).json({
        message: "Imagen asignada correctamente",
        name: req.file.filename,
        path: normalizedPath,
      });
    } catch (error) {
      res.status(500).json({ message: "Error assigning image" });
    }
  },*/

  asignImage: async (req, res) => {
    console.log("req.file:", req.file);
    console.log("req.body:", req.body);
    const id = req.params.id;

    try {
      const group = await Group.findByPk(id);
      if (!group) return res.status(404).json({ message: "Group not found" });

      // Leer el archivo y convertirlo a base64
      //const fileData = fs.readFileSync(req.file.path);
      const base64Image = `data:${
        req.file.mimetype
      };base64,${req.file.buffer.toString("base64")}`;

      // Guardar en la BD como texto largo (tu campo image es TEXT LONG)
      await Group.update({ image: base64Image }, { where: { idGroup: id } });

      res.status(201).json({
        message: "Imagen asignada correctamente",
        name: req.file.filename,
        base64Image, // 👈 aquí agregamos la imagen real
        base64Length: base64Image.length, // opcional
      });

      // Push live
      emitCal(req, id, { image: base64Image });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error assigning image" });
    }
  },

  //obtener la imagen del grupo
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

  // Obtener materiales de grupo
  getGroupMaterials: async (req, res) => {
    const { id } = req.params;
    try {
      const group = await Group.findOne({
        where: { idGroup: id },
        attributes: ["idGroup", "name"], // 👈 opcional: así ves info del grupo
        include: [
          {
            model: TaskTemplate,
            attributes: ["idTaskTemplate"], // 👈 mejor pedir el id aunque luego no lo uses
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
      // O si quieres con info del grupo:
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Error fetching materials", error });
    }
  },

  // Crear grupo con PIN generado y CIFRADO
  createWithPin: async (req, res) => {
    const { name, image } = req.body;
    const meId = req.user?.idUser;

    try {
      // Generar PIN fuerte
      let randomPin;
      do {
        randomPin = generateStrongPin(8);
      } while (!validatePassword(randomPin));

      // Hash + cifrado
      const hashedPin = await bcrypt.hash(randomPin, 10);
      const encryptedPin = encryptPin(randomPin);

      // Crear grupo
      const group = await Group.create({
        name,
        image,
        pin: hashedPin, // hash (bcrypt)
        pinEncrypted: encryptedPin, // cifrado (AES-256-GCM)
      });

      if (meId) {
        await UserGroup.create({ idUser: meId, idGroup: group.idGroup });
      }

      // Al crear un grupo, añadir la taskTemplate "Comprar"
      const comprar = await TaskTemplate.create({
        idGroup: group.idGroup,
        name: "Comprar",
        steps: "",
        type: "task",
      });

      res.status(201).json({
        message: "Grupo creado correctamente",
        group,
        pin: randomPin, // devuelves el PIN para que el cliente lo guarde
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error creando grupo", error });
    }
  },

  // ===============================
  // Cambiar el PIN de un grupo (autogenerado y CIFRADO)
  // ===============================
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
        return res.status(404).json({ message: "Grupo no encontrado" });
      }

      group.pin = hashedPin;
      group.pinEncrypted = encryptedPin;
      await group.save();

      res.json({
        message: "PIN actualizado correctamente",
        pin: newPin,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error actualizando PIN", error });
    }
  },

  // NUEVO: Ver el PIN del grupo (descifrado)
  getPin: async (req, res) => {
    const { id } = req.params;

    try {
      const group = await Group.findByPk(id, {
        attributes: ["idGroup", "name", "pinEncrypted"],
      });
      if (!group) {
        return res.status(404).json({ message: "Grupo no encontrado" });
      }

      // (Opcional) Autorización: verifica que el usuario sea miembro/admin del grupo
      // if (!req.user || !await userIsMemberOrAdmin(req.user.id, id)) {
      //   return res.status(403).json({ message: "No autorizado" });
      // }

      const pin = decryptPin(group.pinEncrypted);
      if (!pin) {
        return res.status(409).json({ message: "PIN no disponible" });
      }

      res.json({
        message: "PIN obtenido correctamente",
        pin,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error obteniendo PIN", error });
    }
  },

  updateName: async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });
    try {
      // const updatedGroup = await Group.findByIdAndUpdate(
      //   id,
      //   { name },
      //   { new: true }
      // );
      // res.json(updatedGroup);
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

  // Obtener compras de un grupo (filtradas por rango de fechas)
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
