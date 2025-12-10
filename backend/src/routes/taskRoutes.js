import express from "express";
import { body } from "express-validator";
import {
  getTasks,
  getTask,
  createTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
  addCommentHandler
} from "../controllers/taskController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getTasks);
router.post(
  "/",
  [body("title").notEmpty().withMessage("Title required")],
  validateRequest,
  createTaskHandler
);

router.get("/:id", getTask);
router.put("/:id", updateTaskHandler);
router.delete("/:id", deleteTaskHandler);

router.post(
  "/:id/comments",
  [body("text").notEmpty().withMessage("Comment text required")],
  validateRequest,
  addCommentHandler
);

export default router;
