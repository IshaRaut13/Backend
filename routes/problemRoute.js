import express from "express";
import { submitProblem, getAllProblems } from "../controllers/problemController.js";
import { authUser } from "../middleware/authUser.js";
import { authRole } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/submit", authUser, submitProblem);
router.get("/all", authUser, authRole("admin"), getAllProblems);

export default router;
