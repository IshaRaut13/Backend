import Problem from "../models/problemModel.js";

// Submit a new problem
export const submitProblem = async (req, res) => {
  try {
    const { name, companyName, email, contactNumber, problemStatement } = req.body;

    if (!name || !email || !problemStatement || !companyName || !contactNumber) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const newProblem = new Problem({ name, companyName, email, contactNumber, problemStatement });
    await newProblem.save();

    res.status(201).json({ success: true, message: "Problem submitted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all problems (Admin View)
export const getAllProblems = async (req, res) => {
  try {
    const problems = await Problem.find();
    res.json({ success: true, problems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
