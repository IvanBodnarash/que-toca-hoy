import { createBaseRouter } from "./base.routes.js";
import { taskTemplateController } from "../controllers/taskTemplate.controller.js";

// List, list by ID, create, edit by ID, delete by ID
const taskTemplateRouter = createBaseRouter(taskTemplateController);

// Specific routes first to avoid conflicts
// List all taskTemplate by type passed as variable (task or recipe) by group ID
taskTemplateRouter.get('/group/:idGroup/:type', taskTemplateController.getTasksByTypeByGroupID);

// Get scheduled tasks (taskDated) from taskTemplate
taskTemplateRouter.get('/:idTask/taskdated', taskTemplateController.getTasksByID);

// List the required materials by task ID
taskTemplateRouter.get('/:id/materials', taskTemplateController.getMaterials);

// Generic path at the end with a fixed prefix for type
// List all taskTemplates by type passed as a variable (task or recipe)
taskTemplateRouter.get('/type/:type', taskTemplateController.getByType);

// Update template
taskTemplateRouter.put("/group/:groupId/template/:idTaskTemplate", taskTemplateController.updateTemplate);

// Update basic template
taskTemplateRouter.put("/:idTaskTemplate", taskTemplateController.updateBasicTemplate);

// Create recipe task template type
taskTemplateRouter.post("/group/:idGroup", taskTemplateController.createRecipe);

export default taskTemplateRouter;