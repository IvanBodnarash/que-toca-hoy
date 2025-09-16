import { createBaseRouter } from "./base.routes.js";
import { userTaskController } from "../controllers/userTask.controller.js";

// listar, listar por ID, crear, editar por ID, borrar por ID
const userTaskRouter = createBaseRouter(userTaskController);

// Ruta específica para asignar task
userTaskRouter.post("/assign", userTaskController.assignTask);

// Ruta específica para desasignar task
userTaskRouter.post("/unassign", userTaskController.unassignTask);


userTaskRouter.post("/status", userTaskController.updateStatus);

export default userTaskRouter;
