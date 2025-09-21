import { createBaseRouter } from "./base.routes.js";
import { userController } from "../controllers/user.controller.js"
import { upload, getImage } from "../middlewares/upload.middleware.js"

// listar, listar por ID, crear, editar por ID, borrar por ID
const userRouter = createBaseRouter(userController);

// añadir imagen
userRouter.post("/:id/upload", upload.single("file"), getImage, userController.asignImage);

// listar tareas de un usuario
userRouter.get("/:id/taskdated", userController.getTasks);

// asignar tarea a un usuario
userRouter.post("/:id/taskdated", userController.assignTask);

// listar grupos a los que pertenece 
userRouter.get("/:id/groups", userController.getGroups);

// asignar grupo a un usuario
userRouter.post("/:id/group", userController.addGroup);


// Obtener tareas por usuario y rango de fechas
userRouter.get("/:id/taskdated/report", userController.getTasksReport);

userRouter.get("/:id/usertask/report", userController.getUserTasksReport);

// buylist
// obtener lista de compras del usuario por rango de fechas
userRouter.get("/:id/buylist/report", userController.getBuyListReport);

// actualizar cantidades o marcar como comprado
userRouter.put("/:id/buylist", userController.updateBuyList);

// obtener lista de compras de un grupo por rango de fechas
// userRouter.get("/:idGroup/buylist/report", userController.getBuyListReportByGroup);


//### Obtener lista de compra por grupo y rango de fechas (today | week | month)
userRouter.get("/:idUser/group/:idGroup/buylist/report", userController.getGroupBuyListReport);



export default userRouter;