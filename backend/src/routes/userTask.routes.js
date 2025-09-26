import { createBaseRouter } from "./base.routes.js";
import { userTaskController } from "../controllers/userTask.controller.js";

// List, list by ID, create, edit by ID, delete by ID
const userTaskRouter = createBaseRouter(userTaskController);

// Special route to assign task
userTaskRouter.post("/assign", userTaskController.assignTask);

// Special route to unassign task
userTaskRouter.post("/unassign", userTaskController.unassignTask);

// Update user task status
userTaskRouter.post("/status", userTaskController.updateStatus);

export default userTaskRouter;
