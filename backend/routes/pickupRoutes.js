import express from "express";
import { getPickupSchedule, reportMissedPickup } from "../controllers/pickupController.js";

const router = express.Router();
router.get("/:wardId", getPickupSchedule);
router.post("/report", reportMissedPickup);

export default router;
