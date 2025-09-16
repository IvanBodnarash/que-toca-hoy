
import { createBaseRouter } from "./base.routes.js";
import { buyListController } from "../controllers/buyList.controller.js"

// listar, listar por ID, crear, editar por ID, borrar por ID
const buyListRouter = createBaseRouter(buyListController);


// Obtener lista de compra por tarea ID
buyListRouter.get('/task/:taskId', buyListController.getByTask);

// Obtener lista de compra por material ID
buyListRouter.get('/material/:materialId', buyListController.getByMaterial);

// crear lista de compra

buyListRouter.post('/:idTaskTemplate/list', buyListController.createListForTask);



export default buyListRouter;