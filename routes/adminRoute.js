import express from "express";
import { authUser, authRole } from "../middleware/authUser.js";
import {
    getAllUsers,
    deleteUser,
    getAllProblems,
    updateProblemStatus,
    addSolution,
    getAllSolutions,
    getAllFeedback
} from "../controllers/adminController.js";

const router = express.Router();

// ✅ User Management
router.get("/users", authUser, authRole("admin"), getAllUsers);
router.delete("/users/:id", authUser, authRole("admin"), deleteUser);

// ✅ Problem Management
router.get("/problems", authUser, authRole("admin"), getAllProblems);
router.put("/problems/:id/status", authUser, authRole("admin"), updateProblemStatus);

// ✅ Solution Management
router.post("/solutions", authUser, authRole("admin"), addSolution);
router.get("/solutions", authUser, authRole("admin"), getAllSolutions);

// ✅ Feedback & Ratings
router.get("/feedback", authUser, authRole("admin"), getAllFeedback);

export default router;
