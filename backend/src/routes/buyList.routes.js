import { createBaseRouter } from "./base.routes.js";
import { buyListController } from "../controllers/buyList.controller.js"

// List, list by ID, create, edit by ID, delete by ID
const buyListRouter = createBaseRouter(buyListController);

// Get buy list by task ID
buyListRouter.get('/task/:taskId', buyListController.getByTask);

// Get nuy list by material ID
buyListRouter.get('/material/:materialId', buyListController.getByMaterial);

// Create buy list
buyListRouter.post('/:idTaskTemplate/list', buyListController.createListForTask);

export default buyListRouter;