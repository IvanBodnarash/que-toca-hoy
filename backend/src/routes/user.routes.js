import { createBaseRouter } from "./base.routes.js";
import { userController } from "../controllers/user.controller.js"
import { upload, getImage } from "../middlewares/upload.middleware.js"

// List, list by ID, create, edit by ID, delete by ID
const userRouter = createBaseRouter(userController);

// Add image
userRouter.post("/:id/upload", upload.single("file"), getImage, userController.asignImage);

// List user tasks
userRouter.get("/:id/taskdated", userController.getTasks);

// Assign task to the user
userRouter.post("/:id/taskdated", userController.assignTask);

// List groups you belong to 
userRouter.get("/:id/groups", userController.getGroups);

// Assign a group to a user
userRouter.post("/:id/group", userController.addGroup);

// Get tasks by user and date range
userRouter.get("/:id/taskdated/report", userController.getTasksReport);

userRouter.get("/:id/usertask/report", userController.getUserTasksReport);

// buylist
// Get user's buy list by date range
userRouter.get("/:id/buylist/report", userController.getBuyListReport);

// Update quantities or mark as purchased
userRouter.put("/:id/buylist", userController.updateBuyList);

// Get a group's buy list by date range
// userRouter.get("/:idGroup/buylist/report", userController.getBuyListReportByGroup);

// Get buy list by group and date range (today | week | month)
userRouter.get("/:idUser/group/:idGroup/buylist/report", userController.getGroupBuyListReport);

export default userRouter;