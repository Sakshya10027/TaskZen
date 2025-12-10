import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { getNotifications, markRead } from "../controllers/notificationController.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getNotifications);
router.post("/read", markRead);

export default router;
