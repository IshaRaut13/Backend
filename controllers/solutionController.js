import Solution from "../models/solutionModel.js";
import Problem from "../models/problemModel.js";

// Admin provides a solution
export const addSolution = async (req, res) => {
  try {
    const { problemId, solutionText, documents } = req.body;

    if (!problemId || !solutionText) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const solution = new Solution({ problemId, solutionText, documents });
    await solution.save();

    // Update problem status
    await Problem.findByIdAndUpdate(problemId, { status: "Solved" });

    res.status(201).json({ success: true, message: "Solution added successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all solutions
export const getSolutions = async (req, res) => {
  try {
    const solutions = await Solution.find().populate("problemId");
    res.json({ success: true, solutions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
