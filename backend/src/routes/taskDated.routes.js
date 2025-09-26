import { createBaseRouter } from "./base.routes.js";
import { taskDatedController } from "../controllers/taskDated.controller.js";

const taskDatedRouter = createBaseRouter(taskDatedController);

// Get tasks from a group
taskDatedRouter.get("/group/:idGroup", taskDatedController.getByGroup);

// Get tasks from a group in a date range
taskDatedRouter.get("/group/:idGroup/range", taskDatedController.getByGroupRange);

// Assign user
taskDatedRouter.post("/:idTaskDated/assign/:idUser", taskDatedController.assignUser);

// Unassign user
taskDatedRouter.delete("/:idTaskDated/assign/:idUser", taskDatedController.unassignUser);

// Get assigned users to a task
taskDatedRouter.get("/:id/users", taskDatedController.getUsers);

// Get buy list of tasks
taskDatedRouter.get("/:id/buylists", taskDatedController.getBuyList);

// Get buy list of task
taskDatedRouter.get("/:id/buylist", taskDatedController.getBuyList);

// Special route to get status
taskDatedRouter.get("/group/:idGroup/status", taskDatedController.getStatusByGroup);

// Change task state (todo/done)
taskDatedRouter.patch("/:idTaskDated/status", taskDatedController.updateStatus);

// Create frequent and rotative tasks
taskDatedRouter.post("/:id/next", taskDatedController.createNextNow);

export default taskDatedRouter;
