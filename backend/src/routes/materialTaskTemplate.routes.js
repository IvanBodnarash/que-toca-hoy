import { createBaseRouter } from "./base.routes.js";
import { materialTaskTemplateController } from "../controllers/materialTaskTemplate.controller.js"

// listar, listar por ID, crear, editar por ID, borrar por ID
const materialTaskTemplateRouter = createBaseRouter(materialTaskTemplateController);

// Obtener materiales por plantilla
materialTaskTemplateRouter.get("/:id/materials", materialTaskTemplateController.getMaterialsByTemplate);

// Obtener plantillas por material
materialTaskTemplateRouter.get("/:id/templates", materialTaskTemplateController.getTemplatesByMaterial);


export default materialTaskTemplateRouter;