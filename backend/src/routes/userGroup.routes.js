import { createBaseRouter } from "./base.routes.js";
import { userGroupController } from "../controllers/userGroup.controller.js"

// listar, listar por ID, crear, editar por ID, borrar por ID
const userGroupRouter = createBaseRouter(userGroupController);

// Ruta específica para asignar grupo
userGroupRouter.post("/assign", userGroupController.assignGroup);


// Unirse a un grupo validando PIN
userGroupRouter.post("/join", userGroupController.joinGroup);

// Test
userGroupRouter.post("/join-by-pin", userGroupController.joinByPin);

// Eliminar relacion y comprobar si borrar grupo
userGroupRouter.delete("/group/:idGroup/user/:idUser", userGroupController.deleteUserGroup);

export default userGroupRouter;