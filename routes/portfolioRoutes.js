import { Router } from "express";
import {
  getPortfolio,
  addAssetToPortfolio,
  removeAssetFromPortfolio,
  updateAssetInPortfolio
} from "../controllers/portfolioController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

// All portfolio routes are now protected
router.use(protect); // Apply authentication to all routes

router.get("/", getPortfolio); 
router.post("/add", addAssetToPortfolio);
router.delete("/remove", removeAssetFromPortfolio);
router.put("/update", updateAssetInPortfolio);

export default router;