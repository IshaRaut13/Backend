// import mongoose from "mongoose";

// const problemSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   name: { type: String, required: true },
//   email: { type: String, required: true },
//   company: { type: String },
//   contactNumber: { type: String },
//   problemStatement: { type: String, required: true },
//   status: { type: String, enum: ["Pending", "Solved"], default: "Pending" },
//   createdAt: { type: Date, default: Date.now }
// });

// const Problem = mongoose.model("Problem", problemSchema);
// export default Problem;

import mongoose from "mongoose";

const problemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    companyName: { type: String, required: true },
    email: { type: String, required: true },
    contactNumber: { type: String, required: true },
    problemStatement: { type: String, required: true },
    status: { type: String, default: "Pending" }, // Status: Pending, In Progress, Solved
  },
  { timestamps: true }
);

export default mongoose.model("Problem", problemSchema);

