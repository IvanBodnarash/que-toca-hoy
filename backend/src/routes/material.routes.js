// crear, editar por ID, borrar por ID, comprobar cuantas templates necesitan material por ID


import { createBaseRouter } from "./base.routes.js";
import { materialController } from "../controllers/material.controller.js"

// listar, crear, editar por ID, borrar por ID
const materialRouter = createBaseRouter(materialController);

// Obtener plantillas de material
materialRouter.get("/:id/templates", materialController.getTaskTemplates);

// Obtener listas de compra
materialRouter.get("/:id/buylists", materialController.getBuyLists);

export default materialRouter;