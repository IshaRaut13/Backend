import userModel from "../models/userModel.js";
import problemModel from "../models/problemModel.js";
import solutionModel from "../models/solutionModel.js";
import feedbackModel from "../models/feedbackModel.js";

// ✅ Get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find().select("-password");
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Delete a user
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await userModel.findByIdAndDelete(id);
        res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Get all problems
export const getAllProblems = async (req, res) => {
    try {
        const problems = await problemModel.find();
        res.json({ success: true, problems });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Update problem status (Pending, Completed, Cancelled)
export const updateProblemStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await problemModel.findByIdAndUpdate(id, { status });
        res.json({ success: true, message: "Problem status updated" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Add a new solution
export const addSolution = async (req, res) => {
    try {
        const { problemId, solutionText, documents } = req.body;
        const solution = new solutionModel({ problemId, solutionText, documents });
        await solution.save();
        res.json({ success: true, message: "Solution added successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Get all solutions
export const getAllSolutions = async (req, res) => {
    try {
        const solutions = await solutionModel.find().populate("problemId");
        res.json({ success: true, solutions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Get all feedback
export const getAllFeedback = async (req, res) => {
    try {
        const feedbacks = await feedbackModel.find();
        res.json({ success: true, feedbacks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
