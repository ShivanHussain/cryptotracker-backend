import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateProfile,
  changePassword
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);


// Protected routes
router.post("/logout",protect, logoutUser);
router.get("/me", protect, getCurrentUser);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

export default router;