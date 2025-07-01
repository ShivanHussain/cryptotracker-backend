import { Router } from "express";
import {
  getTopCoins,
  getCoinDetails,
  getCoinHistory,
  searchCoins,
  getTrendingCoins
} from "../controllers/cryptoController.js";

const router = Router();

router.get("/top", getTopCoins);
router.get("/trending", getTrendingCoins);
router.get("/search", searchCoins);
router.get("/:id", getCoinDetails);
router.get("/:id/history", getCoinHistory);

export default router;