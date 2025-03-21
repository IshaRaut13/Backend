import express from "express";
import { addSolution, getSolutions } from "../controllers/solutionController.js";
import { authUser } from "../middleware/authUser.js";
import { authRole } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/add", authUser, authRole("admin"), addSolution);
router.get("/all", authUser, getSolutions);

export default router;
