import { createBaseRouter } from "./base.routes.js";
import { taskTemplateController } from "../controllers/taskTemplate.controller.js";

// listar, listar por ID, crear, editar por ID, borrar por ID
const taskTemplateRouter = createBaseRouter(taskTemplateController);

// rutas específicas primero para evitar conflictos
// listar todos taskTemplate por tipo pasado como variable (tarea o receta) por ID de grupo
taskTemplateRouter.get('/group/:idGroup/:type', taskTemplateController.getTasksByTypeByGroupID);

// Obtener tareas agendadas (taskDated) de taskTemplate
taskTemplateRouter.get('/:idTask/taskdated', taskTemplateController.getTasksByID);

// listar los materiales requeridos por ID de tarea
taskTemplateRouter.get('/:id/materials', taskTemplateController.getMaterials);

// ruta genérica al final con prefijo fijo para tipo
// listar todos taskTemplate por tipo pasado como variable (tarea o receta)
taskTemplateRouter.get('/type/:type', taskTemplateController.getByType);


taskTemplateRouter.put("/group/:groupId/template/:idTaskTemplate", taskTemplateController.updateTemplate);


taskTemplateRouter.put("/:idTaskTemplate", taskTemplateController.updateBasicTemplate);


taskTemplateRouter.post("/group/:idGroup", taskTemplateController.createRecipe);

export default taskTemplateRouter;