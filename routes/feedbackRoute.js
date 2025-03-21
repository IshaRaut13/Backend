import express from "express";
import { submitFeedback, getAllFeedback } from "../controllers/feedbackController.js";
import { authUser } from "../middleware/authUser.js";

const router = express.Router();

router.post("/submit", authUser, submitFeedback);
router.get("/all", authUser, getAllFeedback);

export default router;
