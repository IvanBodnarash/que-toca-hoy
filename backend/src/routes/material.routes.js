// Create, edit by ID, delete by ID, check how many templates need material by ID

import { createBaseRouter } from "./base.routes.js";
import { materialController } from "../controllers/material.controller.js";

// List, create, edit by ID, delete by ID
const materialRouter = createBaseRouter(materialController);

// Get templatesof material
materialRouter.get("/:id/templates", materialController.getTaskTemplates);

// Get buy lists
materialRouter.get("/:id/buylists", materialController.getBuyLists);

export default materialRouter;
