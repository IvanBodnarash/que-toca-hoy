import { createBaseRouter } from "./base.routes.js";
import { taskDatedController } from "../controllers/taskDated.controller.js";

const taskDatedRouter = createBaseRouter(taskDatedController);

// Obtener tareas de un grupo
taskDatedRouter.get("/group/:idGroup", taskDatedController.getByGroup);

// Obtener tareas de un grupo en un rango de fechas
taskDatedRouter.get("/group/:idGroup/range", taskDatedController.getByGroupRange);

// Asignar usuario
taskDatedRouter.post("/:idTaskDated/assign/:idUser", taskDatedController.assignUser);

// Desasignar usuario
taskDatedRouter.delete("/:idTaskDated/assign/:idUser", taskDatedController.unassignUser);

// Obtener usuarios asignados a una tarea
taskDatedRouter.get("/:id/users", taskDatedController.getUsers);

// Obtener lista de compra de tareas
taskDatedRouter.get("/:id/buylists", taskDatedController.getBuyList);

// Obtener lista de compra de tarea
taskDatedRouter.get("/:id/buylist", taskDatedController.getBuyList);

// Ruta exclusiva para traer status
taskDatedRouter.get("/group/:idGroup/status", taskDatedController.getStatusByGroup);


// Cambiar estado de la tarea
taskDatedRouter.patch("/:idTaskDated/status", taskDatedController.updateStatus);


taskDatedRouter.post("/:id/next", taskDatedController.createNextNow);



export default taskDatedRouter;
