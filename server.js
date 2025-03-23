// import express from "express";
// import cors from "cors";
// import "dotenv/config";
// import connectDB from "./config/mongodb.js";
// import connectCloudinary from "./config/cloudinary.js";
// import userRouter from "./routes/userRoute.js";
// import problemRouter from "./routes/problemRoute.js";
// import solutionRouter from "./routes/solutionRoute.js";
// import feedbackRouter from "./routes/feedbackRoute.js";

// // App Configuration
// const app = express();
// const port = process.env.PORT || 4000;
// connectDB();
// connectCloudinary();

// // Middlewares
// app.use(express.json());
// app.use(cors());

// // API Endpoints
// app.use("/api/user", userRouter);
// app.use("/api/problems", problemRouter);
// app.use("/api/solutions", solutionRouter);
// app.use("/api/feedback", feedbackRouter);

// app.get("/", (req, res) => {
//   res.send("API Working");
// });

// // Server Start
// app.listen(port, () => console.log(`Server started on PORT:${port}`));

// -------------------------END---------------------------------------------------
// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import mongoose from "mongoose";
// import userRoutes from "./routes/userRoute.js";

// dotenv.config();
// const app = express();

// app.use(cors());
// app.use(express.json());

// mongoose.connect(process.env.MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// }).then(() => console.log("MongoDB Connected"))
//   .catch(err => console.log(err));

// app.use("/api/user", userRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// -------------------------END---------------------------------------------------


import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userRoutes from "./routes/userRoute.js";
import problemRoutes from "./routes/problemRoute.js";
import solutionRoutes from "./routes/solutionRoute.js";
import feedbackRoutes from "./routes/feedbackRoute.js";
import adminRoutes from "./routes/adminRoute.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

app.use("/api/user", userRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/solutions", solutionRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
