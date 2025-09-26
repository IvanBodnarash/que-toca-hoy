import { createBaseRouter } from "./base.routes.js";
import { userGroupController } from "../controllers/userGroup.controller.js"

// List, list by ID, create, edit by ID, delete by ID
const userGroupRouter = createBaseRouter(userGroupController);

// Specific route to assign group
userGroupRouter.post("/assign", userGroupController.assignGroup);

// Join a group by validating PIN
userGroupRouter.post("/join", userGroupController.joinGroup);

// Test
userGroupRouter.post("/join-by-pin", userGroupController.joinByPin);

// Delete relation and check if delete group
userGroupRouter.delete("/group/:idGroup/user/:idUser", userGroupController.deleteUserGroup);

export default userGroupRouter;