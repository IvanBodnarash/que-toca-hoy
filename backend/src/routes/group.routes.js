import { createBaseRouter } from "./base.routes.js";
import { groupController } from "../controllers/group.controller.js";
import { upload, getImage } from "../middlewares/upload.middleware.js";
// import { verifyToken } from "../middlewares/auth.middleware.js";

// List, list by ID, create, edit by ID, delete by ID
const groupRouter = createBaseRouter(groupController);

// Add image to a group by group ID
groupRouter.post(
  "/:id/upload",
  upload.single("file"),
  getImage,
  groupController.asignImage
);

// Get group users
groupRouter.get("/:id/users", groupController.getUsers);

// Get group tasks
groupRouter.get("/:id/tasks", groupController.getTasks);

// POST to create template
groupRouter.post("/:id/templates", groupController.createTaskTemplate);

// Get task templates of group
groupRouter.get("/:id/templates", groupController.getTaskTemplates);

// Get the group image (review)
groupRouter.get("/:id/image", groupController.getImage);

// Get group materials
groupRouter.get("/:id/materials", groupController.getGroupMaterials);

// Create group with auto-generated and encrypted PIN
groupRouter.post("/createwithpin", groupController.createWithPin);

// Change PIN (auto-generated and encrypted)
groupRouter.put("/:id/changepin", groupController.changePin);

// View PIN (decrypt AES and return it)
groupRouter.get("/:id/pin", groupController.getPin);

// Get group purchases
groupRouter.get("/:id/buylist", groupController.getBuyList);

// Edit group name
groupRouter.patch("/:id/name", groupController.updateName);

export default groupRouter;
