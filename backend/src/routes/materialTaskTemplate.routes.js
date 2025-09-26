import { createBaseRouter } from "./base.routes.js";
import { materialTaskTemplateController } from "../controllers/materialTaskTemplate.controller.js"

// List, list by ID, create, edit by ID, delete by ID
const materialTaskTemplateRouter = createBaseRouter(materialTaskTemplateController);

// Get materials by template
materialTaskTemplateRouter.get("/:id/materials", materialTaskTemplateController.getMaterialsByTemplate);

// Get templates by material
materialTaskTemplateRouter.get("/:id/templates", materialTaskTemplateController.getTemplatesByMaterial);


export default materialTaskTemplateRouter;