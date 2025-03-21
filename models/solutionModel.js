// import mongoose from "mongoose";

// const solutionSchema = new mongoose.Schema({
//   problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: true },
//   adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   solutionDetails: { type: String, required: true },
//   attachedFile: { type: String }, // URL if file is uploaded
//   createdAt: { type: Date, default: Date.now }
// });

// const Solution = mongoose.model("Solution", solutionSchema);
// export default Solution;
import mongoose from "mongoose";

const solutionSchema = new mongoose.Schema(
  {
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: true },
    solutionText: { type: String, required: true },
    documents: [String], // Links to documents
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Solution", solutionSchema);
