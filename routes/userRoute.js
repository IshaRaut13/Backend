// import express from 'express';
// import { loginUser, registerUser, getProfile, updateProfile, submitProblem, getProblems, submitFeedback } from '../controllers/userController.js';
// import upload from '../middleware/multer.js';
// import { authUser } from '../middleware/authUser.js';
// const userRouter = express.Router();

// // Authentication Routes
// userRouter.post("/register", registerUser);
// userRouter.post("/login", loginUser);

// // User Profile Routes
// userRouter.get("/get-profile", authUser, getProfile);
// userRouter.post("/update-profile", upload.single('image'), authUser, updateProfile);

// // Problem Submission & Viewing
// userRouter.post("/submit-problem", authUser, submitProblem);
// userRouter.get("/problems", authUser, getProblems);

// // Feedback Submission
// userRouter.post("/submit-feedback", authUser, submitFeedback);

// export default userRouter;
import express from 'express';
import { loginUser, registerUser, googleLogin, getProfile, updateProfile, submitProblem, getProblems, submitFeedback } from '../controllers/userController.js';
import upload from '../middleware/multer.js';
import { authUser } from '../middleware/authUser.js';

const userRouter = express.Router();

// Authentication Routes
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/google-login", googleLogin); // New Google Login Route

// User Profile Routes
userRouter.get("/get-profile", authUser, getProfile);
userRouter.post("/update-profile", upload.single('image'), authUser, updateProfile);

// Problem Submission & Viewing
userRouter.post("/submit-problem", authUser, submitProblem);
userRouter.get("/problems", authUser, getProblems);

// Feedback Submission
userRouter.post("/submit-feedback", authUser, submitFeedback);

export default userRouter;
