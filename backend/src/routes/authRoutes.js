import express from "express";
import { body } from "express-validator";
import { register, login, me, refresh, googleLogin, updateAvatar } from "../controllers/authController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { authenticate } from "../middleware/authMiddleware.js";
import multer from "multer";
import fs from "fs";
import path from "path";

const router = express.Router();

const uploadDir = path.join(process.cwd(), "uploads", "avatars");
fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".png";
    cb(null, `${req.user?._id || Date.now()}-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

/**
 * @route POST /auth/register
 */
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Min 6 chars password")
  ],
  validateRequest,
  register
);

router.post(
  "/login",
  [
    body("email").isEmail(),
    body("password").notEmpty().withMessage("Password required")
  ],
  validateRequest,
  login
);

router.post(
  "/refresh",
  [body("refreshToken").notEmpty().withMessage("refreshToken required")],
  validateRequest,
  refresh
);

router.post(
  "/google",
  [body("idToken").notEmpty().withMessage("idToken required")],
  validateRequest,
  googleLogin
);

router.get("/me", authenticate, me);

router.put("/profile/avatar", authenticate, upload.single("avatar"), updateAvatar);

export default router;
