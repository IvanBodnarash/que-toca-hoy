import { createBaseRouter } from "./base.routes.js";
import { groupController } from "../controllers/group.controller.js";
import { upload, getImage } from "../middlewares/upload.middleware.js";
// import { verifyToken } from "../middlewares/auth.middleware.js";

// listar, listar por ID, crear, editar por ID, borrar por ID
const groupRouter = createBaseRouter(groupController);

// añadir imagen a un grupo por ID grupo
groupRouter.post(
  "/:id/upload",
  upload.single("file"),
  getImage,
  groupController.asignImage
);

// Obtener usuarios de grupo
groupRouter.get("/:id/users", groupController.getUsers);

// Obtener tareas de grupo
groupRouter.get("/:id/tasks", groupController.getTasks);

// POST para crear plantilla
groupRouter.post("/:id/templates", groupController.createTaskTemplate);

// Obtener plantillas de tareas de grupo
groupRouter.get("/:id/templates", groupController.getTaskTemplates);

//obtener la imagen del grupo  (revisar)
groupRouter.get("/:id/image", groupController.getImage);

// Obtener materiales de grupo
groupRouter.get("/:id/materials", groupController.getGroupMaterials);

// // Crear grupo con PIN autogenerado y cifrado
groupRouter.post("/createwithpin", groupController.createWithPin);

// Cambiar PIN (autogenerado y cifrado)
groupRouter.put("/:id/changepin", groupController.changePin);

// Ver PIN (descifrar AES y devolverlo)
groupRouter.get("/:id/pin", groupController.getPin);
// Obtener compras de grupo
groupRouter.get("/:id/buylist", groupController.getBuyList);

// Editar nombre de grupo
groupRouter.patch("/:id/name", groupController.updateName);

export default groupRouter;
