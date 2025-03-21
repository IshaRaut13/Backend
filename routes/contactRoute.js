import express from "express";
import { submitContact, getAllContacts } from "../controllers/contactController.js";
import { authUser } from "../middleware/authMiddleware.js";
import { authRole } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/submit", submitContact);
router.get("/all", authUser, authRole("admin"), getAllContacts);

export default router;
